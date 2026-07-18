# Binder and semantic validation

# Slice 6 — Binder / Semantic Validation

## important note
In the earlier 05-in-memory-table-storage design, several binder responsibilities were mixed into storage:

* table lookup
* column lookup
* value-count checking
* value-type checking
* column-index resolution

That works for a small version, but the cleaner design is:

```text
Parser → Binder validates/resolves → Executor/Storage only performs work
```

So refactor those checks out of `Storage.Insert()` and `Storage.Select()` into `Bind()`. Storage should mainly append rows and scan rows.


## What this slice builds

The parser answers:

```text
Is this valid SQL syntax?
```

The binder answers:

```text
Does this SQL make sense for the current database schema?
```

Example:

```sql
SELECT name FROM users;
```

Parser output:

```text
SelectStatement:
    Table   = "users"
    Columns = ["name"]
```

The parser does not know whether `users` or `name` exists.

The binder looks them up in the catalog:

```text
users exists
↓
name exists in users
↓
produce BoundSelectStatement
```

PostgreSQL similarly separates raw parsing from semantic analysis: the parser constructs syntax without catalog lookups, then a later transformation stage resolves referenced tables, columns, functions and operators.

---

## What to study

Read only these:

1. **PostgreSQL — The Parser Stage**
   Focus on the difference between the raw parse tree and semantic transformation.

2. **Crafting Interpreters — Resolving and Binding**
   It is about programming-language variables rather than SQL columns, but the main idea is the same: convert names into resolved references before execution.

Do not study PostgreSQL source code or advanced SQL scopes yet.

---

# Scope

Support:

```text
SELECT columns FROM one table
INSERT INTO one table
CREATE TABLE validation
INT and TEXT
unknown-table detection
unknown-column detection
INSERT value-count validation
INSERT value-type validation
```

Do not support yet:

```text
table aliases
column aliases
joins
multiple tables
ambiguous columns
nested queries
expressions
implicit type conversion
NULL
functions
```

---

# Core mental model

```text
Raw AST:
contains names written by the user

Bound AST:
contains validated references to catalog objects
```

Example:

```text
Raw column:
    Name = "name"

Bound column:
    Index = 1
    Schema = ColumnSchema{Name: "name", Type: TEXT}
```

After binding, execution should not need to search for the column name again.

---

# Pipeline

```text
SQL
↓
Tokenizer
↓
Parser
↓
Raw AST
↓
Binder + Catalog
↓
Bound AST
↓
Executor
```

Example:

```text
SELECT name FROM users
↓
Raw AST:
    table = "users"
    columns = ["name"]
↓
Binder:
    users → table schema
    name  → column index 1
↓
Bound AST:
    table reference
    column index 1
↓
Executor:
    read table
    return row.Values[1]
```

---

# Raw AST types

```go
type SelectStatement struct {
	Table   string
	Columns []string
}

type InsertStatement struct {
	Table  string
	Values []Expression
}

type CreateTableStatement struct {
	Table   string
	Columns []ColumnDefinition
}
```

These contain names and literals exactly as parsed.

---

# Bound AST types

## Bound statement interface

```go
type BoundStatement interface {
	boundStatementNode()
}
```

---

## Bound table reference

```go
type BoundTable struct {
	Name   string
	Schema *TableSchema
	Table  *Table
}
```

For now, the binder can resolve both:

```text
schema metadata
+
runtime table storage
```

Alternatively, it may bind only the schema and let the executor retrieve storage later.

---

## Bound column reference

```go
type BoundColumn struct {
	Name   string
	Index  int
	Schema ColumnSchema
}
```

Example:

```text
users schema:
    index 0 → id   INT
    index 1 → name TEXT
```

Binding `name` produces:

```go
BoundColumn{
	Name:  "name",
	Index: 1,
	Schema: ColumnSchema{
		Name: "name",
		Type: TypeText,
	},
}
```

---

## Bound SELECT

```go
type BoundSelectStatement struct {
	Table   BoundTable
	Columns []BoundColumn
}

func (BoundSelectStatement) boundStatementNode() {}
```

---

## Bound INSERT

```go
type BoundInsertValue struct {
	Column BoundColumn
	Value  Value
}

type BoundInsertStatement struct {
	Table  BoundTable
	Values []BoundInsertValue
}

func (BoundInsertStatement) boundStatementNode() {}
```

The binder converts AST literals into validated typed values.

---

## Bound CREATE TABLE

`CREATE TABLE` cannot resolve the new table because it does not exist yet.

Its binder validates that the proposed schema is legal:

```go
type BoundCreateTableStatement struct {
	TableName string
	Columns   []ColumnSchema
}

func (BoundCreateTableStatement) boundStatementNode() {}
```

---

# Binder structure

```go
type Binder struct {
	Catalog *Catalog
	Storage *Storage
}
```

Possible API:

```go
func Bind(
	stmt Statement,
	catalog *Catalog,
	storage *Storage,
) (BoundStatement, error)
```

Or:

```go
func NewBinder(
	catalog *Catalog,
	storage *Storage,
) *Binder

func (b *Binder) Bind(
	stmt Statement,
) (BoundStatement, error)
```

---

# Core pseudocode

## Main bind function

```text
Bind(statement):

    if statement is SelectStatement:
        return BindSelect(statement)

    if statement is InsertStatement:
        return BindInsert(statement)

    if statement is CreateTableStatement:
        return BindCreateTable(statement)

    return error:
        "unsupported statement type"
```

---

# Resolve table

```text
ResolveTable(tableName):

    normalizedName = NormalizeName(tableName)

    schema, exists = catalog.Tables[normalizedName]

    if schema does not exist:
        return semantic error:
            table "<tableName>" does not exist

    table, exists = storage.Tables[normalizedName]

    if table does not exist:
        return internal error:
            catalog contains table but storage does not

    return BoundTable:
        Name   = normalizedName
        Schema = schema
        Table  = table
```

This distinguishes two error categories:

```text
user semantic error:
    referenced table does not exist

internal consistency error:
    catalog and storage disagree
```

---

# Resolve column

```text
ResolveColumn(tableSchema, columnName):

    normalizedName = NormalizeName(columnName)

    for index from 0 to number of columns - 1:

        column = tableSchema.Columns[index]

        if NormalizeName(column.Name) equals normalizedName:

            return BoundColumn:
                Name   = column.Name
                Index  = index
                Schema = column

    return semantic error:
        column "<columnName>" does not exist
        in table "<tableSchema.Name>"
```

Inputs:

```text
tableSchema
columnName
```

Output:

```text
BoundColumn
```

Stopping condition:

```text
matching column is found
or
all columns have been checked
```

Failure:

```text
column is absent from the table schema
```

---

# Bind SELECT

Supported SQL:

```sql
SELECT id, name FROM users;
```

```text
BindSelect(statement):

    boundTable, error = ResolveTable(statement.Table)

    if error exists:
        return error

    if statement.Columns is empty:
        return semantic error:
            SELECT must contain at least one column

    boundColumns = empty BoundColumn list
    seenColumns = empty set

    for each requestedColumnName in statement.Columns:

        normalizedName = NormalizeName(requestedColumnName)

        if normalizedName exists in seenColumns:
            return semantic error:
                column "<requestedColumnName>"
                is selected more than once

        boundColumn, error = ResolveColumn(
            boundTable.Schema,
            requestedColumnName
        )

        if error exists:
            return error

        append boundColumn to boundColumns
        add normalizedName to seenColumns

    return BoundSelectStatement:
        Table   = boundTable
        Columns = boundColumns
```

You may allow duplicate selected columns later:

```sql
SELECT name, name FROM users;
```

For the simplified database, rejecting them keeps the result model easier.

---

# Bind INSERT

Supported SQL:

```sql
INSERT INTO users VALUES (1, 'Akhilesh');
```

```text
BindInsert(statement):

    boundTable, error = ResolveTable(statement.Table)

    if error exists:
        return error

    expectedCount = number of boundTable.Schema.Columns
    actualCount   = number of statement.Values

    if actualCount does not equal expectedCount:
        return semantic error:
            table "<table>" expects <expectedCount> values,
            received <actualCount>

    boundValues = empty BoundInsertValue list
    reserve expectedCount entries

    for index from 0 to expectedCount - 1:

        columnSchema = boundTable.Schema.Columns[index]
        expression   = statement.Values[index]

        boundColumn = BoundColumn:
            Name   = columnSchema.Name
            Index  = index
            Schema = columnSchema

        typedValue, error = BindValue(
            expression,
            columnSchema.Type
        )

        if error exists:
            return semantic error containing:
                table name
                column name
                expected type
                actual literal type

        append BoundInsertValue:
            Column = boundColumn
            Value  = typedValue

    return BoundInsertStatement:
        Table  = boundTable
        Values = boundValues
```

---

# Bind one value

```text
BindValue(expression, expectedType):

    if expectedType is INT:

        if expression is not NumberLiteral:
            return error:
                expected INT but received <expression type>

        parsedInteger, error = ParseInteger(expression.Value)

        if conversion fails:
            return error:
                invalid INT literal

        return Value:
            Type = INT
            Int  = parsedInteger

    if expectedType is TEXT:

        if expression is not StringLiteral:
            return error:
                expected TEXT but received <expression type>

        return Value:
            Type = TEXT
            Text = expression.Value

    return error:
        unsupported column type
```

Inputs:

```text
raw expression
expected catalog data type
```

Output:

```text
typed Value
```

Failures:

```text
literal kind does not match expected type
number cannot be converted to int64
schema contains unsupported type
```

---

# Bind CREATE TABLE

Supported SQL:

```sql
CREATE TABLE users (
    id INT,
    name TEXT
);
```

```text
BindCreateTable(statement):

    tableName = NormalizeName(statement.Table)

    if tableName is empty:
        return semantic error:
            table name cannot be empty

    if catalog already contains tableName:
        return semantic error:
            table "<tableName>" already exists

    if statement.Columns is empty:
        return semantic error:
            table must contain at least one column

    boundColumns = empty ColumnSchema list
    seenNames = empty set

    for each definition in statement.Columns:

        columnName = NormalizeName(definition.Name)

        if columnName is empty:
            return semantic error:
                column name cannot be empty

        if columnName exists in seenNames:
            return semantic error:
                duplicate column "<columnName>"

        dataType, error = ResolveDataType(
            definition.DataType
        )

        if error exists:
            return semantic error containing:
                column name
                unsupported type

        append ColumnSchema:
            Name = columnName
            Type = dataType

        add columnName to seenNames

    return BoundCreateTableStatement:
        TableName = tableName
        Columns   = boundColumns
```

The binder validates but does not change the catalog.

Catalog mutation should happen during execution:

```text
bind
↓
if successful
↓
execute CREATE TABLE
↓
update catalog and storage
```

---

# Resolve data type

```text
ResolveDataType(typeName):

    normalized = uppercase(typeName)

    if normalized equals "INT":
        return TypeInt

    if normalized equals "TEXT":
        return TypeText

    return semantic error:
        unsupported data type "<typeName>"
```

---

# SELECT helper flow

Input:

```sql
SELECT name FROM users;
```

Catalog:

```text
users
├── id   INT
└── name TEXT
```

Flow:

```text
Parser returns:

SelectStatement:
    Table   = "users"
    Columns = ["name"]

↓
Bind(statement)
↓
statement is SelectStatement
↓
BindSelect(statement)
↓
ResolveTable("users")
    ↓
    normalize name to "users"
    ↓
    catalog lookup succeeds
    ↓
    storage lookup succeeds
    ↓
    return BoundTable
↓
process requested column "name"
↓
ResolveColumn(usersSchema, "name")
    ↓
    inspect index 0: id
    ↓
    no match
    ↓
    inspect index 1: name
    ↓
    match found
    ↓
    return BoundColumn:
        Name  = "name"
        Index = 1
        Type  = TEXT
↓
return BoundSelectStatement
```

Bound output:

```text
BoundSelectStatement:
    Table:
        Name = "users"

    Columns:
        BoundColumn:
            Name  = "name"
            Index = 1
            Type  = TEXT
```

Executor no longer needs to search by name:

```text
for each row:
    return row.Values[1]
```

---

# INSERT helper flow

Input:

```sql
INSERT INTO users VALUES (1, 'Akhilesh');
```

Schema:

```text
index 0 → id   INT
index 1 → name TEXT
```

Flow:

```text
Parser returns InsertStatement
↓
BindInsert(statement)
↓
ResolveTable("users")
↓
table found
↓
expected values = 2
actual values   = 2
↓
process value at index 0
    ↓
    column = id INT
    expression = NumberLiteral("1")
    ↓
    BindValue(expression, INT)
    ↓
    parse "1" into int64
    ↓
    return INT(1)
↓
process value at index 1
    ↓
    column = name TEXT
    expression = StringLiteral("Akhilesh")
    ↓
    BindValue(expression, TEXT)
    ↓
    return TEXT("Akhilesh")
↓
return BoundInsertStatement
```

Bound output:

```text
BoundInsertStatement:
    Table = users

    Values:
        column index 0:
            id INT = 1

        column index 1:
            name TEXT = "Akhilesh"
```

Execution becomes simple:

```text
create row from already-bound values
↓
append row
```

---

# Unknown-table failure flow

Input:

```sql
SELECT id FROM orders;
```

Catalog:

```text
users
```

Flow:

```text
BindSelect(statement)
↓
ResolveTable("orders")
↓
normalize to "orders"
↓
catalog.Tables["orders"] not found
↓
return semantic error:
    table "orders" does not exist
↓
column binding does not run
↓
executor is not called
```

---

# Unknown-column failure flow

Input:

```sql
SELECT email FROM users;
```

Schema:

```text
id   INT
name TEXT
```

Flow:

```text
BindSelect(statement)
↓
ResolveTable("users")
↓
table found
↓
ResolveColumn(usersSchema, "email")
↓
check id
↓
no match
↓
check name
↓
no match
↓
end of columns reached
↓
return semantic error:
    column "email" does not exist
    in table "users"
↓
no BoundSelectStatement is produced
↓
executor is not called
```

---

# Wrong-value-type failure flow

Input:

```sql
INSERT INTO users VALUES ('one', 'Akhilesh');
```

Schema:

```text
id   INT
name TEXT
```

Flow:

```text
BindInsert(statement)
↓
ResolveTable("users")
↓
value counts match
↓
process index 0
↓
column id expects INT
↓
expression is StringLiteral("one")
↓
BindValue(expression, INT)
↓
literal is not NumberLiteral
↓
return semantic error:
    column "id" expects INT,
    received TEXT
↓
remaining values are not processed
↓
executor is not called
↓
no row is inserted
```

---

# Wrong-value-count failure flow

Input:

```sql
INSERT INTO users VALUES (1);
```

Schema:

```text
id   INT
name TEXT
```

Flow:

```text
BindInsert(statement)
↓
ResolveTable("users")
↓
expected value count = 2
actual value count   = 1
↓
return semantic error:
    table "users" expects 2 values,
    received 1
↓
individual values are not bound
↓
executor is not called
```

---

# Syntax error versus semantic error

| SQL                                    | Stage that rejects it | Reason                       |
| -------------------------------------- | --------------------- | ---------------------------- |
| `SELECT FROM users;`                   | Parser                | Missing selected column      |
| `SELECT name users;`                   | Parser                | Missing `FROM`               |
| `SELECT email FROM users;`             | Binder                | Valid syntax, unknown column |
| `SELECT id FROM orders;`               | Binder                | Valid syntax, unknown table  |
| `INSERT INTO users VALUES ('x', 'A');` | Binder                | Wrong type for `id`          |

Rule:

```text
Parser:
Can these tokens form a statement?

Binder:
Can this statement work with this catalog?
```

---

# Why use a bound AST?

Without binding:

```text
executor receives "name"
↓
executor searches schema for "name"
↓
executor validates type and existence
```

With binding:

```text
binder resolves "name" once
↓
executor receives column index 1
↓
executor directly reads row.Values[1]
```

| Raw AST execution                  | Bound AST execution            |
| ---------------------------------- | ------------------------------ |
| Executor performs validation       | Binder performs validation     |
| Names repeatedly resolved          | Names resolved once            |
| Execution code mixes concerns      | Execution code stays simple    |
| Errors may appear during execution | Errors appear before execution |

The bound AST is better here because it separates:

```text
understanding the statement
from
performing the statement
```

---

# Suggested Go methods

```go
func NewBinder(
	catalog *Catalog,
	storage *Storage,
) *Binder

func (b *Binder) Bind(
	stmt Statement,
) (BoundStatement, error)

func (b *Binder) bindSelect(
	stmt *SelectStatement,
) (*BoundSelectStatement, error)

func (b *Binder) bindInsert(
	stmt *InsertStatement,
) (*BoundInsertStatement, error)

func (b *Binder) bindCreateTable(
	stmt *CreateTableStatement,
) (*BoundCreateTableStatement, error)

func (b *Binder) resolveTable(
	name string,
) (*BoundTable, error)

func resolveColumn(
	table *TableSchema,
	name string,
) (*BoundColumn, error)

func bindValue(
	expression Expression,
	expectedType DataType,
) (Value, error)

func resolveDataType(
	name string,
) (DataType, error)
```

---

# Error model

Use a semantic error containing:

```go
type SemanticError struct {
	Message  string
	Position int
}
```

Examples:

```text
semantic error at position 7:
column "email" does not exist in table "users"
```

```text
semantic error at position 12:
table "orders" does not exist
```

To support positions, preserve token positions in the raw AST:

```go
type Identifier struct {
	Name     string
	Position int
}
```

Then:

```go
type SelectStatement struct {
	Table   Identifier
	Columns []Identifier
}
```

This produces much better errors than storing plain strings.

---

# Minimum tests

## Bind valid SELECT

```text
Given:
    users(id INT, name TEXT)

When:
    bind SELECT name FROM users

Then:
    table resolves to users
    name resolves to index 1
    name type is TEXT
```

## Unknown table

```text
When:
    bind SELECT id FROM orders

Then:
    return table-not-found semantic error
```

## Unknown column

```text
When:
    bind SELECT email FROM users

Then:
    return column-not-found semantic error
```

## Valid INSERT

```text
When:
    bind INSERT INTO users VALUES (1, 'Akhilesh')

Then:
    first value becomes INT(1)
    second value becomes TEXT("Akhilesh")
```

## Wrong value count

```text
When:
    bind INSERT INTO users VALUES (1)

Then:
    return expected-two-values error
```

## Wrong value type

```text
When:
    bind INSERT INTO users
    VALUES ('one', 'Akhilesh')

Then:
    return:
        column id expects INT, received TEXT
```

## Duplicate CREATE TABLE

```text
Given:
    users already exists

When:
    bind CREATE TABLE users (id INT)

Then:
    return table-already-exists error
```

## Duplicate CREATE column

```text
When:
    bind CREATE TABLE users (id INT, id TEXT)

Then:
    return duplicate-column error
```

---

# Build order

```text
define BoundStatement
↓
define BoundTable
↓
define BoundColumn
↓
define BoundSelectStatement
↓
define BoundInsertStatement
↓
define BoundCreateTableStatement
↓
implement ResolveTable
↓
implement ResolveColumn
↓
implement BindValue
↓
implement BindSelect
↓
implement BindInsert
↓
implement BindCreateTable
↓
add semantic error positions
↓
change executor to accept BoundStatement
↓
remove catalog lookups from executor
↓
write semantic validation tests
```

---

# Final mental model

```text
Parser output:

SELECT "name" FROM "users"
```

```text
Binder work:

"users"
→ existing table schema

"name"
→ existing column
→ index 1
→ TEXT
```

```text
Bound output:

SELECT column index 1
FROM resolved users table
```

The binder is the boundary between:

```text
SQL as names written by the user
and
database objects understood by the engine
```

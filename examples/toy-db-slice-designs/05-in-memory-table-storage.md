# In-memory table storage

# Slice 5 — In-Memory Table Storage

## What this slice builds

The previous catalog stores only the table definition:

```text
users
├── id   INT
└── name TEXT
```

This slice stores the actual rows:

```text
users
├── schema
│   ├── id   INT
│   └── name TEXT
│
└── rows
    ├── [1, "Akhilesh"]
    ├── [2, "Ravi"]
    └── [3, "Neha"]
```

The scope is intentionally simple:

```text
rows remain in memory
rows are appended to a slice
rows cannot be updated or deleted
INT and TEXT values only
all rows follow the catalog schema
```

---

## What to study

Read only these:

1. **Go slices: usage and internals** — understand storing rows with slices and growing them with `append`.
2. **SQLite database file format** — briefly see how real databases eventually organize table rows using B-trees. Do not implement this yet.
3. **PostgreSQL page layout** — skim only to understand that real databases group rows into fixed-size pages rather than one large Go slice.

For this slice, the implementation is simply:

```text
table rows = []Row
```

---

# Core mental model

```text
Catalog:
What columns does the table have?

Storage:
What rows does the table contain?
```

Example:

```sql
CREATE TABLE users (
    id INT,
    name TEXT
);

INSERT INTO users VALUES (1, 'Akhilesh');
```

The catalog stores:

```text
users:
    id   INT
    name TEXT
```

The table storage stores:

```text
[
    [1, "Akhilesh"]
]
```

---

# Data model

## Typed values

Avoid storing everything as strings:

```go
type ValueType string

const (
	ValueInt  ValueType = "INT"
	ValueText ValueType = "TEXT"
)

type Value struct {
	Type ValueType
	Int  int64
	Text string
}
```

Constructors:

```go
func NewIntValue(value int64) Value {
	return Value{
		Type: ValueInt,
		Int:  value,
	}
}

func NewTextValue(value string) Value {
	return Value{
		Type: ValueText,
		Text: value,
	}
}
```

Examples:

```go
NewIntValue(42)

Value{
	Type: ValueInt,
	Int:  42,
}
```

```go
NewTextValue("Akhilesh")

Value{
	Type: ValueText,
	Text: "Akhilesh",
}
```

---

## Row

```go
type Row struct {
	Values []Value
}
```

Example:

```go
Row{
	Values: []Value{
		NewIntValue(1),
		NewTextValue("Akhilesh"),
	},
}
```

Column meaning comes from the schema position:

```text
schema:
index 0 → id
index 1 → name

row:
index 0 → 1
index 1 → "Akhilesh"
```

Therefore:

```text
Row.Values[i] belongs to TableSchema.Columns[i]
```

---

## Table

```go
type Table struct {
	Schema *TableSchema
	Rows   []Row
}
```

Example:

```go
Table{
	Schema: usersSchema,
	Rows: []Row{
		{
			Values: []Value{
				NewIntValue(1),
				NewTextValue("Akhilesh"),
			},
		},
	},
}
```

---

## Database storage

The catalog knows all table schemas.

The storage layer knows all runtime tables and rows.

```go
type Storage struct {
	Tables map[string]*Table
}
```

Complete relationship:

```text
Catalog
└── users → TableSchema

Storage
└── users → Table
             ├── Schema → same TableSchema
             └── Rows
```

---

# Integration flow

```text
CREATE TABLE users (...)
↓
parser creates CreateTableStatement
↓
catalog creates TableSchema
↓
storage creates an empty Table
↓
table.Rows = []
```

Later:

```text
INSERT INTO users VALUES (1, 'Akhilesh')
↓
parser creates InsertStatement
↓
look up users in catalog/storage
↓
convert AST literals into typed values
↓
validate values against schema
↓
append row to table.Rows
```

---

# Core pseudocode

## Create storage

```text
NewStorage():

    return Storage:
        Tables = empty map
```

---

## Create an empty table from catalog schema

```text
CreateTable(schema):

    tableName = NormalizeName(schema.Name)

    if tableName is empty:
        return error:
            "table name cannot be empty"

    if tableName already exists in storage.Tables:
        return error:
            "table storage already exists"

    table = Table:
        Schema = schema
        Rows   = empty row slice

    storage.Tables[tableName] = table

    return success
```

After:

```sql
CREATE TABLE users (
    id INT,
    name TEXT
);
```

Storage becomes:

```text
Storage
└── users
    ├── Schema
    │   ├── id   INT
    │   └── name TEXT
    │
    └── Rows: []
```

---

## Find a table

```text
GetTable(name):

    normalizedName = NormalizeName(name)

    table, exists = storage.Tables[normalizedName]

    if table does not exist:
        return error:
            "table not found"

    return table
```

---

# Insert pseudocode

Supported syntax:

```sql
INSERT INTO users VALUES (1, 'Akhilesh');
```

The parser should produce something similar to:

```text
InsertStatement:
    Table = "users"

    Values:
        IntegerLiteral(1)
        StringLiteral("Akhilesh")
```

---

## Storage-level insert

```text
Storage.Insert(statement):

    table, error = GetTable(statement.Table)

    if error exists:
        return error

    values, error = BuildRowValues(
        table.Schema,
        statement.Values
    )

    if error exists:
        return error

    row = Row:
        Values = values

    return table.Insert(row)
```

---

## Table insert

```text
Table.Insert(row):

    error = ValidateRow(table.Schema, row)

    if error exists:
        return error

    copiedRow = CopyRow(row)

    append copiedRow to table.Rows

    return success
```

Copying the row prevents the caller from modifying stored data through the original slice.

---

## Build row values from AST literals

```text
BuildRowValues(schema, expressions):

    if number of expressions != number of schema columns:
        return error:
            "expected N values, received M"

    values = empty Value list
    reserve capacity equal to number of expressions

    for index from 0 to number of expressions - 1:

        column = schema.Columns[index]
        expression = expressions[index]

        value, error = ConvertExpression(
            expression,
            column.Type
        )

        if error exists:
            return error containing:
                column name
                expected type
                received expression

        append value to values

    return values
```

---

## Convert one expression

```text
ConvertExpression(expression, expectedType):

    if expectedType is INT:

        if expression is not IntegerLiteral:
            return error:
                "expected INT"

        return Value:
            Type = INT
            Int  = expression.Value

    if expectedType is TEXT:

        if expression is not StringLiteral:
            return error:
                "expected TEXT"

        return Value:
            Type = TEXT
            Text = expression.Value

    return error:
        "unsupported schema type"
```

---

## Validate an already-built row

```text
ValidateRow(schema, row):

    if number of row values != number of schema columns:
        return error:
            "row value count does not match column count"

    for index from 0 to number of columns - 1:

        column = schema.Columns[index]
        value = row.Values[index]

        if value.Type does not match column.Type:
            return error:
                "column <name> expects <type>, received <value type>"

    return success
```

This protects `Table.Insert` even when it is called directly without going through `Storage.Insert`.

---

# Select-all pseudocode

Supported query:

```sql
SELECT id, name FROM users;
```

For the first implementation, scanning means looping over every stored row.

```text
SelectAll(tableName):

    table, error = GetTable(tableName)

    if error exists:
        return error

    result = empty row list
    reserve capacity equal to table row count

    for each row in table.Rows:
        append CopyRow(row) to result

    return result
```

Copying protects internal storage from accidental external mutation.

---

# Selecting specific columns

Example:

```sql
SELECT name FROM users;
```

The table contains:

```text
Schema:
    index 0 → id
    index 1 → name

Rows:
    [1, "Akhilesh"]
    [2, "Ravi"]
```

Expected result:

```text
["Akhilesh"]
["Ravi"]
```

---

## Resolve selected column positions

```text
ResolveColumnIndexes(schema, selectedNames):

    indexes = empty integer list
    seen = empty set

    for each requestedName in selectedNames:

        normalizedName = NormalizeName(requestedName)

        if normalizedName exists in seen:
            return error:
                "column selected more than once"

        foundIndex = -1

        for index from 0 to number of schema columns - 1:

            column = schema.Columns[index]

            if column.Name equals normalizedName:
                foundIndex = index
                break

        if foundIndex equals -1:
            return error:
                "unknown column"

        append foundIndex to indexes
        add normalizedName to seen

    return indexes
```

---

## Project selected columns

“Projection” means returning only requested columns.

```text
ProjectRows(rows, columnIndexes):

    projectedRows = empty row list
    reserve capacity equal to number of rows

    for each sourceRow in rows:

        projectedValues = empty Value list
        reserve capacity equal to number of selected columns

        for each columnIndex in columnIndexes:

            append sourceRow.Values[columnIndex]
                to projectedValues

        append Row:
            Values = projectedValues
            to projectedRows

    return projectedRows
```

---

## Execute simple SELECT

```text
Storage.Select(statement):

    table, error = GetTable(statement.Table)

    if error exists:
        return error

    columnIndexes, error = ResolveColumnIndexes(
        table.Schema,
        statement.Columns
    )

    if error exists:
        return error

    resultRows = ProjectRows(
        table.Rows,
        columnIndexes
    )

    return QueryResult:
        Columns = selected column schemas
        Rows    = resultRows
```

---

# Row-count helper

```text
Table.RowCount():

    return length of table.Rows
```

Example:

```text
before insert: 0
after first insert: 1
after second insert: 2
```

This is the first operational metric for the storage layer.

---

# Insert helper flow

Input:

```sql
INSERT INTO users VALUES (1, 'Akhilesh');
```

Existing schema:

```text
users
├── id   INT
└── name TEXT
```

Flow:

```text
parser returns InsertStatement
↓
Storage.Insert(statement)
↓
GetTable("users")
↓
table found
↓
BuildRowValues(schema, expressions)
↓
compare counts
    schema columns = 2
    expressions    = 2
↓
process expression at index 0
    ↓
    schema column = id INT
    expression    = IntegerLiteral(1)
    ↓
    ConvertExpression()
    ↓
    produce Value{Type: INT, Int: 1}
↓
process expression at index 1
    ↓
    schema column = name TEXT
    expression    = StringLiteral("Akhilesh")
    ↓
    ConvertExpression()
    ↓
    produce Value{Type: TEXT, Text: "Akhilesh"}
↓
create Row:
    [INT(1), TEXT("Akhilesh")]
↓
Table.Insert(row)
↓
ValidateRow()
↓
copy row values
↓
append copied row to table.Rows
↓
row count changes from 0 to 1
↓
return success
```

Final storage:

```text
users.Rows
└── [1, "Akhilesh"]
```

---

# Insert/select round-trip flow

Commands:

```sql
INSERT INTO users VALUES (1, 'Akhilesh');
SELECT id, name FROM users;
```

Flow:

```text
INSERT
↓
row converted and validated
↓
row appended to users.Rows
↓
SELECT
↓
users table found
↓
resolve:
    id   → index 0
    name → index 1
↓
scan users.Rows
↓
read row [1, "Akhilesh"]
↓
project indexes [0, 1]
↓
return [1, "Akhilesh"]
```

This is called a round-trip because:

```text
input row
→ stored
→ retrieved
→ result equals original row
```

---

# Wrong value-count failure flow

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
Storage.Insert(statement)
↓
GetTable("users")
↓
BuildRowValues()
↓
schema expects 2 values
↓
statement contains 1 value
↓
return error:
    table "users" expects 2 values, received 1
↓
Table.Insert is never called
↓
table.Rows remains unchanged
```

---

# Wrong-type failure flow

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
BuildRowValues()
↓
process index 0
↓
column id expects INT
↓
expression is StringLiteral("one")
↓
ConvertExpression() rejects expression
↓
return error:
    column "id" expects INT, received TEXT
↓
no row is appended
↓
row count remains unchanged
```

---

# Unknown-table failure flow

Input:

```sql
INSERT INTO orders VALUES (1);
```

Flow:

```text
Storage.Insert(statement)
↓
GetTable("orders")
↓
orders not found in storage.Tables
↓
return error:
    table "orders" does not exist
↓
no storage state changes
```

---

# Unknown-column SELECT failure

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
Storage.Select(statement)
↓
GetTable("users")
↓
ResolveColumnIndexes(["email"])
↓
scan schema columns
↓
email does not match id
↓
email does not match name
↓
return error:
    column "email" does not exist in table "users"
↓
table rows are not modified
```

---

# Defensive row copying

Consider:

```go
values := []Value{
	NewIntValue(1),
	NewTextValue("Akhilesh"),
}

row := Row{Values: values}

table.Insert(row)

values[1] = NewTextValue("Changed")
```

Without copying, the stored row might unexpectedly become:

```text
[1, "Changed"]
```

Therefore:

```text
CopyRow(row):

    copiedValues = new Value slice
    length = number of row values

    copy row.Values into copiedValues

    return Row:
        Values = copiedValues
```

Go slices refer to underlying arrays, so separate slices may share the same backing storage.

---

# Recommended method structure

```go
type Storage struct {
	Tables map[string]*Table
}

type Table struct {
	Schema *TableSchema
	Rows   []Row
}

type Row struct {
	Values []Value
}

type Value struct {
	Type ValueType
	Int  int64
	Text string
}
```

Methods:

```go
func NewStorage() *Storage

func (s *Storage) CreateTable(
	schema *TableSchema,
) error

func (s *Storage) GetTable(
	name string,
) (*Table, error)

func (s *Storage) Insert(
	stmt *InsertStatement,
) error

func (s *Storage) Select(
	stmt *SelectStatement,
) (*QueryResult, error)

func (t *Table) Insert(row Row) error

func (t *Table) RowCount() int

func buildRowValues(
	schema *TableSchema,
	expressions []Expression,
) ([]Value, error)

func convertExpression(
	expression Expression,
	expected DataType,
) (Value, error)

func validateRow(
	schema *TableSchema,
	row Row,
) error

func resolveColumnIndexes(
	schema *TableSchema,
	names []string,
) ([]int, error)

func projectRows(
	rows []Row,
	indexes []int,
) []Row

func copyRow(row Row) Row
```

---

# Important ownership rule

Use this ownership model:

```text
Storage owns tables.

Table owns its Rows slice.

Each stored Row owns its Values slice.

Callers receive copies when mutation could affect storage.
```

This prevents accidental changes outside the storage layer.

---

# Minimum tests

## Insert one row

```text
Given:
    users(id INT, name TEXT)
    empty table

When:
    insert [1, "Akhilesh"]

Then:
    row count is 1
    stored row equals [1, "Akhilesh"]
```

## Insert/select round trip

```text
Given:
    users(id INT, name TEXT)

When:
    insert [1, "Akhilesh"]
    select id, name from users

Then:
    result contains one row
    result equals [1, "Akhilesh"]
```

## Multiple rows preserve insertion order

```text
When:
    insert [1, "A"]
    insert [2, "B"]

Then:
    rows[0] equals [1, "A"]
    rows[1] equals [2, "B"]
```

## Wrong number of values

```text
When:
    insert [1]

Then:
    return value-count error
    row count remains 0
```

## Wrong type

```text
When:
    insert ["one", "Akhilesh"]

Then:
    return type-mismatch error
    row count remains 0
```

## Unknown table

```text
When:
    insert into orders

Then:
    return table-not-found error
```

## Unknown selected column

```text
When:
    select email from users

Then:
    return column-not-found error
```

## Input mutation does not change stored row

```text
Given:
    caller creates values [1, "Akhilesh"]

When:
    insert row
    caller changes original values to [1, "Changed"]

Then:
    stored row remains [1, "Akhilesh"]
```

---

# What not to build yet

Do not add:

```text
disk files
pages
record serialization
indexes
row identifiers
UPDATE
DELETE
transactions
concurrent access
NULL
constraints
variable-length binary encoding
```

Those concerns would hide the essential learning goal:

```text
schema
+
typed row validation
+
append
+
scan
```

---

# Build order

```text
define Value
↓
define Row
↓
define Table
↓
define Storage
↓
create empty table from catalog schema
↓
implement table lookup
↓
convert AST literals into typed values
↓
validate value count
↓
validate value types
↓
implement Table.Insert
↓
implement RowCount
↓
implement SELECT full scan
↓
implement column projection
↓
add defensive row copying
↓
write insert/select round-trip test
↓
write failure tests
```

---

# Final mental model

```text
Catalog:
users(id INT, name TEXT)

Storage:
users.Rows = [
    [1, "Akhilesh"],
    [2, "Ravi"]
]
```

Insert:

```text
AST values
→ convert to typed Values
→ validate against schema
→ create Row
→ append to Table.Rows
```

Select:

```text
find table
→ resolve requested column positions
→ scan rows
→ project requested values
→ return result
```

This implementation is intentionally temporary:

```text
[]Row
→ later replaced by
heap pages + encoded records + disk persistence
```

The SQL and table APIs can remain mostly stable while the internal storage implementation changes.

# In-memory catalog

# Slice 4 — In-Memory Catalog

## What this slice builds

The catalog stores the database’s **schema metadata**:

```text
database
└── tables
    └── columns
        ├── name
        └── data type
```

Example SQL:

```sql
CREATE TABLE users (
    id INT,
    name TEXT
);
```

Catalog state:

```text
users
├── id   INT
└── name TEXT
```

It stores the table definition, not the table’s rows.

Real databases use system catalogs for similar metadata, although with far more information. PostgreSQL describes system catalogs as the place where table, column and other schema metadata is stored.

---

## What to study

Read only these:

1. **Go Maps in Action** — map creation, lookup, insertion and deletion.
2. **PostgreSQL System Catalogs** — understand what schema metadata means.
3. **SQLite `sqlite_schema`** — see a minimal real database schema catalog.

Do not study PostgreSQL’s complete internal catalog implementation yet.

---

## Scope

Support only:

```text
one database
multiple tables
ordered columns
INT and TEXT types
CREATE TABLE
schema inspection
```

Do not support yet:

```text
constraints
indexes
foreign keys
ALTER TABLE
schema persistence
multiple databases
```

---

## Core data model

```go
type DataType string

const (
	TypeInt  DataType = "INT"
	TypeText DataType = "TEXT"
)

type ColumnSchema struct {
	Name string
	Type DataType
}

type TableSchema struct {
	Name    string
	Columns []ColumnSchema
}

type Catalog struct {
	Tables map[string]*TableSchema
}
```

Why both maps and slices?

```text
map:
quickly find a table by name

slice:
preserve column order
```

Example:

```go
Catalog{
	Tables: map[string]*TableSchema{
		"users": {
			Name: "users",
			Columns: []ColumnSchema{
				{Name: "id", Type: TypeInt},
				{Name: "name", Type: TypeText},
			},
		},
	},
}
```

---

## Integration flow

```text
SQL input
↓
Tokenizer
↓
[]Token
↓
Parser
↓
CreateTableStatement AST
↓
Catalog.Apply()
↓
validate table and columns
↓
store TableSchema
```

The parser understands the SQL structure.

The catalog validates and stores the schema.

---

# Core pseudocode

## Create a catalog

```text
NewCatalog():

    return Catalog:
        Tables = empty map
```

---

## Apply a parsed statement

```text
Apply(statement):

    if statement is CreateTableStatement:
        return CreateTable(statement)

    return error:
        "statement does not modify the catalog"
```

Later, `Apply` may also handle:

```text
DROP TABLE
ALTER TABLE
CREATE INDEX
```

---

## Create a table

```text
CreateTable(statement):

    tableName = NormalizeName(statement.Table)

    if tableName is empty:
        return error:
            "table name cannot be empty"

    if tableName already exists in catalog:
        return error:
            "table already exists"

    columns, error = BuildColumns(statement.Columns)

    if error exists:
        return error

    tableSchema = TableSchema:
        Name    = tableName
        Columns = columns

    add tableSchema to catalog.Tables using tableName as key

    return success
```

Important rule:

```text
Perform all validation before changing the catalog.
```

Otherwise, an error midway through creation could leave partially stored schema state.

---

## Build and validate columns

```text
BuildColumns(columnDefinitions):

    if columnDefinitions is empty:
        return error:
            "table must contain at least one column"

    columns = empty ColumnSchema list
    seenNames = empty set

    for each definition in columnDefinitions:

        columnName = NormalizeName(definition.Name)

        if columnName is empty:
            return error:
                "column name cannot be empty"

        if columnName exists in seenNames:
            return error:
                "duplicate column"

        dataType, error = ParseDataType(definition.DataType)

        if error exists:
            return error

        append ColumnSchema:
            Name = columnName
            Type = dataType

        add columnName to seenNames

    return columns
```

---

## Validate a data type

```text
ParseDataType(value):

    normalized = uppercase(value)

    if normalized equals "INT":
        return TypeInt

    if normalized equals "TEXT":
        return TypeText

    return error:
        "unsupported data type"
```

---

## Find a table

```text
GetTable(name):

    normalizedName = NormalizeName(name)

    table, exists = catalog.Tables[normalizedName]

    if table does not exist:
        return error:
            "table not found"

    return table
```

---

## Find a column

```text
GetColumn(tableName, columnName):

    table, error = GetTable(tableName)

    if error exists:
        return error

    normalizedColumn = NormalizeName(columnName)

    for each column in table.Columns:

        if column.Name equals normalizedColumn:
            return column

    return error:
        "column not found"
```

Because columns are stored in a slice, finding one currently requires a linear scan.

That is acceptable for this small scope.

---

## Inspect the schema

```text
DescribeTable(tableName):

    table, error = GetTable(tableName)

    if error exists:
        return error

    output = empty list

    for each column in table.Columns:

        append:
            column.Name + " " + column.Type

    return output
```

Example output:

```text
users
------
id    INT
name  TEXT
```

---

## List tables

```text
ListTables():

    names = empty list

    for each tableName in catalog.Tables:
        append tableName to names

    sort names alphabetically

    return names
```

Sorting is important because Go map iteration order is not guaranteed.

---

# Parser-to-catalog helper flow

Input:

```sql
CREATE TABLE users (
    id INT,
    name TEXT
);
```

Parser output:

```text
CreateTableStatement:
    Table = "users"

    Columns:
        ColumnDefinition:
            Name = "id"
            Type = "INT"

        ColumnDefinition:
            Name = "name"
            Type = "TEXT"
```

Catalog execution:

```text
Catalog.Apply(statement)
↓
statement is CreateTableStatement
↓
CreateTable(statement)
↓
normalize table name: users
↓
check catalog.Tables["users"]
↓
table does not exist
↓
BuildColumns(statement.Columns)
    ↓
    create empty seenNames set
    ↓
    process id INT
        ↓
        id is not duplicated
        ↓
        INT is supported
        ↓
        append ColumnSchema{Name: "id", Type: INT}
    ↓
    process name TEXT
        ↓
        name is not duplicated
        ↓
        TEXT is supported
        ↓
        append ColumnSchema{Name: "name", Type: TEXT}
↓
create TableSchema
↓
store it under catalog.Tables["users"]
↓
return success
```

Final catalog:

```text
Catalog
└── users
    ├── id   INT
    └── name TEXT
```

---

# Duplicate-table failure flow

Existing catalog:

```text
Catalog
└── users
    ├── id   INT
    └── name TEXT
```

Input:

```sql
CREATE TABLE users (
    email TEXT
);
```

Flow:

```text
Parser returns CreateTableStatement
↓
Catalog.Apply(statement)
↓
CreateTable(statement)
↓
normalize name: users
↓
lookup catalog.Tables["users"]
↓
table already exists
↓
return error:
    table "users" already exists
↓
catalog remains unchanged
```

---

# Duplicate-column failure flow

Input:

```sql
CREATE TABLE users (
    id INT,
    id TEXT
);
```

Flow:

```text
CreateTable(statement)
↓
BuildColumns()
↓
seenNames = {}
↓
process first id
↓
add id to seenNames
↓
process second id
↓
id already exists in seenNames
↓
return error:
    duplicate column "id"
↓
table is not added to catalog
```

This is why validation happens before insertion into `catalog.Tables`.

---

# Unsupported-type failure flow

Input:

```sql
CREATE TABLE users (
    active BOOLEAN
);
```

Flow:

```text
BuildColumns()
↓
process active BOOLEAN
↓
ParseDataType("BOOLEAN")
↓
not INT
↓
not TEXT
↓
return error:
    unsupported data type "BOOLEAN"
↓
catalog remains unchanged
```

---

# Essential helpers

```text
NormalizeName(name):

    trimmed = remove surrounding whitespace

    normalized = lowercase(trimmed)

    return normalized
```

Input:

```text
" Users "
```

Output:

```text
"users"
```

This prevents names such as `users`, `Users` and `USERS` from becoming separate tables in your simplified database.

---

```text
TableExists(name):

    normalized = NormalizeName(name)

    _, exists = catalog.Tables[normalized]

    return exists
```

---

```text
ColumnExists(table, name):

    normalized = NormalizeName(name)

    for each column in table.Columns:

        if column.Name equals normalized:
            return true

    return false
```

---

# Suggested Go method structure

```go
func NewCatalog() *Catalog

func (c *Catalog) Apply(stmt Statement) error

func (c *Catalog) CreateTable(stmt *CreateTableStatement) error

func (c *Catalog) GetTable(name string) (*TableSchema, error)

func (c *Catalog) GetColumn(
	tableName string,
	columnName string,
) (*ColumnSchema, error)

func (c *Catalog) ListTables() []string

func buildColumns(
	definitions []ColumnDefinition,
) ([]ColumnSchema, error)

func parseDataType(value string) (DataType, error)

func normalizeName(value string) string
```

---

# Minimum tests

## Successful table creation

```text
Given:
    empty catalog

When:
    CREATE TABLE users (id INT, name TEXT)

Then:
    catalog contains users
    users has two columns
    column order is id, name
    types are INT, TEXT
```

## Duplicate table

```text
Given:
    users already exists

When:
    CREATE TABLE users (email TEXT)

Then:
    return duplicate-table error
    original users schema remains unchanged
```

## Duplicate column

```text
When:
    CREATE TABLE users (id INT, id TEXT)

Then:
    return duplicate-column error
    users is not created
```

## Unsupported type

```text
When:
    CREATE TABLE users (active BOOLEAN)

Then:
    return unsupported-type error
    users is not created
```

## Unknown table lookup

```text
When:
    GetTable("orders")

Then:
    return table-not-found error
```

---

# Mental model

```text
AST:
describes what the SQL command requested

Catalog:
stores the database’s current schema

CREATE TABLE AST
+
catalog validation
=
new TableSchema
```

For this slice:

```text
Catalog = map<table name, table schema>

TableSchema = ordered list of columns

ColumnSchema = column name + data type
```

---

# Build order

```text
define DataType
↓
define ColumnSchema
↓
define TableSchema
↓
define Catalog
↓
implement NewCatalog
↓
implement CreateTable
↓
validate duplicate tables
↓
validate duplicate columns
↓
validate INT and TEXT
↓
implement GetTable
↓
implement schema inspection
↓
connect parser output to Catalog.Apply
↓
write success and failure tests
```

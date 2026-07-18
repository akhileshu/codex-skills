# Simple logical planner

# Slice 7 — Simple Logical Planner

## What this slice builds

The binder produces a validated statement:

```text
BoundSelectStatement:
    table   = users
    columns = [name at index 1]
```

The planner converts that meaning into a sequence of logical operations:

```text
Project(name)
└── Scan(users)
```

The planner answers:

```text
What operations must happen to produce the result?
```

It does **not** execute those operations.

---

## What to study

Read only these:

1. **PostgreSQL — Using `EXPLAIN`**
   Focus on plan trees, scan nodes and parent-child relationships. PostgreSQL describes query plans as trees of plan nodes, with scan nodes usually at the bottom.

2. **DuckDB — `EXPLAIN`**
   Look at how SQL becomes operators such as sequential scan, filter and projection.

3. **CMU 15-445 — Query Planning and Optimization**
   Read only the introduction explaining logical plans versus physical plans.

Do not study cost estimation, join ordering or optimizer search yet.

---

# Scope

Support these plan nodes:

```text
Scan
Filter
Project
Insert
CreateTable
```

Use one fixed plan for every statement.

Do not support yet:

```text
index scans
join algorithms
cost estimation
alternative plans
sorting
aggregation
parallel execution
optimizer rewrites
```

---

# Core mental model

```text
Bound AST:
What does the validated SQL mean?

Logical plan:
What relational operations are required?

Executor:
Run those operations.
```

Pipeline:

```text
SQL
↓
Tokenizer
↓
Parser
↓
Raw AST
↓
Binder
↓
Bound AST
↓
Logical Planner
↓
Logical Plan
↓
Executor
```

---

# Example

SQL:

```sql
SELECT name FROM users;
```

Bound AST:

```text
BoundSelect:
    table = users

    columns:
        name
        index = 1
        type = TEXT
```

Logical plan:

```text
Project(name)
└── Scan(users)
```

Execution order is bottom-up:

```text
Scan users
↓
produce rows
↓
Project name
↓
produce final result
```

---

# Plan tree structure

A plan is usually a tree:

```text
parent operation
└── child operation
```

The child produces rows for the parent.

Example:

```text
Project(name)
└── Filter(id = 1)
    └── Scan(users)
```

Execution conceptually flows upward:

```text
Scan
↓
Filter
↓
Project
```

---

# Plan node interface

```go
type PlanNode interface {
	planNode()
	OutputSchema() []ColumnSchema
}
```

Each node should describe:

```text
operation type
input child nodes
output columns
operation-specific data
```

---

# Scan plan

A scan reads every row from a table.

```go
type ScanPlan struct {
	Table BoundTable
	Output []ColumnSchema
}

func (*ScanPlan) planNode() {}

func (p *ScanPlan) OutputSchema() []ColumnSchema {
	return p.Output
}
```

Example:

```text
ScanPlan:
    Table = users

    Output:
        id   INT
        name TEXT
```

Logical meaning:

```text
read all rows from users
```

It does not yet specify whether execution uses:

```text
memory slice
heap file
index
sequential disk scan
```

That decision belongs to physical planning later.

---

# Project plan

Projection selects specific columns.

```go
type ProjectPlan struct {
	Child       PlanNode
	Columns     []BoundColumn
	Output      []ColumnSchema
}

func (*ProjectPlan) planNode() {}

func (p *ProjectPlan) OutputSchema() []ColumnSchema {
	return p.Output
}
```

Example:

```text
ProjectPlan:
    Columns:
        name at input index 1

    Child:
        Scan(users)

    Output:
        name TEXT
```

Logical meaning:

```text
for every input row
return only the selected column values
```

---

# Filter plan

A filter keeps rows matching a condition.

You may define it now even if `WHERE` is implemented shortly afterward.

```go
type FilterPlan struct {
	Child     PlanNode
	Predicate BoundExpression
	Output    []ColumnSchema
}

func (*FilterPlan) planNode() {}

func (p *FilterPlan) OutputSchema() []ColumnSchema {
	return p.Output
}
```

Example:

```text
FilterPlan:
    Predicate:
        id = 1

    Child:
        Scan(users)
```

Logical meaning:

```text
receive rows from child
↓
evaluate predicate for each row
↓
keep only matching rows
```

---

# Insert plan

```go
type InsertPlan struct {
	Table  BoundTable
	Values []BoundInsertValue
}

func (*InsertPlan) planNode() {}

func (*InsertPlan) OutputSchema() []ColumnSchema {
	return nil
}
```

Example:

```text
InsertPlan:
    Table = users

    Values:
        id   = INT(1)
        name = TEXT("Akhilesh")
```

Logical meaning:

```text
construct one validated row
↓
insert it into users
```

---

# Create-table plan

```go
type CreateTablePlan struct {
	TableName string
	Columns   []ColumnSchema
}

func (*CreateTablePlan) planNode() {}

func (*CreateTablePlan) OutputSchema() []ColumnSchema {
	return nil
}
```

Logical meaning:

```text
create catalog entry
↓
create empty storage table
```

---

# Planner structure

```go
type Planner struct{}
```

Possible API:

```go
func NewPlanner() *Planner

func (p *Planner) Plan(
	stmt BoundStatement,
) (PlanNode, error)
```

The planner does not need the catalog because the binder has already resolved names and types.

---

# Core pseudocode

## Main planner function

```text
Plan(boundStatement):

    if boundStatement is BoundSelectStatement:
        return PlanSelect(boundStatement)

    if boundStatement is BoundInsertStatement:
        return PlanInsert(boundStatement)

    if boundStatement is BoundCreateTableStatement:
        return PlanCreateTable(boundStatement)

    return planner error:
        unsupported bound statement type
```

Input:

```text
validated BoundStatement
```

Output:

```text
root PlanNode
```

Failure:

```text
planner does not support this bound statement type
```

---

# Plan SELECT

Supported SQL:

```sql
SELECT id, name FROM users;
```

```text
PlanSelect(statement):

    scanPlan = CreateScanPlan(statement.Table)

    projectPlan = CreateProjectPlan(
        child = scanPlan,
        columns = statement.Columns
    )

    return projectPlan
```

The returned root is `ProjectPlan`, not `ScanPlan`.

```text
Project
└── Scan
```

The root represents the final operation.

---

## Create scan plan

```text
CreateScanPlan(boundTable):

    outputColumns = copy boundTable.Schema.Columns

    return ScanPlan:
        Table  = boundTable
        Output = outputColumns
```

Inputs:

```text
resolved table
```

Output:

```text
ScanPlan producing every table column
```

Failure:

```text
normally none

table existence was already validated by binder
```

---

## Create project plan

```text
CreateProjectPlan(child, boundColumns):

    if child is nil:
        return planner error:
            project requires a child plan

    if boundColumns is empty:
        return planner error:
            project requires at least one column

    outputColumns = empty ColumnSchema list
    reserve capacity equal to boundColumns count

    for each boundColumn in boundColumns:

        if boundColumn.Index is outside child output range:
            return planner error:
                bound column index is invalid

        append boundColumn.Schema to outputColumns

    return ProjectPlan:
        Child   = child
        Columns = boundColumns
        Output  = outputColumns
```

The invalid-index check protects against internal binder/planner bugs.

It is not normally a user error.

---

# Plan SELECT with WHERE

Example:

```sql
SELECT name
FROM users
WHERE id = 1;
```

Bound statement:

```text
BoundSelect:
    table = users
    columns = [name]
    predicate = id = INT(1)
```

Planner:

```text
PlanSelect(statement):

    currentPlan = CreateScanPlan(statement.Table)

    if statement.Predicate exists:

        currentPlan = CreateFilterPlan(
            child = currentPlan,
            predicate = statement.Predicate
        )

    currentPlan = CreateProjectPlan(
        child = currentPlan,
        columns = statement.Columns
    )

    return currentPlan
```

Final tree:

```text
Project(name)
└── Filter(id = 1)
    └── Scan(users)
```

---

## Create filter plan

```text
CreateFilterPlan(child, predicate):

    if child is nil:
        return planner error:
            filter requires a child plan

    if predicate is nil:
        return planner error:
            filter requires a predicate

    if predicate result type is not BOOLEAN:
        return planner error:
            filter predicate must produce BOOLEAN

    return FilterPlan:
        Child     = child
        Predicate = predicate
        Output    = copy child.OutputSchema()
```

A filter does not change the row shape:

```text
input columns  = id, name
output columns = id, name
```

It changes only which rows continue upward.

---

# Plan INSERT

```text
PlanInsert(statement):

    if statement.Table is unresolved:
        return planner error:
            insert table is unresolved

    if number of statement.Values
       does not equal number of table columns:

        return planner error:
            bound INSERT has invalid value count

    return InsertPlan:
        Table  = statement.Table
        Values = copy statement.Values
```

The binder should already have checked counts and types.

The planner performs only cheap internal consistency checks.

---

# Plan CREATE TABLE

```text
PlanCreateTable(statement):

    if statement.TableName is empty:
        return planner error:
            table name cannot be empty

    if statement.Columns is empty:
        return planner error:
            table must contain columns

    return CreateTablePlan:
        TableName = statement.TableName
        Columns   = copy statement.Columns
```

The planner does not mutate the catalog.

It only describes the operation.

---

# Helper flow: simple SELECT

Input:

```sql
SELECT name FROM users;
```

Bound AST:

```text
BoundSelectStatement:
    Table:
        users

    Columns:
        BoundColumn:
            Name  = name
            Index = 1
            Type  = TEXT
```

Planning flow:

```text
Planner.Plan(statement)
↓
statement is BoundSelectStatement
↓
PlanSelect(statement)
↓
CreateScanPlan(users)
    ↓
    copy users schema
    ↓
    create:

    ScanPlan:
        Output = [id INT, name TEXT]
↓
CreateProjectPlan(
    child = ScanPlan,
    columns = [name at index 1]
)
    ↓
    verify child exists
    ↓
    verify column index 1 is valid
    ↓
    output schema becomes [name TEXT]
    ↓
    create ProjectPlan
↓
return ProjectPlan as root
```

Final logical plan:

```text
Project
│   columns: name
│   output:  name TEXT
│
└── Scan
    table: users
    output:
        id INT
        name TEXT
```

Nothing has been read from storage yet.

---

# Helper flow: SELECT with filter

Input:

```sql
SELECT name
FROM users
WHERE id = 1;
```

Planning flow:

```text
PlanSelect(statement)
↓
currentPlan = Scan(users)
↓
statement has predicate
↓
currentPlan = Filter(
    predicate = id = 1,
    child = Scan(users)
)
↓
currentPlan = Project(
    columns = name,
    child = Filter(...)
)
↓
return Project as root
```

Final plan:

```text
Project(name)
└── Filter(id = 1)
    └── Scan(users)
```

Execution order:

```text
Scan users
↓
Filter rows where id = 1
↓
Return only name
```

---

# Helper flow: INSERT

Input:

```sql
INSERT INTO users VALUES (1, 'Akhilesh');
```

Bound AST:

```text
BoundInsertStatement:
    Table = users

    Values:
        id   = INT(1)
        name = TEXT("Akhilesh")
```

Planning flow:

```text
Planner.Plan(statement)
↓
statement is BoundInsertStatement
↓
PlanInsert(statement)
↓
verify resolved table exists
↓
verify bound value count matches schema
↓
copy bound values
↓
return InsertPlan
```

Plan:

```text
Insert
├── table: users
├── id:   INT(1)
└── name: TEXT("Akhilesh")
```

Again, no row has been inserted yet.

---

# Failure flow: invalid bound column index

Suppose an internal bug produces:

```text
users schema:
    index 0 → id
    index 1 → name
```

But the bound AST contains:

```text
BoundColumn:
    Name  = email
    Index = 5
```

Flow:

```text
PlanSelect()
↓
CreateScanPlan(users)
↓
CreateProjectPlan(...)
↓
child output contains 2 columns
↓
bound index is 5
↓
index 5 is outside range [0, 2)
↓
return planner error:
    column "email" has invalid bound index 5
↓
no plan is returned
↓
executor is not called
```

This indicates an internal consistency bug, not invalid SQL.

The binder should never normally produce this result.

---

# Failure flow: unsupported statement

Input bound node:

```text
BoundDeleteStatement
```

But `DELETE` planning is not implemented.

Flow:

```text
Planner.Plan(statement)
↓
not BoundSelectStatement
↓
not BoundInsertStatement
↓
not BoundCreateTableStatement
↓
return planner error:
    unsupported statement type BoundDeleteStatement
```

---

# Raw AST versus bound AST versus plan

SQL:

```sql
SELECT name FROM users;
```

Raw AST:

```text
table   = "users"
columns = ["name"]
```

Bound AST:

```text
table = resolved users table

column:
    name
    index = 1
    type = TEXT
```

Logical plan:

```text
Project column index 1
└── Scan users
```

The stages remove uncertainty:

```text
Raw AST:
names may not exist

Bound AST:
names and types are validated

Logical plan:
operations and their order are explicit
```

---

# Logical versus physical plan

For now, use only logical planning.

Logical node:

```text
Scan(users)
```

It means:

```text
read rows from users
```

It does not decide how.

Possible future physical plans:

```text
SequentialMemoryScan(users)
HeapFileScan(users)
IndexScan(users, users_id_index)
```

A real optimizer may compare multiple possible plans and choose one based on estimated cost. PostgreSQL’s planner considers alternative execution strategies that produce equivalent results and selects an expected efficient plan.

For this slice:

```text
one logical operation
→ one fixed executor implementation
```

---

# Why the planner is useful now

Without planner:

```text
executor receives BoundSelectStatement
↓
executor decides:
    scan table
    filter rows
    project columns
```

With planner:

```text
planner builds:
    Project
    └── Filter
        └── Scan

executor only executes nodes
```

| Without planner                    | With planner                           |
| ---------------------------------- | -------------------------------------- |
| Execution order hidden in code     | Execution order visible as a tree      |
| Harder to inspect                  | Plan can be printed                    |
| Harder to optimize later           | Nodes can later be rewritten           |
| Executor handles statement meaning | Executor handles individual operations |

The planner may feel unnecessary for three statements, but it creates the correct boundary for future optimization.

---

# Explain-plan output

Implement:

```text
Explain(plan):

    recursively print node
    then print child with deeper indentation
```

Pseudocode:

```text
Explain(node, depth):

    indentation = repeat "  " depth times

    if node is ScanPlan:
        print indentation + "Scan table=" + node.Table.Name
        return

    if node is FilterPlan:
        print indentation + "Filter predicate=" +
            FormatExpression(node.Predicate)

        Explain(node.Child, depth + 1)
        return

    if node is ProjectPlan:
        names = collect projected column names

        print indentation + "Project columns=" +
            Join(names, ",")

        Explain(node.Child, depth + 1)
        return

    if node is InsertPlan:
        print indentation + "Insert table=" +
            node.Table.Name
        return

    if node is CreateTablePlan:
        print indentation + "CreateTable table=" +
            node.TableName
        return

    print indentation + "UnknownPlan"
```

Output:

```text
Project columns=name
  Filter predicate=id = 1
    Scan table=users
```

`EXPLAIN`-style output is valuable because it makes the planner’s chosen operation tree observable without executing it. DuckDB and PostgreSQL expose plans through `EXPLAIN`.

---

# Suggested Go structure

```go
type PlanNode interface {
	planNode()
	OutputSchema() []ColumnSchema
}

type ScanPlan struct {
	Table  BoundTable
	Output []ColumnSchema
}

type FilterPlan struct {
	Child     PlanNode
	Predicate BoundExpression
	Output    []ColumnSchema
}

type ProjectPlan struct {
	Child   PlanNode
	Columns []BoundColumn
	Output  []ColumnSchema
}

type InsertPlan struct {
	Table  BoundTable
	Values []BoundInsertValue
}

type CreateTablePlan struct {
	TableName string
	Columns   []ColumnSchema
}
```

Planner methods:

```go
func NewPlanner() *Planner

func (p *Planner) Plan(
	stmt BoundStatement,
) (PlanNode, error)

func (p *Planner) planSelect(
	stmt *BoundSelectStatement,
) (PlanNode, error)

func (p *Planner) planInsert(
	stmt *BoundInsertStatement,
) (PlanNode, error)

func (p *Planner) planCreateTable(
	stmt *BoundCreateTableStatement,
) (PlanNode, error)

func createScanPlan(
	table BoundTable,
) *ScanPlan

func createFilterPlan(
	child PlanNode,
	predicate BoundExpression,
) (*FilterPlan, error)

func createProjectPlan(
	child PlanNode,
	columns []BoundColumn,
) (*ProjectPlan, error)

func Explain(plan PlanNode) string
```

---

# Output schema rule

Every row-producing plan node should describe its output columns.

Example:

```text
Scan users output:
    id   INT
    name TEXT
```

```text
Filter output:
    id   INT
    name TEXT
```

```text
Project name output:
    name TEXT
```

Rule:

```text
Scan:
output = table schema

Filter:
output = child output

Project:
output = selected columns
```

This becomes important when plans contain:

```text
expressions
joins
aliases
aggregations
```

---

# Golden plan tests

A golden test compares the printed plan with expected text.

Input:

```sql
SELECT name FROM users;
```

Expected:

```text
Project columns=name
  Scan table=users
```

Test concept:

```text
parse SQL
↓
bind AST
↓
plan bound AST
↓
Explain(plan)
↓
compare exact output with expected string
```

---

# Minimum tests

## Simple SELECT plan

```text
Given:
    users(id INT, name TEXT)

When:
    plan SELECT name FROM users

Then:
    root is Project
    Project child is Scan
    Scan table is users
    Project output is name TEXT
```

## SELECT with filter

```text
When:
    plan SELECT name
    FROM users
    WHERE id = 1

Then:
    root is Project
    Project child is Filter
    Filter child is Scan
```

## Full projection

```text
When:
    plan SELECT id, name FROM users

Then:
    Project columns preserve requested order:
        id
        name
```

## INSERT plan

```text
When:
    plan bound INSERT INTO users
    VALUES (1, 'Akhilesh')

Then:
    root is Insert
    table is users
    two typed values are present
```

## CREATE TABLE plan

```text
When:
    plan bound CREATE TABLE users (
        id INT,
        name TEXT
    )

Then:
    root is CreateTable
    output schema is empty
```

## Invalid bound column index

```text
Given:
    bound column index exceeds scan output

When:
    create ProjectPlan

Then:
    return internal planner error
```

## Golden explain test

```text
Expected:

Project columns=name
  Scan table=users
```

---

# What should not be repeated here

The planner should not perform binder responsibilities:

```text
look up table names
look up column names
check INSERT value types
check whether columns exist
convert string literals to typed values
```

Those belong to the binder.

The planner may perform only internal consistency checks:

```text
child is not nil
column index is within range
filter predicate returns BOOLEAN
bound value count remains consistent
```

---

# Build order

```text
define PlanNode interface
↓
define ScanPlan
↓
define ProjectPlan
↓
define InsertPlan
↓
define CreateTablePlan
↓
implement Planner.Plan
↓
implement PlanSelect
↓
create Scan → Project tree
↓
implement PlanInsert
↓
implement PlanCreateTable
↓
add OutputSchema to row-producing nodes
↓
implement Explain
↓
add FilterPlan when WHERE exists
↓
write structural tests
↓
write golden explain tests
↓
change executor to consume PlanNode
```

---

# Final mental model

```text
Bound AST:

SELECT:
    table = users
    column = name at index 1
```

Planner transforms it into:

```text
Project(name)
└── Scan(users)
```

The plan is:

```text
not rows
not execution
not storage access
not an optimized algorithm
```

It is a structured description of the work that the executor must perform.

```text
Binder:
resolve meaning

Planner:
organize operations

Executor:
perform operations
```

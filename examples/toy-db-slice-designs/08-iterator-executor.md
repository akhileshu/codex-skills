# Iterator executor

# Slice 8 — Iterator Executor

## What this slice builds

The planner produces a plan:

```text
Project(name)
└── Scan(users)
```

The iterator executor runs that plan as a pipeline:

```text
Open
↓
repeatedly call Next
↓
Close
```

The executor answers:

```text
Run this plan and produce rows.
```

The Volcano model represents each plan node as an iterator that initializes itself, produces one row per request, and cleans up afterward. Parent operators request rows from their children, creating a pull-based execution pipeline.

---

## What to study

Read only these:

1. **Volcano query evaluation paper**
   Focus on the iterator model and operator pipelines.

2. **PostgreSQL executor overview**
   Focus on how plan nodes recursively request tuples from child nodes.

3. **DuckDB execution format**
   Read briefly to understand the future evolution from one-row-at-a-time execution to batch or vectorized execution. DuckDB operators process fixed-size vectors instead of individual rows.

For this slice, implement only:

```text
one row per Next() call
single-threaded execution
in-memory tables
Scan
Project
Insert
CreateTable
```

---

# Core mental model

```text
Logical plan:
describes operations

Iterator executor:
runs each operation

Operator:
runtime implementation of one plan node
```

Example:

```text
Plan nodes              Runtime operators

ProjectPlan             ProjectOperator
└── ScanPlan            └── ScanOperator
```

Execution is pull-based:

```text
Executor asks Project.Next()
↓
Project asks Scan.Next()
↓
Scan returns one row
↓
Project transforms it
↓
Project returns one row
```

The root operator controls execution by repeatedly pulling rows from its child.

---

# Pipeline

```text
SQL
↓
Tokenizer
↓
Parser
↓
Binder
↓
Planner
↓
PlanNode tree
↓
BuildOperator(plan)
↓
Operator tree
↓
Open → Next → Close
↓
QueryResult
```

---

# Operator interface

```go
type Operator interface {
	Open() error
	Next() (Row, bool, error)
	Close() error
	Schema() []ColumnSchema
}
```

Meaning:

```text
Open():
initialize execution state

Next():
return the next row

Close():
release resources and reset state

Schema():
describe rows produced by this operator
```

`Next()` returns:

```text
row     = produced row
hasRow  = whether a row was produced
error   = execution failure
```

Possible results:

```text
Row, true, nil
    one row was produced

empty Row, false, nil
    normal end-of-stream

empty Row, false, error
    execution failed
```

Do not use an empty row to represent end-of-stream because a valid query may theoretically produce a row containing zero projected columns.

---

# Operator lifecycle

Every operator follows this state machine:

```text
Created
↓ Open()
Opened
↓ Next() zero or more times
Exhausted
↓ Close()
Closed
```

Rules:

```text
Open must happen before Next.

Next may be called repeatedly.

Once Next reports end-of-stream,
future Next calls should continue reporting end-of-stream.

Close should be safe after successful Open.

Close should clean up children even after execution failure.
```

---

# Operator state

Use explicit state:

```go
type OperatorState int

const (
	StateCreated OperatorState = iota
	StateOpen
	StateExhausted
	StateClosed
)
```

Each operator can track:

```go
state OperatorState
```

This catches invalid execution such as:

```text
Next before Open
Open twice
Next after Close
```

---

# Scan operator

A scan operator reads rows from one in-memory table.

```go
type ScanOperator struct {
	table       *Table
	position    int
	state       OperatorState
	rowsRead    int64
}
```

`position` points to the next row:

```text
position = 0 → next row is rows[0]
position = 1 → next row is rows[1]
```

---

## Scan.Open

```text
Scan.Open():

    if state is Open:
        return error:
            scan is already open

    if state is Closed:
        return error:
            closed scan cannot be reopened

    if table is nil:
        return error:
            scan table is nil

    position = 0
    rowsRead = 0
    state = Open

    return success
```

Input:

```text
none
```

Output:

```text
initialized scan
```

Failure:

```text
nil table
already open
already closed
```

---

## Scan.Next

```text
Scan.Next():

    if state is Created:
        return error:
            scan must be opened before Next

    if state is Closed:
        return error:
            scan is closed

    if state is Exhausted:
        return:
            no row
            hasRow = false
            no error

    if position >= number of table rows:
        state = Exhausted

        return:
            no row
            hasRow = false
            no error

    sourceRow = table.Rows[position]

    position++
    rowsRead++

    resultRow = CopyRow(sourceRow)

    return:
        resultRow
        hasRow = true
        no error
```

Stopping condition:

```text
position reaches len(table.Rows)
```

---

## Scan.Close

```text
Scan.Close():

    if state is Closed:
        return success

    position = 0
    state = Closed

    return success
```

Make `Close` idempotent:

```text
calling Close twice should not fail
```

This simplifies cleanup after partial failures.

---

## Scan.Schema

```text
Scan.Schema():

    return copy of table.Schema.Columns
```

---

# Project operator

A project operator receives rows from its child and returns only selected columns.

```go
type ProjectOperator struct {
	child         Operator
	columnIndexes []int
	outputSchema  []ColumnSchema
	state         OperatorState
	rowsProduced  int64
}
```

Example:

```text
child schema:
    index 0 → id
    index 1 → name
    index 2 → email

project indexes:
    [1, 0]

output:
    name, id
```

Projection preserves the order requested by the query.

---

## Project.Open

```text
Project.Open():

    if state is Open:
        return error:
            project is already open

    if state is Closed:
        return error:
            closed project cannot be reopened

    if child is nil:
        return error:
            project child is nil

    childSchema = child.Schema()

    for each index in columnIndexes:

        if index < 0:
            return error:
                project column index cannot be negative

        if index >= number of child columns:
            return error:
                project column index is outside child schema

    error = child.Open()

    if error exists:
        return error:
            failed to open project child

    rowsProduced = 0
    state = Open

    return success
```

Important ordering:

```text
validate local state
↓
open child
↓
mark parent open
```

Do not mark the project open before its child successfully opens.

---

## Project.Next

```text
Project.Next():

    if state is Created:
        return error:
            project must be opened before Next

    if state is Closed:
        return error:
            project is closed

    if state is Exhausted:
        return:
            no row
            hasRow = false
            no error

    childRow, hasRow, error = child.Next()

    if error exists:
        return error:
            project child failed

    if hasRow is false:
        state = Exhausted

        return:
            no row
            hasRow = false
            no error

    projectedValues = empty Value slice
    reserve capacity equal to columnIndexes count

    for each index in columnIndexes:
        append childRow.Values[index]
            to projectedValues

    rowsProduced++

    return:
        Row{Values: projectedValues}
        hasRow = true
        no error
```

Project usually calls its child once per `Next()` call.

Later operators such as `Filter` may call their child multiple times before producing one row.

---

## Project.Close

```text
Project.Close():

    if state is Closed:
        return success

    state = Closed

    if child is nil:
        return success

    error = child.Close()

    if error exists:
        return error:
            failed to close project child

    return success
```

Child cleanup must happen even when the project is exhausted or execution failed.

---

## Project.Schema

```text
Project.Schema():

    return copy of outputSchema
```

---

# Filter operator

The slice table includes `Filter`, although you can implement it after scan and project.

```go
type FilterOperator struct {
	child        Operator
	predicate    BoundExpression
	state        OperatorState
	rowsChecked  int64
	rowsProduced int64
}
```

A filter may consume many child rows before returning one matching row.

---

## Filter.Open

```text
Filter.Open():

    validate current state

    if child is nil:
        return error

    if predicate is nil:
        return error

    if predicate result type is not BOOLEAN:
        return error

    error = child.Open()

    if error exists:
        return error

    rowsChecked = 0
    rowsProduced = 0
    state = Open

    return success
```

---

## Filter.Next

```text
Filter.Next():

    validate that operator is open

    if state is Exhausted:
        return end-of-stream

    loop forever:

        row, hasRow, error = child.Next()

        if error exists:
            return error:
                filter child failed

        if hasRow is false:
            state = Exhausted
            return end-of-stream

        rowsChecked++

        matches, error = EvaluatePredicate(
            predicate,
            row
        )

        if error exists:
            return error:
                predicate evaluation failed

        if matches is false:
            continue loop

        rowsProduced++

        return:
            row
            hasRow = true
            no error
```

Stopping conditions:

```text
matching row found
or
child reaches end-of-stream
or
child/predicate returns error
```

---

## Filter.Close

```text
Filter.Close():

    if already closed:
        return success

    state = Closed

    return child.Close()
```

---

# Insert operator

`INSERT` does not produce normal query rows.

Use an execution result containing affected-row count.

Possible design:

```go
type InsertOperator struct {
	table        *Table
	values       []Value
	state        OperatorState
	inserted     bool
	rowsAffected int64
}
```

Because the common `Operator` interface returns rows, represent command completion as a special result row or handle command plans separately.

The cleaner initial design is:

```go
type ExecutorNode interface {
	Open() error
	Next() (ExecutionItem, bool, error)
	Close() error
}
```

Where:

```go
type ExecutionItem struct {
	Row          *Row
	RowsAffected int64
}
```

However, this complicates simple query execution.

For this slice, use two executor paths:

```text
row-producing plans:
    Scan
    Filter
    Project

command plans:
    Insert
    CreateTable
```

---

## Command executor interface

```go
type CommandExecutor interface {
	Execute() (CommandResult, error)
}
```

```go
type CommandResult struct {
	RowsAffected int64
	Message      string
}
```

This is simpler than forcing `INSERT` into a row iterator.

---

## Insert execution pseudocode

```text
ExecuteInsert(plan):

    if plan table is nil:
        return error

    values = empty Value list

    for each bound insert value in plan.Values:
        append bound value.Value to values

    row = Row:
        Values = values

    error = plan.Table.Table.Insert(row)

    if error exists:
        return error

    return CommandResult:
        RowsAffected = 1
        Message = "INSERT 1"
```

The binder already validated value count and types.

The storage layer may retain defensive checks for internal safety.

---

# Create-table execution pseudocode

```text
ExecuteCreateTable(plan, catalog, storage):

    schema = TableSchema:
        Name    = plan.TableName
        Columns = copy plan.Columns

    error = catalog.AddTable(schema)

    if error exists:
        return error

    error = storage.CreateTable(schema)

    if error exists:

        rollbackError = catalog.RemoveTable(schema.Name)

        if rollbackError exists:
            return internal error:
                storage creation failed
                and catalog rollback failed

        return error:
            storage table creation failed

    return CommandResult:
        RowsAffected = 0
        Message = "CREATE TABLE"
```

This reveals an important consistency problem:

```text
catalog update
+
storage update
```

must succeed together.

For now, rollback the catalog if storage creation fails.

Later, transaction mechanisms should handle this atomically.

---

# Building operators from plans

The planner creates plan nodes.

The executor must convert each plan node into a runtime operator.

```text
BuildOperator(plan):

    if plan is ScanPlan:
        return BuildScanOperator(plan)

    if plan is ProjectPlan:
        return BuildProjectOperator(plan)

    if plan is FilterPlan:
        return BuildFilterOperator(plan)

    return error:
        plan does not produce rows
```

---

## Build scan operator

```text
BuildScanOperator(plan):

    if plan.Table.Table is nil:
        return error:
            scan plan has no runtime table

    return ScanOperator:
        table    = plan.Table.Table
        position = 0
        state    = Created
```

---

## Build project operator

```text
BuildProjectOperator(plan):

    childOperator, error = BuildOperator(plan.Child)

    if error exists:
        return error:
            failed to build project child

    indexes = empty integer list

    for each boundColumn in plan.Columns:
        append boundColumn.Index to indexes

    return ProjectOperator:
        child         = childOperator
        columnIndexes = indexes
        outputSchema  = copy plan.OutputSchema()
        state         = Created
```

The helper recursively converts the plan tree:

```text
ProjectPlan
└── ScanPlan
```

into:

```text
ProjectOperator
└── ScanOperator
```

---

## Build filter operator

```text
BuildFilterOperator(plan):

    childOperator, error = BuildOperator(plan.Child)

    if error exists:
        return error

    return FilterOperator:
        child     = childOperator
        predicate = plan.Predicate
        state     = Created
```

---

# Main query execution pseudocode

```text
ExecuteQuery(rootPlan):

    rootOperator, error = BuildOperator(rootPlan)

    if error exists:
        return error

    startTime = current time

    error = rootOperator.Open()

    if error exists:
        return error:
            failed to open execution pipeline

    must call rootOperator.Close
        before function returns

    resultRows = empty Row list

    loop forever:

        row, hasRow, error = rootOperator.Next()

        if error exists:
            return error:
                query execution failed

        if hasRow is false:
            break loop

        append row to resultRows

    closeError = rootOperator.Close()

    if closeError exists:
        return error:
            query completed but cleanup failed

    elapsed = current time - startTime

    return QueryResult:
        Schema = rootOperator.Schema()
        Rows = resultRows
        RowsProcessed = number of resultRows
        ExecutionTime = elapsed
```

In Go, prefer deferred cleanup immediately after successful `Open()`:

```text
error = operator.Open()

if error exists:
    return error

defer operator.Close()
```

But you must still decide how to report both:

```text
execution error
+
close error
```

---

# Cleanup-safe execution helper

```text
ExecuteQuery(rootPlan):

    operator, error = BuildOperator(rootPlan)

    if error exists:
        return error

    error = operator.Open()

    if error exists:
        return error

    result, executionError = Drain(operator)

    closeError = operator.Close()

    if executionError exists:

        if closeError exists:
            return combined error:
                execution failed
                cleanup also failed

        return executionError

    if closeError exists:
        return closeError

    return result
```

This makes all error paths explicit.

---

# Drain helper

`Drain` repeatedly consumes the root operator.

```text
Drain(operator):

    rows = empty Row list
    rowsProcessed = 0

    loop forever:

        row, hasRow, error = operator.Next()

        if error exists:
            return error

        if hasRow is false:
            break

        append row to rows
        rowsProcessed++

    return QueryResult:
        Schema = operator.Schema()
        Rows = rows
        RowsProcessed = rowsProcessed
```

Inputs:

```text
an already-open operator
```

Output:

```text
all produced rows
```

Stopping condition:

```text
Next returns hasRow = false
```

Failure:

```text
any operator in the tree returns an error
```

---

# Complete helper flow: SELECT

Input:

```sql
SELECT name FROM users;
```

Stored rows:

```text
users.Rows:
    [1, "Akhilesh"]
    [2, "Ravi"]
```

Plan:

```text
Project(name at index 1)
└── Scan(users)
```

Operator construction:

```text
BuildOperator(ProjectPlan)
↓
BuildProjectOperator
↓
recursively BuildOperator(ScanPlan)
↓
BuildScanOperator
↓
return ScanOperator
↓
create ProjectOperator with ScanOperator child
↓
return ProjectOperator as root
```

Execution:

```text
ExecuteQuery
↓
root.Open()
```

`Project.Open()`:

```text
validate project indexes
↓
call Scan.Open()
↓
Scan position = 0
↓
Project state = Open
```

First `Project.Next()`:

```text
call Scan.Next()
↓
Scan reads rows[0]
↓
Scan position becomes 1
↓
Scan returns [1, "Akhilesh"]
↓
Project reads value at index 1
↓
Project returns ["Akhilesh"]
```

Second `Project.Next()`:

```text
call Scan.Next()
↓
Scan reads rows[1]
↓
Scan position becomes 2
↓
Scan returns [2, "Ravi"]
↓
Project reads value at index 1
↓
Project returns ["Ravi"]
```

Third `Project.Next()`:

```text
call Scan.Next()
↓
position 2 equals row count 2
↓
Scan state = Exhausted
↓
Scan returns hasRow = false
↓
Project state = Exhausted
↓
Project returns hasRow = false
```

Cleanup:

```text
Project.Close()
↓
Project calls Scan.Close()
↓
both operators become Closed
```

Final result:

```text
Schema:
    name TEXT

Rows:
    ["Akhilesh"]
    ["Ravi"]

RowsProcessed:
    2
```

---

# Complete helper flow: SELECT with filter

Input:

```sql
SELECT name
FROM users
WHERE id = 2;
```

Rows:

```text
[1, "Akhilesh"]
[2, "Ravi"]
[3, "Neha"]
```

Operator tree:

```text
ProjectOperator(name)
└── FilterOperator(id = 2)
    └── ScanOperator(users)
```

First root `Next()`:

```text
Project.Next()
↓
Filter.Next()
↓
Scan.Next() returns [1, "Akhilesh"]
↓
evaluate id = 2
↓
false
↓
Filter does not return yet
↓
Scan.Next() returns [2, "Ravi"]
↓
evaluate id = 2
↓
true
↓
Filter returns [2, "Ravi"]
↓
Project returns ["Ravi"]
```

Second root `Next()`:

```text
Project.Next()
↓
Filter.Next()
↓
Scan.Next() returns [3, "Neha"]
↓
predicate is false
↓
Scan.Next() reaches end-of-stream
↓
Filter reaches end-of-stream
↓
Project reaches end-of-stream
```

Important point:

```text
one Project.Next call
may cause multiple Scan.Next calls
```

---

# Successful INSERT flow

Input:

```sql
INSERT INTO users VALUES (3, 'Neha');
```

Plan:

```text
InsertPlan:
    table = users
    values:
        INT(3)
        TEXT("Neha")
```

Flow:

```text
ExecuteCommand(plan)
↓
plan is InsertPlan
↓
ExecuteInsert(plan)
↓
construct Row:
    [3, "Neha"]
↓
Table.Insert(row)
↓
append copied row to users.Rows
↓
row count changes from 2 to 3
↓
return:
    RowsAffected = 1
    Message = "INSERT 1"
```

---

# End-of-stream flow

Empty table:

```text
users.Rows = []
```

Plan:

```text
Scan(users)
```

Flow:

```text
Scan.Open()
↓
position = 0
↓
Scan.Next()
↓
position 0 >= row count 0
↓
state = Exhausted
↓
return:
    hasRow = false
    error = nil
```

A second call:

```text
Scan.Next()
↓
state is Exhausted
↓
return:
    hasRow = false
    error = nil
```

End-of-stream is not an error.

---

# Failure flow: Next before Open

```text
operator = ScanOperator
↓
operator.Next()
↓
state is Created
↓
return error:
    scan must be opened before Next
```

No row is produced.

---

# Failure flow: project child fails

Suppose the scan returns an internal error while reading its second row.

Flow:

```text
Project.Next()
↓
Scan.Next()
↓
Scan returns error
↓
Project returns wrapped error:
    project child failed:
    scan failed at row 1
↓
Drain stops
↓
ExecuteQuery calls Project.Close()
↓
Project closes Scan
↓
execution error is returned
```

Cleanup still runs after execution failure.

---

# Failure flow: Open partially fails

Operator tree:

```text
Project
└── Scan
```

Suppose `Scan.Open()` fails because its table pointer is nil.

Flow:

```text
Project.Open()
↓
validate project state
↓
call Scan.Open()
↓
Scan detects nil table
↓
Scan returns error
↓
Project does not change state to Open
↓
ExecuteQuery returns open error
↓
Next is never called
```

Because no operator successfully opened, normal execution cleanup is not required.

For deeper trees, an operator that opens several children must close already-opened children if a later child fails.

---

# Failure flow: invalid projection index

Child schema:

```text
index 0 → id
index 1 → name
```

Project indexes:

```text
[4]
```

Flow:

```text
Project.Open()
↓
read child schema length = 2
↓
validate index 4
↓
index is outside range [0, 2)
↓
return error:
    project index 4 exceeds child schema
↓
child.Open() is not called
```

The planner should prevent this, but the executor keeps a defensive check.

---

# Expression evaluation

A filter needs to evaluate a bound expression against a row.

Example expression:

```text
id = 2
```

Bound expression:

```text
BoundComparison:
    Left:
        BoundColumn:
            Index = 0
            Type = INT

    Operator:
        Equals

    Right:
        BoundLiteral:
            INT(2)

    ResultType:
        BOOLEAN
```

---

## Evaluate expression

```text
EvaluateExpression(expression, row):

    if expression is BoundLiteral:
        return expression.Value

    if expression is BoundColumn:

        if expression.Index is outside row.Values:
            return internal execution error

        return row.Values[expression.Index]

    if expression is BoundComparison:

        leftValue, error =
            EvaluateExpression(expression.Left, row)

        if error exists:
            return error

        rightValue, error =
            EvaluateExpression(expression.Right, row)

        if error exists:
            return error

        return CompareValues(
            leftValue,
            expression.Operator,
            rightValue
        )

    return error:
        unsupported expression type
```

---

## Compare values

```text
CompareValues(left, operator, right):

    if left.Type does not equal right.Type:
        return error:
            cannot compare different value types

    if operator is EQUALS:

        if type is INT:
            return BooleanValue(left.Int == right.Int)

        if type is TEXT:
            return BooleanValue(left.Text == right.Text)

    return error:
        unsupported comparison operator
```

---

## Evaluate predicate

```text
EvaluatePredicate(predicate, row):

    value, error = EvaluateExpression(predicate, row)

    if error exists:
        return error

    if value.Type is not BOOLEAN:
        return error:
            filter predicate did not produce BOOLEAN

    return value.Boolean
```

---

# Execution metrics

Record basic metrics:

```go
type ExecutionMetrics struct {
	RowsScanned   int64
	RowsFiltered  int64
	RowsProduced  int64
	ExecutionTime time.Duration
}
```

Possible meaning:

```text
RowsScanned:
rows returned by Scan.Next

RowsFiltered:
rows rejected by Filter

RowsProduced:
rows returned by root operator

ExecutionTime:
time from before Open until after Close
```

Example:

```text
table rows:       100
matching rows:     12

RowsScanned:      100
RowsFiltered:      88
RowsProduced:      12
```

---

# Metrics collection options

## Simple operator-local counters

```text
ScanOperator.rowsRead
FilterOperator.rowsChecked
FilterOperator.rowsProduced
ProjectOperator.rowsProduced
```

After execution, recursively collect counters.

This is straightforward for the first implementation.

## Shared execution context

Later:

```go
type ExecutionContext struct {
	Metrics *ExecutionMetrics
}
```

Every operator updates the same metrics object.

This is easier when the operator tree becomes larger.

For this slice, operator-local counters are sufficient.

---

# Explain-analyze output

You already have logical `EXPLAIN`.

Add basic execution information:

```text
Project columns=name
  rows produced: 2

  Scan table=users
    rows scanned: 2

Execution time: 120µs
```

Keep timing tests tolerant because exact execution time varies between runs.

---

# Operator versus plan node

| Plan node                        | Operator                               |
| -------------------------------- | -------------------------------------- |
| Static description               | Runtime mutable state                  |
| Safe to inspect repeatedly       | Changes during execution               |
| Contains table/column references | Contains cursor positions and counters |
| Produced by planner              | Produced by executor builder           |
| No `Open` or `Next` state        | Has lifecycle state                    |

Do not store runtime cursor state inside the logical plan.

Bad:

```go
type ScanPlan struct {
	Position int
}
```

Better:

```text
ScanPlan:
    table reference

ScanOperator:
    table reference
    current position
    execution state
```

---

# Why use iterators?

Without an iterator pipeline:

```text
scan entire table into []Row
↓
filter entire []Row into another []Row
↓
project into another []Row
```

With iterators:

```text
scan one row
↓
filter it
↓
project it
↓
return it
```

| Materialize every stage         | Iterator pipeline                    |
| ------------------------------- | ------------------------------------ |
| Creates intermediate row slices | Rows flow operator to operator       |
| Higher temporary memory usage   | Usually keeps only the current row   |
| Execution logic is less modular | Each operator has one responsibility |
| Simple for very small queries   | Extensible to more operators         |

The trade-off is that row-at-a-time iterator calls add per-row function-call overhead. Vectorized engines reduce this overhead by processing batches, which is the intended future evolution of this slice.

---

# Recommended Go structure

```go
type Operator interface {
	Open() error
	Next() (Row, bool, error)
	Close() error
	Schema() []ColumnSchema
}
```

```go
type ScanOperator struct {
	table    *Table
	position int
	state    OperatorState
	rowsRead int64
}
```

```go
type ProjectOperator struct {
	child         Operator
	columnIndexes []int
	outputSchema  []ColumnSchema
	state         OperatorState
	rowsProduced  int64
}
```

```go
type FilterOperator struct {
	child        Operator
	predicate    BoundExpression
	state        OperatorState
	rowsChecked  int64
	rowsProduced int64
}
```

Executor:

```go
type Executor struct {
	Catalog *Catalog
	Storage *Storage
}
```

Methods:

```go
func (e *Executor) Execute(
	plan PlanNode,
) (*ExecutionResult, error)

func (e *Executor) buildOperator(
	plan PlanNode,
) (Operator, error)

func (e *Executor) executeQuery(
	plan PlanNode,
) (*QueryResult, error)

func (e *Executor) executeInsert(
	plan *InsertPlan,
) (*CommandResult, error)

func (e *Executor) executeCreateTable(
	plan *CreateTablePlan,
) (*CommandResult, error)

func drain(
	operator Operator,
) ([]Row, error)
```

---

# Top-level executor dispatch

```text
Execute(plan):

    if plan is InsertPlan:
        return ExecuteInsert(plan)

    if plan is CreateTablePlan:
        return ExecuteCreateTable(plan)

    if plan is ScanPlan:
        return ExecuteQuery(plan)

    if plan is FilterPlan:
        return ExecuteQuery(plan)

    if plan is ProjectPlan:
        return ExecuteQuery(plan)

    return error:
        unsupported plan node
```

---

# Minimum tests

## Scan all rows

```text
Given:
    users rows:
        [1, "A"]
        [2, "B"]

When:
    execute Scan(users)

Then:
    first Next returns [1, "A"]
    second Next returns [2, "B"]
    third Next returns end-of-stream
```

## Empty scan

```text
Given:
    empty users table

When:
    Open and call Next

Then:
    Next returns:
        hasRow = false
        error = nil
```

## Project one column

```text
Given:
    scan produces:
        [1, "A"]
        [2, "B"]

When:
    project column index 1

Then:
    output is:
        ["A"]
        ["B"]
```

## Projection order

```text
Given:
    row:
        [1, "A"]

When:
    project indexes [1, 0]

Then:
    output:
        ["A", 1]
```

## Filter rows

```text
Given:
    users:
        [1, "A"]
        [2, "B"]
        [3, "C"]

When:
    filter id = 2

Then:
    output:
        [2, "B"]

    rows checked = 3
    rows produced = 1
```

## Complete pipeline

```text
When:
    execute:

    Project(name)
    └── Filter(id = 2)
        └── Scan(users)

Then:
    output:
        ["B"]
```

## Stable end-of-stream

```text
Given:
    exhausted scan

When:
    call Next multiple additional times

Then:
    every call returns:
        hasRow = false
        error = nil
```

## Next before Open

```text
When:
    call Next on newly-created operator

Then:
    return lifecycle error
```

## Cleanup

```text
When:
    execution completes successfully

Then:
    root and all children are closed
```

## Cleanup after error

```text
Given:
    child fails during Next

When:
    ExecuteQuery returns

Then:
    root and child Close were called
```

## Insert

```text
Given:
    users has zero rows

When:
    execute InsertPlan

Then:
    users has one row
    RowsAffected = 1
```

## Metrics

```text
Given:
    scan reads three rows
    filter keeps one

Then:
    RowsScanned = 3
    RowsProduced = 1
```

---

# What belongs in each slice

## Planner

```text
build operator structure:

Project
└── Scan
```

## Executor builder

```text
convert plan nodes into runtime operators
```

## Operators

```text
maintain cursor state
pull rows from children
transform rows
track execution counters
```

## Storage

```text
own tables and stored rows
```

## Binder

```text
resolve columns
validate types
produce column indexes
```

The executor should not search column names or decide whether types are valid.

---

# What not to build yet

Do not add:

```text
goroutines
parallel scans
channels between operators
batch execution
vectorized execution
disk pages
buffer pool
indexes
joins
sorting
aggregation
transactions
query cancellation
```

The learning goal is:

```text
plan tree
→ operator tree
→ pull one row at a time
→ clean end-of-stream
→ guaranteed cleanup
```

---

# Build order

```text
define Operator interface
↓
define operator lifecycle state
↓
implement ScanOperator.Open
↓
implement ScanOperator.Next
↓
implement ScanOperator.Close
↓
test normal and empty scans
↓
implement ProjectOperator
↓
make Project pull rows from Scan
↓
implement recursive BuildOperator
↓
implement Drain
↓
implement ExecuteQuery with guaranteed cleanup
↓
add FilterOperator
↓
implement expression evaluation
↓
add command execution for Insert
↓
add CreateTable execution
↓
add row counters
↓
add execution timing
↓
write end-of-stream and cleanup tests
```

---

# Final mental model

Plan:

```text
Project(name)
└── Scan(users)
```

Runtime:

```text
Project.Open()
└── Scan.Open()
```

Each row:

```text
Project.Next()
↓
Scan.Next()
↓
source row
↓
project selected values
↓
result row
```

Completion:

```text
Scan reaches end
↓
Project reaches end
↓
Project.Close()
└── Scan.Close()
```

The essential rule is:

```text
Parent operator pulls from child operator.
```

Or:

```text
Open:
prepare the pipeline

Next:
pull one result through the pipeline

Close:
clean up the entire pipeline
```


## Toy SQL database implementation slices

| # | Slice / visible capability | Understand | Simplify | Reuse | Build | Integrate | Verify | Operate | Evolve |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **REPL and command loop** | Accept SQL, display rows/errors, exit cleanly | Support one statement at a time | `bufio.Scanner`, `io.Reader/Writer` | `Run(reader, writer)` | Connect CLI to database API | `.exit`, empty input, invalid command | Structured errors | Script/file input later |
| 2 | **Tokenizer** | Convert SQL text into tokens | Keywords, identifiers, numbers, strings, punctuation only | Go Unicode/string utilities | `NextToken()` | REPL → tokenizer | Token table tests | Include token position in errors | Comments, quoted identifiers |
| 3 | **Parser and AST** | Convert tokens into structured statements | Begin with `CREATE`, `INSERT`, simple `SELECT` | Recursive-descent parsing | `ParseStatement()` and AST types | Tokenizer → parser | Valid and invalid SQL tests | Human-readable syntax errors | `UPDATE`, `DELETE`, joins |
| 4 | **In-memory catalog** | Track tables, columns and types | One database; `INT` and `TEXT` only | Maps and slices | `Catalog`, `TableSchema` | Parser commands update catalog | Duplicate table/column tests | Inspect schema command | Constraints and metadata persistence |
| 5 | **In-memory table storage** | Store and retrieve rows correctly | Append-only rows; no disk yet | Slices and typed values | `Table.Insert`, `Table.Rows` | Catalog → table storage | Insert/select round trip | Row counts | Replace implementation with heap files |
| 6 | **Binder / semantic validation** | Resolve table and column names; check types | No aliases or ambiguous scopes initially | Catalog lookup | `Bind(statement, catalog)` | Parser AST → bound AST | Unknown table/column, wrong value type | Clear semantic errors | Aliases, expressions, scopes |
| 7 | **Simple logical planner** | Describe what must happen without executing it | One fixed plan; no cost optimizer | Bound AST | `Scan`, `Filter`, `Project`, `Insert` plan nodes | Binder → planner | AST-to-plan golden tests | Print/explain plan | Alternative plans and costing |
| 8 | **Iterator executor** | Execute a plan as a pipeline | `Open → Next → Close`; single-threaded | Volcano iterator model | `Operator` interface and scan/project operators | Planner → executor | Expected rows, end-of-stream, cleanup | Rows processed and execution time | Vectorized or parallel execution later |
| 9 | **Filtering and expressions** | Evaluate `WHERE` predicates | Comparisons and `AND` only | Expression tree from parser | `FilterOperator`, evaluator | Parser → binder → plan → executor | Null/type/error cases | Predicate error context | `OR`, arithmetic, functions |
| 10 | **Fixed-size pages and row codec** | Disk is accessed as pages, not arbitrary objects | Fixed page size; fixed row format initially | `encoding/binary`, `io.ReaderAt/WriterAt` | `Page`, `EncodeRow`, `DecodeRow` | Storage layer beneath tables | Encode/decode round trip, boundary tests | Page IDs and corruption errors | Variable-length rows and slotted pages |
| 11 | **Pager and database file** | Read/write pages through one abstraction | One file; synchronous writes | `os.File` | `ReadPage`, `WritePage`, `AllocatePage` | Page codec → database file | Reopen database and retain rows | File/page counters | Free-page management |
| 12 | **Heap table and sequential scan** | Store unordered rows across pages | Append rows; scan every page | Page and pager layers | Heap-file header, page iterator | Replace in-memory table storage | Multi-page insert/reopen/scan | Pages read, rows scanned | Deleted-slot reuse |
| 13 | **End-to-end CRUD** | Full SQL path should now work | Basic `INSERT`, `SELECT`, `UPDATE`, `DELETE` | Existing pipeline | Missing DML operators | SQL → disk → result | Restart tests and CRUD scenarios | Statement latency and affected rows | Constraints and richer SQL |
| 14 | **Buffer pool** | Cache hot pages and control disk I/O | Fixed capacity and simple LRU/FIFO | Map + linked list or clock algorithm | Pin, unpin, dirty, flush, evict | Pager calls pass through buffer pool | Dirty eviction, pinned-page exhaustion | Hit/miss/eviction metrics | Clock/LRU-K, background flushing |
| 15 | **B+ tree index** | Avoid full scans for indexed keys | Unique integer key; equality lookup first | Pager and page codec | Leaf/internal nodes, search, split | Planner chooses index scan when applicable | Insert/search/split/reopen tests | Tree height and page reads | Range scans, deletion, composite keys |
| 16 | **Join and aggregation** | Combine rows and compute grouped results | Nested-loop join; `COUNT` only | Existing operators | Join and aggregate operators | Extend parser, binder, planner, executor | Small deterministic datasets | Comparisons and rows processed | Hash join, grouping, more aggregates |
| 17 | **Transactions and locking** | Prevent partial or conflicting changes | Single writer or strict two-phase locking | Go mutexes plus transaction IDs | Begin, commit, rollback, lock manager | All mutations execute inside transactions | Concurrent conflict and rollback tests | Active transactions and lock waits | MVCC, deadlock detection |
| 18 | **WAL and crash recovery** | Data changes must survive crashes atomically | Redo-only or simple undo/redo log | Checksums and append-only file | Log record, flush-before-page, recovery scan | Transaction manager + pager | Kill/restart fault tests | Log size and recovery duration | Checkpoints and log truncation |
| 19 | **Basic optimizer** | Choose among multiple correct plans | Rules before costs | Plan tree rewrites | Predicate pushdown, index selection | Planner → optimizer → executor | Same results before/after rewrite | `EXPLAIN` chosen plan | Statistics and cost-based planning |

## Recommended repository structure

```text
toydb/
├── cmd/toydb/
│   └── main.go
├── internal/
│   ├── sql/
│   │   ├── token.go
│   │   ├── lexer.go
│   │   ├── ast.go
│   │   ├── parser.go
│   │   └── binder.go
│   ├── planner/
│   ├── executor/
│   ├── catalog/
│   ├── storage/
│   │   ├── page.go
│   │   ├── pager.go
│   │   ├── heap.go
│   │   ├── buffer_pool.go
│   │   └── btree.go
│   ├── transaction/
│   └── recovery/
└── docs/slices/
    ├── 01-repl.md
    ├── 02-tokenizer.md
    └── ...
```

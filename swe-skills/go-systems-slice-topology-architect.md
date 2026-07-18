# Skill 1: Go Systems Slice & Topology Architect

## Purpose
Instruct Codex/IDE agents to dynamically decompose a complex systems engineering problem into a multi-phase **Tracer Code Roadmap** and an idiomatic, decoupled package structure. This skill enforces strict step-by-step feature progression, preventing premature optimization and unbounded concurrency designs.

## Structural Generation Rules

### 1. The Tracer Code Matrix Requirement
When a project objective or feature set is declared, the agent must output a comprehensive markdown milestone matrix following the complete software engineering execution formula. 
*   **The Incrementality Law:** Every single row must represent an **independent, compilable, and vertically testable piece of running capability**, never an abstract layer or isolated source file.
*   **The Lifecycle Blueprint Columns:** The table must map the system's execution lifecycle cleanly:

| # | Slice / Visible Capability | Understand (Problem Domain) | Simplify (V1 Guardrails) | Reuse (Std Lib / Core Models) | Build (Core API / Data Primitives) | Integrate (Pipeline Hooks) | Verify (Observable Asserts) | Operate (Telemetry Signals) | Evolve (Future Deferrals) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

#### Target Example Format:
```markdown
| 12 | **Heap Table Page Scan** | Store unordered variable rows across disk pages | Append-only mode; ignore delete-tombstones initially | `encoding/binary`, local file system cache bounds | `HeapHeader`, `PageIterator`, `EncodeRow()` | Bind storage layout beneath logical `Scan` operator | Multi-page overflow append, disk reload data preservation checks | Pages read count, disk IO counters, buffer cache hit-rates | Slot fragmentation reuse, multi-index updates |
```

### 2. Idiomatic Go Repository Layout
The skill mandates the generation of a clean, highly structured, boundary-insulated layout matching standard enterprise Go engineering designs:
*   `cmd/[project-name]/main.go` - The absolute Composition Root where dependencies are instantiated and wired together. No business or storage logic is permitted here.
*   `internal/` - Private codebase directory preventing external application package bleeding.
*   Separate boundaries strictly by domain capabilities (e.g., `internal/sql/`, `internal/storage/`, `internal/engine/`), never by raw data models or abstract layers.

#### Layout Schema Sample:
```text
my-sys-engine/
├── cmd/sys-engine/
│   └── main.go         ← Composition Root
├── internal/
│   ├── parser/         ← Input parsing & syntactic validation
│   ├── compute/        ← Core compute, pipelines, worker pools
│   ├── storage/        ← Memory-mapped structures, codecs, disk pager
│   └── telemetry/      ← OpenTelemetry hooks & structured log hooks
└── docs/slices/        ← Individual slice milestone specs
```

## ⚖️ Flexibility & Pragmatism Guardrail
*   **Context Over Rigidity:** Apply the full multi-column specification strictly to core algorithmic, multi-threaded, or complex stateful infrastructure (like database file pagers, background queues, or network protocols). 
*   **Pragmatic Reductions:** For simple CLI wrappers, direct system configuration scripts, or minor helper utilities, do not generate extensive matrix rows or separate architecture directories. A flat 5-line textual list or single source file is preferred if it speeds up verification without compromising the system architecture.

***

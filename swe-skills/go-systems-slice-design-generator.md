# Skill: Go Systems Slice Design Generator

## Purpose
Deconstruct a high-level milestone row from a project engineering matrix into a concrete, context-aware architectural blueprint. The blueprint must align directly with the existing repository architecture before implementation begins.

## Column-by-Column Blueprint Requirements
When a milestone row is provided, the agent must systematically address every column using the following engineering constraints:

### 1. Understand & Simplify (Core Model)
*   **Targeted Study Sourcing:** Prior to mapping code structures, discover and output a **"What to Study"** shortlist. This must contain 2–3 hyper-specific technical references, syntax diagrams, official documentation sections, or elite open-source reference files that define the exact problem domain.
*   **Data Flow First:** Define the precise, idiomatic Go data shapes, types, interfaces, or enums needed to satisfy the slice. Treat the problem as `input -> transform -> output`.
*   **Input Normalization:** Map how messy inputs are normalized exactly once at the entry boundary (`normalize -> validate -> transform -> store`). Eliminate special-case `if` statements scattered across layers.
*   **Structural Grammars:** When interpreting languages, query engines, or parsers, explicitly document the minimal syntax grammar rules using plain notation rules before declaring abstractions:
    ```text
    statement       → selectStatement | createStatement
    selectStatement → SELECT columnList FROM identifier SEMICOLON
    ```

### 2. Reuse & Build (Implementation)
*   **Intelligent Reuse:** Explicitly audit the standard library, existing structs, utility packages, or tools already in the codebase before proposing new code.
*   **Implementation-Oriented Pseudocode:** Provide explicit logic maps. Do not offer high-level outlines. Include:
    - Complete control flows, conditions, loops, pointer mutations, state shifts, and error returns.
    - Specific behaviors for every helper function (e.g., `Match`, `Advance`, `Expect`), including its inputs, structural stopping conditions, and validation failures.
    - Logic detailed enough to translate line-by-line into idiomatic Go without inventing missing properties.
*   **Step-by-Step Execution Traces:** Trace exactly how an input payload steps through the internal control structures. Provide:
    - One full **Success Trace Flow** tracking sequential state transitions, array listings, and final composite assignments.
    - One full **Failure Trace Flow** pinpointing the exact condition where execution stops, detailing token placements, character columns, or mismatched bounds.

### 3. Integrate & Verify (Testing Boundaries)
*   **The Integration Path:** Define exactly how this component hooks into the broader application pipeline (e.g., `REPL -> Tokenizer -> Parser -> Engine`). Maintain thin boundaries and explicit contracts.
*   **Invariant-Driven Testing:** Outline test cases optimized for observable behavior rather than implementation details. 
    *   Use *unit tests* for pure logic.
    *   Use *integration/contract tests* for real dependencies and boundaries.
*   **Failure Paths:** Explicitly include test cases for concurrency, cancellation, cleanup, and shutdown when relevant.

### 4. Operate & Evolve (Lifecycle)
*   **Operational Telemetry:** Define the specific operational signals needed to debug production behavior: structured logs, metric types (counters, gauges, histograms), traces, and correlation IDs. Ensure errors pass accurate positions and human-readable context fields.
*   **Failure Modes:** Call out explicit behavior under retries, duplication, cancellation, partial failure, resource bounds, and load.
*   **Scope Guardrails:** Clearly segregate what is built in the **Active Slice** versus what must be deferred to the **Evolve Phase** (e.g., postpone expressions, joins, or deep mutations).
*   **Loop Invariants:** Every control step or execution pass must explicitly ensure it either advances processing state indexes or cleanly triggers a terminal error block to prevent infinite execution traps on malformed inputs.

---

## Code Review Checklist (Pre-Generation Guardrail)
Before writing any actual system code from this blueprint, evaluate the design against these standing preferences:
- [ ] Is the responsibility boundary correct with single-responsibility components?
- [ ] Is state owned in one clear, explicit place?
- [ ] What is the smallest safe implementation slice?
- [ ] Is it the simplest correct sequential version before adding concurrency?
- [ ] Are all queues, memory footprints, and workers strictly bounded?

---

## ⚖️ Flexibility & Pragmatism Guardrail
*   **Value Over Form:** Apply these directives only when they actively improve correctness, decision-making, or production safety.
*   **No Forced Complexity:** Do not force complex grammar charts, execution trace charts, or deep telemetry planning for trivial, low-risk utils, static arrays, or simple pure-logic handlers. If an output can be fully explained cleanly in a simple list or a few lines of straightforward code, default to the simplest path.
*   **Context Primacy:** Specific instruction updates or immediate milestone constraints provided in your prompt always take precedence over the defaults in this skill file.

***

### Updated `AGENTS.md` Reference Entry
```markdown
- **Skill Reference:** `skills/slice-design-generator.md`
  - **When to invoke:** Invoke this when moving to a new capability block in the project roadmap matrix to generate clear study targets, local pseudocode, grammar chains, validation structures, data models, and operational constraints before coding.
  - **Prompt Hook:** "Act as an Architectural Planner. Enforce the `skills/slice-design-generator.md` skill rules against the chosen roadmap matrix block. Analyze our local project structure and emit a production-grade implementation specification addressing every single column column-by-column, starting with the baseline Study References."
```

---

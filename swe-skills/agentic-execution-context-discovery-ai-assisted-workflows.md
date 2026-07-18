## Skill 4: Agentic Execution & Context Discovery (AI-Assisted Workflows)

### `SKILL.md` Content
```markdown
# Skill: Agentic Execution & Context Discovery

## Core Philosophy
AI amplifies both high-quality architectural judgment and low-quality implementation mistakes. AI agents must operate inside strict context boundaries and use stepwise reasoning before typing a single line of code. The execution specification is the ultimate source of truth, not the generated code assets.

## Workflow Execution Loop
Every task must progress linearly through this verification chain:
```text
Problem Statement 
→ Constraint/Invariant Identification 
→ Multi-Phase Execution Plan 
→ Stepwise Implementation 
→ Local Context Verification
```

## Context Discovery Standards
1. **Discover Before Modifying:** When entering a codebase, do not guess structural traits. Explicitly audit:
   - Folder layout and module maps.
   - Core runtime dependencies.
   - Component/Service call graphs.
   - System operational hotspots.
2. **Stepwise Guardrails:** Write the sequential, basic logic first. Do not add structural optimizations, concurrency flags, or abstract patterns until the initial execution vector passes safety checks.
3. **Targeted AI Scoping:** Restrict AI usage to boilerplate acceleration, unit tests, mock data generation, and operational log parsing. Do not allow an agent to freestyle core system architectures or distributed sync components without preset boundaries.

## Verification Checklist
- [ ] Did the agent actively trace the directory structure and call graph before suggesting code alterations?
- [ ] Is the proposed modification split into a testable multi-phase plan?
- [ ] Have the business invariants been clearly stated as pre-conditions before code output?
```

### `AGENTS.md` Reference Entry
```markdown
- **Skill Reference:** `skills/agentic-execution-workflow.md`
  - **When to invoke:** Inject this into the primary cognitive layer of your development agents at all times. It acts as the foundational governance blueprint for how the agent discovers project context and structures tasks.
  - **System Prompt Prompting:** "Act as a Principal Engineer Coordinator. Enforce the Agentic Execution & Context Discovery skill. Do not write code immediately. Discover project structures first, state your constraints explicitly, map out your phases, and validate your work sequentially."
```

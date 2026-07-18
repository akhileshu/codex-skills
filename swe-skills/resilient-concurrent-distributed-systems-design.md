
## Skill 2: Resilient Concurrent & Distributed Systems Design

### `SKILL.md` Content
```markdown
# Skill: Resilient Concurrent & Distributed Systems Design

## Core Philosophy
Once work crosses execution threads, processes, or distinct network machines, partial failure, out-of-order execution, and message duplication are guaranteed. Local success does not imply distributed success. Systems must be bounded in capacity, explicitly rate-limited, and built with defensive recovery paths.

## Design Patterns & Mechanisms
1. **Incremental Scale:** Build the simplest correct sequential version first, then introduce concurrency constraints step-by-step.
2. **Capacity Bounding:** Never allow unbounded queues, open-ended goroutines, or unmitigated thread spawning. Implement worker pools, semaphores, and strict load-shedding early.
3. **Traffic Management:** Protect downstream dependencies using **Token Bucket** (for managed bursts) or **Leaky Bucket** (for smooth, steady drainage) rate-limiting patterns. 
4. **Fault Isolation:** 
   - **Circuit Breakers:** Move through `Closed`, `Open`, and `Half-Open` states to allow failing dependencies space to recover without exhausting local system resources.
   - **Bulkheads:** Segregate thread/connection pools so a failure in one feature does not cascade and freeze unrelated features.
5. **Data Reliability:** Couple message delivery and state updates safely using the **Transactional Outbox/Inbox** pattern anchored to local transactions to manage network retries and deduplication seamlessly.

## Design Trade-off Guardrails
*   *Availability vs. Safety:* Explicitly choose between **Fail-Open** (prioritizes uptime/availability but risks weaker security/protection checks) and **Fail-Closed** (prioritizes high protection/security but risks blocking legitimate work during downtime).

## Verification Checklist
- [ ] Are all queues and concurrent workers strictly bounded in size?
- [ ] Is there an explicit idempotency key or deduplication mechanism for network retry loops?
- [ ] If a critical downstream dependency crashes, does our system use circuit breaking or bulkheads to survive the fallout?
```

### `AGENTS.md` Reference Entry
```markdown
- **Skill Reference:** `skills/resilient-distributed-systems.md`
  - **When to invoke:** Use this when writing multi-threaded application code (e.g., Go routines, background workers), implementing message queues, writing API clients that consume external services, or setting up database transactions across system nodes.
  - **System Prompt Prompting:** "Act as a Distributed Systems Engineer. Enforce the Resilient Concurrent & Distributed Systems skill. Verify all worker queues are bounded, design for failure loops, explicitly configure circuit breaking, and validate idempotency handling."
```

---

Which of these two structural paths feels like the highest priority for your coding workflow right now? We can dive deeper into customizing its exact code validation hooks.

---

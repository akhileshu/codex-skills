```markdown
# Skill: Production Capacity & Lifecycle Operations

## Core Philosophy
A system is never "done" when it merely runs correctly once on a local machine. It is only done when its constraints are bounded, its behavior is observable under stress, and it can be changed or rolled back safely in production without downtime.

## Operational Standards
1. **Capacity & Traffic Regulation:** Protect compute boundaries by enforcing strict scale-control primitives:
   - **Rate Limiting:** Protect system frequency using the Token Bucket pattern (for acceptable bursts) or Leaky Bucket pattern (to smooth out high-volume traffic flows).
   - **Concurrency Limits:** Bind internal resources using worker pools and semaphores. Do not confuse rate limiting (time-based caps) with concurrency limiting (resource-based caps).
2. **Telemetry Anchoring:** You cannot run what you cannot see. Code must expose three unified pillars:
   - **Traces:** Propagate context via consistent Correlation IDs and Request IDs across process boundaries.
   - **Logs:** Use structured logging (JSON) with strict leveling (`debug`, `info`, `warn`, `error`).
   - **Metrics:** Instrument code with Counters (errors, events), Gauges (queue depth, connections), and Histograms (p95/p99 tail latency).
3. **Safe System Evolution:** Deploy changes invisibly using safe operational patterns:
   - **Feature Flags:** Completely decouple code deployment from feature release. Ship features dark and roll them out incrementally.
   - **Shadow Mirroring:** Validate high-risk structural replacements by duplicating real production traffic to the new service slice without routing the response back to users.
4. **Behavioral Testing:** Focus test cases on structural invariants, boundary limits, and state recovery loops under simulation tools (e.g., load testing, fault injection) rather than happy-path unit mocks.

## Verification Checklist
- [ ] Are rate limits and concurrency limits explicitly bounded rather than left to defaults?
- [ ] Do all logs contain the appropriate request or entity context tracking variables?
- [ ] Can this component be safely disabled using a feature flag or configuration switch without requiring a rollback deployment?
```

#### `AGENTS.md` Reference Entry
```markdown
- **Skill Reference:** `skills/production-capacity-operations.md`
  - **When to invoke:** Invoke this when configuring rate limiters, writing infrastructure code, integrating telemetry monitoring tools, building database query paginations, or planning complex zero-downtime feature rollouts.
  - **System Prompt Prompting:** "Act as an Site Reliability & Performance Engineer. Enforce the Production Capacity & Lifecycle Operations skill. Validate telemetry implementation, check time/space bottlenecks, bound maximum scaling limits, and verify feature flag isolation."
```

```markdown
# Skill: Fault-Tolerant Distributed Integration

## Philosophy
When crossing network boundaries to transmit blobs, dispatch events, or trigger endpoints, treat failures as normal conditions. Implement structural telemetry, enforce deadlines, and eliminate proxies for intensive file actions.

## Engineering Standards
1. **Network Life Controls:** When writing Go-based integrations, force explicit `context.Context` cancellation policies, tracing hooks, and deadlines onto all outgoing calls.
2. **Direct-to-Storage Uploads:** Never proxy large media files through application servers. Utilize the Valet-Key pattern via `UploadThing` or direct S3 signed URLs to offload high-volume file transfers safely to storage buckets.
3. **Observability Injection:** Embed consistent tracing boundaries using `OpenTelemetry` spans, ensuring transparent context mapping across client requests, API nodes, and database nodes.
4. **Defensive Integration Mirroring:** Prior to deploying new external API paths, isolate your HTTP clients inside local tests using `httpbin` mirrors to map and stress-test failure conditions, unexpected status loops, and structural timeouts.

## Verification Checklist
- [ ] Do all network actions contain a valid execution deadline?
- [ ] Are file uploads handling multi-gigabyte files without overloading app server memory?
- [ ] Are distributed correlation IDs automatically tracking across cross-service boundaries?
```

### `AGENTS.md` Reference
```markdown
- **Skill Reference:** `skills/fault-tolerant-integrations.md`
  - **When to invoke:** Invoke this when writing Go service clients, setting up file ingestion pipelines, or configuring telemetry monitoring nodes.
  - **Prompt Hook:** "Act as a Distributed Infrastructure Developer. Enforce the Fault-Tolerant Distributed Integration skill. Set network bounds, structure OpenTelemetry spans, and build direct, resilient workflows."
```

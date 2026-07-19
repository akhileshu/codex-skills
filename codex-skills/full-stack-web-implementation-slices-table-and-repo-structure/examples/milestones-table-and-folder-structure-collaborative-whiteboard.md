# Real-Time Collaborative Whiteboard Implementation Slices

|  # | Done | Slice / visible capability                   | Understand                                                                                 | Simplify                                                           | Reuse                                                                     | Build                                                                         | Integrate                                                                | Verify / acceptance tests                                                                                                                                                | Operate                                                                   | Evolve                                                     |
| -: | :--: | -------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
|  1 |  [ ] | **Whiteboard shell and canvas viewport**     | Establish the coordinate system, viewport size, and render loop                            | Empty board; no tools, persistence, or collaboration               | Next.js App Router, React                                                 | Board page, canvas/SVG surface, viewport component                            | Route → board workspace                                                  | Board opens without errors; canvas fills available space; resizing preserves usability                                                                                   | Client render errors                                                      | Zoomable infinite canvas later                             |
|  2 |  [ ] | **User creates a shape locally**             | Convert pointer input into a shape with stable identity and geometry                       | Rectangle only; click-and-drag creation                            | Pointer Events API, `crypto.randomUUID()`                                 | Tool state, draft shape, committed shape                                      | Toolbar → pointer handler → local document state → renderer              | Dragging creates one rectangle; releasing commits it; cancelling removes the draft                                                                                       | Shape count, render duration in development                               | Ellipse, text, lines, sticky notes                         |
|  3 |  [ ] | **User selects and drags a shape locally**   | Separate document coordinates from screen coordinates                                      | Single selection; move only; no resizing or rotation               | Pointer capture, existing shape model                                     | Hit testing, selection state, drag session                                    | Renderer → selection controller → shape update                           | Clicking selects the topmost shape; dragging moves it; pointer release ends the drag; movement remains correct after leaving the shape bounds                            | Pointer-handler errors                                                    | Multi-select, resize handles, rotation                     |
|  4 |  [ ] | **Pan and zoom viewport**                    | Map between screen and world coordinates consistently                                      | Mouse wheel zoom and space-drag pan only                           | DOMMatrix or small coordinate helpers                                     | `screenToWorld`, `worldToScreen`, viewport transform                          | Pointer tools use transformed coordinates                                | Shapes can be created and moved correctly at different zoom levels; zoom focuses around the cursor; panning does not change document geometry                            | Frame time during navigation                                              | Minimap, touch gestures, fit-to-screen                     |
|  5 |  [ ] | **Local undo and redo**                      | Represent user actions as reversible document changes                                      | Create and move commands only                                      | Command pattern or immutable patches                                      | History stack, undo, redo, transaction grouping                               | Shape mutations → history manager                                        | Create and move can be undone/redone; one drag creates one history entry; new edits clear the redo stack                                                                 | History depth                                                             | Collaborative undo through Yjs later                       |
|  6 |  [ ] | **Board creation and loading over HTTP**     | Define board ownership, identity, and persisted document boundary                          | Anonymous or development user; one board document                  | Next.js route handlers or Bun HTTP API, Zod                               | Create-board and get-board endpoints                                          | Board route → HTTP client → API → database                               | Creating a board returns an ID; opening the ID loads the board; unknown IDs return a clear 404                                                                           | Request latency, error rate                                               | Authentication and sharing permissions                     |
|  7 |  [ ] | **Persist shapes to PostgreSQL**             | Decide whether the database stores snapshots, normalized shapes, or both                   | Store one JSON document snapshot per board initially               | Prisma, PostgreSQL JSONB                                                  | Board document schema, revision number, save endpoint                         | Local document → debounced save → API → Prisma                           | Refreshing restores shapes and positions; malformed payloads are rejected; stale board IDs cannot create unintended records                                              | Save latency, payload size, failed saves                                  | Normalized entities, snapshot compaction                   |
|  8 |  [ ] | **Reliable autosave and save status**        | Prevent overlapping saves and stale responses from overwriting newer state                 | One pending save and one latest queued state                       | `AbortController`, revision/version field                                 | Save coordinator, dirty state, retry button                                   | Local mutations → save coordinator → HTTP API                            | UI shows saving/saved/error; rapid edits eventually persist the latest state; an older response cannot mark newer edits as saved                                         | Save failures, retry count, pending age                                   | Offline queue and background sync                          |
|  9 |  [ ] | **WebSocket connection and board room**      | Define connection lifecycle and room membership                                            | One WebSocket server instance; no Redis yet                        | Bun + Elysia or Fastify WebSocket support                                 | Connect, authenticate, join board, leave board, heartbeat                     | Browser client ↔ WebSocket server ↔ in-memory room registry              | Two clients can join the same board; clients in another board receive nothing; disconnected clients are removed                                                          | Active connections, room count, disconnect reason                         | Horizontal scaling through Redis                           |
| 10 |  [ ] | **Live cursor presence**                     | Treat cursor presence as transient state, not persisted document data                      | Cursor position, user ID, name, and color only                     | WebSocket room, requestAnimationFrame throttling                          | Presence message types, cursor publisher, remote cursor store                 | Pointer movement → WebSocket → room broadcast → cursor overlay           | Two browser sessions see each other’s cursors; cursor updates are smooth; cursor disappears shortly after disconnect                                                     | Presence messages/sec, dropped/throttled updates                          | Selection presence and viewport presence                   |
| 11 |  [ ] | **Live shape creation between clients**      | Define client-generated IDs and message ordering                                           | Broadcast committed shape creation only; no simultaneous edits yet | Existing WebSocket room and shape model                                   | Shape-created event, validation, remote apply                                 | Local command → WebSocket → peer document state                          | A shape created in one browser appears once in the other; sender does not duplicate its own shape; invalid messages are rejected                                         | Events/sec, validation failures                                           | Incremental draft drawing                                  |
| 12 |  [ ] | **Live shape movement between clients**      | Distinguish transient drag previews from committed document state                          | Stream throttled previews; commit final position on release        | Existing drag session, WebSocket                                          | Drag-preview and shape-moved events                                           | Local drag → preview broadcast → peer render → final commit              | Remote movement appears during dragging; final coordinates converge after release; late preview messages cannot override the committed position                          | Preview rate, commit latency                                              | Interpolation and adaptive throttling                      |
| 13 |  [ ] | **Authoritative realtime message contract**  | Make message versioning, identity, validation, and deduplication explicit                  | One protocol version and bounded payload size                      | Zod schemas, discriminated unions                                         | Client/server protocol package, event IDs, sequence metadata                  | Client encoder ↔ server validator ↔ room broadcaster                     | Unknown message types are rejected; oversized payloads close or reject safely; duplicate event IDs do not apply twice                                                    | Protocol errors, rejected payloads, message size                          | Backward-compatible protocol versions                      |
| 14 |  [ ] | **CRDT-backed shared document**              | Replace ad hoc last-write behavior with convergent shared state                            | Yjs map of shapes; no text collaboration initially                 | Yjs, `Y.Map`, binary updates                                              | Yjs document adapter, shape serialization, update transport                   | UI commands → Yjs transaction → WebSocket provider → remote Yjs document | Two clients editing different shapes converge; concurrent edits never corrupt the document; reconnecting clients reach identical state                                   | CRDT update size, apply duration                                          | Nested groups, collaborative text                          |
| 15 |  [ ] | **Concurrent same-shape conflict handling**  | Define semantic expectations when two users edit the same shape                            | Accept Yjs field-level last-writer behavior initially              | Yjs transactions and origins                                              | Per-shape field updates, drag ownership hints                                 | Drag controller → Yjs transaction → peers                                | Concurrent edits never crash; all clients eventually show the same shape; temporary divergence resolves after updates arrive                                             | Conflict count or overlapping drag telemetry                              | Soft locks, merge policies, edit intent                    |
| 16 |  [ ] | **Collaborative undo and redo**              | Undo only the current user’s authored changes without reversing remote work                | Track create, delete, move, and resize transactions                | `Y.UndoManager`                                                           | Local transaction origins, grouped drag operations                            | Command layer → Yjs → undo manager                                       | Undo reverses the local user’s last action; remote edits remain; one drag is one undo step                                                                               | Undo stack depth, failed operations                                       | Per-object history and restore UI                          |
| 17 |  [ ] | **Redis-backed rooms and presence**          | Remove process-local room ownership so multiple WebSocket servers can participate          | Redis Pub/Sub; no durable event stream                             | Redis Pub/Sub, server instance IDs                                        | Board channels, publish/subscribe adapter, presence expiry                    | WebSocket server A ↔ Redis ↔ WebSocket server B                          | Clients connected to different server instances receive the same updates; messages are not echoed twice; crashed-server presence expires                                 | Redis latency, reconnects, publish failures                               | Redis Streams or dedicated realtime broker                 |
| 18 |  [ ] | **Reconnect and state resynchronization**    | Recover from missed updates without assuming WebSocket delivery is reliable                | Fetch latest Yjs state vector/update after reconnect               | Yjs state vectors, exponential backoff                                    | Connection state machine, reconnect, sync handshake                           | Client disconnect → reconnect → server sync → resume updates             | Temporarily offline client reconnects and converges; duplicate updates are harmless; retry delay is bounded                                                              | Reconnect attempts, sync bytes, convergence time                          | Offline editing and persisted update logs                  |
| 19 |  [ ] | **Durable CRDT snapshots**                   | Persist shared state without writing every pointer movement to PostgreSQL                  | Periodic snapshot and flush after inactivity                       | Yjs state encoding, Prisma transaction                                    | Snapshot worker, document version, last-flushed update marker                 | Realtime document → snapshot scheduler → PostgreSQL                      | Restarting the realtime server restores the latest durable board; repeated snapshot jobs are idempotent; failed flushes retry safely                                     | Snapshot age, duration, size, failures                                    | Incremental update log and compaction                      |
| 20 |  [ ] | **Shape deletion and lifecycle correctness** | Define deletion under retries and concurrent edits                                         | Delete one selected shape; tombstone through CRDT                  | Yjs delete semantics, existing selection model                            | Delete command, selection cleanup                                             | Keyboard/tool action → Yjs → peers → snapshot                            | Deleting removes the shape from all clients; duplicate delete is harmless; selected deleted shapes are cleared                                                           | Delete events, invalid references                                         | Restore from history, soft deletion                        |
| 21 |  [ ] | **Resize and additional shape types**        | Keep manipulation logic independent from shape rendering                                   | Rectangle and ellipse resizing; no rotation                        | Shared bounding-box utilities                                             | Resize handles, shape renderer registry                                       | Selection controls → document commands → Yjs                             | Resizing stays correct under zoom; minimum sizes are enforced; remote clients converge                                                                                   | Manipulation errors                                                       | Rotation, connectors, grouping                             |
| 22 |  [ ] | **Text shapes and editing mode**             | Separate canvas shortcuts from text-input behavior                                         | Plain text only; one editor at a time per client                   | HTML overlay editor, Y.Text when collaboration is required                | Text shape, editing state, keyboard routing                                   | Canvas selection → text editor → Yjs document                            | Typing does not trigger board shortcuts; text persists and syncs; Escape exits editing safely                                                                            | Text update size, editing errors                                          | Rich text and collaborative caret presence                 |
| 23 |  [ ] | **Large-board rendering performance**        | Keep interaction cost proportional to visible objects, not total objects                   | Optimize after measuring; target hundreds or thousands of shapes   | `requestAnimationFrame`, spatial index, memoization, Canvas/SVG profiling | Viewport culling, render scheduler, batched updates                           | CRDT state → derived visible set → renderer                              | Dragging remains responsive on the agreed benchmark board; off-screen shapes are not rendered unnecessarily; remote cursor traffic does not trigger full-board rerenders | FPS, long tasks, rendered object count, input latency                     | WebGL renderer, worker-based computation                   |
| 24 |  [ ] | **Bounded realtime backpressure**            | Prevent slow clients and message spikes from exhausting server memory                      | Fixed outbound queue per connection; explicit overflow policy      | Bounded queues, coalescing for cursor/drag previews                       | Per-client writer loop, queue limits, disconnect/coalesce policy              | Room broadcast → client queue → socket writer                            | Slow clients cannot create unbounded memory growth; cursor previews may be dropped/coalesced; committed document updates are preserved or trigger resync                 | Queue depth, dropped previews, slow-client disconnects                    | Priority queues and adaptive quality                       |
| 25 |  [ ] | **Authentication and board authorization**   | The server must be the source of truth for view/edit permissions                           | Owner, editor, viewer roles only                                   | Existing auth provider, database membership table                         | HTTP and WebSocket authorization middleware                                   | Session → board membership → capability checks                           | Viewers cannot mutate through HTTP or WebSocket; revoked users lose access; unauthorized board IDs reveal no private data                                                | Authorization failures, revocations                                       | Share links, teams, granular permissions                   |
| 26 |  [ ] | **Board list and ownership workflows**       | Connect persisted boards to user-visible navigation                                        | Create, rename, open, and delete owned boards                      | Next.js server components/actions, Prisma                                 | Dashboard, board metadata APIs                                                | Dashboard → board route → workspace                                      | User sees owned boards; rename persists; delete requires confirmation; deleted boards cannot be reopened                                                                 | CRUD error rate                                                           | Search, folders, recent boards                             |
| 27 |  [ ] | **Export board image**                       | Render the same document consistently for export                                           | PNG export of visible board or all shapes                          | Canvas serialization or server-side renderer                              | Export command and bounds calculation                                         | Shared document → export renderer → browser download                     | Export includes all expected shapes at correct positions; empty boards export safely                                                                                     | Export duration, dimensions, failures                                     | PDF/SVG export and background jobs                         |
| 28 |  [ ] | **End-to-end multiplayer assurance**         | Verify critical behavior across browser, HTTP, WebSocket, Redis, and PostgreSQL boundaries | Cover only high-value user journeys                                | Playwright with two browser contexts, disposable test database            | Multiplayer test harness and deterministic board fixtures                     | Full deployed-like stack                                                 | Two users join a board, create/move/delete shapes, see cursors, reconnect, and retain state after reload; viewer mutation is rejected                                    | Test duration, flaky-test rate, captured traces                           | Load and fault-injection suites                            |
| 29 |  [ ] | **Realtime observability and tracing**       | Trace one user action across browser, WebSocket server, Redis, and persistence             | Instrument committed mutations first                               | Structured logs, OpenTelemetry, correlation IDs                           | Event context, metrics, distributed traces                                    | Client event ID → server → Redis → snapshot worker                       | One committed shape mutation can be followed end-to-end; logs contain board, connection, event, and server IDs without leaking document contents                         | Connection count, fanout latency, apply latency, snapshot lag, error rate | Sampling and production dashboards                         |
| 30 |  [ ] | **Load, failure, and rollout readiness**     | Validate resource bounds and recovery under messy conditions                               | Test expected portfolio-scale targets, not internet-scale Figma    | Load generator, Docker Compose, feature flags                             | Connection tests, hot-room tests, Redis interruption tests, shutdown handling | Multiple server instances + Redis + PostgreSQL                           | Server shuts down without accepting new work; clients reconnect after instance loss; Redis interruption does not corrupt documents; queues and memory remain bounded     | CPU, memory, GC, event-loop lag, reconnect storms                         | Gradual rollout, regional deployment, durable event broker |

## Recommended Repository Structure

```text
collaborative-whiteboard/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── boards/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [boardId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── api/
│   │   │   │       └── boards/
│   │   │   ├── features/
│   │   │   │   ├── board-list/
│   │   │   │   ├── canvas/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── rendering/
│   │   │   │   │   ├── coordinates/
│   │   │   │   │   ├── hit-testing/
│   │   │   │   │   └── viewport/
│   │   │   │   ├── shapes/
│   │   │   │   │   ├── model/
│   │   │   │   │   ├── renderers/
│   │   │   │   │   └── commands/
│   │   │   │   ├── selection/
│   │   │   │   ├── history/
│   │   │   │   ├── collaboration/
│   │   │   │   │   ├── crdt/
│   │   │   │   │   ├── presence/
│   │   │   │   │   ├── connection/
│   │   │   │   │   └── synchronization/
│   │   │   │   └── export/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── observability/
│   │   │   │   └── configuration/
│   │   │   └── tests/
│   │   │       ├── integration/
│   │   │       └── e2e/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── realtime/
│       ├── src/
│       │   ├── main.ts
│       │   ├── server/
│       │   │   ├── websocket-server.ts
│       │   │   ├── connection-handler.ts
│       │   │   └── shutdown.ts
│       │   ├── rooms/
│       │   │   ├── room-manager.ts
│       │   │   ├── board-room.ts
│       │   │   └── membership.ts
│       │   ├── protocol/
│       │   │   ├── decode-message.ts
│       │   │   ├── encode-message.ts
│       │   │   └── validate-message.ts
│       │   ├── collaboration/
│       │   │   ├── yjs-document.ts
│       │   │   ├── sync-handler.ts
│       │   │   ├── presence-handler.ts
│       │   │   └── snapshot-scheduler.ts
│       │   ├── transport/
│       │   │   ├── redis-pubsub.ts
│       │   │   └── outbound-queue.ts
│       │   ├── persistence/
│       │   │   ├── board-repository.ts
│       │   │   └── snapshot-repository.ts
│       │   ├── auth/
│       │   │   └── authorize-board-access.ts
│       │   ├── observability/
│       │   │   ├── logger.ts
│       │   │   ├── metrics.ts
│       │   │   └── tracing.ts
│       │   └── tests/
│       │       ├── integration/
│       │       └── load/
│       └── package.json
│
├── packages/
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── board.ts
│   │   │   ├── shape.ts
│   │   │   ├── presence.ts
│   │   │   └── realtime-message.ts
│   │   └── package.json
│   │
│   ├── board-domain/
│   │   ├── src/
│   │   │   ├── document.ts
│   │   │   ├── shape.ts
│   │   │   ├── geometry.ts
│   │   │   ├── commands.ts
│   │   │   └── invariants.ts
│   │   └── package.json
│   │
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── client.ts
│   │   └── package.json
│   │
│   ├── observability/
│   │   └── src/
│   │
│   └── test-support/
│       ├── src/
│       │   ├── board-fixtures.ts
│       │   ├── websocket-client.ts
│       │   └── test-database.ts
│       └── package.json
│
├── docs/
│   ├── architecture/
│   │   ├── data-flow.md
│   │   ├── realtime-protocol.md
│   │   ├── synchronization-model.md
│   │   └── persistence-model.md
│   └── slices/
│       ├── 01-whiteboard-shell-and-canvas.md
│       ├── 02-create-shape-locally.md
│       ├── 03-select-and-drag-shape.md
│       ├── 04-pan-and-zoom.md
│       ├── 05-local-undo-redo.md
│       ├── 06-board-http-api.md
│       ├── 07-postgres-persistence.md
│       ├── 08-reliable-autosave.md
│       ├── 09-websocket-board-room.md
│       ├── 10-cursor-presence.md
│       ├── 11-live-shape-creation.md
│       ├── 12-live-shape-movement.md
│       ├── 13-realtime-protocol.md
│       ├── 14-crdt-shared-document.md
│       ├── 15-same-shape-conflicts.md
│       ├── 16-collaborative-undo.md
│       ├── 17-redis-room-scaling.md
│       ├── 18-reconnect-and-resync.md
│       ├── 19-durable-crdt-snapshots.md
│       └── ...
│
├── tests/
│   ├── e2e/
│   │   ├── local-editing.spec.ts
│   │   ├── multiplayer-sync.spec.ts
│   │   ├── reconnect.spec.ts
│   │   ├── persistence.spec.ts
│   │   └── authorization.spec.ts
│   └── load/
│       ├── concurrent-connections.ts
│       └── hot-board.ts
│
├── infrastructure/
│   ├── docker-compose.yml
│   ├── postgres/
│   ├── redis/
│   └── telemetry/
│
├── AGENTS.md
├── package.json
├── tsconfig.json
└── README.md
```

## Important Boundary

```text
Pointer input
→ canvas interaction controller
→ board command
→ Yjs transaction
→ local rendering
→ WebSocket update
→ Redis fanout
→ remote Yjs document
→ remote rendering

Yjs document
→ bounded snapshot scheduler
→ persistence repository
→ PostgreSQL
```

Keep these state categories separate:

| State                               | Owner                   | Persistence            |
| ----------------------------------- | ----------------------- | ---------------------- |
| Shapes and document content         | Yjs document            | PostgreSQL snapshots   |
| Selection and active tool           | Local client            | Never                  |
| Cursor and active viewport presence | Realtime presence layer | Never; expires         |
| Board metadata and permissions      | PostgreSQL              | Durable                |
| WebSocket connections and queues    | Realtime server         | Process lifecycle only |

The most important invariant is:

> Every client may temporarily observe a different intermediate state, but clients connected to the same board must eventually converge to the same persisted document.

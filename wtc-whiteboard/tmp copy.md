This addresses the reality of moving from abstract design to physical execution. When implementing an isolated slice (like `01-local-canvas.md`), the specific feature requirements in that design file will frequently over-simplify things, skip error boundary paths, or use shortcut data models to save time.

If you tell the AI to simply "implement this slice," it will blindly duplicate those structural flaws and violate your architectural standards.

To fix this, add a **"Design Validation & Execution Boundary"** protocol directly into `agents.md`. This forces the agent to read the design document critically, identify where it falls short of the quality guidelines, and correct it *before* writing code.

Add this section right under **Evolutionary Architecture & The Refactoring Tax**:

---

```
### 3. 📋 The Slice Design Execution Protocol (Reconciliation Loop) in 09.full-stack-code-quality-and-evolutionary-architecture-guidelines.agents-universal.md
```
#### Why this works:

By adding this explicit loop, you block the AI from taking lazy shortcuts just because the markdown file it read was written simply. It transforms the agent from a passive text-converter into an active guardian of your system architecture.


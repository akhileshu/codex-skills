
# gemini response

The stark contrast in how legendary software pioneers (like Linus Torvalds, Anders Hejlsberg, or Jonathan Blow) view AI versus how junior or younger developers view it comes down to a fundamental disagreement over what the word **"coding"** actually means. 

When a legendary programmer says "AI can't code good enough," they aren't talking about syntax, boilerplate, or writing an algorithm. They are talking about things further up the abstraction layer.

Here is the breakdown of why these industry titans hold this viewpoint, whether they are outliers, and why younger developers see a completely different reality.

---

## 1. The Core Disconnection: What is "Coding"?

To understand the titans, you have to look at the formula we've been using: 
$$\text{Software Engineering} = \text{Understand} \rightarrow \text{Simplify} \rightarrow \text{Reuse} \rightarrow \text{Build} \rightarrow \text{Integrate} \rightarrow \text{Verify} \rightarrow \text{Operate} \rightarrow \text{Evolve}$$

Current LLMs are world-class at the **Build** phase (writing the raw code blocks) and decent at the **Verify** phase (writing tests). However, legendary programmers spend almost $0\%$ of their cognitive energy on the "Build" phase. They live entirely in **Understand, Simplify, and Evolve**.

### The Three Blocker Pillars for Legends:

*   **The Invariant Problem:** Jonathan Blow (creator of *Braid* and the Jai programming language) frequently talks about deep, mechanical performance and software collapse. If you ask an AI to write a data pipeline, it will give you one that works. But the AI doesn't inherently reason about cash-locality, CPU instruction pipelines, or the long-term cost of memory allocation. It patches over structural problems with more code, creating **software bloat**.
*   **The Intent Deficit:** Anders Hejlsberg (creator of Turbo Pascal, Delphi, C#, and TypeScript) spends his life designing systems that *other developers* use to build things. A language designer must predict human errors and build type systems that cleanly prevent them before they occur. AI cannot predict structural human intent because it works by predicting the *next most likely word* based on what humans have *already done*. It cannot pioneer an unprecedented mental model.
*   **The Taste & Judgement Arbitrage:** Linus Torvalds famously looks at code submissions for Linux based on "good taste." Good taste means removing lines of code, collapsing five special cases into one elegant, recursive data loop, and keeping the core engine minimal. AI naturally introduces *more code* to fix bugs, which is the antithesis of the systems engineering mindset.

---

## 2. Is this an Outlier View or the Majority?

It is the **majority view among Systems, Language, and Core Infrastructure Architects**, but a minority view among product, application, and business-logic developers. 

If we look at the software landscape as a pyramid, the viewpoints split cleanly by tier:

```text
▲ Systems Level (Kernel, Languages, Databases, Custom Game Engines)
│   → Viewpoint: "AI is a blunt tool. It hallucinates boundaries, lacks taste, 
│     and introduces hidden architectural debt."
│
▼ Application Level (CRUD Apps, Web Dashboards, Standard API Integrations)
    → Viewpoint: "AI is revolutionary. It eliminates hours of repetitive setup 
      and accelerates product shipping by 10x."
```

The veterans are not out-of-touch outliers; they are simply operating at the very peak of the pyramid where a single design flaw or wrong invariant choice can ruin an entire language runtime or ecosystem for a decade.

---

## 3. Why Younger Programmers See It Differently

Younger, modern full-stack programmers are not wrong either; they are just playing a completely different game with different winning conditions. 

### Why Younger Devs Love It:
*   **The Boilerplate Burden:** Modern web frameworks require massive amounts of integration configuration (wiring up schemas to endpoints, setting up UI styles, syncing states). To a junior engineer, typing this out is manual friction. AI obliterates this friction instantly.
*   **Rapid Feedback Loops:** A younger developer values getting a feature to run quickly so users can interact with it. They are comfortable working in a state of **Continuous Refactoring** or treating code as semi-disposable scaffolding.
*   **Stack Overload:** A full-stack developer has to know TypeScript, Go, SQL, CSS, Docker, and AWS configuration simultaneously. No human can hold all of that syntax perfectly in their head. The AI acts as an instant, zero-friction translator across multiple language boundaries.

---

## 4. The SWE Job Anxiety: Who is Right?

The anxiety among younger developers that "AI will take SWE jobs" stems from a misunderstanding of what companies pay for. Companies do not pay developers to write code loops; they pay them to **solve human business problems using the smallest, most reliable architecture possible under budget and time constraints.**

*   **What AI kills:** The role of the pure "Code Typist" — someone who takes a perfectly specified Jira ticket and translates it into standard, generic loops and template styles.
*   **What AI elevates:** The role of the **Product Engineer** or **Systems Architect**. 

### The Ultimate Reality

The legends are correct that AI cannot engineer deep, novel systems with elegant architectural taste independently. The younger developers are also correct that AI completely alters the velocity of building application software. 

The developers who will remain completely secure in their careers are those who leverage the **velocity of the younger generation** but strictly filter their design choices through the **discipline, invariants, and architectural boundaries of the legends.**

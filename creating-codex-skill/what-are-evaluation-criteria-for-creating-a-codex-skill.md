
When building, testing, or submitting a "Skill" for OpenAI's Codex (or large language model-based code generation systems), evaluation relies on assessing how safely, accurately, and efficiently the model translates intent into working code. 

Here are the primary evaluation criteria broken down directly:

### 1. Functional Correctness (Accuracy)
*   **Definition:** Does the generated code actually work and solve the problem?
*   **Measurement:** Evaluated using unit tests and metrics like **Pass@k** (the probability that at least one of the top $k$ generated code samples passes all tests).
*   **Example:** If the skill is "Parse a CSV file," the evaluation tests it against standard CSVs, empty files, and malformed data to ensure it doesn't crash and returns the correct data structures.

### 2. Alignment with Prompt Intent (Robustness)
*   **Definition:** Does the model accurately interpret natural language constraints, edge cases, and nuances?
*   **Measurement:** Blind A/B testing or semantic evaluation against the prompt requirements.
*   **Example:** If a prompt asks to "Sort a list of users by age *in descending order* without using built-in sort functions," the skill fails if it sorts in ascending order or uses `.sort()`.

### 3. Execution Safety & Security
*   **Definition:** Is the code secure, free of vulnerabilities, and safe to execute?
*   **Measurement:** Static Analysis Security Testing (SAST) tools and sandbox execution tracking.
*   **Example:** Checking to ensure the generated code doesn't introduce SQL injection flaws, hardcoded API keys, or infinite loops that consume infinite compute.

### 4. Code Efficiency & Optimization
*   **Definition:** Is the generated code optimized for time and space complexity?
*   **Measurement:** Benchmarking execution time and memory footprint against a baseline standard.
*   **Example:** A skill that solves a problem using an $O(n \log n)$ algorithm passes with high marks, whereas an $O(n^2)$ brute-force approach for large datasets gets heavily penalized.

### 5. Idiomatic Design & Readability
*   **Definition:** Does the code look like it was written by an experienced human developer in that specific language?
*   **Measurement:** Linter scores (e.g., PEP 8 for Python) and naming convention checks.
*   **Example:** In Python, using list comprehensions instead of messy `for` loops, and using `snake_case` for variables rather than `camelCase`.

---

- consider adding [flexible] aspect where it helps and avoid forcing every rule of this skill file where it can hurt rather then helping
- skill should have `AGENTS.md` Reference Entry content
- create / link it as global skills so they are accessible in any project
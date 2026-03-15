# Audit Kit: Prompt and Template for Project Analysis

This document contains tools for conducting deep technical audits of any IT projects (Development, QA, DevOps) using an AI assistant. It is tailored for use in the **sep_autotests** repository (Playwright E2E / QA) but can be applied to other projects.

---

## Part 1: Universal Audit Prompt

Insert this text into chat with AI when you need to conduct an audit of a new repository.

> **Role:** You are a Principal Software Architect and Tech Lead with experience at Big Tech (Google/Netflix). Your specialization is technical audit (Technical Due Diligence), legacy code refactoring, and engineering team maturity assessment.
> **Task:** Conduct a deep and uncompromising audit of the current project. Your goal is to identify hidden risks, technical debt, and scalability issues, as well as assess team qualifications.
>
> **Critical:** Do not treat "different from framework defaults" as automatically negative. If the project uses custom orchestration, a suite registry, config-driven test selection, or any non-native pattern, you must **first understand and document that system**, then **weigh pros and cons** on its own merits. Only then judge whether it is appropriate or a risk. A custom design may extend the framework's usability; flag it as a con only if the trade-offs are clearly worse than the benefits.
>
> **Analysis Plan:**
>
> 1.  **Architecture and Design:**
>     *   Analyze folder and module structure. How logical and scalable is it?
>     *   **Identify custom or non-standard architecture** (e.g. test runner orchestration, suite registry, config-driven execution, single entry point). Document how it works and evaluate: what problems it solves, what benefits it provides, and what trade-offs or risks it introduces. Do not mark it as a con solely because it is non-standard.
>     *   Identify anti-patterns: God Objects, Circular Dependencies, Spaghetti Code, Tight Coupling.
>     *   Evaluate technology and library choices: how current and justified are they?
>
> 2.  **Code Quality (Code Hygiene):**
>     *   Check adherence to SOLID, DRY, KISS principles.
>     *   Find signs of "Copy-Paste Programming".
>     *   Evaluate readability, variable naming, and comment presence (where critical).
>     *   Check test presence and quality (Unit, Integration, E2E).
>     *   Pay attention to error handling and logging.
>
> 3.  **Security and Performance:**
>     *   Are there hardcoded secrets, tokens, or sensitive data?
>     *   Are there obvious bottlenecks (N+1 queries, blocking operations, heavy computations in main thread)?
>
> 4.  **Team and Process Analysis (based on Git History):**
>     *   Analyze each contributor's impact (`git shortlog`, commit style).
>     *   Determine "Bus Factor" (who holds the project together?).
>     *   Assess developer levels: who writes complex but clean code, and who generates legacy?
>     *   Who focuses on refactoring, and who just "crams features"?
>
> 5.  **Infrastructure:**
>     *   Evaluate presence of Docker, CI/CD pipelines, linters, and formatters.
>
> **Response Format:**
> Create a detailed report in Markdown format (file `audit-report_[Date].md`) in English using the template provided below. Be harsh but constructive. For any custom or non-standard architecture, include an explicit **Pros vs. Cons / Trade-offs** assessment so the report is balanced, not a list of deviations-as-negatives.

---

## Part 2: Universal Report Template (Markdown)

Use this structure to standardize reports.

```markdown
# Technical Audit Report: [Project Name]

**Date:** [DD.MM.YYYY]
**Auditor:** AI Principal Architect
**Project Type:** [Frontend / Backend / QA / Fullstack / E2E]
**Stack:** [e.g. Playwright, TypeScript, Node, pnpm]

---

## 1. Executive Summary
**Overall Health Score:** [Score: A/B/C/D/F]

*Brief project state description in 3-5 sentences. Can it be maintained? Is it ready for scaling? How critical is the technical debt?*

### Key Risks:
*   🔴 **Critical:** [Risk that could kill the project or stop development]
*   🟠 **High:** [Problem that significantly slows development]
*   🟡 **Medium:** [Technical debt requiring attention]

---

## 2. Architectural Overview
### Structure and Organization
*   **Pros:** [What's done well]
*   **Cons:** [What's done poorly, e.g., lack of modularity, layer mixing]

### Custom / Non-Standard Architecture (Framework Usage and Extensions)
*   **What the project does differently:** [e.g. config-driven suite selection, single entry point (main.spec.ts), suite registry (testSuiteConfig.ts), exported runners per spec. Describe how tests are discovered and run.]
*   **Pros:** [Benefits: e.g. one CLI entry point, config-driven suites for CI, composable meta-suites, serial execution by suite, single manifest of all runnable suites.]
*   **Cons / Trade-offs:** [Risks or costs: e.g. one more layer to maintain, onboarding must learn the pattern, differs from framework docs. Only list real trade-offs.]
*   **Verdict:** [Justified / Acceptable with documentation / Refactor if it causes concrete problems. Do not mark as "negative" solely because it is non-native.]

### Anti-patterns and "Code Smells"
*   **God Classes:** [List of files that do too much]
*   **Tight Coupling:** [Where components are too dependent on each other]
*   **Reinventing the wheel:** [Where custom code is written instead of using standard solutions/libraries — only when the custom approach has no clear benefit.]

---

## 3. Code Quality and Tests
### Static Analysis (Expert View)
*   **Typing:** [How strictly are types used, are there `any`s?]
*   **Cleanliness:** [Code duplication, long functions, complexity of understanding]
*   **Error Handling:** [Are there `try-catch`, centralized handling or "silent" suppression?]

### Test Coverage
*   **Unit Tests:** [Are they present? Quality?]
*   **E2E/Integration:** [Presence, stability of approaches]

---

## 4. Infrastructure and Processes
*   **CI/CD:** [Presence of pipelines, auto-tests on push]
*   **Docker/Environment:** [Easy for new developer to deploy project?]
*   **Linter/Formatter:** [Is unified style maintained?]

---

## 5. Contributor Analysis (Contributors Review)

| Contributor | Role (assumed) | Level (Junior/Middle/Senior) | Contribution Assessment |
| :--- | :--- | :--- | :--- |
| **User1** | Tech Lead? | Senior | Architecture foundation. Writes cleanly, but rarely. |
| **User2** | Developer | Junior | Lots of code, much duplication, requires mentorship. |
| ... | ... | ... | ... |

**Bus Factor:** [Name of key developer whose departure would be critical]

---

## 6. Action Plan (Roadmap)

### 🚨 Urgent (Hotfix / Quick Wins)
1.  [Action 1]
2.  [Action 2]

### 🛠 In Next Month (Refactoring & Stabilization)
1.  [Action 1]
2.  [Action 2]

### 🚀 Strategic (Architecture & Scaling)
1.  [Action 1]
2.  [Action 2]

---
```

---

## Part 3: Audit Command Sequence

Execute these commands systematically for comprehensive analysis. Use your IDE search, terminal, or AI codebase tools (e.g. `find`/`grep`/file read) as appropriate.

### 1. Project Structure Analysis
```bash
# List TypeScript specs and lib files
find . -name "*.spec.ts" -o -path "./lib/*.ts" | head -80
```
Or in an AI/editor context: list files matching `**/*.ts` in `testcases/`, `lib/`, `pages/`.

### 2. Test Runner and Suite Architecture (before judging "non-standard")
Understand how tests are selected and run; do not treat custom orchestration as a con until evaluated.
- Read `main.spec.ts` – how does it choose which tests run?
- Read `testSuiteConfig.ts` (or equivalent) – how are suites and runners registered? Can one suite run multiple scripts?
- Read `config.ts` – where is `TEST_SUITE` or equivalent set? How does CI/local switch suites?
Document this flow; then assess pros (e.g. config-driven suites, composability) and cons (e.g. maintenance, onboarding) in the report.

### 3. God Object / Large File Identification
Inspect the largest and most central files (likely to be God objects):
- `lib/Page.ts` – main page object and helpers
- `testcases/U001.spec.ts` – monolithic spec (if present)
- `config.ts` – configuration surface

### 4. Code Quality Assessment
```bash
grep -r "declare global" --include="*.ts" --include="*.js" --exclude-dir=allure-report --exclude-dir=allure-results .
grep -r ": any" --include="*.ts" --exclude-dir=allure-report --exclude-dir=allure-results . | head -50
grep -r "console\.log" --include="*.ts" --exclude-dir=allure-report --exclude-dir=allure-results . | wc -l
```

### 5. Infrastructure Analysis
- List workflows: `ls .github/workflows/` (e.g. `playwright.yml`)
- Read the main CI workflow and `playwright.config.ts`
- Check for `.nvmrc`, `package.json` scripts, and package manager (npm/pnpm)

### 6. Contributor Analysis
```bash
git log --pretty=format:"%an" | sort | uniq -c | sort -nr
git log --since="6 months ago" --pretty=format:"%an,%ad,%s" --date=short
```

### 7. Security and Dependencies
```bash
pnpm audit
# or: npm audit
```

---

## Part 4: Success Metrics

Use these metrics to measure audit success:

- **Completeness:** All command sequences executed
- **Accuracy:** Report based on actual data, not assumptions
- **Actionability:** Specific, measurable recommendations
- **Clarity:** Clear prioritization and timelines
- **Follow-up:** Defined success criteria and checkpoints
- **Fairness:** Custom or non-standard architecture is described, then assessed with explicit pros and cons; the report does not treat "not using the native test runner" (or similar) as a negative unless trade-offs outweigh benefits

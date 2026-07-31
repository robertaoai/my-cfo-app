# 🏭 GStack Production Protocol

**Welcome to the Factory.**

This document outlines the strict engineering rigor enforced within the `my-cfo-app` repository. Any idea promoted from the `docs/odysseus/` sandbox to the `docs/TASKS.md` backlog MUST pass through the following agentic quality gates before it is merged into production.

## The Slash-Command Quality Gates

To process a feature, utilize these slash-commands to invoke the corresponding engineering role:

### 1. `/ceo_review` [Feature Name / Task ID]
- **Role**: Vision Validator
- **Responsibility**: Evaluates the proposed feature against the core `PRD.md` business objectives. 
- **Goal**: Prevent scope creep. If a feature does not directly support the primary goals (e.g., extracting $581,872 from the market safely), it is rejected.

### 2. `/eng_manager` [Feature Name / Task ID]
- **Role**: Sprint Planner & Architect
- **Responsibility**: Translates the CEO-approved vision into concrete, technical component-level tasks inside `TASKS.md`. 
- **Goal**: Establish the data schema, identify potential regressions, and strictly sequence the required development work.

### 3. `/qa` [Commit SHA / Feature Branch]
- **Role**: Quality Assurance
- **Responsibility**: Reviews the completed development work.
- **Goal**: Executes `npm run build`, manually validates edge cases (e.g., testing empty states, broken API connections), and explicitly blocks the release if regressions are found.

### 4. `/release` [Commit SHA]
- **Role**: Release Engineer
- **Responsibility**: Handles final deployment tracking.
- **Goal**: Verifies that CI/CD pipelines passed, updates the `walkthrough.md` or `TASKS.md` to reflect the completed state, and baselines the feature.

---
*No casual commits. Respect the gears.*

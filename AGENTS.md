# Agent Guidelines & Operating Rules

## Core Rule: "One Prompt, One Review, One Commit" (1P-1R-1C)

Every autonomous coding agent working in this repository must strictly adhere to the **One Prompt, One Review, One Commit** lifecycle for every user prompt or task execution.

### 1. One Prompt (Atomic Scope & Planning)

- **Deep Requirement Analysis**: Read the user prompt thoroughly. Inspect existing codebase conventions, `.agents` skills, and repository configuration before modifying any file.
- **Strict Scope Boundaries**: Do not perform speculative refactoring, introduce unrequested packages, or expand scope beyond what was asked.
- **Clear Execution Plan**: Formulate and follow a focused, deterministic implementation plan that maps directly to the user's intent.
- **ADR Assessment & Proposal**: Evaluate whether the task introduces significant architectural changes, framework migrations, or structural shifts. If an ADR is warranted, formulate and propose the draft to the user for review first. Never modify `DECISIONS.md` directly without explicit user approval.

### 2. One Review (Rigorous Verification & Self-Correction)

- **Zero-Tolerance Quality Gate**: Before marking any prompt or task as complete, you must execute the mandatory verification suite:
  1. `pnpm install` (Lockfile & dependency consistency)
  2. `pnpm typecheck` (Full strict TypeScript check with 0 type errors)
  3. `pnpm lint` (ESLint flat config check with 0 errors and 0 warnings)
  4. `pnpm build` (Production build verification for all packages and apps)
- **Root-Cause Remediation**: If any error or warning arises, fix the root cause immediately and re-run all checks. Never suppress or bypass errors with `@ts-ignore`, `any`, or eslint-disable comments unless formally required and justified.
- **Self-Review**: Inspect git diffs to ensure no unintended files, debug logs, or transient artifacts are staged.

### 3. One Commit (Atomic Conventional Git Commit)

- **Single Cohesive Commit**: Exactly one atomic git commit per completed prompt.
- **Conventional Commits Standard**: The commit message must strictly comply with Conventional Commits specification:
  - Format: `<type>(<scope>): <short summary>`
  - Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `perf`, `test`
  - Examples: `feat(client): upgrade to next 16 and streamline ui`, `fix(core-banking): resolve cors origin validation`
- **Clean Working Tree**: Ensure pre-commit hooks (Husky, lint-staged, Commitlint) run cleanly and the working tree is completely clean upon task completion.

---

## Architecture Decision Records (ADR) Policy & Workflow

For any task that introduces architectural changes, core framework/library migrations, monorepo structural alterations, or runtime/protocol decisions:

1. **Assess Need**:
   - Evaluate whether the task warrants an ADR (e.g., changes to frameworks, adapters, monorepo organization, storage/database choices, API protocols).
2. **Propose Draft First (Mandatory User Review Gate)**:
   - **Never write directly to `DECISIONS.md`.**
   - The agent must formulate a complete ADR draft in the chat response (following the standard structure: Context & Problem Statement, Decision & Solution, Consequences & Costs/Trade-offs, Status, Stakeholders) and present it explicitly for user review.
3. **Persist to `DECISIONS.md` Only Upon Explicit Approval**:
   - Only after the user explicitly reviews and confirms the proposal (e.g., "approved", "تایید است", "ثبت کن"), append the finalized ADR to `DECISIONS.md`.
   - If the user requests modifications, adjust the proposal in chat and wait for final confirmation before writing to `DECISIONS.md`.

---

## Branching & Release Policy: Target Branch (`develop`)

- **Primary Development Branch (`develop`)**: All development changes, feature additions, bug fixes, and commits pushed to GitHub must target the `develop` branch. Never push development or unverified work directly to `main`.
- **Pristine Production Branch (`main`)**: The `main` branch is strictly reserved for stable, verified, production-ready releases that can be safely launched to production at any moment. It must remain launchable and clean at all times.
- **Branch Management**:
  - All day-to-day work, reviews, and prompt commits must be made and pushed on `develop`.
  - While granular feature branch conventions may be evaluated in future architectural decisions, all current active integration and synchronization happen on `develop`.

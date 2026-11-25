# Agent Guidelines & Operating Rules

## Core Rule: "Prompt Execution, Verification, and User-Approved Commit" (No Auto-Commit Policy)

Every autonomous coding agent working in this repository must strictly adhere to the following lifecycle for every user prompt or task execution:

### 1. Atomic Scope & Planning

- **Deep Requirement Analysis**: Read the user prompt thoroughly. Inspect existing codebase conventions, `.agents` skills, and repository configuration before modifying any file.
- **Strict Scope Boundaries**: Do not perform speculative refactoring, introduce unrequested packages, or expand scope beyond what was asked.
- **Clear Execution Plan**: Formulate and follow a focused, deterministic implementation plan that maps directly to the user's intent.
- **ADR Assessment & Proposal**: Evaluate whether the task introduces significant architectural changes, framework migrations, or structural shifts. If an ADR is warranted, formulate and propose the draft to the user for review first. Never modify `DECISIONS.md` directly without explicit user approval.

### 2. Rigorous Verification & Self-Correction (Quality Gate)

- **Zero-Tolerance Quality Gate**: Before presenting the output to the user, you must execute the mandatory verification suite:
  1. `pnpm install` (Lockfile & dependency consistency)
  2. `pnpm typecheck` (Full strict TypeScript check with 0 type errors)
  3. `pnpm lint` (ESLint flat config check with 0 errors and 0 warnings)
  4. `pnpm test` (Unit and integration tests with 0 failures)
  5. `pnpm build` (Production build verification for all packages and apps)
  6. **Runtime Smoke Test (اجرا و راه‌اندازی واقعی برنامه)**: Start/run the application to verify that it boots cleanly without runtime errors, crash on startup, missing dependencies, or unhandled exceptions.
- **Mandatory Runtime Execution & Smoke Test**:
  - Compiling and building alone are not sufficient. After every task that modifies application code or configurations, the agent MUST run the affected application (e.g., `pnpm start`, `pnpm dev:api`, or `node dist/main`) to verify live execution and ensure no runtime errors (e.g. `MODULE_NOT_FOUND`, DI resolution failure, port conflict).
  - Perform a sanity check (such as requesting the `/health` endpoint or validating startup logs) and terminate the test process cleanly before presenting results.
- **Root-Cause Remediation**: If any error or warning arises, fix the root cause immediately and re-run all checks. Never suppress or bypass errors with `@ts-ignore`, `any`, or eslint-disable comments unless formally required and justified.
- **Self-Review**: Inspect git diffs to ensure no unintended files, debug logs, or transient artifacts are staged or left behind.

### 3. Mandatory User Review Gate Before Commit (Strict No Auto-Commit Rule)

- **NEVER Commit Automatically**: When a prompt is executed and the output is generated, the agent must **NEVER** commit automatically.
- **Wait for User Review**: Present the results, summarize changes, and wait for the user to review the code and output.
- **Explicit User Authorization Required**: A git commit can ONLY be created after the user explicitly reviews the changes and gives permission to commit (e.g., "commit", "کامیت کن", "تایید است، کامیت کن", "you have permission to commit").
- **Single Cohesive Commit**: Exactly one atomic git commit per authorized prompt.
- **Conventional Commits Standard**: When authorized to commit, the commit message must strictly comply with Conventional Commits specification:
  - Format: `<type>(<scope>): <short summary>`
  - Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `perf`, `test`
  - Examples: `feat(client): upgrade to next 16 and streamline ui`, `fix(core-banking): resolve cors origin validation`
- **Clean Working Tree**: After receiving authorization and committing, ensure pre-commit hooks (Husky, lint-staged, Commitlint) run cleanly and the working tree is completely clean.

---

## Testing Standards & AAA Pattern Rule

All tests (unit tests, integration tests, spec files such as `*.spec.ts` or `*.test.ts`) written across all applications and packages in this repository must strictly adhere to the **AAA (Arrange, Act, Assert)** pattern:

1. **Arrange (تنظیم و آماده‌سازی)**:
   - Set up the environment, instantiate the subject under test (controllers, services, utilities), configure test modules/dependencies, and prepare input fixtures or mocks.
2. **Act (اجرا و عملکرد)**:
   - Trigger the specific action, invoke the method, or perform the operation being tested. Keep this phase concise and focused on the single behavior under test.
3. **Assert (اعتبارسنجی و بررسی صحت)**:
   - Verify that the outcome matches expectations (returned value, state mutation, thrown exception, or side effect) using clear and precise assertions.

- **Structure & Clarity**:
  - Explicitly organize test bodies into these three distinct phases, clearly delineated or labeled with comments (`// Arrange`, `// Act`, `// Assert`) to ensure immediate readability and diagnostic clarity.
  - Avoid mixing execution and assertions into a single monolithic step.

---

## Environment Variables & Configuration Policy (No Direct `process.env` Access)

- **No `process.env` Outside Schema Modules**: Direct access to `process.env` is strictly prohibited everywhere outside the designated environment validation schema/config modules (e.g., forbidden in controllers, services, modules, `main.ts`, feature code, and tests).
- **Single Validated Source of Truth**:
  - All environment variables must be declared and validated with **Zod** inside the application's environment configuration module (`apps/core-banking/src/config/env.config.ts` for backend, `apps/client/src/env.ts` for client).
  - In NestJS applications (`apps/core-banking`), configuration must be registered globally via `@nestjs/config` (`AppConfigModule`) and accessed strictly through typed dependency injection (`AppConfigService` or `ConfigService<Env, true>`).
- **Fail-Fast Startup Validation**: Invalid or missing required environment variables must prevent the application from starting and output a clear, readable list of every failing variable.
- **Example Files & Git Safety**: Every variable defined in the Zod schema must be documented in the app's `.env.example` file, and real `.env` files must remain gitignored.

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

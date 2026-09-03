# Project context

SkillBridge has a React/TanStack Start frontend at the repository root and a
Spring Boot/PostgreSQL backend in `backend/`. Read this file before making changes.

## Checkpoint — 2026-09-03

- Objective: reproduce and fix errors preventing this Windows checkout from running.
- Initial state: no root PROJECT_CONTEXT.md. Existing changes were present in
  package-lock.json and src/routeTree.gen.ts, plus untracked target/classes/.
  These were not intentionally reverted or deleted.
- Fixed backend/mvnw.cmd: guard a null directory Target before indexing it.
  The wrapper had crashed before Maven could start on Windows.
- Restored src/lib/api-client.ts, src/lib/rbac.ts, and src/lib/mock-api.ts from
  commit 89f2485 (HEAD's parent). The combined frontend/backend commit omitted
  these modules while retaining services and auth context that import them.
  Existing demo/mock behavior was retained.
- Updated package.json and package-lock.json: added the missing
  @testing-library/jest-dom dev dependency, a type-check script, type-checking
  before build, and npm start for the generated Node server.
- Updated vite.config.ts: fixed development port 3000 with strictPort and set
  Nitro's node-server preset for local production execution. The previous default
  generated a Cloudflare worker. The wrapper's tsconfig-paths deprecation notice
  remains informational; final Node build had no unresolved dependency warnings.
- Fixed UserActivityLog.hoursLearned to use BigDecimal with precision 10, scale 2,
  matching the existing V22 DECIMAL(10,2) column. Updated DashboardQueryService
  conversions and DashboardQueryServiceTest with 2.25-hour regression assertions.
  No database migration was edited; all 24 existing migrations validated and the
  connected local database was already at version 23.
- Added backend/.env.example. Generated a random local JWT secret in ignored
  backend/.env, without changing security defaults. Never copy its value here.
- Updated README.md with Windows startup commands, correct health port, build
  output, and current demo-page limitations.
- Validation: npm run build passed including TypeScript; generated .output
  node-server artifact ran via npm start on port 3100; dashboard and mentors
  rendered and client navigation succeeded with no browser console errors.
  Required server/public output and packaged tslib dependency were present.
  Browser checks used the in-app browser because agent-browser CLI was unavailable.
- Validation: DashboardQueryServiceTest passed (2 tests, 0 failures/errors).
  Backend started against local PostgreSQL 17; /actuator/health on 9096 returned
  UP, /api/skills on 9095 returned 200, and CORS preflight allowed localhost:3000.
  git diff --check passed. npm reported one high-severity dependency advisory;
  no unrelated dependency upgrade was attempted.
- Environment: Node 24.18.0 and Java 26.0.1 were installed. Maven properties must
  be quoted in PowerShell, e.g. .\mvnw.cmd "-Dfrontend.skip=true" spring-boot:run
  from backend/. Sandboxed Maven/npm needed escalation to use caches/network;
  Nitro Node dependency tracing also needed access to parent-directory metadata.
- Remaining work outside this startup fix: route pages still use demo data and
  are not wired to live API/auth services. No claim of full live booking/auth
  integration or a verified single-JAR distribution. The SSR Node frontend runs
  separately; Maven's legacy dist/client resource path is not an SSR deployment.

## Checkpoint — 2026-09-03 (frontend port handoff)

- Objective: resolve the user's `Port 3000 is already in use` startup error.
- Cause: the agent's Vite verification server was still running on port 3000.
- Action: stopped that specific agent-owned server; left application code and
  backend unchanged. Only PROJECT_CONTEXT.md was changed for this checkpoint.
- Validation: successfully bound and released a temporary TCP listener on
  localhost:3000, confirming the port is free for the user's `npm run dev`.
- Remaining work: user can start the frontend in their own terminal. Do not
  restart an agent-owned frontend during this handoff.

## Checkpoint — 2026-09-03 (backend port handoff)

- Objective: address the user's Maven spring-boot:run exit-code-1 screenshot.
- Evidence: screenshot contains only Maven's failure summary. The agent-owned
  backend was still running and its health endpoint reported UP, so a duplicate
  startup would conflict with its ports. The user's earlier root-cause log was
  not available in the screenshot.
- Action: stopped the specific agent-owned backend verification session.
  No application configuration or source changes; only this checkpoint was added.
- Validation: successfully bound and released temporary TCP listeners on both
  localhost:9095 and localhost:9096, confirming the ports are now free.
- Remaining work: user can run the backend in their own terminal. Leave both
  frontend and backend startup under the user's control; do not launch another
  agent-owned instance during handoff.

## Checkpoint — 2026-09-03 (publish startup fixes to main)

- Objective: commit and push the repaired version to the user-specified
  loucasty-cell/UIT-Java-Final-Project repository's main branch.
- Confirmed origin matches the requested GitHub repository; fetched main and
  verified local HEAD and origin/main both point to the same pre-fix commit.
- Files: publish the startup/configuration/module restorations described above,
  package-lock.json, regression tests, environment example, and this context.
  README now gives new-checkout setup without implying a private secret ships
  with the repository. Exclude local .env files and generated build/class files.
- Validation repeated: npm run build (including TypeScript) passed;
  DashboardQueryServiceTest passed with 2 tests and no failures/errors.
  The newly produced Node artifact served dashboard, mentors, and all 8 referenced
  asset URLs with HTTP 200 on temporary port 3101; no server stderr output.
  The temporary process was stopped; user-owned frontend/backend were untouched.
- Scope limits: existing CI has missing frontend test-script references and old
  dist artifact paths; CI repair and live-data UI integration are not included
  in this startup-fix commit. Do not claim all CI or all app features are error-free.

## Checkpoint — 2026-09-03 (local login/logout repair)

- Objective: repair and validate login/logout for local review. The user explicitly
  requested no push. No commit or push was made; HEAD remains 079eac5.
- Root cause: no login route or mounted AuthProvider, hardcoded account identity,
  unwired logout action, and API mock fallbacks that could manufacture successful
  authentication while the backend was unavailable.
- Files: added login route/form, AuthGate, auth-session and auth-validation helpers;
  updated root route, dashboard identity/role badge, TopNav, auth context/service,
  API client, generated route tree, and API profile types. Updated package files
  and test setup; added five frontend test files and scripts/test-auth-api.mjs.
  README documents login, local review credentials, and authentication testing.
- Decisions: authenticate against the real Java API; validate stored sessions with
  /api/v1/me; guard protected/admin views; report validation and network failures;
  disable duplicate submissions; bound requests; coordinate refresh and guard late
  responses after logout. Logout clears tokens/user/query cache immediately and
  revokes the refresh-token family, including after refresh rotation. Sync logout
  across tabs. Backend production code was unchanged.
- Validation: 55 frontend tests passed covering inputs, errors, refresh, races,
  restoration, logout/cache clearing, cross-tab logout, and protected routes.
  Twenty real local API checks passed, including malformed/incorrect credentials,
  unauthenticated profile, successful login/profile, refresh rotation, logout
  family revocation, repeated logout, and signing in again.
- Validation: TypeScript and production build passed. The final .output artifact
  ran on temporary port 3101; login and protected SSR responses plus 10 referenced
  assets returned HTTP 200, with packaged tslib present. Browser checks against
  the compiled artifact verified login, reload/session restoration, correct account
  identity, logout, and post-logout protected-page redirection, with no console
  errors. Development UI also verified blank-input and wrong-password feedback.
  git diff --check passed; targeted ESLint had no errors (two auth-context warnings
  concerning effect cleanup refs and Fast Refresh exports remain). A development
  HMR error while editing the context cleared on reload; production flow passed.
  Build notices concern chunk size and redundant tsconfig-paths plugin, with no
  unresolved runtime dependencies.
- Local review: one synthetic account was created in the local database. Its
  credentials are in ignored auth-test.local; no credentials are recorded here.
  Agent-owned dev/API/production verification servers were stopped and ports
  3000, 3101, 9095, and 9096 were confirmed free for the user's terminals.
- Remaining scope: dashboard statistics/certificates, notifications, and other
  page data remain demos. Stateless access tokens expire according to backend
  policy; logout revokes refresh tokens and removes browser access credentials.
  No full backend-suite, CI, or single-JAR release certification is claimed.
  Existing untracked root target/classes was preserved.

## Checkpoint — 2026-09-03 (local new-user registration)

- Objective: add sign-up from the login page and connect new-user registration
  to the existing Java API. Preserve the user's no-push instruction; no commit or
  push was made, and the prior local authentication changes remain intact.
- Files: added src/routes/register.tsx, src/components/register-form.tsx and its
  test; extended auth-validation.ts; linked login/register routes and allowed both
  through the public root layout; updated generated route tree and RegisterRequest
  optional metadata types. Added scripts/test-registration-api.mjs and its package
  script; updated README and this checkpoint.
- Behavior: required first/last names, valid email, password rules matching the
  registration DTO, exact password confirmation, show/hide passwords, disabled
  duplicate submissions, actionable duplicate-email/server/network feedback,
  accessible errors/focus, and automatic sign-in with a safe return destination.
  Registration sends only the four required backend fields, without confirmation.
- Backend: added V24__remove_email_based_role_assignment.sql to remove V19's
  automatic email-substring role trigger/function for future accounts. Existing
  role assignments are preserved. Flyway successfully applied V24 locally.
  New registration receives USER even when email contains admin/mentor wording,
  as verified through registration, profile and subsequent login responses.
- Validation: all 77 frontend tests passed (22 new registration cases), TypeScript
  passed, targeted ESLint passed with no findings, and production build passed.
  Eighteen real registration API checks passed, including invalid fields,
  duplicate email, successful creation/profile, default roles, logout revocation,
  and subsequent login. Existing login tests were included in the frontend run.
- Final artifact: ran the newly built .output Node server on port 3101; registration,
  login and protected SSR routes plus 24 referenced assets returned HTTP 200,
  packaged tslib was present, and no unresolved dependency warnings occurred.
  Browser verification of that artifact against the user's API on 9095 passed
  registration -> automatic dashboard sign-in -> logout -> login -> logout with
  correct identity and no console errors. Development UI showed required errors
  and the login-to-registration link; sign-up layout was visually inspected.
- Environment: user-owned servers on 3000/9095/9096 were left running. Temporary
  backend on 9195/9196 applied the migration to the same local DB and was stopped;
  temporary frontend 3101 was stopped and all three temporary ports are free.
  Two synthetic local accounts were created for API/browser checks; no existing
  user data was edited and no test credentials are recorded here.
- Remaining scope: existing demo dashboard data and pre-existing role assignments
  were not changed. Registration does not add email verification or password reset.

## Checkpoint — 2026-09-03 (publish authentication changes)

- Objective: user now authorizes publishing all reviewed login/logout/registration
  changes to the specified GitHub main branch, superseding the earlier no-push
  instruction. Origin was verified as loucasty-cell/UIT-Java-Final-Project.
- Remote reconciliation: fetched and fast-forwarded to a585dac, preserving its
  setup documentation, script, and dispute-service changes. No force push or
  history rewriting is used.
- Additional fixes: the fetched AdminDisputeService contained a stray character
  that prevented Java compilation and had removed the cancelled-session guard.
  Removed the typo and restored rejection of missing/cancelled sessions before
  resolution. Existing SessionDisputeTest exposed and now verifies the regression.
  CI now runs the frontend authentication tests in addition to type/build checks.
- Files: publish the authentication and registration files recorded in the two
  preceding checkpoints, plus AdminDisputeService.java and .github/workflows/ci.yml.
  Exclude private .env/auth-test.local files, generated output/logs, and the existing
  untracked root target/classes directory.
- Validation of combined source: 77 frontend tests and all 97 backend Maven tests
  passed, with no failures/errors/skips in the backend suite. Real local API checks
  passed: 20 login/session/logout checks and 18 registration checks. The Java API
  used for live checks was the user's already-running instance; the latest dispute
  code was covered by compilation and unit tests, not restarted on their ports.
- Artifact validation: npm run build including TypeScript passed; ran the final
  .output artifact on temporary port 3101 and verified login/register/protected
  SSR plus 24 assets. Packaged tslib was present; no unresolved dependencies.
  Previous browser auth/registration end-to-end verification remains applicable;
  no frontend runtime source was changed in this publication turn. Temporary
  artifact server was stopped; user's existing servers were left running.
- Scope: authentication is verified as described; unrelated demo-page data and
  full single-JAR frontend hosting are not certified by this checkpoint.

## Checkpoint — 2026-09-03 (CI lockfile follow-up)

- Published authentication commit d34c2c9 to origin/main and verified remote SHA.
  GitHub clean-install jobs then failed before tests because npm 10 requires a
  nested optional peer lru-cache entry that the local npm 11 lockfile omitted.
- Change: regenerated lock metadata with npm 10.9.7 --package-lock-only; the only
  dependency change adds nitro/node_modules/lru-cache 11.5.2 to package-lock.json.
  The user's running node_modules and servers were left untouched.
- Validation: npm 10.9.7 ci --dry-run --ignore-scripts passed. Previously verified
  source, tests and frontend artifact are unchanged. Do not equate local build/test
  success with all CI jobs passing: repository-wide lint also reports pre-existing
  formatting, explicit-any and Playwright fixture lint issues outside the auth
  feature. Full lint cleanup is not included in this dependency correction.

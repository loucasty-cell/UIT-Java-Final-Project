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

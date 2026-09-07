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

## Checkpoint — 2026-09-03 (CI asynchronous focus assertion)

- The primary CI workflow for 98ce9e6 passed frontend build/tests and backend
  tests/package. A duplicate frontend workflow exposed a timing-sensitive test:
  duplicate-email text can render before the effect restores input focus.
- Changed register-form.test.tsx to wait for the focus effect before asserting it,
  matching the component's asynchronous behavior without weakening the assertion.
  Application runtime code is unchanged. Legacy lint jobs still have unrelated
  repository-wide findings; do not report that all workflow checks are green.

## Checkpoint — 2026-09-03 (repair failing lint workflows)

- Objective: user asks to fix the red GitHub check; repair lint and publish the
  corrections to main under the existing authorization. Remote main was fetched
  and matched local HEAD 5886cc8 before changes.
- Changes: formatted application services, mock helpers, and E2E source/scripts
  to the existing Prettier rules. Replaced explicit-any types with existing DTOs,
  typed pagination unions, typed demo request fields, or unknown for unspecified
  response bodies; narrowed array/page responses before accessing content.
  Renamed the Playwright fixture callback from use to providePage to avoid its
  false React-hook classification. Documented intentional demo cache recovery.
- Lint configuration: exclude .agents/**, a separate vendored agent tool package,
  from application ESLint. Application rules remain enabled and lint remains a
  required CI step. Eight existing non-failing warnings remain; zero lint errors.
- CI files: frontend.yml, frontend-ci.yml and main.yml now upload the real .output
  artifact, include its hidden directory, and fail if it is missing. Added
  scripts/verify-frontend-build.mjs to start the compiled Node server, validate
  login/register/protected SSR and referenced JS/CSS, then stop the test process
  before uploading. Existing deployment placeholders are unchanged.
- Validation: npm run lint passed (0 errors), TypeScript passed, all 77 frontend
  tests passed, and npm run build passed. The final generated artifact passed the
  new runtime check: 3 routes and 24 assets, with no unresolved dependencies.
  git diff --check passed. Backend source was unchanged in this repair; its prior
  97-test pass remains applicable. User-owned dev/API servers were not stopped.
- Files: eslint.config.js, affected src/lib and src/services files, src/types/api.ts,
  E2E formatting/fixture files, test-e2e-demo-data.mjs, the three workflow files,
  the artifact verification script, and this checkpoint. Private credentials,
  logs, build output and existing root target/classes remain excluded.

## Checkpoint — 2026-09-03 (workflow cancellation collision)

- User's screenshot still showed a red cross on 402e3ed although four workflows
  completed successfully. Inspected all commit checks: no failed checks, but two
  duplicate workflows had cancelled jobs. The earlier all-green summary omitted
  the effect of those cancellations on the commit indicator.
- Cause: backend.yml/backend-ci.yml shared a workflow name, as did the two frontend
  workflows. Their concurrency group uses github.workflow plus github.ref, so the
  paired workflows cancelled each other on the same push.
- Changed only the names in backend-ci.yml (Backend Tests and Migrations) and
  frontend-ci.yml (Frontend Verification), giving each an independent concurrency
  group while retaining all jobs and cancellation of older runs of the same workflow.
- Validation: workflow YAML parses; names are unique across all workflow files.
  Runtime source and previously verified build artifacts are unchanged.

## Checkpoint — 2026-09-03 (local session, volunteer and admin workflows)

- Objective: finish the user's local-only feature fixes: persistent mentor/volunteer
  requests, Learner/Mentor session tabs, completion, arbitrary exchange skills,
  shared posts, reason-based reporting and separate administrator sign-in.
  Applied prompt-preflight and browser/React verification guidance. No commit or
  push; HEAD remains 8084726. Existing untracked root target/classes is preserved.
- Frontend changes: rebuilt routes/mentors.tsx, sessions.tsx, forum.tsx, admin.tsx
  and index.tsx around actual APIs instead of static demo rows, balances and fake
  success handlers. Added admin-login.tsx, role-aware auth routing, and typed DTO
  updates. Corrected learning-request/session/forum/mentor/moderation/admin/skill
  services. Session requests are separated by learner/mentor identity. Active,
  Requests, Awaiting confirmation, Completed and Reported reflect saved states.
  Mutations preserve the selected role tab. Completed-session reviews call the
  real review API. Exchange accepts a named skill and safely reuses it on retry.
- Shared data: use-live-refresh.ts refreshes visible session, forum, admin and
  notification data every 15 seconds and on window focus. top-nav.tsx now shows
  real wallet balances/notifications and working mentor search. Forum posting,
  likes, comments, full post reading, owner deletion and reports use the backend.
  Replaced demo dashboard information with real wallet/session/skill data.
- Backend changes: custom user-skill creation DTO/controller/service and catalog
  lookup; discover mentors from teaching portfolios; validate volunteer post
  ownership/skills and selected offerings. Persist forum skill associations and
  return skill tags and likedByMe; query newest posts first and filter by skill.
  Attribute moderation reports to the authenticated user. Admin report responses
  contain reporter names and details, and dashboard statistics use database
  counts rather than constants. Admin dispute decisions update sessions and funds.
- Completion and points: include SCHEDULED in active sessions; confirmation moves
  a session out of Active, preserves its original deadline on repeat, and permits
  AWAITING_CONFIRMATION to finish. Carry point cost snapshots and link held
  learning-request escrow to the accepted swap request. Both-party completion
  releases funds once. Preserve volunteer mode in reports.
- Migrations: V25 creates forum_post_skills; V26 repairs escrow references for
  accepted learning requests; V27 adds COMPLETED to the swap-request constraint
  while retaining legacy EXPIRED compatibility. All applied successfully to the
  local PostgreSQL database. The live test caught the missing COMPLETED database
  state, which unit tests could not detect.
- Browser-only blocker fixed: SecurityConfig now allows Idempotency-Key in CORS
  preflight headers. Direct API calls had succeeded while browser bookings were
  blocked. Added an explicit preflight assertion to the live API regression script.
  Date/time inputs now capture input events as well as changes. Browser retry also
  exposed and fixed duplicate custom-skill creation after a failed booking.
- Added scripts/local-database.mjs, grant-local-admin.mjs and test-feature-api.mjs;
  expanded verify-frontend-build.mjs to include admin-login. LOCAL_FEATURE_CHECKS.md
  documents startup, explicit local admin assignment and two-account checks.
  Test additions/updates cover admin-only login, session roles/completion, real
  dashboard totals and authenticated reporting. Session UI test is named
  routes/-sessions.test.tsx so TanStack excludes it from route discovery.
- Validation: 82 frontend tests passed; TypeScript and lint passed (0 lint errors,
  8 pre-existing warnings). 100 backend tests passed with no failures/errors, and
  Maven package succeeded using -Dfrontend.skip=true. Final backend JAR started,
  health returned HTTP 200 UP, and 79 local API checks passed against it: shared
  posts/likes/comments, three booking modes, incoming/outgoing visibility,
  unauthorized access, confirmations, one-time point release, reporting and admin
  resolution, real admin counts, and newest-first posts. Frontend build succeeded
  without unresolved dependencies; the produced .output server served four routes
  and 33 JS/CSS assets. Windows sandbox readlink restrictions required an elevated
  frontend build; source changes were not used to bypass that restriction.
- Browser validation: signed in as a synthetic learner, requested a real exchange
  with a newly typed skill, verified Learner/Requests, signed out and signed in as
  its mentor, verified Mentor/Requests, accepted, completed out of Active, submitted
  an issue with category/details, then signed into /admin-login and resolved that
  same report. Confirmed reporter names and shared volunteer posts; no captured
  browser console errors in these checks. Temporary admin access was removed,
  browser test sessions logged out, test posts deactivated and the private fixture
  file removed. Synthetic account/session history remains in the local database.
- Runtime: restored frontend on port 3000 after reinstalling the locked npm
  dependencies, and left the final packaged backend on 9095/9096 for user review.
  To rebuild Java, stop that running JAR first (Windows locks the artifact); the
  normal Maven dev command is documented. No package/lockfile changes were made.
- Remaining: user acceptance testing. This verifies the named workflows and
  related wallet/notification/review behavior, not every legacy endpoint or
  production integration. The simplified dashboard does not certify the old
  demo profile/certificate/activity controls, and existing certificate storage
  configuration remains outside this task. No deployment or GitHub work requested.
- Verification detail: the review UI is connected and existing backend review
  tests pass; browser review submission was not part of the recorded end-to-end
  check. Final discovery after renaming -sessions.test.tsx still ran all 82
  frontend tests successfully. Final git diff --check passed.

## 2026-09-04 — Final compiled-app browser verification

- Objective: resume the local feature fixes and close the remaining volunteer
  and review browser checks. No application source changes were needed today;
  this checkpoint is the only additional file change. No commit or push made.
- Restarted the packaged backend and normal Vite frontend as hidden processes
  after finding the previous servers stopped. Verified frontend HTTP 200 on 3000
  and backend health UP on 9096 (API on 9095).
- Exercised the final .output frontend on temporary port 4173 against the final
  backend JAR: mentor published a volunteer post, another account saw and booked
  it, Learner/Requests and Mentor/Requests showed the same request, mentor
  accepted, each participant confirmed completion, Active became empty, and
  Completed showed the session. Learner submitted feedback successfully through
  the review form. Captured browser console errors were empty.
- Deleted the temporary post and signed out the browser test accounts. Synthetic
  session/review history remains locally. Stopped the temporary port 4173 server;
  left normal frontend/backend running. Runtime logs contained no ERROR,
  Unhandled, or Exception matches; an existing PageImpl serialization warning
  remains non-blocking and is not a missing dependency warning.
- Reused the unchanged-source results from the previous checkpoint: 82 frontend
  tests, 100 backend tests, 79 live API checks, successful builds and compiled
  route/asset checks. Final git diff --check passed before this documentation
  append. Remaining work is user acceptance testing within the documented scope.

## 2026-09-04 — Restore dashboard features and fix volunteer publishing

- Objective: restore user-requested skill levels, certificates, activity log and
  teaching posts removed by the previous dashboard simplification; make volunteer
  skills manually entered and explain why publishing cannot proceed.
- Frontend changes: added components/dashboard-extras.tsx for real certificate
  upload/download/delete, wallet activity pagination/CSV export, and teaching
  offering create/hide/republish. Dashboard skill creation now accepts Beginner,
  Intermediate or Advanced. Updated forum.tsx to accept typed skills and display
  title/description validation errors on Publish rather than silently disabling
  the button. Updated mentors.tsx to let learners select published offerings,
  respecting their price, duration, skill and enabled modes. Updated skill service,
  API types and mock fixtures to match actual backend payloads. Added
  routes/-forum.test.tsx regression for the screenshot's short description case.
- Backend changes: MentorMapper now resolves portfolio IDs to actual skill IDs;
  MentorOfferingService validates ownership, teaching direction and nonempty modes
  when creating offerings. application.yml defaults certificate storage to local
  filesystem and permits multipart PDFs up to 5 MB. Filesystem storage uses UUID
  keys independent of uploaded filenames. LOCAL_FEATURE_CHECKS.md updated.
- Validation: 83 frontend tests and 100 backend tests passed; frontend type-check
  and production build passed; backend package passed; lint has 0 errors and the
  same 8 existing warnings. Final compiled frontend served 4 routes and 34 assets
  without unresolved dependencies. git diff --check passed; HEAD stays 8084726.
- Browser/API: created an Advanced teaching skill and 45-minute/12-point post;
  confirmed another account sees it and the booking UI applies its price/duration
  and disables unsupported modes. API booking charged 12 points and cancellation
  refunded 12, both reflected in real activity. Confirmed ownership rejection for
  another account's teaching skill and certificate download access protection.
  Uploaded a PDF through the browser; restarted the final backend JAR and checked
  downloaded bytes exactly match the source file. Browser volunteer publishing
  showed the 20-character error for HI, then published with a manually entered new
  skill. Captured browser errors were empty after the checks.
- Cleanup/runtime: deleted only the synthetic uploaded certificate and volunteer
  post, hid the synthetic teaching offering, cancelled the test booking, signed
  out test sessions and removed the local PDF fixture. Synthetic skill/history
  rows remain. Frontend 3000 and packaged backend 9095/9096 left running; health UP.
  No commit, push, deployment, or user-account permission changes were made.

## 2026-09-04 — Remove verification data and enable shared development API access

- User requested removal of generated Flow/Creative skills, BrowserMentor and
  FlowCheck accounts/requests, review of other pages, and an explanation of
  pending requests and testing with two laptops.
- Added scripts/cleanup-local-test-data.mjs with a preview default, exact documented
  synthetic identity patterns, verified Git-ignored local recovery snapshot, and
  transactional dependent-record cleanup. Applied it to the local database:
  removed 22 synthetic accounts, their posts/sessions/reports/notifications and
  unused generated skills. Preserved the sole genuine account and its data.
  Refunded 10 held points on its pending request to a test mentor before cleanup;
  retained genuine wallet audit history. Verified available +10, held -10, no
  other real-wallet changes, and zero synthetic accounts afterward. Remaining
  catalog: Java, MySQL, React, Machine learning, problem solving. No invented
  replacement users or posts were inserted. Private backup stays under ignored
  backend/storage/backups; do not publish it.
- Removed the hardcoded Fall 2026 sidebar label and global exchange-skill datalist;
  exchange entry remains manual and persists real user skills. Runtime service
  scan found no active mock-api import or fabricated fallback; removed a stale
  mock-fallback comment in forum service. Test fixtures remain development code.
- Added a same-origin API base for development plus a Vite /api proxy to the host
  backend and npm run dev:lan. Production API configuration is unchanged. The
  feature API test now refuses to seed unless explicitly configured for a
  disposable test database using FEATURE_TEST_ISOLATED_DATABASE=true.
- Files: cleanup script, feature-test script, mentors route, app-sidebar,
  api-client, forum service, vite.config.ts, package.json, LOCAL_FEATURE_CHECKS.md
  and this checkpoint. No backend source or dependency versions changed.
- Validation: all 83 frontend tests passed, lint 0 errors/8 pre-existing warnings,
  git diff --check clean. Local frontend API proxy returned HTTP 200 both via
  localhost and host Wi-Fi IP 192.168.1.25; backend health UP. A physical second
  laptop was not available, so cross-device firewall/router access is not claimed
  verified. Two devices must use the same host URL/backend/database and different
  accounts. No GitHub push/commit or firewall modification was made.
- Final frontend production build passed; the produced artifact served all four
  checked routes and 34 assets successfully.

## 2026-09-04 — Small presentation dataset in the existing account

- User explicitly reversed the no-demo preference for a small classroom demo,
  and clarified that sample sessions must appear in their existing account,
  not require switching to a demo learner account.
- Added and ran scripts/seed-presentation-demo.mjs locally: two clearly labelled
  fictional mentors (Java and MySQL), two labelled volunteer posts, one pending
  outgoing request, one scheduled active session, and one incoming request in the
  real account's Mentor tab. No changes to the user's profile or skills.
- Demo mentor records are necessary for relational session/post ownership; their
  presentation-only identities use a reserved example domain. Credentials are
  random, not printed or recorded here, and their API sessions were logged out.
  No admin access granted. The script refuses duplicate seeds and requires an
  explicit existing account ID if multiple genuine accounts are present.
- Validation: API creation/acceptance succeeded, mentor search returns demo data,
  database checks confirm PENDING and SCHEDULED states, and the existing account's
  available/held points exactly match pre-seed values. All demo bookings are
  zero-cost volunteer sessions. Only script/documentation and local data changed;
  no app rebuild required. No commit or push performed.

## 2026-09-04 — Integrate upstream changes for authorized main push

- User explicitly authorized pushing all local work to main after checking new
  commits and validating integration. Fetched origin/main and found 337d610 and
  f2face1 after the prior 8084726 baseline. Saved local work as a5c602b and merged
  both upstream commits, preserving their Wallet and Settings routes/navigation.
- Resolved overlaps in favor of the verified real login/logout, forum, session
  request and notification behavior; upstream versions would restore dummy user
  details and remove logout behavior. Wallet now uses actual balances/history
  with loading/error/empty states instead of fabricated money. Settings skill
  controls now persist to the backend, profile saves refresh auth context, and
  login redirects include both new routes. Existing Settings photo preview and
  unavailable password/notification-delivery controls are explicitly labelled;
  they are not claimed as implemented upload or delivery services.
- Retained immutable V23 content from the existing baseline, because the upstream
  edit would change its applied Flyway checksum. V27 supplies the intended
  COMPLETED constraint change as a new migration for existing databases.
- Added SettingsSkills component and two wallet regression tests. Expanded final
  artifact verification to six routes. Validation: 85 frontend tests, 100 backend
  tests, frontend type-check/build and backend package passed; compiled frontend
  served six routes and 48 assets. No dependency-resolution errors. Local private
  backups, environment files, database records and untracked target/classes are
  excluded from the commits. Demo data remains in the local database; the explicit
  seed script is included so it can be recreated intentionally elsewhere.

## 2026-09-05 — Separate admin workspace, rename user dashboard, repair Settings save

- Objective: keep administrator and user workspaces separate, present the existing
  root user dashboard as Profile, route the account-menu Profile action there,
  retain Settings as a separate editor, and make its existing profile fields save.
  The user explicitly limited changes to these areas and requested no GitHub push.
- Frontend: the user sidebar and root page now say Profile; the account-menu Profile
  item routes to `/`, while Settings remains at `/settings`. Administrator accounts
  are rejected by the user login form, normal accounts are rejected by the admin
  login form, authenticated admins are redirected away from user routes, and the
  admin page renders without the user sidebar/top navigation. A dedicated sign-out
  control remains available on the Admin Dashboard.
- Profile save fix: the client now sends the profile response version as a quoted
  `If-Match` header, updates the auth/query state from the successful response, and
  reports the backend error instead of masking PATCH failures with an unsupported
  PUT fallback. The response type now includes the version and server-derived
  avatar URL. The backend update DTO/service now support the form's existing first
  and last name fields. CORS permits `If-Match` and exposes `ETag`.
- Tests: added frontend coverage for login separation, admin route isolation and
  the versioned PATCH request, plus backend service coverage for name updates and
  missing/stale versions. Focused frontend checks passed 25/25. All 103 backend
  tests passed. TypeScript and the production frontend build passed with traced
  `tslib` and no unresolved dependencies. Scoped lint had 0 errors and the two
  previously documented auth-context warnings.
- Runtime verification: used an isolated updated backend on 9195/9196 and Vite on
  4173. A synthetic user signed in to Profile, opened separate Settings, saved
  first name/display name/major, and retained all values after reload. A synthetic
  admin signed in through `/admin-login`, saw only Admin Dashboard content, and a
  direct `/settings` visit redirected back to `/admin`. Browser console errors were
  empty. Both synthetic accounts and dependent records were removed with the
  existing cleanup script; its ignored local recovery backup was verified. The
  temporary browser and servers were closed.
- Existing unrelated checks: the full frontend suite passed 86 tests but two
  pre-existing My Sessions assertions failed because their expected tab/empty-state
  text no longer matches the current UI. Full-project lint also has pre-existing
  formatting errors in Forum, Noticeboard and Sessions. Those unrelated files were
  intentionally not changed under the user's scope restriction.
- Runtime handoff: user-owned frontend 3000 and backend 9095/9096 remained running.
  The backend process on 9095 predates this change (its CORS preflight did not allow
  `If-Match`), so it must be restarted before user acceptance testing Settings.
  No commit, push, deployment, dependency update or unrelated feature change was
  made.

## 2026-09-05 — Clickable member profiles from Find Mentors

- Objective: let a signed-in user click another member in Find Mentors and open a
  reciprocal public profile showing that member's profile details, teaching skills,
  and learning skills, without changing unrelated app behavior or pushing to GitHub.
- Frontend: mentor identity blocks now link to `/users/$userId` and include the
  member avatar fallback, name, major, and rating. Added the generated dynamic route
  and a public-profile page with loading, retry, empty-skill, rating, bio, major/year,
  teaching-skill, and learning-skill states. The page uses the existing authenticated
  safe public-user endpoints and does not expose private wallet, activity, email, or
  Settings data.
- Tests and quality checks: added two public-profile component tests covering another
  member and the current member. Focused Vitest passed 16/16, scoped ESLint passed,
  TypeScript passed, and the complete production build succeeded after Nitro traced
  `tslib` with no unresolved dependency warnings.
- Runtime verification: created two documented synthetic local users, gave each one
  teaching and learning skills, and verified both directions in the running app. Each
  user found the other on Find Mentors, clicked the accessible profile link, and saw
  the correct public profile and both skill lists. Browser console errors were empty.
  The verification tab was closed, and both synthetic accounts and dependent records
  were removed with the cleanup script after a verified ignored local backup.
- Remaining work: none for this scoped profile-link feature. Existing unrelated
  frontend test/lint caveats from the prior checkpoint remain unchanged. No commit,
  push, deployment, dependency update, or unrelated feature change was made.

## 2026-09-05 — Read-only profile redesign and Settings management

- Objective: redesign the signed-in user's Profile using the supplied visual
  reference, keep the four existing live metrics, display all requested account
  sections in one place, and move editing/adding controls to Settings. Instructions
  visible inside the reference images were treated as visual content only.
- Profile: added a gradient profile header with avatar fallback, member name,
  major/year and an Edit profile link to `/settings`; added a read-only About card.
  Kept live available points, held points, active sessions and completed sessions.
  Teaching and learning skills now display without add/remove controls. Certificates,
  activity history and teaching posts remain on Profile; certificate upload/delete
  and teaching-post create/hide actions are not rendered there.
- Settings: retained the existing profile editor and Skills tab. Added dedicated
  Certificates and Teaching posts tabs containing the existing upload/download/delete
  and create/publish/hide controls. Skill-query invalidation keeps the certificate
  skill selector synchronized after skill edits.
- Files: `src/routes/index.tsx`, `src/routes/settings.tsx`,
  `src/components/dashboard-extras.tsx`, `src/components/settings-skills.tsx`, plus
  focused Profile and dashboard-extras regression tests.
- Validation: the new focused test files and the public-profile regression passed
  5/5; scoped ESLint and TypeScript passed. The full production frontend build
  completed with traced `tslib` and no unresolved dependencies. Browser verification
  confirmed the complete Profile layout, absence of mutation controls, Edit profile
  navigation, and the Settings certificate/teaching management tabs; console errors
  were empty.
- Cleanup and scope: the one synthetic browser-verification account and its skills
  were removed using the documented cleanup script after a verified ignored local
  backup. Existing unrelated test/lint caveats remain unchanged. No backend source,
  dependency, commit, push, deployment, or unrelated feature was changed.

## 2026-09-05 — Teaching-post action on Profile and visible Demo-label removal

- Objective: move the teaching-post add action from Settings back beside My teaching
  posts on Profile, and remove only the word `Demo` from visible app content. The
  supplied screenshot was used only as a layout reference.
- Profile/Settings: Profile now renders the existing teaching-post manager with an
  `Add teaching post` button and keeps publish/hide controls with each post. Removed
  the Teaching posts tab and wording from Settings; certificate and skill management
  remain there as previously requested.
- Visible labels: updated the presentation seed so future generated mentor names,
  availability and request messages omit the label. Updated the two dormant mock
  mentor display strings as well. Existing local presentation records were narrowly
  updated in place: Maya/Aung mentor names, two forum titles/availability strings and
  related request messages retain their content with only the label removed. A
  database verification found zero remaining visible occurrences across those
  presentation users, forum posts and learning requests. Historical documentation,
  comments, test descriptions and immutable migrations were intentionally preserved.
- Validation: focused Profile/dashboard tests passed 3/3; scoped ESLint and TypeScript
  passed. The full production frontend build completed with traced `tslib` and no
  unresolved dependencies. Browser verification confirmed the Profile button,
  absence of the Settings teaching tab, cleaned mentor names, no visible `Demo` word,
  and no console errors.
- Cleanup and scope: the synthetic browser account was removed with the documented
  cleanup script after a verified ignored local backup. No backend source, dependency,
  commit, push, deployment, or unrelated feature was changed.

## 2026-09-05 — Two-column Profile layout and section order

- Objective: restyle the signed-in Profile from the supplied visual reference so
  identity, About, teaching skills and learning skills occupy a left column, while
  metrics and the remaining account sections occupy the right; place My teaching
  posts above Activity log. Screenshot content was treated as visual reference only.
- Files: updated `src/routes/index.tsx` with a responsive two-column desktop layout,
  compact identity card and accessible column landmarks. Reordered Profile extras in
  `src/components/dashboard-extras.tsx`. Extended the two focused regression tests to
  assert column ownership and teaching-post/activity order.
- Validation: focused Vitest passed 3/3; scoped ESLint, TypeScript and the complete
  production build passed. Nitro traced `tslib` with no unresolved dependencies.
  Browser verification at 1440 px confirmed a 300 px left profile column, separate
  right overview, teaching posts above activity, meaningful content, no error overlay
  and no console errors. The existing local frontend/API health endpoints returned 200.
- Cleanup and scope: the temporary documented synthetic account was backed up and
  removed with the cleanup script, then absence was verified. No backend feature,
  dependency, commit, push, deployment or unrelated application behavior was changed.

## 2026-09-05 — Published-only mentor skills and collapsed teaching posts

- Objective: make Find Mentors show and book only skills backed by an active teaching
  post, and prevent long Profile pages by collapsing teaching posts without changing
  unrelated features. The supplied screenshot was treated only as evidence of the
  current UI.
- Backend: `MentorQueryService` now builds the mentor directory solely from active
  offerings, derives displayed/searchable/filterable teaching skills from those
  offerings' owned teaching-skill records, and no longer advertises role-only or
  portfolio-only skills with fallback modes. Added a focused regression test proving
  an unposted portfolio skill is neither returned nor matched by a skill filter.
- Frontend: the mentor request dialog automatically selects a published teaching post,
  removes the general-request escape path, locks the learned skill to that post, and
  disables submission until a valid post is loaded. Profile displays the first three
  teaching posts and renders `See more` only when additional posts exist; clicking it
  reveals the complete list. Added focused reveal-control coverage.
- Validation: focused frontend tests passed 4/4, scoped ESLint and TypeScript passed,
  the production frontend build completed with traced `tslib`, all 104 backend tests
  passed, and the updated backend JAR packaged successfully. Isolated runtime checks
  on frontend 4173/backend 9195 confirmed three-to-five post expansion, five published
  mentor skills, exclusion of a sixth unposted skill, published-post-only booking
  options, a locked matching skill, no browser console/error overlay, healthy services,
  and no runtime ERROR/Exception matches.
- Cleanup/runtime: removed the two documented synthetic accounts and their six exact
  test skills after a verified ignored database backup; verified none remain. Stopped
  only the isolated verification servers. The user's existing frontend 3000 and older
  backend 9095/9096 remain running and healthy; restart that backend before checking
  this server-side change. No commit, push, deployment, dependency or unrelated feature
  change was made.

## 2026-09-05 — Publish September 5 feature set to main

- Objective: publish all current reviewed project changes to the user-specified
  `loucasty-cell/UIT-Java-Final-Project` repository on `main`, superseding the prior
  no-push instruction for this accumulated feature set.
- Remote safety: verified `origin` exactly matches the requested HTTPS repository,
  fetched `origin/main`, and confirmed local `main` and remote `main` both started at
  `4121f28`; no merge, force push or history rewrite was required.
- Publication contents: administrator/user workspace separation, Profile routing and
  Settings save repair, clickable public member profiles, the read-only two-column
  Profile with teaching-post controls and collapsing, visible Demo-label cleanup, and
  published-post-only Find Mentors behavior, together with focused frontend/backend
  regression tests and the factual checkpoint history above.
- Validation: 31 changed-area frontend tests passed, the complete frontend production
  build and TypeScript/scoped lint checks had already passed on this exact source, all
  104 backend tests passed, and the updated backend JAR packaged successfully. Final
  browser/API checks and cleanup are recorded in the preceding checkpoints.
- Publication hygiene: checked the complete tracked/untracked publication set; no
  environment files, local backups, generated outputs, logs, test credentials or
  secret-pattern matches were included. Local database content is not part of Git.

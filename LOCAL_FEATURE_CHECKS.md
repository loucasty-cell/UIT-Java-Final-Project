# Local feature checks

These changes are local. No commit or push was made for this task.

## Run the app

From the project root, run `npm run dev`. In another terminal:

```powershell
cd backend
.\mvnw.cmd "-Dfrontend.skip=true" spring-boot:run
```

The frontend uses http://localhost:3000 and the API uses http://localhost:9095.
PostgreSQL must be running with the settings in your private `backend/.env`.
If these servers are already running, use them rather than launching duplicate instances.
Restart the backend after code or migration changes.

## Administrator account

Register an account normally. From the project root, grant that specific account
local administrator access:

```powershell
node scripts/grant-local-admin.mjs "your-registered-email@example.com"
```

Sign out and open http://localhost:3000/admin-login. Use that account's existing
email and password. Ordinary accounts cannot enter the admin portal or call its
APIs. Registration does not grant admin rights based on the email address.
The setup script works only against local PostgreSQL. It reads existing database
settings without printing credentials. Set `PSQL_PATH` if your PostgreSQL client
is installed somewhere other than the default PostgreSQL 17 Windows location.

## Check with two accounts

The dashboard also includes **My teaching posts**, **Certificates**, and
**Activity log**. Add skills with Beginner, Intermediate, or Advanced level.
Create a teaching post with a typed skill, accepted modes, duration, point cost,
and availability. Other users can select that post in the mentor request dialog.
Hide a post to stop advertising it without removing session history.

Certificates accept PDFs up to 5 MB, with one certificate per skill. Upload,
download, and delete work against the authenticated account. Files are persisted
under `backend/storage/certificates` by default and survive backend restarts.
Keep that folder with the database when backing up local data. Activity log
lists real point transactions and supports pagination and CSV export.

Volunteer posts accept typed skill names. Titles require at least 5 characters
and descriptions at least 20; Publish now displays the validation reason.

1. Add a teaching skill on one account's dashboard. Sign in with a second account
   and find that mentor. Choose a skill, future date/time, and booking mode.
2. The request appears under **My Sessions → Learner → Requests** for its sender,
   and **Mentor → Requests** for its recipient. Accepting creates the same
   scheduled session for both users.
3. Exchange accepts a typed skill name; a new skill is added to the learner's
   teaching portfolio. A direct point booking is 10 points for 60 minutes, shown
   before submission. Volunteer bookings require no points.
4. Publish a volunteer post, then view and request it using another account.
   Posts, likes, comments, requests and reports persist in PostgreSQL. Visible
   feeds and session lists refresh every 15 seconds and when returning to the app.
5. **Complete Session** removes the session from Active and moves it to Awaiting
   confirmation. Both confirmations complete it and release held points once.
6. **Report Issue** offers reason choices and details. Admins see the report under
   Session Reports. Post reports appear under Content Reports. Admin resolutions
   update the report and session/escrow state.

## Repeatable checks

```powershell
npm run lint
npm run test:ci
npm run build
node scripts/verify-frontend-build.mjs
cd backend
.\mvnw.cmd "-Dfrontend.skip=true" test
```

The API check (`node scripts/test-feature-api.mjs`) must run against a separate,
disposable test database, not the database used for normal accounts. After
configuring both the backend and local maintenance connection for that database,
set `FEATURE_TEST_ISOLATED_DATABASE=true` explicitly to enable the script.
It creates synthetic
accounts and test records, revokes its temporary admin grant in `finally`, and
logs out its sessions. It does not touch real user accounts. Test account history
remains in the local database. The compiled frontend check starts a temporary
server, checks four routes and their assets, and stops it automatically.

Verification covers the booking, completion, reporting, admin, shared-post and
authentication flows described here. It is not a certification of every legacy
API, deployment target, or third-party integration in the repository.

## Testing from another laptop

Keep the backend and PostgreSQL running on the host laptop. Run `npm run dev:lan`
on that same laptop (stop an existing frontend first to free port 3000). Connect
both laptops to the same Wi-Fi and open `http://HOST_WIFI_IP:3000` on the second
laptop. The host Wi-Fi address at the September 4 check was `192.168.1.25`; it can
change. Use `ipconfig` to find the current Wi-Fi IPv4 address. Do not use localhost
on the second laptop, and do not start a second independent database there.

Development API calls use the frontend's origin and Vite forwards `/api` to the
host backend. Leave `VITE_API_BASE_URL` unset for this development setup. If the
page is blocked from another device, check that both devices can communicate and
that Node is allowed on the host's private-network firewall. No firewall changes
were made automatically. Production hosting still needs its own API URL setup.

Use two separate registered accounts. One adds a teaching skill or post; the other
requests it. Pending is visible under Learner/Requests for the sender and
Mentor/Requests for the recipient. Accept creates an Active session for both;
Decline or learner Cancel closes the request and refunds held points. Completing
moves the session out of Active into Awaiting confirmation; the second confirmation
finishes it. Both browsers refresh data periodically and on returning to the page.

Documented synthetic accounts were removed from the everyday database on September
4. New real mentors and posts appear only when actual users create them; empty
states are intentional. `scripts/cleanup-local-test-data.mjs` has a read-only
default; `--apply` creates a private local backup and removes only documented
synthetic identities, refunding real learners' open escrows to those identities.

import { localSql, sqlLiteral } from "./local-database.mjs";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Usage: node scripts/grant-local-admin.mjs "your-registered-email@example.com"');
}
const result = localSql(
  `WITH selected AS (SELECT id FROM users WHERE lower(email) = ${sqlLiteral(email)}), granted AS (INSERT INTO user_roles (user_id, role) SELECT id, 'ADMIN' FROM selected ON CONFLICT DO NOTHING) SELECT count(*) FROM selected;`,
);
if (result !== "1")
  throw new Error("Account not found. Register the account first, then run this command again.");
console.log(
  "Admin role granted to the selected local account. Sign out, then sign in at /admin-login.",
);

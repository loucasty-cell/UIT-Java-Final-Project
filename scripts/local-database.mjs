import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Local maintenance only. Credentials stay in the child environment, never command arguments.
export function localSql(sql) {
  const config = {};
  const path = fileURLToPath(new URL("../backend/.env", import.meta.url));
  if (existsSync(path)) {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (match) config[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  const settings = { ...config, ...process.env };
  const url = new URL(
    (settings.DATABASE_URL || "jdbc:postgresql://localhost:5432/skillbridge").replace(/^jdbc:/, ""),
  );
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    throw new Error("This script only supports a local PostgreSQL database.");
  const executable =
    settings.PSQL_PATH ||
    (process.platform === "win32" ? "C:/Program Files/PostgreSQL/17/bin/psql.exe" : "psql");
  const result = spawnSync(executable, ["-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1"], {
    input: sql,
    encoding: "utf8",
    windowsHide: true,
    env: {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
      PGUSER: settings.DATABASE_USERNAME || "postgres",
      PGPASSWORD: settings.DATABASE_PASSWORD || "postgres",
      PGCONNECT_TIMEOUT: "5",
    },
  });
  if (result.error)
    throw new Error(
      `Could not launch psql. Set PSQL_PATH to the PostgreSQL client executable: ${result.error.code}`,
    );
  if (result.status !== 0) throw new Error(`Local database operation failed: ${result.stderr}`);
  return result.stdout.trim();
}

export const sqlLiteral = (value) => "'" + String(value).replaceAll("'", "''") + "'";

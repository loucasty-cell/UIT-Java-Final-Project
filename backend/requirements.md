# SkillBridge Backend — Team Requirements & Setup

This document explains what every teammate must do manually after pulling this repository so the
backend builds and runs identically on all machines. Follow it top to bottom; the whole setup takes
about 10 minutes (plus one-time dependency downloads).

## 1. Prerequisites

| Requirement | Version | Why | Check with |
|---|---|---|---|
| **JDK** | 25 (Temurin LTS recommended) | The project targets Java 25 (`pom.xml` `<java.version>25</java.version>`); older JDKs will fail to compile | `java -version` |
| **Git** | any recent | Pull/push code | `git --version` |
| **Maven** | *not required* | The repo ships a Maven Wrapper (`mvnw` / `mvnw.cmd`) that auto-downloads the exact pinned Maven version (3.9.9) on first use | — |
| **IDE** | IntelliJ IDEA or VS Code | Either works; see section 4 for IDE-specific notes | — |

### Installing JDK 25
- Download **Eclipse Temurin 25 (LTS)** from <https://adoptium.net>.
- Set the `JAVA_HOME` environment variable to the installed JDK directory, e.g.
  - Windows (PowerShell, persistent): `[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\path\to\jdk-25", "User")`
  - macOS/Linux: add `export JAVA_HOME=/path/to/jdk-25` to your shell profile.
- Reopen the terminal and confirm: `echo $env:JAVA_HOME` (Windows) / `echo $JAVA_HOME`.

## 2. First-time setup after pulling

Run these once, from the repository root:

1. **Create your private `.env` file** (never commit it — `.gitignore` already blocks it):
   ~~~powershell
   Copy-Item .env.example .env      # Windows
   cp .env.example .env             # macOS/Linux
   ~~~
   Then fill in:
   - `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` → your **own Neon dev branch** (must include `sslmode=require`)
   - `JWT_SECRET` → any random string of at least 256 bits (e.g. generate with `openssl rand -base64 48`)
   - Leave everything else at defaults unless you know you need otherwise.

2. **Build online once.** The very first build downloads all dependencies (~a few minutes) and must
   run **without the `-o` flag**:
   ~~~powershell
   .\mvnw.cmd compile               # Windows
   ./mvnw compile                   # macOS/Linux
   ~~~
   After this first successful build you may use `-o` (offline) for faster repeat builds.

3. **Run the application:**
   ~~~powershell
   .\mvnw.cmd spring-boot:run       # Windows
   ./mvnw spring-boot:run           # macOS/Linux
   ~~~
   Flyway automatically applies migrations V1–V8 plus V4.1 (identity, forum, mentors, admin/moderation,
   skills catalog, profiles + wallets + escrow, swap requests/sessions, reviews, notifications) to
   **your** Neon branch. Out-of-order application of V4.1 is enabled by design.

4. **Smoke check.** While the app is running:
   ~~~powershell
   curl.exe -i http://localhost:9095/api/v1/me
   ~~~
   Expect HTTP `401 Unauthorized` with an `application/problem+json` body — that means the server,
   security filter chain, and database validation are all healthy.

## 3. Daily commands

| Action | Windows | macOS/Linux |
|---|---|---|
| Compile | `.\mvnw.cmd compile` | `./mvnw compile` |
| Compile offline (after first online build) | `.\mvnw.cmd -o compile` | `./mvnw -o compile` |
| Run app | `.\mvnw.cmd spring-boot:run` | `./mvnw spring-boot:run` |
| Package JAR | `.\mvnw.cmd package` | `./mvnw package` |

## 4. IDE notes

### IntelliJ IDEA
- The **Lombok plugin is bundled** — nothing to install.
- Enable annotation processing if prompted: `Settings → Build, Execution, Deployment → Compiler → Annotation Processors → Enable annotation processing`.
- Let IntelliJ import the Maven project when prompted; it can use its own bundled Maven because the wrapper pins everything important.

### Visual Studio Code
- Install the **Extension Pack for Java** (`vscjava.vscode-java-pack`). It bundles Lombok support — nothing else needed.
- Point VS Code at your JDK: `Ctrl+Shift+P → "Preferences: Open Settings (UI)" → Java › Configuration: Runtimes` → set `"default"` to your JDK 25 path, or just rely on `JAVA_HOME`.
- If red squiggles appear on getters/builders that clearly exist, run `Ctrl+Shift+P → "Java: Clean Java Language Server Workspace" → Reload and delete`.

## 5. Why the build "just works"

The `pom.xml` does two things you never need to touch manually:

- Pins `<lombok.version>` explicitly — the version managed by older Spring Boot parents breaks on recent JDKs, and since javac 23 annotation processors are no longer run implicitly, the `maven-compiler-plugin → annotationProcessorPaths` declaration in the committed `pom.xml` is what makes `@Getter`, `@Builder`, `@RequiredArgsConstructor` etc. actually generate code.

If either were missing, compilation fails with misleading errors like `cannot find symbol getId()`.
Both fixes are in the committed `pom.xml`, so teammates get them by simply pulling.

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `cannot find symbol getId()` / `builder()` everywhere | Stale language-server cache or old Lombok | Clean rebuild: `.\mvnw.cmd clean compile` (VS Code: also "Clean Java Language Server Workspace") |
| Wrapper downloads Maven on first run and seems stuck | One-time distribution download (~10 MB) | Wait; subsequent runs are instant |
| Offline build (`-o`) fails with missing plugin | Dependencies not yet downloaded | Run one build **without** `-o` while online |
| `UnsupportedClassVersionError` or release flag errors | Wrong JDK on `PATH`/`JAVA_HOME` | Verify `java -version` shows 25; fix `JAVA_HOME` |
| Port 9095 already in use | Another service bound | Change `SERVER_PORT` in your `.env` |
| Flyway validation error at startup | Your DB schema drifted from migrations | Use a fresh Neon branch; never hand-edit applied migrations |

## 7. Database rules (team agreement)

- **One Neon branch per developer.** Never point `DATABASE_URL` at production or at someone else's branch.
- Migrations are **forward-only**: never edit an applied migration file — always add a new `V<n>__*.sql`.
- Hibernate runs with `JPA_DDL_AUTO=validate`: it checks the schema but never creates or updates tables. If startup fails validation, your branch is missing a migration, not the reverse.

## 8. Runtime verification status

All runtime checks have passed on `dev`: build, Flyway V1–V8 + V4.1 against Neon, app boot on JDK 25 /
port 9095, health check (`/actuator/health` → UP), security (401 without token), and the full
62-test suite (`.\mvnw.cmd test`).

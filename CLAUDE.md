# Kayé

Career guidance platform for young people in Angola (14–30). MVP: the catalogue covers every area, Luanda first, everything free; depth grows with what users ask for (ADR 0015).
Built by Eduardo (founder) and Claude only.

- `docs/` is the source of truth (index: `docs/README.md`). When a roadmap task is done, tick its checkbox.
- How to run, test and build: `README.md`. Laravel-specific rules: `apps/api/CLAUDE.md` (Laravel Boost).

## How we work (mandatory)

Eduardo requires a DevOps methodology: **everything is tested and verified**. Follow `docs/engenharia.md`:

- Work on a short branch, never commit to `main`; Conventional Commits (`feat(api): …`).
- Before writing code, search for something to reuse (table in `docs/engenharia.md#reutilização`).
- Every change ships with tests, including failure cases. For a security control, disable it once and confirm a test fails.
- Run the same gates as CI before saying something is done:
  - `apps/api`: `vendor/bin/pint --test && vendor/bin/phpstan analyse && php artisan test`
  - `apps/web`: `npm run check && npm run build && npm run e2e`
  - root: `npm run duplication`
- Update the affected doc in the same commit. `DocumentationTest` enforces tables, env vars and ADRs.
- Never weaken a gate silently (PHPStan max, coverage ≥ 90%, zero lint warnings, ≤ 3% duplication, strict CSP on the app): write an ADR in `docs/decisoes/`.

## Language

- Talk to Eduardo in Portuguese (Angolan/European variant, "tu"). Explain jargon in plain words.
- Code, identifiers, comments, table and column names: English. Docs: Portuguese.
- User-facing text exists in pt, en and fr. In the app: `apps/web/src/locales/*.ts` (pt is the source; TypeScript forces en/fr to have the same keys).

## Hard constraints

- Production is **Hostinger shared hosting**: no Redis, no long-running processes, no containers. Queue and cache use the `database` driver, run by cron. Heavy work (scraping) runs on GitHub Actions. The Docker image mirrors Hostinger (PHP 8.4 + Apache) for CI/E2E.
- PHP: Laravel 13 needs **PHP 8.4+** (Symfony 8). `composer.json` pins `config.platform.php` to 8.4.1.
- MySQL/MariaDB, `utf8mb4_unicode_ci`. Tests run on MySQL (`kaye_test`), not SQLite.
- Users sign in with Google only. Web session in an HttpOnly cookie, Android token in secure storage (ADR-0003). The password column exists only for the local admin login.
- Minors (14–17) use the app: collect the minimum (birth year, not date), no public profile, no salary reports. Institutions never get individual data. Sentry never gets personal data.
- Nothing paid influences recommendations.

## Windows notes

- `php -` (script from stdin) does not work here: write the script to a file and run it.
- The old folder `C:\Projects\___Kayé` has an accent and breaks the Android build (Gradle); the code lives in `C:\Projects\kaye`.
- `php artisan serve` drops environment variables; the E2E server uses `php -S` with Laravel's `server.php` instead.
- `npm` install scripts are blocked (`.npmrc`); after `npm ci` at the root, run `npm run hooks:install`.

## Agent-session pitfalls

- In an agent session, `php artisan test` prints JSON (laravel/pao) and **exits 0 even when tests fail**. Read `result`, `failed` and `errors` from the JSON, or use `vendor/bin/phpunit`, whose exit code is reliable. CI has no agent variables, so it fails correctly.
- `$this->artisan(...)` runs the command in a destructor, where exceptions are lost; to assert that a command works, use `Artisan::call()` and check the exit code.
- Git does not keep empty folders: test on a clean clone (or let CI do it) before trusting a build that passes locally.

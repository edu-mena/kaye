# Kayé

Career guidance platform for young people in Angola (14–30). MVP: "Kayé Tech" (Luanda, tech careers only, everything free).
Built by Eduardo (founder) and Claude only.

- `docs/arquitetura.md` and `docs/roadmap.md` are the source of truth. When a roadmap task is done, tick its checkbox.
- How to run, test and build: `README.md`. Laravel-specific rules: `apps/api/CLAUDE.md` (Laravel Boost).

## Language

- Talk to Eduardo in Portuguese (Angolan/European variant, "tu"). Explain jargon in plain words.
- Code, identifiers, comments, table and column names: English.
- User-facing text exists in pt, en and fr. In the app: `apps/web/src/locales/*.ts` (pt is the source; TypeScript forces en/fr to have the same keys).

## Hard constraints

- Production is **Hostinger shared hosting**: no Redis, no long-running processes, limited execution time. Queue and cache use the `database` driver, run by cron. Heavy work (scraping) runs on GitHub Actions.
- PHP: Laravel 13 needs **PHP 8.4+** (Symfony 8). `composer.json` pins `config.platform.php` to 8.4.1, so the lock file never needs more than production has.
- MySQL/MariaDB, `utf8mb4_unicode_ci`. Tests run on MySQL (`kaye_test`), not SQLite.
- Users sign in with Google only. The password column exists only for the local admin login.
- Minors (14–17) use the app: collect the minimum (birth year, not date), no public profile, no salary reports. Institutions never get individual data.
- Nothing paid influences recommendations.

## Windows notes

- `php -` (script from stdin) does not work here: write the script to a file and run it.
- The old folder `C:\Projects\___Kayé` has an accent and breaks the Android build (Gradle); the code lives in `C:\Projects\kaye`.

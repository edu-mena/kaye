<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin allowlist
    |--------------------------------------------------------------------------
    |
    | Only these emails can open /admin, on top of having the admin or
    | moderator role. Comma-separated in ADMIN_EMAILS. Empty means nobody.
    |
    */

    'admin_emails' => array_values(array_filter(array_map(
        fn (string $email): string => strtolower(trim($email)),
        explode(',', (string) env('ADMIN_EMAILS', '')),
    ))),

    /*
    |--------------------------------------------------------------------------
    | Content export
    |--------------------------------------------------------------------------
    |
    | Where `php artisan kaye:import` reads the frontend's export (manifest.json
    | and <resource>.<locale>.json). Written by `npm run export:data`.
    |
    */

    'data_path' => database_path('data'),

    /*
    |--------------------------------------------------------------------------
    | Waiting list export
    |--------------------------------------------------------------------------
    |
    | The password for GET /api/v1/waitlist/export (the waiting list and the
    | feedback as CSV). Shorter than 16 characters, or empty, locks it.
    |
    */

    'waitlist_export_token' => (string) env('WAITLIST_EXPORT_TOKEN', ''),

    /*
    |--------------------------------------------------------------------------
    | Ingest of the scrapers' facts
    |--------------------------------------------------------------------------
    |
    | The password for POST /api/v1/ingest/jobs, sent by the GitHub Actions
    | runs (the GitHub secret of the same name). Shorter than 16 characters,
    | or empty, locks it.
    |
    */

    'ingest_token' => (string) env('INGEST_TOKEN', ''),

    /*
    |--------------------------------------------------------------------------
    | API reads per minute
    |--------------------------------------------------------------------------
    |
    | Per account or IP (docs/seguranca.md). 300 in production. Only the test
    | container raises it (compose.yaml): the end-to-end tests run many
    | browsers at once from one IP, which is not a real visitor.
    |
    */

    'api_reads_per_minute' => (int) env('API_READS_PER_MINUTE', 300),

    /*
    |--------------------------------------------------------------------------
    | Legal texts
    |--------------------------------------------------------------------------
    |
    | The version of the terms and the privacy policy in force, recorded with
    | the consents given outside the app (the waiting list). The app sends its
    | own (apps/web/src/data/legalVersion.ts); keep both the same.
    |
    */

    'legal_version' => '2026-11-12',

    /*
    |--------------------------------------------------------------------------
    | Notices: email and Web Push
    |--------------------------------------------------------------------------
    |
    | How many messages each channel sends per hour (the SMTP of the shared
    | hosting has a limit), and how many days before a saved deadline its
    | reminder goes out. docs/infraestrutura.md explains each variable.
    |
    */

    'notices' => [
        'hourly_limit' => [
            'email' => (int) env('MAIL_HOURLY_LIMIT', 80),
            'push' => (int) env('PUSH_HOURLY_LIMIT', 1000),
        ],
        'reminder_days' => 3,
        'confirmation_days' => 7,
    ],

];

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
    | Health and alerts
    |--------------------------------------------------------------------------
    |
    | HEALTH_TOKEN opens every check of GET /api/v1/health (the uptime monitor
    | sends it); without it the answer only says whether the Kayé works.
    | Shorter than 16 characters, or empty: nobody sees the details. The queue
    | counts as stuck when a job waits longer than QUEUE_STUCK_MINUTES, and the
    | disk as full below DISK_MIN_FREE_PERCENT free. Alerts go to ADMIN_EMAILS.
    |
    */

    'health_token' => (string) env('HEALTH_TOKEN', ''),

    'queue_stuck_minutes' => (int) env('QUEUE_STUCK_MINUTES', 15),

    'disk_min_free_percent' => (int) env('DISK_MIN_FREE_PERCENT', 10),

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

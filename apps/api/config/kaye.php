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

];

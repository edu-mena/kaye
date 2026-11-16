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

];

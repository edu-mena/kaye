<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    | Login with Google (docs/arquitetura.md, 5.1). The web uses the OAuth client (Socialite); the
    | Android app sends an ID token, accepted only when its `aud` is one of `audiences`: the web
    | client id, which the app uses as its server client id. Empty means nobody signs in.
    */
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => rtrim((string) env('APP_URL', 'http://localhost'), '/').'/auth/google/callback',
        'audiences' => array_values(array_filter([(string) env('GOOGLE_CLIENT_ID', '')])),
    ],

    /*
    | The Upstash Redis the Vercel functions used, read once by `php artisan kaye:migrate-redis`. On Vercel the
    | integration names them KV_REST_API_URL and KV_REST_API_TOKEN; either name works.
    */
    'upstash' => [
        'url' => env('UPSTASH_REDIS_REST_URL', env('KV_REST_API_URL')),
        'token' => env('UPSTASH_REDIS_REST_TOKEN', env('KV_REST_API_TOKEN')),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];

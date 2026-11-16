<?php

/**
 * Router for `php -S` in the local end-to-end tests (playwright.config.ts). The built-in server reads no
 * .htaccess, so the service worker gets here the header Apache gives it in production
 * (apps/api/public/.htaccess); everything else goes to Laravel's own router, as before.
 */
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if ($path === '/spa/sw.js' && is_file(getcwd().'/spa/sw.js')) {
    header('Content-Type: text/javascript');
    header('Service-Worker-Allowed: /');
    readfile(getcwd().'/spa/sw.js');

    return true;
}

return require getcwd().'/../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php';

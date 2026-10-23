<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves the React app (apps/web, built into public/spa) for every path that
 * is not the API or the admin panel. React Router handles the rest.
 */
class SpaController
{
    public function __invoke(Request $request): Response
    {
        abort_if($request->is('api/*'), 404);

        $index = public_path('spa/index.html');

        abort_unless(is_file($index), 503, 'The web app has not been built yet: run "npm run build" in apps/web.');

        return response(file_get_contents($index), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache',
        ]);
    }
}

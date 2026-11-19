<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves the React app (apps/web, built into public/spa) for every page path
 * that is not the API or the admin panel. React Router handles the rest.
 */
class SpaController
{
    /**
     * App pages never contain a dot: "/.env", "/composer.json" or a missing
     * "/logo.png" get a real 404 instead of the app.
     */
    private const NOT_A_PAGE = '/\./';

    public function __invoke(Request $request): Response
    {
        abort_if($request->is('api/*') || preg_match(self::NOT_A_PAGE, $request->path()) === 1, 404);

        $index = public_path('spa/index.html');

        abort_unless(is_file($index), 503, 'The web app has not been built yet: run "npm run build" in apps/web.');

        return response(File::get($index), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache',
        ]);
    }
}

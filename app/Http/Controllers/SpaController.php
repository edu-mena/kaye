<?php

namespace App\Http\Controllers;

use App\Support\PublicContent;
use App\Support\Seo\SeoDocument;
use App\Support\Seo\SeoPages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves the React app (apps/web, built into public/spa) for every page path that is not the API or the admin
 * panel. React Router handles the rest. Each page goes out with its own title, description, structured data and
 * content, so search engines and link previews see it without JavaScript (docs/seo.md); a career, a course or an
 * institution that does not exist answers a real 404.
 */
class SpaController
{
    /**
     * App pages never contain a dot: "/.env", "/composer.json" or a missing
     * "/logo.png" get a real 404 instead of the app.
     */
    private const NOT_A_PAGE = '/\./';

    public function __construct(private readonly SeoPages $pages, private readonly SeoDocument $document) {}

    public function __invoke(Request $request): Response
    {
        abort_if($request->is('api/*') || preg_match(self::NOT_A_PAGE, $request->path()) === 1, 404);

        $index = public_path('spa/index.html');

        abort_unless(is_file($index), 503, 'The web app has not been built yet: run "npm run build" in apps/web.');

        $path = '/'.trim($request->path(), '/');
        $page = PublicContent::remember('seo:'.$path, fn (): array => $this->pages->page($path));

        return response($this->document->render(File::get($index), $page), $page['status'], [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache',
        ]);
    }
}

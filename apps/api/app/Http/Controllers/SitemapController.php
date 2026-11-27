<?php

namespace App\Http\Controllers;

use App\Support\PublicContent;
use App\Support\Seo\SeoPages;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /sitemap.xml: every public page (the sections and each published career, course, institution, company, area,
 * news item and Kurso), so search engines find them all (docs/seo.md).
 */
class SitemapController
{
    public function __invoke(SeoPages $pages): Response
    {
        $xml = PublicContent::remember('seo-sitemap', fn (): string => View::make('seo.sitemap', [
            'urls' => array_map($pages->url(...), $pages->paths()),
        ])->render());

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8', 'Cache-Control' => 'public, max-age=3600']);
    }
}

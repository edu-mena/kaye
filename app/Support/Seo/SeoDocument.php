<?php

namespace App\Support\Seo;

use Illuminate\Support\Facades\View;

/**
 * Puts a page from SeoPages into the web app's index.html: its own <head> (title, description, canonical, robots,
 * Open Graph, Twitter, JSON-LD) and its content inside <div id="root">, which React replaces when it starts.
 *
 * @phpstan-import-type Page from SeoPages
 */
final class SeoDocument
{
    /**
     * The tags of index.html that every page replaces with its own.
     */
    private const array REPLACED = [
        '/\s*<title>.*?<\/title>/s',
        '/\s*<meta\s+name="description"[^>]*>/s',
        '/\s*<meta\s+property="og:[^"]*"[^>]*>/s',
        '/\s*<meta\s+name="twitter:[^"]*"[^>]*>/s',
        '/\s*<link\s+rel="canonical"[^>]*>/s',
        '/\s*<meta\s+name="robots"[^>]*>/s',
        '/\s*<!--\s*Link preview.*?-->/s',
    ];

    public function __construct(private readonly SeoPages $pages) {}

    /**
     * @param  Page  $page
     */
    public function render(string $index, array $page): string
    {
        $head = View::make('seo.head', [
            'page' => $page,
            'url' => $this->pages->url($page['path']),
            'image' => $page['image'] ?? $this->pages->url('/spa/og-image.png'),
            'jsonLd' => array_map(self::json(...), $page['jsonLd']),
        ])->render();
        $body = View::make('seo.body', ['page' => $page, 'socials' => $this->pages->socials()])->render();

        $html = (string) preg_replace(self::REPLACED, '', $index);
        $html = str_replace('</head>', $head."\n  </head>", $html);

        return str_replace('<div id="root"></div>', '<div id="root">'.$body.'</div>', $html);
    }

    /**
     * JSON-LD that is safe inside <script>: a "</script>" in a name or a summary cannot close the tag.
     *
     * @param  array<string, mixed>  $data
     */
    public static function json(array $data): string
    {
        return (string) json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_THROW_ON_ERROR);
    }
}

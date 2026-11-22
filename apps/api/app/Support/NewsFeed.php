<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use SimpleXMLElement;
use Throwable;

/**
 * Reads an RSS feed or a Google News sitemap into the few facts we keep: title, date, link, the lead's first
 * words and, only when the feed itself gives one, an image. The article is never fetched.
 *
 * @phpstan-type Entry array{title: string, url: string, date: string, lead: string, image: ?string}
 */
final class NewsFeed
{
    /**
     * @param  'rss'|'sitemap'  $type
     * @return list<Entry>
     */
    public static function parse(string $xml, string $type, int $limit): array
    {
        $previous = libxml_use_internal_errors(true);
        try {
            $document = simplexml_load_string($xml, SimpleXMLElement::class, LIBXML_NONET | LIBXML_NOCDATA);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
        if ($document === false) {
            return [];
        }

        $entries = $type === 'rss' ? self::rss($document) : self::sitemap($document);

        return array_slice($entries, 0, $limit);
    }

    /**
     * The words of an HTML lead as plain text.
     */
    public static function plain(string $html): string
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }

    /**
     * @return list<Entry>
     */
    private static function rss(SimpleXMLElement $document): array
    {
        $entries = [];
        foreach ($document->channel->item ?? [] as $item) {
            $media = $item->children('http://search.yahoo.com/mrss/');
            $image = null;
            if (isset($media->thumbnail)) {
                $image = (string) $media->thumbnail->attributes()?->url;
            } elseif (isset($media->content) && str_starts_with((string) $media->content->attributes()?->type, 'image/')) {
                $image = (string) $media->content->attributes()?->url;
            } elseif (isset($item->enclosure) && str_starts_with((string) $item->enclosure->attributes()?->type, 'image/')) {
                $image = (string) $item->enclosure->attributes()?->url;
            }
            $entry = self::entry((string) $item->title, (string) $item->link, (string) $item->pubDate, self::plain((string) $item->description), $image);
            if ($entry !== null) {
                $entries[] = $entry;
            }
        }

        return $entries;
    }

    /**
     * @return list<Entry>
     */
    private static function sitemap(SimpleXMLElement $document): array
    {
        $entries = [];
        foreach ($document->url ?? [] as $url) {
            $news = $url->children('http://www.google.com/schemas/sitemap-news/0.9');
            if (! isset($news->news)) {
                $news = $url->children('https://www.google.com/schemas/sitemap-news/0.9');
            }
            $item = $news->news ?? null;
            if ($item === null) {
                continue;
            }
            $entry = self::entry((string) $item->title, (string) $url->loc, (string) $item->publication_date, '', null);
            if ($entry !== null) {
                $entries[] = $entry;
            }
        }

        return $entries;
    }

    /**
     * @return Entry|null
     */
    private static function entry(string $title, string $url, string $date, string $lead, ?string $image): ?array
    {
        $title = self::plain($title);
        $url = trim($url);
        if ($title === '' || ! self::isWebUrl($url)) {
            return null;
        }
        try {
            $day = Carbon::parse(trim($date))->toDateString();
        } catch (Throwable) {
            return null;
        }

        return [
            'title' => mb_substr($title, 0, 300),
            'url' => $url,
            'date' => $day,
            'lead' => $lead,
            'image' => $image !== null && self::isWebUrl($image) ? $image : null,
        ];
    }

    private static function isWebUrl(string $url): bool
    {
        return mb_strlen($url) <= 2048 && preg_match('#^https?://[^\s]+$#i', $url) === 1;
    }
}

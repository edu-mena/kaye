<?php

namespace App\Support;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * The public reads of /api/v1 (docs/arquitetura.md, section 6): each answer is built once per path, query and
 * language, kept in the cache store (the database in production) for 5 minutes and sent with an ETag, so a
 * client that already has it gets a 304. Any change to the content (a model saved or deleted, an import)
 * calls flush(): the version in the keys changes and the old answers are never read again.
 */
final class PublicContent
{
    public const int SECONDS = 300;

    private const string VERSION = 'public-content:version';

    /**
     * @param  Closure(): (JsonResource|array<array-key, mixed>|null)  $build  null answers 404
     */
    public function respond(Request $request, Closure $build): Response
    {
        $cached = Cache::remember($this->key($request), self::SECONDS, function () use ($build, $request): array {
            $data = $build();
            if ($data === null) {
                return ['status' => 404];
            }
            $body = json_encode(
                $data instanceof JsonResource ? $data->resolve($request) : $data,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
            );

            return ['status' => 200, 'body' => $body, 'etag' => hash('xxh128', $body)];
        });

        if ($cached['status'] !== 200) {
            abort(404);
        }

        $response = response($cached['body'], 200, ['Content-Type' => 'application/json', 'Vary' => 'Accept-Language']);
        $response->setEtag($cached['etag']);
        $response->setPublic();
        $response->setMaxAge(self::SECONDS);
        $response->isNotModified($request);

        return $response;
    }

    /**
     * Forgets every cached answer (the content changed).
     */
    public static function flush(): void
    {
        Cache::forever(self::VERSION, Str::random(12));
    }

    private function key(Request $request): string
    {
        $version = Cache::get(self::VERSION);
        $query = $request->query();
        ksort($query);

        return 'public-content:'.(is_string($version) ? $version : '0').':'.app()->getLocale().':'
            .$request->path().'?'.http_build_query($query);
    }
}

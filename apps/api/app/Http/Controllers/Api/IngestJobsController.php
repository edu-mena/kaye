<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Support\AccessToken;
use App\Support\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Throwable;

/**
 * POST /ingest/jobs: the facts of job posts (scrapers/data/postings.jsonl rows), sent by the GitHub Actions runs with
 * INGEST_TOKEN. Known posts are updated, bad rows are counted and dropped; never the text of a post.
 */
class IngestJobsController extends Controller
{
    private const int MAX_BODY = 1_000_000;

    private const int MAX_ROWS = 500;

    public function store(Request $request): JsonResponse
    {
        if (! AccessToken::allows($request, Config::string('kaye.ingest_token'))) {
            return Submission::json(['error' => 'unauthorised'], 401);
        }
        $body = Submission::read($request, self::MAX_BODY);
        $rows = $body['jobs'] ?? null;
        if (! is_array($rows) || ! array_is_list($rows) || count($rows) > self::MAX_ROWS) {
            return Submission::invalid();
        }

        $saved = $rejected = 0;
        foreach ($rows as $row) {
            $fact = is_array($row) ? self::clean($row) : null;
            if ($fact === null) {
                $rejected++;

                continue;
            }
            JobPosting::query()->updateOrCreate(['external_id' => $fact['external_id']], $fact);
            $saved++;
        }

        return Submission::json(['saved' => $saved, 'rejected' => $rejected]);
    }

    /**
     * @param  array<mixed>  $row
     * @return array<string, mixed>|null
     */
    private static function clean(array $row): ?array
    {
        $id = $row['id'] ?? null;
        $source = $row['source'] ?? null;
        $url = $row['url'] ?? null;
        $title = $row['title'] ?? null;
        $date = $row['date'] ?? null;
        if (! Submission::text($id, 191) || ! Submission::text($source, 40) || ! Submission::text($title, 500)
            || ! is_string($url) || preg_match('#^https?://\S+$#', $url) !== 1 || mb_strlen($url) > 2048
            || ! is_string($date) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
            return null;
        }
        try {
            $day = Carbon::createFromFormat('!Y-m-d', $date);
        } catch (Throwable) {
            return null;
        }
        if ($day === null || $day->toDateString() !== $date) {
            return null;
        }
        $openings = $row['openings'] ?? null;

        return [
            'external_id' => $id,
            'source' => $source,
            'date' => $date,
            'url' => $url,
            'title' => $title,
            'kind' => self::optional($row['kind'] ?? null, 20),
            'company' => self::optional($row['company'] ?? null, 255),
            'province' => self::optional($row['province'] ?? null, 64),
            'sector' => self::optional($row['sector'] ?? null, 40),
            'career' => self::optional($row['career'] ?? null, 191),
            'openings' => is_int($openings) && $openings >= 0 && $openings <= 65_535 ? $openings : null,
        ];
    }

    private static function optional(mixed $value, int $max): ?string
    {
        return is_string($value) && $value !== '' && mb_strlen($value) <= $max ? $value : null;
    }
}

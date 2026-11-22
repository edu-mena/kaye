<?php

namespace App\Support;

use App\Enums\ContentStatus;
use App\Models\News;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Collects the news of the configured sources (config/news.php): one bounded request per source, only what
 * NewsClassifier finds relevant, no duplicates (by link and by title), a source that fails does not stop the others.
 *
 * @phpstan-import-type Entry from NewsFeed
 */
final class NewsCollector
{
    /** Older pieces are not news any more. */
    private const int MAX_AGE_DAYS = 30;

    public function __construct(private readonly NewsClassifier $classifier, private readonly NewsSummariser $summariser) {}

    /**
     * Gives the newest collected pieces without a summary their own (a few per run, each tried at most
     * `news.ai.max_attempts` times). Returns how many got one.
     */
    public function summarise(): int
    {
        $done = 0;
        $pending = News::query()
            ->whereNotNull('url_hash')->whereNull('body')
            ->where('summary_attempts', '<', Config::integer('news.ai.max_attempts'))
            ->orderByDesc('date')->orderByDesc('id')
            ->limit(Config::integer('news.ai.max_per_run'))
            ->get();

        foreach ($pending as $index => $news) {
            if ($index > 0) {
                $this->pause();
            }
            $news->increment('summary_attempts');
            $title = $news->getTranslation('title', 'pt');
            $result = is_string($title) ? $this->summariser->summarise((string) $news->source_url, $title) : null;
            if ($result === null) {
                continue;
            }
            $news->setTranslation('summary', 'pt', $result['summary'])->setTranslation('body', 'pt', $result['body'])->save();
            $done++;
        }
        if ($done > 0) {
            PublicContent::flush();
        }

        return $done;
    }

    /**
     * @return array{created: int, skipped: int, failed: list<string>}
     */
    public function run(): array
    {
        $created = $skipped = 0;
        $failed = [];
        $budget = Config::integer('news.max_new_per_run');

        foreach (Config::array('news.sources') as $index => $source) {
            if (! is_array($source) || ! is_string($source['id'] ?? null) || ! is_string($source['name'] ?? null)
                || ! is_string($source['url'] ?? null) || ! in_array($source['type'] ?? null, ['rss', 'sitemap'], true)) {
                continue;
            }
            if ($index > 0) {
                $this->pause();
            }
            $entries = $this->read($source['url'], $source['type']);
            if ($entries === null) {
                $failed[] = $source['id'];

                continue;
            }
            foreach ($entries as $entry) {
                if ($budget <= 0) {
                    break;
                }
                if ($this->store($entry, $source['name'])) {
                    $created++;
                    $budget--;
                } else {
                    $skipped++;
                }
            }
        }

        return ['created' => $created, 'skipped' => $skipped, 'failed' => $failed];
    }

    /**
     * @param  'rss'|'sitemap'  $type
     * @return list<Entry>|null
     */
    private function read(string $url, string $type): ?array
    {
        try {
            $response = Http::withUserAgent(Config::string('news.user_agent'))
                ->accept('application/rss+xml, application/xml, text/xml')
                ->timeout(Config::integer('news.timeout'))
                ->connectTimeout(Config::integer('news.timeout'))
                ->get($url);
            $body = $response->body();
            if (! $response->successful() || strlen($body) > Config::integer('news.max_bytes')) {
                Log::warning('News source unavailable', ['url' => $url, 'status' => $response->status()]);

                return null;
            }

            return NewsFeed::parse($body, $type, Config::integer('news.max_items_per_source'));
        } catch (Throwable $error) {
            Log::warning('News source failed', ['url' => $url, 'error' => $error::class]);

            return null;
        }
    }

    /**
     * Whether the entry was relevant and new, and is now saved.
     *
     * @param  Entry  $entry
     */
    private function store(array $entry, string $sourceName): bool
    {
        $day = Carbon::parse($entry['date']);
        if ($day->isAfter(now()->addDay()) || $day->isBefore(now()->subDays(self::MAX_AGE_DAYS))) {
            return false;
        }
        $urlHash = hash('sha256', self::normaliseUrl($entry['url']));
        $titleHash = hash('sha256', trim((string) preg_replace('/[^a-z0-9]+/', ' ', NewsClassifier::normalise($entry['title']))));
        if (News::withTrashed()->where('url_hash', $urlHash)->orWhere('title_hash', $titleHash)->exists()) {
            return false;
        }
        $links = $this->classifier->classify($entry['title'], $entry['lead']);
        if ($links === null) {
            return false;
        }

        $news = News::query()->create([
            'slug' => Str::limit(Str::slug($entry['title']), 150, '').'-'.substr($urlHash, 0, 8),
            'status' => ContentStatus::Published,
            'date' => $day->toDateString(),
            'kind' => $links['companies'] !== [] ? 'empresas' : ($links['topic'] ? 'cursos' : 'analise'),
            'title' => ['pt' => $entry['title']],
            'summary' => ['pt' => self::summary($entry['lead'], $sourceName)],
            'image' => $entry['image'] === null ? null : [
                'thumb' => $entry['image'], 'small' => $entry['image'], 'large' => $entry['image'], 'alt' => $entry['title'],
                'credit' => ['author' => $sourceName, 'license' => 'Imagem do feed da fonte', 'url' => $entry['url']],
            ],
            'source' => ['label' => $sourceName, 'url' => $entry['url']],
            'source_url' => $entry['url'],
            'source_checked_at' => now()->toDateString(),
            'url_hash' => $urlHash,
            'title_hash' => $titleHash,
        ]);
        $news->areas()->sync($links['areas']);
        $news->companies()->sync($links['companies']);
        $news->institutions()->sync($links['institutions']);
        $news->careers()->sync($links['careers']);
        PublicContent::flush();

        return true;
    }

    /**
     * The lead's first sentence, cut at 200 characters: never the article. Without a lead, only the source.
     */
    private static function summary(string $lead, string $sourceName): string
    {
        $lead = trim($lead);
        if ($lead === '') {
            return "Notícia publicada por {$sourceName}.";
        }
        $first = preg_split('/(?<=[.!?])\s+/u', $lead, 2);
        $sentence = is_array($first) ? $first[0] : $lead;

        return Str::limit($sentence, 200, '…', preserveWords: true);
    }

    /**
     * The same article under http/https, with or without www, query or a closing slash, is one.
     */
    private static function normaliseUrl(string $url): string
    {
        $parts = parse_url($url);
        $host = preg_replace('/^www\./', '', mb_strtolower($parts['host'] ?? ''));
        $path = preg_replace('#/+#', '/', rtrim($parts['path'] ?? '', '/'));

        return $host.$path;
    }

    private function pause(): void
    {
        $seconds = Config::integer('news.pause_seconds');
        if ($seconds > 0) {
            sleep($seconds);
        }
    }
}

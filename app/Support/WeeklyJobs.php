<?php

namespace App\Support;

use App\Models\JobPosting;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * GET /market/week: the job posts of the last 7 days (today in Luanda included) and the 7 before, counted from
 * `job_postings` (the scrapers' runs every 3 hours and "Colar vaga"), and who posted most. Only counts and
 * employer names: never a post (docs/decisoes/0008). The rules for employers and agencies are the scrapers'
 * (scrapers/jobs/summarize.py), so the week and the 12 months agree.
 */
final class WeeklyJobs
{
    public const int DAYS = 7;

    public const int TOP_COMPANIES = 6;

    public const int AGENCY_NAMES = 3;

    private const string LEGAL_FORM = '/\b(s\.?a\.?|lda\.?|limitada|sarl)(?=\W|$)/iu';

    /** Recruitment agencies and boards that publish for their clients: counted apart from the employers. */
    private const string AGENCIES = '/kept people|ascending|jobartis|recrut|recruit|recursos humanos|outsourcing|staffing|talent|headhunt|manpower|adecco|randstad|michael page|\bhays\b/u';

    /** Employers a board hides behind a description ("Indústria do sector alimentar"). */
    private const string UNNAMED = '/^(industria d[oe] sector|a leading company|projecto de|empresa\b|confidencial|multinacional)/u';

    /** A post's sector (scrapers/jobs/classify.py) to the Mercado's area: SECTOR_AREAS in scrapers/areas.py. */
    private const array SECTOR_AREAS = [
        'technology' => 'technology', 'telecom' => 'technology', 'engineering' => 'engineering',
        'construction' => 'engineering', 'oil_mining' => 'oil_mining', 'health' => 'health', 'education' => 'education',
        'finance' => 'business', 'sales' => 'business', 'administration' => 'business', 'marketing' => 'communication',
        'legal' => 'legal', 'security' => 'public', 'public_admin' => 'public', 'agriculture' => 'agriculture',
        'hospitality' => 'hospitality', 'logistics' => 'logistics',
    ];

    /**
     * The sites (SOURCES in scrapers/jobs/collect.py) and "Colar vaga": who published a post whose employer is not
     * named, so the count points to them.
     *
     * @var array<string, array{name: string, url: string|null}>
     */
    private const array SOURCES = [
        'angovagas' => ['name' => 'AngoVagas', 'url' => 'https://angovagas.net'],
        'angoemprego' => ['name' => 'Ango Emprego', 'url' => 'https://angoemprego.com'],
        'angorecruta' => ['name' => 'AngoRecruta', 'url' => 'https://angorecruta.com'],
        'jobartis' => ['name' => 'Jobartis', 'url' => 'https://www.jobartis.com'],
        'verangola' => ['name' => 'Ver Angola Empregos', 'url' => 'https://empregos.verangola.net'],
        JobMessage::SOURCE => ['name' => 'WhatsApp', 'url' => null],
    ];

    /**
     * `previous` is null until the facts have arrived since the week before began: a week counted only from its
     * last days (the first days of the collection) would make any week look like a boom.
     *
     * @return array{from: string, to: string, postings: int, previous: int|null, areas: list<array{area: string, postings: int}>, companies: list<array{name: string, postings: int}>, unnamed: list<array{source: string, name: string, url: string|null, postings: int}>, agencies: array{postings: int, names: list<string>}, updated: string|null}
     */
    public static function summary(?CarbonImmutable $today = null): array
    {
        $today ??= CarbonImmutable::now('Africa/Luanda')->startOfDay();
        $from = $today->subDays(self::DAYS - 1);
        $before = $from->subDays(self::DAYS);

        /** @var Collection<int, JobPosting> $rows */
        $rows = JobPosting::query()
            ->whereBetween('date', [$before->toDateString(), $today->toDateString()])
            ->get(['external_id', 'source', 'date', 'title', 'company', 'sector', 'updated_at']);

        $week = self::distinct($rows->filter(fn (JobPosting $row): bool => self::day($row) >= $from->toDateString()));
        $previous = self::distinct($rows->filter(fn (JobPosting $row): bool => self::day($row) < $from->toDateString()));
        $agencies = self::employers($week, agencies: true);
        $updated = $rows->max('updated_at');

        return [
            'from' => $from->toDateString(),
            'to' => $today->toDateString(),
            'postings' => $week->count(),
            'previous' => self::collectedSince($before) ? $previous->count() : null,
            'areas' => self::areas($week),
            'companies' => array_slice(self::employers($week, agencies: false), 0, self::TOP_COMPANIES),
            'unnamed' => self::unnamed($week),
            'agencies' => [
                'postings' => array_sum(array_column($agencies, 'postings')),
                'names' => array_slice(array_column($agencies, 'name'), 0, self::AGENCY_NAMES),
            ],
            'updated' => $updated instanceof DateTimeInterface ? CarbonImmutable::instance($updated)->toIso8601ZuluString() : null,
        ];
    }

    /**
     * The same post on two sites counts once: same title and same employer. A post without a named employer is
     * kept on its own, so two "Contabilista" posts from unknown employers are not merged.
     *
     * @param  Collection<int, JobPosting>  $rows
     * @return Collection<string, JobPosting>
     */
    private static function distinct(Collection $rows): Collection
    {
        return $rows->keyBy(function (JobPosting $row): string {
            $company = self::named($row->company) ? self::companyKey((string) $row->company) : '';

            return $company === '' ? 'id:'.$row->external_id : self::fold($row->title).'|'.$company;
        });
    }

    /**
     * The employers (or the agencies) with most posts, each under its most common spelling.
     *
     * @param  Collection<string, JobPosting>  $rows
     * @return list<array{name: string, postings: int}>
     */
    private static function employers(Collection $rows, bool $agencies): array
    {
        /** @var array<string, array<string, int>> $spellings */
        $spellings = [];
        foreach ($rows as $row) {
            $name = $row->company;
            if (! self::named($name) || (preg_match(self::AGENCIES, self::fold((string) $name)) === 1) !== $agencies) {
                continue;
            }
            $key = self::companyKey((string) $name);
            $spellings[$key][(string) $name] = ($spellings[$key][(string) $name] ?? 0) + 1;
        }

        $list = [];
        foreach ($spellings as $variants) {
            arsort($variants);
            $list[] = ['name' => self::display((string) array_key_first($variants)), 'postings' => array_sum($variants)];
        }
        usort($list, fn (array $a, array $b): int => [$b['postings'], $a['name']] <=> [$a['postings'], $b['name']]);

        return $list;
    }

    /**
     * The posts of each area, most first; a sector no area takes (or none) is `other`.
     *
     * @param  Collection<string, JobPosting>  $rows
     * @return list<array{area: string, postings: int}>
     */
    private static function areas(Collection $rows): array
    {
        $counts = $rows->countBy(fn (JobPosting $row): string => self::SECTOR_AREAS[(string) $row->sector] ?? 'other')->all();

        return array_map(fn (array $entry): array => ['area' => $entry['name'], 'postings' => $entry['postings']], self::ranked($counts));
    }

    /**
     * The posts whose employer is not named (boards like Jobartis often leave it out), by the site that published
     * them: the site is the reference.
     *
     * @param  Collection<string, JobPosting>  $rows
     * @return list<array{source: string, name: string, url: string|null, postings: int}>
     */
    private static function unnamed(Collection $rows): array
    {
        $counts = $rows->reject(fn (JobPosting $row): bool => self::named($row->company))
            ->countBy(fn (JobPosting $row): string => $row->source)->all();

        return array_map(fn (array $entry): array => [
            'source' => $entry['name'],
            'name' => self::SOURCES[$entry['name']]['name'] ?? $entry['name'],
            'url' => self::SOURCES[$entry['name']]['url'] ?? null,
            'postings' => $entry['postings'],
        ], self::ranked($counts));
    }

    /**
     * Counts as a list, most first, then by name.
     *
     * @param  array<array-key, int>  $counts
     * @return list<array{name: string, postings: int}>
     */
    private static function ranked(array $counts): array
    {
        $list = [];
        foreach ($counts as $name => $postings) {
            $list[] = ['name' => (string) $name, 'postings' => $postings];
        }
        usort($list, fn (array $a, array $b): int => [$b['postings'], $a['name']] <=> [$a['postings'], $b['name']]);

        return $list;
    }

    /** Whether the first facts reached the table by that moment, so the days after it were collected as they came. */
    private static function collectedSince(CarbonImmutable $start): bool
    {
        $first = JobPosting::query()->min('created_at');

        return is_string($first) && CarbonImmutable::parse($first, 'UTC')->lessThanOrEqualTo($start);
    }

    private static function named(?string $name): bool
    {
        return $name !== null && trim($name) !== '' && preg_match(self::UNNAMED, self::fold($name)) !== 1;
    }

    /**
     * 'UNITEL S.A.' and 'Unitel' are the same employer, and so are 'MINEA - RECLIMA' and 'MINEA (UCP)', and
     * 'Noble Group-Sector Industrial' and 'Noble Group-Industrial Sector': a bare hyphen after two words or more
     * starts a division, while 'Coca-Cola' stays whole.
     */
    private static function companyKey(string $name): string
    {
        $first = preg_split('/\s+-\s+|\s*\(/u', $name)[0] ?? $name;
        $head = explode('-', $first)[0];
        if (str_contains($first, '-') && count(preg_split('/\s+/u', trim($head)) ?: []) >= 2) {
            $first = $head;
        }
        $key = preg_replace(self::LEGAL_FORM, '', self::fold($first)) ?? '';
        $key = preg_replace('/\bangola\b/u', '', $key) ?? '';

        return trim(preg_replace('/[^a-z0-9]+/', ' ', $key) ?? '');
    }

    /** An employer's name without its legal form: 'SOL SORRISO LIMITADA .' becomes 'SOL SORRISO'. */
    private static function display(string $name): string
    {
        $plain = preg_replace(self::LEGAL_FORM, '', $name) ?? $name;

        return preg_replace('/^[\s.,\-–]+|[\s.,\-–]+$/u', '', $plain) ?? $plain;
    }

    /** Lowercase without accents: 'Huíla' and 'huila' are the same word. */
    private static function fold(string $text): string
    {
        return mb_strtolower(Str::ascii(trim($text)));
    }

    private static function day(JobPosting $row): string
    {
        return $row->date->format('Y-m-d');
    }
}

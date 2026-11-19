<?php

namespace App\Import;

use App\Enums\Locale;
use JsonException;

/**
 * The frontend's export (database/data): manifest.json and one file per resource and language. Every file must
 * have the hash and the number of records the manifest gives, or nothing is imported.
 */
final class DataFiles
{
    /** @var array<string, array<string, array{file: string, sha256: string}>> resource => locale => entry */
    private array $manifest = [];

    /** @var array<string, array<string, mixed>> resource => locale => decoded file */
    private array $decoded = [];

    public function __construct(private readonly string $path) {}

    /**
     * Checks every file the manifest lists, in every language.
     *
     * @throws ImportFailed
     */
    public function verify(): void
    {
        $manifest = $this->json('manifest.json');
        if (! is_array($manifest) || $manifest === []) {
            throw new ImportFailed(["manifest.json is missing or empty in {$this->path}"]);
        }

        $problems = [];
        foreach ($manifest as $resource => $locales) {
            foreach (Locale::values() as $locale) {
                $entry = is_array($locales) ? ($locales[$locale] ?? null) : null;
                $problems[] = $this->check((string) $resource, $locale, $entry);
            }
        }

        $problems = array_values(array_filter($problems));
        if ($problems !== []) {
            throw new ImportFailed($problems);
        }
    }

    /**
     * The records of a list resource, the three languages of each together.
     *
     * @return list<Record>
     */
    public function records(string $resource): array
    {
        $lists = array_map(Record::list(...), $this->locales($resource));

        $records = [];
        foreach (array_keys($lists[Locale::fallback()->value] ?? []) as $at) {
            $locales = array_map(fn (array $list): array => $list[$at] ?? [], $lists);
            $ids = array_unique(array_map(fn (array $record): string => json_encode($record['slug'] ?? $record['id'] ?? null, JSON_THROW_ON_ERROR), $locales));
            if (count($ids) > 1) {
                throw new ImportFailed(["{$resource}: record {$at} is not the same in every language"]);
            }
            $records[] = new Record($locales);
        }

        return $records;
    }

    /**
     * A resource that is one document (the Mercado figures, the provinces), in Portuguese.
     */
    public function document(string $resource): mixed
    {
        return $this->locales($resource)[Locale::fallback()->value] ?? null;
    }

    /**
     * The decoded files of a resource. A language whose file is the same as the Portuguese one (the same hash)
     * shares its data, so the export is held in memory once.
     *
     * @return array<string, mixed>
     */
    private function locales(string $resource): array
    {
        if (! isset($this->manifest[$resource])) {
            throw new ImportFailed(["{$resource} is not in a verified manifest.json"]);
        }

        if (! isset($this->decoded[$resource])) {
            $byHash = [];
            foreach ($this->manifest[$resource] as $locale => $entry) {
                $this->decoded[$resource][$locale] = $byHash[$entry['sha256']] ??= $this->json($entry['file']);
            }
        }

        return $this->decoded[$resource];
    }

    private function check(string $resource, string $locale, mixed $entry): ?string
    {
        if (! is_array($entry) || ! is_string($entry['file'] ?? null) || ! is_int($entry['records'] ?? null) || ! is_string($entry['sha256'] ?? null)) {
            return "{$resource}.{$locale}: missing or incomplete in manifest.json";
        }
        $file = "{$this->path}/{$entry['file']}";
        if (! is_file($file)) {
            return "{$entry['file']}: the file does not exist";
        }
        if (hash_file('sha256', $file) !== $entry['sha256']) {
            return "{$entry['file']}: the SHA-256 does not match manifest.json (export again: npm run export:data)";
        }
        $data = $this->json($entry['file']);
        $records = is_array($data) && array_is_list($data) ? count($data) : 1;
        if ($records !== $entry['records']) {
            return "{$entry['file']}: {$records} records, manifest.json says {$entry['records']}";
        }

        $this->manifest[$resource][$locale] = ['file' => $entry['file'], 'sha256' => $entry['sha256']];

        return null;
    }

    private function json(string $name): mixed
    {
        $file = "{$this->path}/{$name}";
        if (! is_file($file)) {
            return null;
        }

        try {
            return json_decode((string) file_get_contents($file), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new ImportFailed(["{$name}: invalid JSON ({$exception->getMessage()})"]);
        }
    }
}

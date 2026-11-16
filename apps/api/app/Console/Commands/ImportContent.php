<?php

namespace App\Console\Commands;

use App\Import\Catalog;
use App\Import\DataFiles;
use App\Import\Importer;
use App\Import\ImportFailed;
use App\Import\Result;
use App\Import\Target;
use App\Support\PublicContent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

/**
 * Loads the frontend's export (database/data) into the database, by slug: creates what is new, updates what
 * changed and leaves the rest, so it can run any number of times (local, staging, production). See ADR 0019.
 */
class ImportContent extends Command
{
    protected $signature = 'kaye:import {--only= : Comma-separated resources to import (e.g. careers,pathways)}';

    protected $description = 'Import the catalogue from database/data into the database';

    public function handle(): int
    {
        $files = new DataFiles(Config::string('kaye.data_path'));
        try {
            $files->verify();
        } catch (ImportFailed $failure) {
            return $this->fail_('The export does not match manifest.json; nothing was imported.', $failure->problems);
        }

        $resources = Catalog::resources();
        $only = array_values(array_filter(array_map(trim(...), explode(',', (string) $this->option('only')))));
        $names = array_map(fn (Target $resource): string => $resource->name, $resources);
        $unknown = array_diff($only, $names);
        if ($unknown !== []) {
            return $this->fail_('Unknown resources.', ['Unknown: '.implode(', ', $unknown), 'Known: '.implode(', ', $names)]);
        }

        $importer = new Importer($files, $resources);
        $results = [];
        foreach ($resources as $resource) {
            if ($only === [] || in_array($resource->name, $only, true)) {
                $results[] = $importer->run($resource);
            }
        }

        // The link tables change without model events: the public API's cached answers go here.
        PublicContent::flush();

        $this->table(
            ['Resource', 'Read', 'Created', 'Updated', 'Errors'],
            array_map(fn (Result $result): array => [$result->name, $result->read, $result->created, $result->updated, count($result->problems)], $results),
        );

        $problems = array_merge(...array_map(fn (Result $result): array => $result->problems, $results));
        if ($problems !== []) {
            return $this->fail_('Some resources were not imported (each one is rolled back whole).', $problems);
        }
        $this->info('Import complete.');

        return self::SUCCESS;
    }

    /**
     * @param  list<string>  $problems
     */
    private function fail_(string $message, array $problems): int
    {
        $this->error($message);
        foreach ($problems as $problem) {
            $this->line("  - {$problem}");
        }

        return self::FAILURE;
    }
}

<?php

namespace App\Support;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;

/**
 * The row count of every table, written into each backup (backup-manifest.json) so that the restore test compares
 * the copy with what the database had when it was made, not with what it has today.
 */
final class BackupManifest
{
    public const FILE = 'backup-manifest.json';

    /**
     * Tables that change between the count and the dump (sessions, cache, queue, logins, Pulse): the restore test
     * only checks that they exist.
     */
    public const VOLATILE = [
        'activity_log', 'cache', 'cache_locks', 'failed_jobs', 'job_batches', 'jobs', 'personal_access_tokens',
        'pulse_aggregates', 'pulse_entries', 'pulse_values', 'sessions',
    ];

    /**
     * @return array<string, int>
     */
    public static function counts(?Connection $connection = null): array
    {
        $connection ??= DB::connection();
        $counts = [];
        foreach ($connection->getSchemaBuilder()->getTableListing($connection->getDatabaseName(), schemaQualified: false) as $table) {
            $counts[$table] = $connection->table($table)->count();
        }
        ksort($counts);

        return $counts;
    }

    public static function path(): string
    {
        return storage_path('app/'.self::FILE);
    }
}

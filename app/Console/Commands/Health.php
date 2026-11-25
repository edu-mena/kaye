<?php

namespace App\Console\Commands;

use App\Support\SystemHealth;
use Illuminate\Console\Command;

/**
 * The checks of /api/v1/health with HEALTH_TOKEN, from the server's own shell (docs/observabilidade.md): the
 * deploy runs it after each release, without needing the token. Fails when any check is not ok.
 */
class Health extends Command
{
    protected $signature = 'kaye:health';

    protected $description = 'Check the database, the queue, the cron and the disk; fail when one is not ok';

    public function handle(): int
    {
        if (! SystemHealth::databaseIsUp()) {
            $this->error('database: down');

            return self::FAILURE;
        }

        $checks = ['queue' => SystemHealth::queue(), 'cron' => SystemHealth::cron(), 'disk' => SystemHealth::disk()];
        $this->table(['Check', 'Status', 'Details'], array_map(
            fn (string $name, array $check): array => [$name, $check['status'], (string) json_encode(array_diff_key($check, ['status' => true]))],
            array_keys($checks),
            $checks,
        ));

        // The same rule as /api/v1/health: a disk whose space the host does not tell (`unknown`) is not a failure.
        $failing = array_keys(array_filter([
            'queue' => $checks['queue']['status'] !== 'ok',
            'cron' => $checks['cron']['status'] !== 'ok',
            'disk' => $checks['disk']['status'] === 'low',
        ]));
        if ($failing !== []) {
            $this->error('Not ok: '.implode(', ', $failing).'.');

            return self::FAILURE;
        }
        $this->info('database, queue, cron and disk: ok.');

        return self::SUCCESS;
    }
}

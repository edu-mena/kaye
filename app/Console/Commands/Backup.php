<?php

namespace App\Console\Commands;

use App\Support\BackupManifest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * The daily backup (routes/console.php): the row counts first, then spatie's `backup:run` with the database dump
 * and that manifest, to BACKUP_DISK. See docs/infraestrutura.md, "Cópias de segurança".
 */
class Backup extends Command
{
    protected $signature = 'kaye:backup';

    protected $description = 'Back up the database (with its row counts) to BACKUP_DISK';

    public function handle(): int
    {
        File::put(BackupManifest::path(), (string) json_encode([
            'created_at' => now()->toIso8601String(),
            'counts' => BackupManifest::counts(),
        ], JSON_PRETTY_PRINT));

        try {
            return $this->call('backup:run');
        } finally {
            File::delete(BackupManifest::path());
        }
    }
}

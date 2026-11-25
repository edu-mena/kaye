<?php

namespace App\Console\Commands;

use App\Support\BackupManifest;
use Illuminate\Console\Command;
use Illuminate\Database\Connection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;
use Spatie\Backup\BackupDestination\BackupDestination;
use Throwable;
use ZipArchive;

/**
 * A backup is only one when it restores. This takes the newest copy on BACKUP_DISK, restores its dump into the
 * `restore` database (DB_RESTORE_DATABASE, empty and of its own) and compares every table's rows with the counts
 * written when the copy was made. Fails on any difference. Scheduled weekly; run by hand after changing backups.
 */
class BackupRestoreTest extends Command
{
    protected $signature = 'kaye:backup-restore-test';

    protected $description = 'Restore the newest backup into the restore database and compare the row counts';

    public function handle(): int
    {
        $restore = DB::connection('restore');
        $target = (string) $restore->getDatabaseName();
        if ($target === '' || $target === DB::connection()->getDatabaseName()) {
            $this->error('DB_RESTORE_DATABASE must name an empty database of its own, never the real one.');

            return self::FAILURE;
        }

        $disk = Config::array('backup.backup.destination.disks')[0] ?? null;
        $disk = is_string($disk) ? $disk : 'local';
        $newest = BackupDestination::create($disk, Config::string('backup.backup.name'))->newestBackup();
        if ($newest === null) {
            $this->error("There is no backup on the disk {$disk}.");

            return self::FAILURE;
        }

        $directory = storage_path('app/backup-restore-test');
        File::ensureDirectoryExists($directory);
        $zipPath = $directory.'/backup.zip';

        try {
            File::put($zipPath, $newest->disk()->get($newest->path()) ?? '');
            [$manifest, $dump] = $this->open($zipPath);
            $this->replaceDatabase($restore, $dump);
            $differences = $this->compare($manifest, BackupManifest::counts($restore));
        } catch (Throwable $exception) {
            // The class only: the message could carry a path or a host.
            $this->error('The restore failed: '.$exception::class);

            return self::FAILURE;
        } finally {
            File::deleteDirectory($directory);
            $this->dropTables($restore);
        }

        if ($differences !== []) {
            $this->table(['Table', 'In the backup', 'Restored'], $differences);
            $this->error(count($differences).' table(s) differ. The backup does not restore what it had.');

            return self::FAILURE;
        }

        $this->info('The newest backup ('.$newest->date()->toDateTimeString().') restores: every table has its rows.');

        return self::SUCCESS;
    }

    /**
     * @return array{array<string, int>, string}
     */
    private function open(string $zipPath): array
    {
        $zip = new ZipArchive;
        if ($zip->open($zipPath) !== true) {
            throw new RuntimeException('Not a zip.');
        }
        $password = Config::get('backup.backup.password');
        if (is_string($password) && $password !== '') {
            $zip->setPassword($password);
        }

        $manifest = json_decode((string) $zip->getFromName(BackupManifest::FILE), true);
        $dump = null;
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = (string) $zip->getNameIndex($index);
            // A zip made on Windows writes the folder with a backslash.
            if (preg_match('#^db-dumps[/\\\\].+\.sql$#', $name) === 1) {
                $dump = $zip->getFromIndex($index);
            }
        }
        $zip->close();

        if (! is_array($manifest) || ! is_array($manifest['counts'] ?? null) || ! is_string($dump) || $dump === '') {
            throw new RuntimeException('The backup has no manifest or no dump.');
        }

        $counts = [];
        foreach ($manifest['counts'] as $table => $count) {
            if (is_string($table) && is_int($count)) {
                $counts[$table] = $count;
            }
        }

        return [$counts, $dump];
    }

    private function replaceDatabase(Connection $restore, string $dump): void
    {
        $this->dropTables($restore);
        $restore->getPdo()->exec($dump);
    }

    private function dropTables(Connection $restore): void
    {
        try {
            $restore->getSchemaBuilder()->dropAllTables();
        } catch (Throwable) {
            // Nothing to drop, or the database is not there: the restore itself reports it.
        }
    }

    /**
     * @param  array<string, int>  $expected
     * @param  array<string, int>  $restored
     * @return list<array{string, string, string}>
     */
    private function compare(array $expected, array $restored): array
    {
        $differences = [];
        foreach ($expected as $table => $count) {
            $actual = $restored[$table] ?? null;
            $volatile = in_array($table, BackupManifest::VOLATILE, true);
            if ($actual === null || (! $volatile && $actual !== $count)) {
                $differences[] = [$table, (string) $count, $actual === null ? 'missing' : (string) $actual];
            }
        }

        return $differences;
    }
}

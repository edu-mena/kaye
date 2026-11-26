<?php

namespace Tests\Feature;

use App\Support\BackupManifest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

/**
 * The daily copy and the proof that it restores (docs/infraestrutura.md, "Cópias de segurança"). A real mysqldump
 * runs (DB_DUMP_BINARY_PATH when it is not on the PATH) and the copy is restored into `kaye_test_restore`.
 * No rows are created here: the dump only sees what is committed, not this test's transaction.
 */
class BackupTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'backup-password-for-tests';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('backups');
        DB::statement('CREATE DATABASE IF NOT EXISTS kaye_test_restore');
        config([
            'backup.backup.destination.disks' => ['backups'],
            'backup.monitor_backups.0.disks' => ['backups'],
            'backup.backup.password' => self::PASSWORD,
            'database.connections.restore.database' => 'kaye_test_restore',
        ]);
        DB::purge('restore');
        // Spatie reads its config once per scope: read it again with the values above.
        $this->app->forgetScopedInstances();
    }

    public function test_the_backup_is_one_encrypted_zip_with_the_dump_and_the_counts_and_it_restores(): void
    {
        $this->assertSame(0, Artisan::call('kaye:backup'), Artisan::output());

        $zip = $this->newestZip();
        $this->assertTrue($zip->getFromName(BackupManifest::FILE) === false, 'The zip opens without the password.');
        $zip->setPassword(self::PASSWORD);
        $manifest = json_decode((string) $zip->getFromName(BackupManifest::FILE), true);
        $this->assertSame(DB::table('roles')->count(), data_get($manifest, 'counts.roles'));
        $this->assertFileDoesNotExist(BackupManifest::path());

        $this->assertSame(0, Artisan::call('kaye:backup-restore-test'));
        $this->assertStringContainsString('restores', Artisan::output());
        $this->assertSame([], DB::connection('restore')->getSchemaBuilder()->getTableListing('kaye_test_restore', schemaQualified: false), 'The restore database is not emptied after the test.');
    }

    public function test_a_backup_that_does_not_have_what_it_counted_fails_the_restore_test(): void
    {
        config(['backup.backup.password' => null]);
        $this->app->forgetScopedInstances();
        Artisan::call('kaye:backup');
        $zip = $this->newestZip();
        $manifest = json_decode((string) $zip->getFromName(BackupManifest::FILE), true);
        $roles = data_get($manifest, 'counts.roles');
        $this->assertIsInt($roles);
        data_set($manifest, 'counts.roles', $roles + 1);
        data_set($manifest, 'counts.a_table_that_was_lost', 3);
        $zip->addFromString(BackupManifest::FILE, (string) json_encode($manifest));
        $zip->close();
        $this->putBack();

        $this->assertSame(1, Artisan::call('kaye:backup-restore-test'));
        $output = Artisan::output();
        $this->assertStringContainsString('a_table_that_was_lost', $output);
        $this->assertStringContainsString('2 table(s) differ', $output);
    }

    public function test_the_restore_test_never_touches_the_real_database(): void
    {
        config(['database.connections.restore.database' => DB::connection()->getDatabaseName()]);
        DB::purge('restore');

        $this->assertSame(1, Artisan::call('kaye:backup-restore-test'));
        $this->assertStringContainsString('never the real one', Artisan::output());
        $this->assertTrue(DB::getSchemaBuilder()->hasTable('users'));
    }

    public function test_without_a_backup_the_restore_test_fails(): void
    {
        $this->assertSame(1, Artisan::call('kaye:backup-restore-test'));
        $this->assertStringContainsString('no backup', Artisan::output());
    }

    public function test_the_backups_run_daily_off_the_server_and_are_kept_30_days(): void
    {
        $this->assertSame(30, config('backup.cleanup.default_strategy.keep_all_backups_for_days'));
        $this->assertSame(0, config('backup.cleanup.default_strategy.keep_daily_backups_for_days'));
        $this->assertSame([storage_path('app/backup-manifest.json')], config('backup.backup.source.files.include'));
    }

    private string $zipCopy = '';

    private function newestZip(): ZipArchive
    {
        $files = Storage::disk('backups')->allFiles('kaye');
        $this->assertCount(1, $files);
        $this->zipCopy = (string) tempnam(sys_get_temp_dir(), 'kaye');
        file_put_contents($this->zipCopy, Storage::disk('backups')->get($files[0]));
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($this->zipCopy));

        return $zip;
    }

    private function putBack(): void
    {
        $files = Storage::disk('backups')->allFiles('kaye');
        Storage::disk('backups')->put($files[0], (string) file_get_contents($this->zipCopy));
        @unlink($this->zipCopy);
    }
}

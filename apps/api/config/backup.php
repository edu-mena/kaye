<?php

use Spatie\Backup\Notifications\Notifiable;
use Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification;
use Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification;
use Spatie\Backup\Notifications\Notifications\CleanupHasFailedNotification;
use Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification;
use Spatie\Backup\Notifications\Notifications\HealthyBackupWasFoundNotification;
use Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification;
use Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy;
use Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays;
use Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes;

/*
 * The daily copy of the database (docs/infraestrutura.md, "Cópias de segurança"): `kaye:backup` writes the row
 * counts (backup-manifest.json) and dumps the database into one encrypted zip, sent off Hostinger to BACKUP_DISK
 * (S3 or any S3-compatible storage: Cloudflare R2, Backblaze B2…). Kept 30 days. `kaye:backup-restore-test` proves
 * that the newest one restores. Only failures send an email (to ADMIN_EMAILS).
 */

$disk = (string) env('BACKUP_DISK', 'local');
$name = 'kaye';

return [

    'backup' => [
        'name' => $name,

        'source' => [
            'files' => [
                // Only the manifest: the code is in git, and the app keeps no other files of its own.
                'include' => [
                    storage_path('app/backup-manifest.json'),
                ],
                'exclude' => [],
                'follow_links' => false,
                'ignore_unreadable_directories' => false,
                'relative_path' => storage_path('app'),
            ],

            'databases' => [
                env('DB_CONNECTION', 'mysql'),
            ],
        ],

        'database_dump_compressor' => null,
        'database_dump_file_timestamp_format' => null,
        'database_dump_filename_base' => 'database',
        'database_dump_file_extension' => '',

        'destination' => [
            'compression_method' => ZipArchive::CM_DEFAULT,
            'compression_level' => 9,
            'filename_prefix' => '',
            'disks' => [$disk],
            'continue_on_failure' => false,
        ],

        'temporary_directory' => storage_path('app/backup-temp'),

        // The zip is encrypted (AES-256) with this password: a leaked copy gives nothing without it.
        'password' => env('BACKUP_ARCHIVE_PASSWORD'),
        'encryption' => 'default',
        'verify_backup' => true,
        'tries' => 1,
        'retry_delay' => 0,
    ],

    'notifications' => [
        'notifications' => [
            BackupHasFailedNotification::class => ['mail'],
            UnhealthyBackupWasFoundNotification::class => ['mail'],
            CleanupHasFailedNotification::class => ['mail'],
            // Spatie needs every key; success sends nothing.
            BackupWasSuccessfulNotification::class => [],
            HealthyBackupWasFoundNotification::class => [],
            CleanupWasSuccessfulNotification::class => [],
        ],
        'notifiable' => Notifiable::class,
        'mail' => [
            'to' => array_values(array_filter(array_map('trim', explode(',', (string) env('ADMIN_EMAILS', ''))))),
            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                'name' => env('MAIL_FROM_NAME', 'Kayé'),
            ],
        ],
        'slack' => ['webhook_url' => '', 'channel' => null, 'username' => null, 'icon' => null],
        'discord' => ['webhook_url' => '', 'username' => '', 'avatar_url' => ''],
        'webhook' => ['url' => ''],
    ],

    'log_channel' => null,

    // `backup:monitor` (daily): an email when the newest copy is older than a day.
    'monitor_backups' => [
        [
            'name' => $name,
            'disks' => [$disk],
            'health_checks' => [
                MaximumAgeInDays::class => 1,
                MaximumStorageInMegabytes::class => 5000,
            ],
        ],
    ],

    // Every copy of the last 30 days, none older (`backup:clean`, daily).
    'cleanup' => [
        'strategy' => DefaultStrategy::class,
        'default_strategy' => [
            'keep_all_backups_for_days' => 30,
            'keep_daily_backups_for_days' => 0,
            'keep_weekly_backups_for_weeks' => 0,
            'keep_monthly_backups_for_months' => 0,
            'keep_yearly_backups_for_years' => 0,
            'delete_oldest_backups_when_using_more_megabytes_than' => 5000,
        ],
        'tries' => 1,
        'retry_delay' => 0,
    ],

];

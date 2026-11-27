<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Area;
use App\Support\Settings;
use Illuminate\Cache\RateLimiter;
use Illuminate\Console\Scheduling\CallbackEvent;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * The public API keeps its answers in files (store `content`), not in the database: under load, reading a 1 MB list
 * from MySQL held a connection per request and the host refused new ones (docs/infraestrutura.md, carga).
 */
class PublicContentStoreTest extends TestCase
{
    use RefreshDatabase;

    private const array PUBLISHED = ['status' => ContentStatus::Published];

    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->directory = storage_path('framework/testing/content-'.uniqid());
        config([
            'kaye.content_cache_store' => 'content',
            'cache.stores.content.path' => $this->directory,
            'cache.stores.content.lock_path' => $this->directory.'-locks',
        ]);
        Cache::forgetDriver('content');
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->directory);
        File::deleteDirectory($this->directory.'-locks');

        parent::tearDown();
    }

    public function test_production_keeps_the_answers_in_files_of_their_own(): void
    {
        /** @var array{stores: array<string, array<string, string>>} $cache */
        $cache = require config_path('cache.php');

        $this->assertSame('file', $cache['stores']['content']['driver']);
        $this->assertSame(storage_path('framework/cache/content'), $cache['stores']['content']['path']);
        // Not the database store, which the rest of the cache (rate limits, locks) still uses.
        $this->assertNotSame($cache['stores']['database'], $cache['stores']['content']);
    }

    public function test_a_kept_answer_is_served_without_touching_the_database(): void
    {
        Area::factory()->create(self::PUBLISHED);
        $first = $this->getJson('/api/v1/areas')->assertOk()->assertJsonCount(1);
        $this->assertNotEmpty(File::allFiles($this->directory), 'The answer was not written to the content store.');

        $queries = [];
        DB::listen(function (QueryExecuted $query) use (&$queries): void {
            $queries[] = $query->sql;
        });

        $again = $this->getJson('/api/v1/areas')->assertOk();

        $this->assertSame($first->getContent(), $again->getContent());
        $content = array_filter($queries, fn (string $sql): bool => str_contains($sql, 'public-content') || str_contains($sql, '`areas`'));
        $this->assertSame([], array_values($content), 'A kept answer still went to the database.');
    }

    public function test_a_public_read_needs_no_database_at_all_once_warm(): void
    {
        // The real stores of production: rate limits and settings in `local`, answers in `content` (ADR 0029).
        config([
            // As in production: whatever still uses the default store shows up as a query below.
            'cache.default' => 'database',
            'cache.limiter' => 'local',
            'cache.stores.local.path' => $this->directory.'-local',
            'cache.stores.local.lock_path' => $this->directory.'-local-locks',
        ]);
        Cache::forgetDriver('local');
        $limiter = new RateLimiter(Cache::store('local'));
        $api = app(RateLimiter::class)->limiter('api');
        $this->assertNotNull($api);
        $limiter->for('api', $api);
        $this->app->instance(RateLimiter::class, $limiter);
        Area::factory()->create(self::PUBLISHED);
        Settings::apply();
        $this->getJson('/api/v1/areas')->assertOk()->assertJsonCount(1);

        $queries = [];
        DB::listen(function (QueryExecuted $query) use (&$queries): void {
            $queries[] = $query->sql;
        });

        Settings::apply(); // what every request does at boot
        $this->getJson('/api/v1/areas')->assertOk()->assertJsonCount(1)->assertHeader('X-RateLimit-Remaining');

        $this->assertSame([], $queries, 'A warm public read still went to the database.');

        File::deleteDirectory($this->directory.'-local');
        File::deleteDirectory($this->directory.'-local-locks');
    }

    public function test_a_change_to_the_content_is_served_at_once(): void
    {
        $area = Area::factory()->create(self::PUBLISHED);
        $this->getJson('/api/v1/areas', ['Accept-Language' => 'pt'])->assertOk();

        $area->update(['name' => ['pt' => 'Nome novo', 'en' => 'New name', 'fr' => 'Nouveau nom']]);

        $this->getJson('/api/v1/areas', ['Accept-Language' => 'pt'])->assertOk()->assertSee('Nome novo');
    }

    public function test_the_daily_prune_empties_the_store_and_the_next_read_rebuilds_it(): void
    {
        Area::factory()->create(self::PUBLISHED);
        $this->getJson('/api/v1/areas')->assertOk();
        $this->assertNotEmpty(File::allFiles($this->directory));

        $event = collect(app(Schedule::class)->events())
            ->first(fn ($event): bool => $event instanceof CallbackEvent && $event->description === 'public-content-prune');
        $this->assertNotNull($event, 'The prune is not scheduled.');
        $this->assertSame('45 4 * * *', $event->expression);
        $event->run(app());

        $this->assertCount(0, File::allFiles($this->directory));
        $this->getJson('/api/v1/areas')->assertOk();
        $this->assertNotEmpty(File::allFiles($this->directory));
    }

    public function test_expired_rows_of_the_database_cache_are_deleted_daily(): void
    {
        DB::table('cache')->insert([
            ['key' => 'old', 'value' => 's:1:"x";', 'expiration' => now()->subMinute()->getTimestamp()],
            ['key' => 'live', 'value' => 's:1:"x";', 'expiration' => now()->addHour()->getTimestamp()],
        ]);

        $event = collect(app(Schedule::class)->events())
            ->first(fn ($event): bool => $event instanceof CallbackEvent && $event->description === 'cache-expired-rows');
        $this->assertNotNull($event, 'The cleanup is not scheduled.');
        $this->assertSame('50 4 * * *', $event->expression);
        $event->run(app());

        $this->assertSame(['live'], DB::table('cache')->pluck('key')->all());
    }

    public function test_the_migration_deletes_only_the_old_public_answers_from_the_database_cache(): void
    {
        DB::table('cache')->insert([
            ['key' => 'kaye-cache-public-content:abc:pt:api/v1/areas?', 'value' => 's:1:"x";', 'expiration' => 0],
            ['key' => 'kaye-cache-read:127.0.0.1', 'value' => 'i:1;', 'expiration' => 0],
        ]);

        $exitCode = Artisan::call('migrate:refresh', [
            '--path' => 'database/migrations/2026_11_27_020558_delete_public_answers_from_database_cache.php',
            '--force' => true,
        ]);
        $this->assertSame(0, $exitCode);

        $this->assertSame(['kaye-cache-read:127.0.0.1'], DB::table('cache')->pluck('key')->all());
    }
}

<?php

namespace Tests\Feature;

use App\Support\AtomicFileStore;
use Illuminate\Cache\FileStore;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * The `local` cache store counts the rate limits on disk (ADR 0029). Its increment() must stay exact when many
 * requests count at the same moment, or a burst could pass the limit.
 */
class AtomicFileStoreTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->directory = storage_path('framework/testing/atomic-'.uniqid());
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->directory);
        parent::tearDown();
    }

    public function test_increment_counts_from_zero_and_keeps_the_expiry(): void
    {
        $store = new AtomicFileStore(new Filesystem, $this->directory);

        $this->assertSame(1, $store->increment('hits'));
        $this->assertSame(3, $store->increment('hits', 2));
        $this->assertSame(3, $store->get('hits'));

        $store->put('limited', 5, 60);
        $this->assertSame(6, $store->increment('limited'));
        $this->travel(61)->seconds();
        $this->assertNull($store->get('limited'), 'The counter outlived its window.');
        $this->assertSame(1, $store->increment('limited'), 'An expired counter starts again from zero.');
    }

    public function test_the_local_store_uses_it(): void
    {
        config(['cache.stores.local.path' => $this->directory, 'cache.stores.local.lock_path' => $this->directory.'-locks']);

        $store = cache()->store('local')->getStore();

        $this->assertInstanceOf(AtomicFileStore::class, $store);
    }

    public function test_parallel_increments_are_never_lost(): void
    {
        $this->assertSame(4 * 300, $this->countInParallel(AtomicFileStore::class));
    }

    public function test_laravels_file_store_loses_them_which_is_why_this_exists(): void
    {
        $this->assertLessThan(4 * 300, $this->countInParallel(FileStore::class));
    }

    /**
     * Four PHP processes add 1 to the same key 300 times each, all at once; returns the final count.
     *
     * @param  class-string<FileStore>  $class
     */
    private function countInParallel(string $class): int
    {
        File::ensureDirectoryExists($this->directory);
        $script = $this->directory.'/count.php';
        File::put($script, '<?php require '.var_export(base_path('vendor/autoload.php'), true).';'
            .'$store = new '.$class.'(new Illuminate\Filesystem\Filesystem, '.var_export($this->directory.'/data', true).');'
            .'while (! file_exists('.var_export($this->directory.'/go', true).')) { usleep(1000); }'
            .'for ($i = 0; $i < 300; $i++) { $store->increment("hits"); }');

        $processes = [];
        for ($i = 0; $i < 4; $i++) {
            $process = proc_open([PHP_BINARY, $script], [], $pipes);
            $this->assertIsResource($process);
            $processes[] = $process;
        }
        usleep(300_000);
        File::put($this->directory.'/go', '');
        foreach ($processes as $process) {
            proc_close($process);
        }

        $count = (new $class(new Filesystem, $this->directory.'/data'))->get('hits');

        return is_numeric($count) ? (int) $count : 0;
    }
}

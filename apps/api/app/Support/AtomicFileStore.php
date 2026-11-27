<?php

namespace App\Support;

use Illuminate\Cache\FileStore;
use Illuminate\Contracts\Filesystem\LockTimeoutException;
use Illuminate\Filesystem\LockableFile;

/**
 * The file cache, with increment() done under an exclusive lock on the file. Laravel's FileStore reads, adds and
 * writes in three steps, so two requests at the same moment both count from the same value and one hit is lost.
 * The rate limits count with increment(), and they are a security control: here they stay exact under load.
 *
 * Used by the `local` store (config/cache.php): the rate limits and the panel's settings, kept on disk so a
 * request to the public API never needs a database connection (docs/decisoes/0029-cache-em-ficheiros.md).
 */
class AtomicFileStore extends FileStore
{
    /**
     * @param  string  $key
     * @param  mixed  $value
     * @return int|false
     */
    public function increment($key, $value = 1)
    {
        $this->ensureCacheDirectoryExists($path = $this->path($key));

        $file = new LockableFile($path, 'c+');

        try {
            $file->getExclusiveLock(true);
        } catch (LockTimeoutException) {
            $file->close();

            return false;
        }

        $contents = $file->size() > 0 ? $file->read() : '';
        $expire = (int) substr($contents, 0, 10);
        $current = 0;

        if ($contents !== '' && $this->currentTime() < $expire) {
            $stored = $this->unserialize(substr($contents, 10));
            $current = is_numeric($stored) ? (int) $stored : 0;
        } else {
            // Missing or expired: a new counter that never expires, as FileStore::increment() does.
            $expire = $this->expiration(0);
        }

        $total = $current + (is_numeric($value) ? (int) $value : 0);

        $file->truncate()
            ->write(str_pad((string) $expire, 10, '0', STR_PAD_LEFT).serialize($total))
            ->close();

        $this->ensurePermissionsAreCorrect($path);

        return $total;
    }
}

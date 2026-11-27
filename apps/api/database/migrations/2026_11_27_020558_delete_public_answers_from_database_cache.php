<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The public API's answers moved from the database cache to files (App\Support\PublicContent, store `content`).
 * The rows they left behind (about 150 MB in production, 27/11/2026) are never read again: delete them once.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('cache')->where('key', 'like', '%public-content:%')->delete();
    }

    public function down(): void
    {
        // Nothing to bring back: the answers rebuild themselves on the next read.
    }
};

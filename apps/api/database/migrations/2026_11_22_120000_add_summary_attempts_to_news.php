<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * How many times the AI summary of a collected piece was tried, so a dead link or a paywall stops being retried.
 * See `news` in docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news', function (Blueprint $table): void {
            $table->unsignedTinyInteger('summary_attempts')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('news', function (Blueprint $table): void {
            $table->dropColumn('summary_attempts');
        });
    }
};

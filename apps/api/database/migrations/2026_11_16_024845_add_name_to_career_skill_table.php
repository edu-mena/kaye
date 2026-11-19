<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `career_skill.name`: how one career names a skill when it is not the skill's own name ("SQL básico" for `sql`),
 * as {"pt": …, "en": …}. See docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('career_skill', function (Blueprint $table): void {
            $table->json('name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('career_skill', function (Blueprint $table): void {
            $table->dropColumn('name');
        });
    }
};

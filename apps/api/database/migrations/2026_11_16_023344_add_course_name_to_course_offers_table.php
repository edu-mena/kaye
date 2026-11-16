<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `course_offers.course_name`: the name an institution gives the course when it is not the course's own
 * ("Técnico de Informática" for `tecnico-informatica`). See docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_offers', function (Blueprint $table): void {
            $table->json('course_name')->nullable()->after('course_id');
        });
    }

    public function down(): void
    {
        Schema::table('course_offers', function (Blueprint $table): void {
            $table->dropColumn('course_name');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `course_offers.duration_months` and `schedule`: the length and the timetable the showcase estimates for every
 * offer (AcademyOffer.durationMonths, .schedule). See docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_offers', function (Blueprint $table): void {
            $table->unsignedSmallInteger('duration_months')->nullable()->after('year');
            $table->json('schedule')->nullable()->after('duration_months');
        });
    }

    public function down(): void
    {
        Schema::table('course_offers', function (Blueprint $table): void {
            $table->dropColumn(['duration_months', 'schedule']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The order of each link, as the content lists it (an offer's careers, a news piece's companies): the API returns
 * the lists in that order. career_skill and career_company already have it. See docs/base-de-dados.md.
 */
return new class extends Migration
{
    /** @var list<string> */
    private array $tables = [
        'career_course_offer', 'company_institution', 'career_free_course', 'admission_course', 'career_program',
        'career_news', 'company_news', 'career_figure', 'career_mentor',
    ];

    public function up(): void
    {
        foreach ($this->tables as $name) {
            Schema::table($name, function (Blueprint $table): void {
                $table->unsignedSmallInteger('position')->default(0);
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $name) {
            Schema::table($name, function (Blueprint $table): void {
                $table->dropColumn('position');
            });
        }
    }
};

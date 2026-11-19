<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `careers`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('careers', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('career_group_id')->constrained()->cascadeOnDelete();
            $table->json('name');
            $table->json('summary');
            $table->json('description')->nullable();
            $table->json('riasec');
            $table->string('demand', 5)->index();
            $table->unsignedInteger('salary_median')->nullable();
            $table->string('salary_kind', 10)->nullable();
            $table->boolean('detailed')->default(false);
            $table->json('image')->nullable();
            $table->json('day_to_day')->nullable();
            $table->json('work_context')->nullable();
            $table->json('work_styles')->nullable();
            $table->json('employer_asks')->nullable();
            $table->json('stages')->nullable();
            $table->json('market')->nullable();
            $table->json('cv_guide')->nullable();
            $table->json('self_employment')->nullable();
        });
        ContentSchema::pivot('career_skill', 'career_id', 'skill_id', function (Blueprint $table): void {
            $table->string('importance', 10);
            $table->unsignedSmallInteger('position')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('career_skill');
        Schema::dropIfExists('careers');
    }
};

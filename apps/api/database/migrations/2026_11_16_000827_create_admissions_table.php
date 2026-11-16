<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `admissions`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admissions', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('institution_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('academic_year', 9);
            $table->date('registration_start')->nullable();
            $table->date('registration_end')->nullable()->index();
            $table->json('exam_dates');
            $table->json('subjects');
            $table->json('requirements');
            $table->unsignedInteger('vacancies')->nullable();
            $table->decimal('min_grade', 4, 2)->nullable();
            $table->string('min_grade_year', 9)->nullable();
            $table->unsignedInteger('fee_aoa')->nullable();
            $table->string('url', 2048);
            $table->json('sources');
        });
        ContentSchema::pivot('admission_course', 'admission_id', 'course_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_course');
        Schema::dropIfExists('admissions');
    }
};

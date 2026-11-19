<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `tuition_fees`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tuition_fees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_offer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('monthly_aoa');
            $table->string('basis', 8);
            $table->string('academic_year', 9);
            $table->json('source');
            $table->timestamps();
            $table->unique(['institution_id', 'course_offer_id', 'academic_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tuition_fees');
    }
};

<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `programs`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('level', 24);
            $table->unsignedSmallInteger('duration_months');
            $table->json('schedule');
            $table->unsignedInteger('total_cost')->nullable();
            $table->boolean('recognized')->default(false);
            $table->decimal('rating_average', 3, 2)->nullable();
            $table->unsignedInteger('rating_count')->nullable();
            $table->json('image')->nullable();
        });
        ContentSchema::pivot('career_program', 'career_id', 'program_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('career_program');
        Schema::dropIfExists('programs');
    }
};

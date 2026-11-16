<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `course_offers`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_offers', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->json('name');
            $table->string('level', 24)->index();
            $table->string('faculty')->nullable();
            $table->json('recognition')->nullable();
            $table->json('groups');
            $table->unsignedInteger('students')->nullable();
            $table->unsignedInteger('graduates')->nullable();
            $table->string('year', 9)->nullable();
            $table->json('curriculum')->nullable();
            $table->unique(['institution_id', 'course_id', 'level']);
        });
        ContentSchema::pivot('career_course_offer', 'career_id', 'course_offer_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('career_course_offer');
        Schema::dropIfExists('course_offers');
    }
};

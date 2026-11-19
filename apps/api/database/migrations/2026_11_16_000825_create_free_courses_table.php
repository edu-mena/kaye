<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `free_courses`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('free_courses', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('name');
            $table->string('provider');
            $table->json('languages');
            $table->json('areas');
            $table->decimal('hours', 6, 2)->nullable();
            $table->string('certificate', 8)->nullable();
            $table->string('credential')->nullable();
            $table->decimal('price_usd', 8, 2)->nullable();
            $table->string('level', 12);
            $table->string('url', 2048);
            $table->json('sources');
        });
        ContentSchema::pivot('career_free_course', 'career_id', 'free_course_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('career_free_course');
        Schema::dropIfExists('free_courses');
    }
};

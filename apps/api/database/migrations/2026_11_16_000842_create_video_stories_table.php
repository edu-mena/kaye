<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `video_stories`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_stories', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('career_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('role');
            $table->string('company')->nullable();
            $table->json('title');
            $table->string('url', 2048);
            $table->string('platform', 10);
            $table->unsignedSmallInteger('duration_seconds');
            $table->text('thumbnail')->nullable();
            $table->date('consent_at');
            $table->date('recorded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_stories');
    }
};

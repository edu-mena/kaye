<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `ai_tasks` (each research asked to the AI from the panel) and `revisions` (every change proposed by the AI or a
 * person, waiting for approval). See docs/base-de-dados.md, "Painel e IA", and ADR 0027.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_tasks', function (Blueprint $table): void {
            $table->id();
            $table->string('kind', 12)->default('research');
            $table->string('content_type', 32);
            $table->string('target_slug', 191)->nullable();
            $table->text('prompt');
            $table->string('status', 10)->default('queued')->index();
            $table->text('result')->nullable();
            $table->json('sources')->nullable();
            $table->string('model', 48);
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->unsignedSmallInteger('web_searches')->default(0);
            $table->decimal('cost_usd', 8, 4)->default(0);
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable()->index();
            $table->string('error', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('revisions', function (Blueprint $table): void {
            $table->id();
            $table->string('content_type', 32);
            $table->string('revisable_type');
            $table->unsignedBigInteger('revisable_id')->nullable();
            $table->string('slug', 191);
            $table->foreignId('ai_task_id')->nullable()->constrained('ai_tasks')->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('changes');
            $table->json('original')->nullable();
            $table->string('source_url', 2048);
            $table->text('note')->nullable();
            $table->string('status', 10)->default('pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->index(['revisable_type', 'revisable_id']);
            $table->index(['content_type', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revisions');
        Schema::dropIfExists('ai_tasks');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `users.plus_until`, `kurso_completions` and `kurso_question_stats`: see docs/base-de-dados.md (ADR 0025).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('plus_until')->nullable()->after('last_login_at');
        });

        Schema::create('kurso_completions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('course', 120);
            $table->string('topic', 120);
            $table->date('completed_on');
            $table->decimal('score', 4, 3)->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'course', 'topic']);
            $table->index(['user_id', 'completed_on']);
        });

        // No link to the person: only counters.
        Schema::create('kurso_question_stats', function (Blueprint $table): void {
            $table->id();
            $table->string('course', 120);
            $table->string('question_id', 120);
            $table->unsignedInteger('answered')->default(0);
            $table->unsignedInteger('correct')->default(0);
            $table->unique(['course', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kurso_question_stats');
        Schema::dropIfExists('kurso_completions');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('plus_until');
        });
    }
};

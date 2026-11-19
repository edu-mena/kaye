<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `interviews`: the interview practice sent for review. The candidate's contact is encrypted; rows older than
 * 12 months are pruned every day. See docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table): void {
            $table->id();
            $table->string('public_id', 16)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('area', 30)->index();
            $table->string('career_slug', 120)->nullable();
            $table->string('career_name', 120)->nullable();
            $table->string('locale', 5);
            $table->timestamp('started_at');
            $table->text('candidate');
            $table->json('answers');
            $table->string('status', 10)->default('received')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};

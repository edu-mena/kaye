<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `messages`: a notice or the news, by email or push, to an audience. See docs/base-de-dados.md.
 * The deadline reminders are messages too, one per deadline, day and channel (`key`).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 191)->nullable()->unique();
            $table->string('channel', 8);
            $table->string('purpose', 10);
            $table->string('template', 10);
            $table->json('subject');
            $table->json('body');
            $table->string('url', 255)->nullable();
            $table->json('audience');
            $table->string('status', 10)->default('draft')->index();
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};

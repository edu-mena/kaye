<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `message_deliveries`: one person's copy of a message. See docs/base-de-dados.md.
 * `recipient` (`user:7`, `waitlist:3`) is never empty, so the unique key holds: a NULL in a MySQL unique
 * index would let the same message reach the same person twice.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_deliveries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->string('recipient', 32);
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('waitlist_id')->nullable()->constrained('waitlist')->cascadeOnDelete();
            $table->string('channel', 8);
            $table->string('status', 10)->default('queued')->index();
            $table->string('error', 255)->nullable();
            $table->timestamp('sent_at')->nullable()->index();
            $table->timestamps();

            $table->unique(['message_id', 'recipient']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_deliveries');
    }
};

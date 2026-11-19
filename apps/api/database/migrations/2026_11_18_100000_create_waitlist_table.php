<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `waitlist`: the waiting list, moved from the Vercel function and its Upstash Redis. See docs/base-de-dados.md.
 * At least one of email or WhatsApp; each one is on the list once.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlist', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 80)->default('');
            $table->string('email', 120)->nullable()->unique();
            $table->string('whatsapp', 20)->nullable()->unique();
            $table->string('source', 12);
            $table->string('locale', 5);
            $table->timestamp('consent_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist');
    }
};

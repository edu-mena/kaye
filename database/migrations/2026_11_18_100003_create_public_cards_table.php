<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `public_cards`: the public page of a business card (ADR 0014). Only the SHA-256 of the owner's secret is kept.
 * Deleting is final, so the link stops working at once. See docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_cards', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 32)->unique();
            $table->char('secret_hash', 64);
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->json('card');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_cards');
    }
};

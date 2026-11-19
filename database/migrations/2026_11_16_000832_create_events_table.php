<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `events`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('news_id')->unique()->constrained()->cascadeOnDelete();
            $table->date('starts_on')->index();
            $table->date('ends_on')->nullable();
            $table->string('time', 32)->nullable();
            $table->string('venue');
            $table->string('city');
            $table->json('formats');
            $table->boolean('free')->default(false);
            $table->string('price')->nullable();
            $table->string('organizer')->nullable();
            $table->json('register')->nullable();
            $table->boolean('unconfirmed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

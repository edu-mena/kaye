<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `area_memberships` and `area_counters`: see docs/base-de-dados.md (ADR 0025).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('area_memberships', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('area', 32);
            $table->string('level', 16);
            $table->unsignedInteger('pioneer_number')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'area']);
            $table->unique(['area', 'pioneer_number']);
        });

        // The last number given in each area. It only goes up, so a deleted account never frees its number.
        Schema::create('area_counters', function (Blueprint $table): void {
            $table->string('area', 32)->primary();
            $table->unsignedInteger('last_number')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_counters');
        Schema::dropIfExists('area_memberships');
    }
};

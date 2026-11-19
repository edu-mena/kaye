<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `pathways`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pathways', function (Blueprint $table): void {
            ContentSchema::columns($table, uniqueSlug: false);
            $table->foreignId('career_id')->constrained()->cascadeOnDelete();
            $table->json('name');
            $table->json('summary');
            $table->json('steps');
            $table->unsignedInteger('total_cost_min')->nullable();
            $table->unsignedInteger('total_cost_max')->nullable();
            $table->unique(['career_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pathways');
    }
};

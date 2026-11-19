<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `cv_examples`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cv_examples', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('career_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pathway_id')->constrained()->cascadeOnDelete();
            $table->string('seniority', 16);
            $table->string('template', 16);
            $table->json('why');
            $table->json('cv');
            $table->json('notes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cv_examples');
    }
};

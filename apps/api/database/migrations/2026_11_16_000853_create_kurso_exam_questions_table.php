<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `kurso_exam_questions`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kurso_exam_questions', function (Blueprint $table): void {
            ContentSchema::columns($table, uniqueSlug: false);
            $table->foreignId('kurso_id')->constrained()->cascadeOnDelete();
            $table->foreignId('kurso_unit_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 6);
            $table->text('prompt');
            $table->json('options')->nullable();
            $table->unsignedTinyInteger('answer')->nullable();
            $table->json('answers')->nullable();
            $table->unique(['kurso_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kurso_exam_questions');
    }
};

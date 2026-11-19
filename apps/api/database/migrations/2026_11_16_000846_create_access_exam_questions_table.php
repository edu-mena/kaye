<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `access_exam_questions`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_exam_questions', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('subject', 24)->index();
            $table->string('topic', 48)->index();
            $table->string('level', 6)->index();
            $table->text('passage')->nullable();
            $table->text('text');
            $table->json('options');
            $table->unsignedTinyInteger('answer');
            $table->text('explanation');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access_exam_questions');
    }
};

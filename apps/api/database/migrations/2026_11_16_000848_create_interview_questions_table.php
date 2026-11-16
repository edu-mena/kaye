<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `interview_questions`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_questions', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('area', 16)->nullable()->index();
            $table->foreignId('career_id')->nullable()->constrained()->nullOnDelete();
            $table->json('text');
            $table->json('goal');
            $table->json('model');
            $table->json('mistakes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_questions');
    }
};

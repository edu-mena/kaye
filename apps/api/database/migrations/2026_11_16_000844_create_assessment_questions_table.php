<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `assessment_questions`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_questions', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->char('dimension', 1);
            $table->json('text');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_questions');
    }
};

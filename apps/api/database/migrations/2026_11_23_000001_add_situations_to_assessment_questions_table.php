<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The vocational test gets situation questions (ADR 0017): a text and six cards, one per interest. A statement
 * keeps `dimension`; a situation has none, but a `context` and its `options`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessment_questions', function (Blueprint $table): void {
            $table->string('kind', 12)->default('statement')->after('slug');
            $table->string('context', 16)->nullable()->after('kind');
            $table->json('options')->nullable()->after('text');
            $table->char('dimension', 1)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('assessment_questions', function (Blueprint $table): void {
            $table->dropColumn(['kind', 'context', 'options']);
            $table->char('dimension', 1)->nullable(false)->change();
        });
    }
};

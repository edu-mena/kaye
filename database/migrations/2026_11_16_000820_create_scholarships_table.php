<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `scholarships`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholarships', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->json('name');
            $table->string('provider');
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind', 20)->index();
            $table->string('destination', 8);
            $table->json('levels');
            $table->json('areas');
            $table->json('covers');
            $table->unsignedTinyInteger('min_age')->nullable();
            $table->unsignedTinyInteger('max_age')->nullable();
            $table->json('requirements');
            $table->date('deadline')->nullable()->index();
            $table->boolean('recurring')->default(false);
            $table->string('url', 2048);
            $table->json('sources');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};

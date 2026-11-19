<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `internships`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->json('name');
            $table->string('provider');
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind', 24)->index();
            $table->json('areas');
            $table->json('audience');
            $table->unsignedTinyInteger('min_age')->nullable();
            $table->unsignedTinyInteger('max_age')->nullable();
            $table->boolean('paid')->nullable();
            $table->unsignedSmallInteger('duration_months')->nullable();
            $table->string('province', 64)->nullable();
            $table->json('requirements');
            $table->date('deadline')->nullable()->index();
            $table->boolean('recurring')->default(false);
            $table->string('url', 2048);
            $table->json('sources');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};

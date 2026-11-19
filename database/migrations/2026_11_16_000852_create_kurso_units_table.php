<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `kurso_units`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kurso_units', function (Blueprint $table): void {
            ContentSchema::columns($table, uniqueSlug: false);
            $table->foreignId('kurso_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('number');
            $table->string('title');
            $table->text('summary');
            $table->json('outline')->nullable();
            $table->json('content')->nullable();
            $table->unique(['kurso_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kurso_units');
    }
};

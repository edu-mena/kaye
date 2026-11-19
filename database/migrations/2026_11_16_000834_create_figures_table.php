<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `figures`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('figures', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('name');
            $table->json('role');
            $table->json('why');
            $table->json('follow');
            $table->json('source');
            $table->text('photo')->nullable();
        });
        ContentSchema::pivot('career_figure', 'career_id', 'figure_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('career_figure');
        Schema::dropIfExists('figures');
    }
};

<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `support_programs`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_programs', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->json('name');
            $table->json('audience');
            $table->string('provider');
            $table->string('kind', 12);
            $table->unsignedTinyInteger('min_age')->nullable();
            $table->string('url', 2048);
            $table->json('sources');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_programs');
    }
};

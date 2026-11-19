<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `kursos`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kursos', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->json('title');
            $table->json('subtitle');
            $table->json('audience')->nullable();
            $table->string('level', 32)->nullable();
            $table->string('lang', 8)->nullable();
            $table->string('icon', 12);
            $table->string('tone', 12)->nullable();
            $table->json('goals')->nullable();
            $table->json('credits')->nullable();
            $table->boolean('announced')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kursos');
    }
};

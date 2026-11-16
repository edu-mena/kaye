<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `institutions`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('name');
            $table->string('type', 20)->index();
            $table->string('ownership', 8)->nullable()->index();
            $table->string('province', 64)->index();
            $table->string('place');
            $table->json('summary');
            $table->unsignedTinyInteger('min_age')->nullable();
            $table->text('logo')->nullable();
            $table->text('banner')->nullable();
            $table->string('website', 2048)->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('maps_url', 2048)->nullable();
            $table->json('social')->nullable();
            $table->json('founded')->nullable();
            $table->json('recognized_by')->nullable();
            $table->json('sources');
            $table->boolean('example')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};

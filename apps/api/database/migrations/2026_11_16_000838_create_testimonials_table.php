<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `testimonials`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('career_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->nullable();
            $table->json('role');
            $table->json('path');
            $table->json('tip');
            $table->string('place')->nullable();
            $table->unsignedSmallInteger('years')->nullable();
            $table->json('source')->nullable();
            $table->boolean('example')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};

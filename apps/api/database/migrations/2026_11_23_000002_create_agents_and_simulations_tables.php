<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `agents` and `simulations`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('name');
            $table->string('role');
            $table->string('area', 20);
            $table->string('verified_by');
            $table->date('verified_at');
            $table->string('company')->nullable();
            $table->text('photo')->nullable();
            $table->date('consent_at');
        });

        Schema::create('simulations', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->foreignId('career_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained()->nullOnDelete();
            $table->json('title');
            $table->json('intro');
            $table->unsignedSmallInteger('minutes');
            $table->json('moments');
            $table->json('asks');
            $table->json('next_steps');
            $table->boolean('example')->default(false);
            $table->json('languages');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulations');
        Schema::dropIfExists('agents');
    }
};

<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `mentors`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentors', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('name');
            $table->string('role');
            $table->string('company')->nullable();
            $table->json('bio');
            $table->json('languages');
            $table->text('photo')->nullable();
            $table->date('consent_at');
            $table->string('availability', 10);
        });
        ContentSchema::pivot('career_mentor', 'career_id', 'mentor_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('career_mentor');
        Schema::dropIfExists('mentors');
    }
};

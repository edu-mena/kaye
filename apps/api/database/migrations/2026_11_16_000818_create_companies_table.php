<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `companies`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->string('name');
            $table->string('sector', 20)->index();
            $table->string('province', 64)->index();
            $table->string('place');
            $table->json('summary');
            $table->text('logo')->nullable();
            $table->text('banner')->nullable();
            $table->string('website', 2048)->nullable();
            $table->boolean('logo_on_dark')->default(false);
            $table->boolean('careers_sourced')->default(false);
            $table->json('groups');
            $table->json('programs');
            $table->json('activities')->nullable();
            $table->json('activities_source')->nullable();
            $table->json('founded')->nullable();
            $table->json('employees')->nullable();
            $table->json('socials')->nullable();
            $table->json('roles')->nullable();
            $table->json('people')->nullable();
            $table->json('sources');
        });
        ContentSchema::pivot('career_company', 'career_id', 'company_id', function (Blueprint $table): void {
            $table->unsignedSmallInteger('position')->default(0);
        });
        ContentSchema::pivot('company_institution', 'company_id', 'institution_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('company_institution');
        Schema::dropIfExists('career_company');
        Schema::dropIfExists('companies');
    }
};

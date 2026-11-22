<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `companies.insights`, `quotes` and `headquarters`: what the company pages show about how to get in, what
 * leaders have said, and where the head office is (Company.insights, .quotes, .headquarters). They are the
 * same in every language. See docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->json('insights')->nullable()->after('people');
            $table->json('quotes')->nullable()->after('insights');
            $table->json('headquarters')->nullable()->after('quotes');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->dropColumn(['insights', 'quotes', 'headquarters']);
        });
    }
};

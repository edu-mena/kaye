<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `news`: see docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table): void {
            ContentSchema::columns($table);
            $table->date('date')->index();
            $table->string('kind', 10)->index();
            $table->json('title');
            $table->json('summary');
            $table->json('body')->nullable();
            $table->json('image')->nullable();
            $table->string('to')->nullable();
            $table->json('source')->nullable();
            $table->boolean('example')->default(false);
        });
        ContentSchema::pivot('career_news', 'career_id', 'news_id');
        ContentSchema::pivot('company_news', 'company_id', 'news_id');
    }

    public function down(): void
    {
        Schema::dropIfExists('company_news');
        Schema::dropIfExists('career_news');
        Schema::dropIfExists('news');
    }
};

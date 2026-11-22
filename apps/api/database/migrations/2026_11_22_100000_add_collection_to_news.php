<?php

use App\Support\ContentSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * News collected from the feeds (`url_hash`, `title_hash` against duplicates), their links to areas and
 * institutions (the filter), the job facts sent by the scrapers and the comments. See docs/base-de-dados.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news', function (Blueprint $table): void {
            $table->char('url_hash', 64)->nullable()->unique();
            $table->char('title_hash', 64)->nullable()->index();
        });
        ContentSchema::pivot('area_news', 'area_id', 'news_id');
        ContentSchema::pivot('institution_news', 'institution_id', 'news_id');

        Schema::create('job_postings', function (Blueprint $table): void {
            $table->id();
            $table->string('external_id', 191)->unique();
            $table->string('source', 40)->index();
            $table->date('date')->index();
            $table->string('url', 2048);
            $table->string('title', 500);
            $table->string('kind', 20)->nullable();
            $table->string('company')->nullable();
            $table->string('province', 64)->nullable();
            $table->string('sector', 40)->nullable();
            $table->string('career', 191)->nullable();
            $table->unsignedSmallInteger('openings')->nullable();
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('subject_type', 12);
            $table->string('subject_id', 191);
            $table->text('body');
            $table->unsignedTinyInteger('reports_count')->default(0);
            $table->timestamp('hidden_at')->nullable();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id', 'hidden_at']);
        });

        Schema::create('comment_reports', function (Blueprint $table): void {
            $table->foreignId('comment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['comment_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_reports');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('job_postings');
        Schema::dropIfExists('institution_news');
        Schema::dropIfExists('area_news');
        Schema::table('news', function (Blueprint $table): void {
            $table->dropColumn(['url_hash', 'title_hash']);
        });
    }
};

<?php

namespace App\Support;

use Closure;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The parts of the content tables that repeat (docs/base-de-dados.md, "Regras comuns"), for the migrations.
 */
final class ContentSchema
{
    /**
     * The columns of every content table. Without $uniqueSlug, the table makes the slug unique together with
     * its parent (pathways, kurso_units, kurso_exam_questions).
     */
    public static function columns(Blueprint $table, bool $uniqueSlug = true): void
    {
        $table->id();
        $slug = $table->string('slug', 191);
        if ($uniqueSlug) {
            $slug->unique();
        }
        $table->string('status', 10)->default('draft')->index();
        $table->string('source_url', 2048)->nullable();
        $table->date('source_checked_at')->nullable();
        $table->boolean('estimated')->default(false);
        $table->unsignedSmallInteger('position')->default(0);
        $table->timestamps();
        $table->softDeletes()->index();
    }

    /**
     * A link table: the two keys (deleted with either side), the composite primary key and any extra columns.
     *
     * @param  (Closure(Blueprint): void)|null  $extra
     */
    public static function pivot(string $name, string $first, string $second, ?Closure $extra = null): void
    {
        Schema::create($name, function (Blueprint $table) use ($first, $second, $extra): void {
            $table->foreignId($first)->constrained()->cascadeOnDelete();
            $table->foreignId($second)->constrained()->cascadeOnDelete();
            if ($extra !== null) {
                $extra($table);
            }
            $table->primary([$first, $second]);
        });
    }
}

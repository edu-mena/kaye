<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\KursoExamQuestionResource;
use App\Http\Resources\KursoResource;
use App\Models\Kurso;
use App\Models\KursoExamQuestion;
use App\Models\KursoUnit;
use App\Support\Catalog;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /kursos (`{kursos, announced}`, without the lessons' text), /kursos/{slug}/units/{unit} (`UnitContent`)
 * and /kursos/{slug}/exam (`ExamQuestion[]`). Each lesson and the exam load only when they are opened.
 */
class KursoController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, function () use ($request): array {
            $kursos = self::published(Kurso::class)->with(['units' => Catalog::published()])->get();

            return [
                'kursos' => KursoResource::collection($kursos->where('announced', false)->values())->resolve($request),
                'announced' => KursoResource::collection($kursos->where('announced', true)->values())->resolve($request),
            ];
        });
    }

    public function unit(Request $request, string $slug, string $unit): Response
    {
        return $this->content->respond($request, function () use ($slug, $unit): ?array {
            $content = self::published(KursoUnit::class)->where('slug', $unit)->whereHas('kurso', self::kurso($slug))->first()?->content;

            return is_array($content) ? $content : null;
        });
    }

    public function exam(Request $request, string $slug): Response
    {
        return $this->content->respond($request, function () use ($slug): ?AnonymousResourceCollection {
            if (! self::published(Kurso::class)->where('slug', $slug)->where('announced', false)->exists()) {
                return null;
            }

            return KursoExamQuestionResource::collection(
                self::published(KursoExamQuestion::class)->whereHas('kurso', self::kurso($slug))->with('unit:id,slug')->get(),
            );
        });
    }

    /**
     * For whereHas: the row belongs to this published Kurso.
     *
     * @return Closure(Builder<Kurso>): void
     */
    private static function kurso(string $slug): Closure
    {
        return function (Builder $query) use ($slug): void {
            $query->where('kursos.slug', $slug);
            Catalog::isPublished()($query);
        };
    }
}

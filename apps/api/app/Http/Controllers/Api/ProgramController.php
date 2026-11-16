<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProgramResource;
use App\Models\Program;
use App\Support\Catalog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /programs?occupation=: the programmes of published institutions.
 */
class ProgramController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => ProgramResource::collection(
            self::ofCareer(self::published(Program::class), self::occupation($request))
                ->whereHas('institution', fn (Builder $query): Builder => $query->published())
                ->whereHas('course', fn (Builder $query): Builder => $query->published())
                ->with(['institution', 'course', ...Catalog::links()])
                ->get(),
        ));
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\FigureResource;
use App\Models\Figure;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /figures: Figuras da semana.
 */
class FigureController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => FigureResource::collection(
            self::published(Figure::class)->with(Catalog::links())->get(),
        ));
    }
}

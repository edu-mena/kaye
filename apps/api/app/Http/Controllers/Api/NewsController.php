<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /news: newest first (the order Novidades keeps in `position`).
 */
class NewsController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => NewsResource::collection(
            self::published(News::class)->orderByDesc('date')->with(['event', ...Catalog::links(), ...Catalog::links('companies'), ...Catalog::links('areas'), ...Catalog::links('institutions')])->get(),
        ));
    }
}

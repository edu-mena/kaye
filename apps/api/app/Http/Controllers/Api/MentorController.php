<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MentorResource;
use App\Models\Mentor;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /mentors: the approved mentors. Until there are accounts the app shows minors only the group sessions.
 */
class MentorController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => MentorResource::collection(
            self::published(Mentor::class)->with(Catalog::links())->get(),
        ));
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\VideoStoryResource;
use App\Models\VideoStory;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /video-stories: "O meu dia como…".
 */
class VideoStoryController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => VideoStoryResource::collection(
            self::published(VideoStory::class)->with('career:id,slug')->get(),
        ));
    }
}

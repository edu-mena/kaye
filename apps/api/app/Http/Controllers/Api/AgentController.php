<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AgentResource;
use App\Models\Agent;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /agents: the Kayé agents approved to write simulations.
 */
class AgentController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => AgentResource::collection(
            self::published(Agent::class)->get(),
        ));
    }
}

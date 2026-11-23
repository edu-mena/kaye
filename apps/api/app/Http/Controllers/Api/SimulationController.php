<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\SimulationResource;
use App\Models\Simulation;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /simulations and /occupations/{slug}/simulations: the working days. The ones written by Kayé while they wait
 * for an agent's review come with `example: true`, and the app shows them marked.
 */
class SimulationController extends PublicController
{
    public function index(Request $request, ?string $slug = null): Response
    {
        return $this->content->respond($request, fn (): mixed => SimulationResource::collection(
            self::ofCareer(self::published(Simulation::class), $slug, 'career')
                ->with(['career:id,slug', 'agent' => Catalog::published()])->get(),
        ));
    }
}

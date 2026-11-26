<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AreaMembership;
use App\Support\Communities;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The communities by area (ADR 0025). The count is public and only from 50 people; the person's own level and
 * pioneer number are theirs. Nothing here ever returns other people. A minor has a level and counts, but gets
 * no number, so no seal.
 */
class AreaCommunityController extends Controller
{
    public function show(string $area): JsonResponse
    {
        abort_unless(in_array($area, Communities::areas(), true), 404);

        return response()->json(['count' => Communities::count($area)]);
    }

    public function mine(Request $request, string $area): JsonResponse
    {
        abort_unless(in_array($area, Communities::areas(), true), 404);
        $membership = AreaMembership::query()->where(['user_id' => MeController::user($request)->getKey(), 'area' => $area])->first();

        return response()->json(self::shape($membership));
    }

    public function update(Request $request, string $area): JsonResponse
    {
        abort_unless(in_array($area, Communities::areas(), true), 404);
        $request->validate(['level' => ['required', Rule::in(Communities::LEVELS)]]);

        return response()->json(self::shape(Communities::join(MeController::user($request), $area, $request->string('level')->value())));
    }

    /** @return array{level: string|null, pioneerNumber: int|null} */
    private static function shape(?AreaMembership $membership): array
    {
        return ['level' => $membership?->level, 'pioneerNumber' => $membership?->pioneer_number];
    }
}

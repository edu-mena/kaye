<?php

namespace App\Http\Resources;

use App\Models\Consent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The signed-in person (`GET /me`): the account and what the server's rules decided. Never the Google id.
 *
 * @property User $resource
 */
class MeResource extends JsonResource
{
    /** No `data` envelope, like every route of the API (docs/arquitetura.md, 6). */
    public static $wrap = null;

    public function __construct(User $user)
    {
        parent::__construct($user);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->resource;

        return [
            'id' => $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'avatarUrl' => $user->avatar_url,
            'birthYear' => $user->birth_year,
            'province' => $user->province,
            'education' => $user->current_education_level,
            'locale' => $user->locale->value,
            'minor' => ! $user->isAdult(),
            'consents' => $user->consents()->active()->oldest('id')->get()
                ->map(fn (Consent $consent): string => $consent->kind->value)->unique()->values()->all(),
        ];
    }
}

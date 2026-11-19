<?php

namespace Database\Factories;

use App\Enums\ConsentKind;
use App\Models\Consent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Consent>
 */
class ConsentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'kind' => ConsentKind::Terms,
            'version' => '2026-11-12',
            'granted_at' => now(),
        ];
    }
}

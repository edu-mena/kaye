<?php

namespace Database\Factories;

use App\Models\AreaMembership;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AreaMembership>
 */
class AreaMembershipFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'area' => fake()->unique()->slug(1),
            'level' => 'member',
            'pioneer_number' => null,
        ];
    }
}

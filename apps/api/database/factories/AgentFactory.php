<?php

namespace Database\Factories;

use App\Models\Agent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Agent>
 */
class AgentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            'area' => 'health',
            'verified_by' => 'Equipa Kayé',
            'verified_at' => fake()->date(),
            'consent_at' => fake()->date(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Career;
use App\Models\Simulation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Simulation>
 */
class SimulationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'career_id' => Career::factory(),
            'title' => ['pt' => fake()->sentence(4)],
            'intro' => ['pt' => fake()->sentence()],
            'minutes' => 8,
            'moments' => ['pt' => [['id' => 'chegada', 'time' => '08:00', 'title' => 'Chegada', 'text' => fake()->sentence()]]],
            'asks' => ['pt' => [fake()->sentence()]],
            'next_steps' => ['pt' => [['kind' => 'course', 'text' => fake()->sentence()]]],
            'example' => true,
            'languages' => ['pt'],
        ];
    }
}

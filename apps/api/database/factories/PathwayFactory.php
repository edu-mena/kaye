<?php

namespace Database\Factories;

use App\Models\Career;
use App\Models\Pathway;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pathway>
 */
class PathwayFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'career_id' => Career::factory(),
            'name' => ['pt' => fake()->words(3, true)],
            'summary' => ['pt' => fake()->sentence()],
            'steps' => ['pt' => []],
        ];
    }
}

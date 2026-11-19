<?php

namespace Database\Factories;

use App\Models\Career;
use App\Models\CareerGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Career>
 */
class CareerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'career_group_id' => CareerGroup::factory(),
            'name' => ['pt' => fake()->jobTitle()],
            'summary' => ['pt' => fake()->sentence()],
            'riasec' => ['R' => 0.5, 'I' => 0.5, 'A' => 0.5, 'S' => 0.5, 'E' => 0.5, 'C' => 0.5],
            'demand' => 'media',
        ];
    }
}

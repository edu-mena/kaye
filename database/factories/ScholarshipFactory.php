<?php

namespace Database\Factories;

use App\Models\Scholarship;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Scholarship>
 */
class ScholarshipFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => ['pt' => fake()->words(3, true)],
            'provider' => fake()->company(),
            'kind' => 'empresa',
            'destination' => 'angola',
            'levels' => [],
            'areas' => [],
            'covers' => [],
            'requirements' => ['pt' => []],
            'url' => fake()->url(),
            'sources' => [],
        ];
    }
}

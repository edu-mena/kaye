<?php

namespace Database\Factories;

use App\Models\Internship;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Internship>
 */
class InternshipFactory extends Factory
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
            'kind' => 'trainee',
            'areas' => [],
            'audience' => [],
            'requirements' => ['pt' => []],
            'url' => fake()->url(),
            'sources' => [],
        ];
    }
}

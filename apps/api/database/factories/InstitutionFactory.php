<?php

namespace Database\Factories;

use App\Models\Institution;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Institution>
 */
class InstitutionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => fake()->company(),
            'type' => 'universidade',
            'province' => 'Luanda',
            'place' => fake()->city(),
            'summary' => ['pt' => fake()->sentence()],
            'sources' => [],
        ];
    }
}

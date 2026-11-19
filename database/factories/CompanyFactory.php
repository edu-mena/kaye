<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => fake()->company(),
            'sector' => 'banca',
            'province' => 'Luanda',
            'place' => fake()->city(),
            'summary' => ['pt' => fake()->sentence()],
            'groups' => [],
            'programs' => ['pt' => []],
            'sources' => [],
        ];
    }
}

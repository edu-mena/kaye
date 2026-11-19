<?php

namespace Database\Factories;

use App\Models\SupportProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportProgram>
 */
class SupportProgramFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => ['pt' => fake()->words(3, true)],
            'audience' => ['pt' => fake()->sentence()],
            'provider' => fake()->company(),
            'kind' => 'formacao',
            'url' => fake()->url(),
            'sources' => [],
        ];
    }
}

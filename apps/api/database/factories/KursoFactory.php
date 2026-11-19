<?php

namespace Database\Factories;

use App\Models\Kurso;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kurso>
 */
class KursoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'title' => ['pt' => fake()->words(3, true)],
            'subtitle' => ['pt' => fake()->sentence()],
            'icon' => 'chart',
        ];
    }
}

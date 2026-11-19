<?php

namespace Database\Factories;

use App\Models\Figure;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Figure>
 */
class FigureFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => fake()->name(),
            'role' => ['pt' => fake()->jobTitle()],
            'why' => ['pt' => fake()->sentence()],
            'follow' => ['label' => 'LinkedIn', 'url' => fake()->url()],
            'source' => ['label' => 'Jornal de Angola', 'url' => fake()->url()],
        ];
    }
}

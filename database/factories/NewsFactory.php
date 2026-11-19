<?php

namespace Database\Factories;

use App\Models\News;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<News>
 */
class NewsFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'date' => fake()->date(),
            'kind' => 'kaye',
            'title' => ['pt' => fake()->sentence()],
            'summary' => ['pt' => fake()->sentence()],
        ];
    }
}

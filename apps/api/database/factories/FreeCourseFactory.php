<?php

namespace Database\Factories;

use App\Models\FreeCourse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FreeCourse>
 */
class FreeCourseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => fake()->words(3, true),
            'provider' => fake()->company(),
            'languages' => ['en'],
            'areas' => [],
            'level' => 'iniciante',
            'url' => fake()->url(),
            'sources' => [],
        ];
    }
}

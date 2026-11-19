<?php

namespace Database\Factories;

use App\Models\Mentor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mentor>
 */
class MentorFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            'bio' => ['pt' => fake()->sentence()],
            'languages' => ['pt'],
            'consent_at' => fake()->date(),
            'availability' => 'grupo',
        ];
    }
}

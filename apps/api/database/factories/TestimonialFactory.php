<?php

namespace Database\Factories;

use App\Models\Career;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimonial>
 */
class TestimonialFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'career_id' => Career::factory(),
            'role' => ['pt' => fake()->jobTitle()],
            'path' => ['pt' => fake()->sentence()],
            'tip' => ['pt' => fake()->sentence()],
        ];
    }
}

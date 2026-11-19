<?php

namespace Database\Factories;

use App\Models\Career;
use App\Models\VideoStory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VideoStory>
 */
class VideoStoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'career_id' => Career::factory(),
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            'title' => ['pt' => fake()->sentence()],
            'url' => fake()->url(),
            'platform' => 'youtube',
            'duration_seconds' => 90,
            'consent_at' => fake()->date(),
            'recorded_at' => fake()->date(),
        ];
    }
}

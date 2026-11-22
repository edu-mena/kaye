<?php

namespace Database\Factories;

use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobPosting>
 */
class JobPostingFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'external_id' => 'angovagas:'.fake()->unique()->numberBetween(1, 999_999),
            'source' => 'angovagas',
            'date' => fake()->date(),
            'url' => fake()->url(),
            'title' => fake()->jobTitle(),
        ];
    }
}

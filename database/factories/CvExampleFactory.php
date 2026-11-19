<?php

namespace Database\Factories;

use App\Models\Career;
use App\Models\CvExample;
use App\Models\Pathway;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CvExample>
 */
class CvExampleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'career_id' => Career::factory(),
            'pathway_id' => Pathway::factory(),
            'seniority' => 'junior',
            'template' => 'europeu',
            'why' => ['pt' => fake()->sentence()],
            'cv' => ['pt' => []],
            'notes' => ['pt' => []],
        ];
    }
}

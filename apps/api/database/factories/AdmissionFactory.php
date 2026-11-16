<?php

namespace Database\Factories;

use App\Models\Admission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Admission>
 */
class AdmissionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'academic_year' => '2026/27',
            'exam_dates' => [],
            'subjects' => ['pt' => []],
            'requirements' => ['pt' => []],
            'url' => fake()->url(),
            'sources' => [],
        ];
    }
}

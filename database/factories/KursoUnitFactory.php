<?php

namespace Database\Factories;

use App\Models\Kurso;
use App\Models\KursoUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KursoUnit>
 */
class KursoUnitFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'kurso_id' => Kurso::factory(),
            'number' => 1,
            'title' => fake()->words(3, true),
            'summary' => fake()->sentence(),
        ];
    }
}

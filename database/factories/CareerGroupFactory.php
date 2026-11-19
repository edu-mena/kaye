<?php

namespace Database\Factories;

use App\Models\Area;
use App\Models\CareerGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CareerGroup>
 */
class CareerGroupFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'area_id' => Area::factory(),
            'name' => ['pt' => fake()->words(3, true)],
        ];
    }
}

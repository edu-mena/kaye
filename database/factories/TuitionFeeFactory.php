<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\TuitionFee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TuitionFee>
 */
class TuitionFeeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'institution_id' => Institution::factory(),
            'monthly_aoa' => 45000,
            'basis' => 'average',
            'academic_year' => '2025/26',
            'source' => ['label' => 'Expansão', 'url' => fake()->url()],
        ];
    }
}

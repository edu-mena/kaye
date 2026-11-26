<?php

namespace Database\Factories;

use App\Models\AiTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiTask>
 */
class AiTaskFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_type' => 'institution',
            'prompt' => 'Completa os contactos das universidades de Luanda.',
            'model' => 'claude-sonnet-5-5',
        ];
    }
}

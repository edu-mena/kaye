<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserData>
 */
class UserDataFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'data' => '{"version":1,"savedCareers":[]}',
            'version' => 1,
            'schema_version' => 1,
        ];
    }
}

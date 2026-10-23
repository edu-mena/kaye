<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->isLocal()) {
            // Local admin for /admin (email: admin@kaye.test, password: password).
            User::factory()->admin()->create([
                'name' => 'Admin Kayé',
                'email' => 'admin@kaye.test',
                'google_sub' => null,
            ]);
        }
    }
}

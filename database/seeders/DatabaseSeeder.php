<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // The catalogue, from the frontend's export (the same command as in production).
        if (Artisan::call('kaye:import') !== 0) {
            throw new RuntimeException('kaye:import failed: '.Artisan::output());
        }

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

<?php

namespace Database\Seeders;

use App\Enums\StaffRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Config;
use RuntimeException;

/**
 * The panel's account for the end-to-end tests (apps/web/e2e/admin.spec.ts): an admin with a known password and
 * second factor, from E2E_ADMIN_* (config/kaye.php). Without them it refuses: production never has them.
 */
class E2eAdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Config::array('kaye.e2e_admin');
        $email = is_string($admin['email'] ?? null) ? $admin['email'] : '';
        $password = is_string($admin['password'] ?? null) ? $admin['password'] : '';
        $secret = is_string($admin['totp_secret'] ?? null) ? $admin['totp_secret'] : '';
        if ($email === '' || strlen($password) < 12 || strlen($secret) < 16) {
            throw new RuntimeException('E2E_ADMIN_PASSWORD (12+ characters) and E2E_ADMIN_TOTP_SECRET are only for the E2E stacks.');
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => 'Admin E2E',
            'password' => $password,
            'app_authentication_secret' => $secret,
            'google_sub' => null,
        ])->save();
        $user->syncRoles([StaffRole::Admin->value]);
    }
}

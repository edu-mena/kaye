<?php

use App\Support\StaffRoles;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The team's roles move to spatie/laravel-permission (docs/seguranca.md, "Papéis e permissões"): `admin` stays
 * admin, `moderator` becomes `reviewer`, and `users.role` goes. The panel's second factor (TOTP) gets its columns,
 * both encrypted with the APP_KEY by the model.
 */
return new class extends Migration
{
    public function up(): void
    {
        StaffRoles::sync();

        $roles = DB::table('roles')->where('guard_name', 'web')->pluck('id', 'name');
        $map = ['admin' => $roles['admin'], 'moderator' => $roles['reviewer']];
        foreach (DB::table('users')->whereIn('role', array_keys($map))->get(['id', 'role']) as $user) {
            $role = $user->role === 'admin' ? $map['admin'] : $map['moderator'];
            DB::table('model_has_roles')->insertOrIgnore([
                'role_id' => $role,
                'model_type' => 'App\Models\User',
                'model_id' => $user->id,
            ]);
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
            $table->text('app_authentication_secret')->nullable();
            $table->text('app_authentication_recovery_codes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 16)->default('user')->index();
            $table->dropColumn(['app_authentication_secret', 'app_authentication_recovery_codes']);
        });
    }
};

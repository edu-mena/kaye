<?php

namespace App\Support;

use App\Enums\StaffPermission;
use App\Enums\StaffRole;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Writes the roles and permissions of `StaffRole` to the database, exactly: a permission taken out of a role in
 * the code is taken out in the database too. Idempotent; run by a migration on each deploy that changes them.
 */
final class StaffRoles
{
    public static function sync(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (StaffPermission::cases() as $permission) {
            Permission::findOrCreate($permission->value, 'web');
        }
        Permission::query()->where('guard_name', 'web')->whereNotIn('name', StaffPermission::values())->delete();

        foreach (StaffRole::cases() as $staffRole) {
            Role::findOrCreate($staffRole->value, 'web')->syncPermissions(
                array_map(fn (StaffPermission $permission): string => $permission->value, $staffRole->permissions()),
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}

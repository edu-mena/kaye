<?php

namespace App\Policies;

use App\Enums\StaffPermission;
use App\Models\User;

/**
 * Accounts in the panel: only admins see them, give roles or close an account, and never their own (nobody locks
 * themselves out by mistake, nor raises their own rights).
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(StaffPermission::StaffManage->value);
    }

    public function view(User $user, User $account): bool
    {
        return $user->is($account) || $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, User $account): bool
    {
        return $this->viewAny($user) && ! $user->is($account);
    }

    public function delete(User $user, User $account): bool
    {
        return $this->update($user, $account);
    }
}

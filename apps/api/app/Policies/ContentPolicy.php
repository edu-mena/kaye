<?php

namespace App\Policies;

use App\Enums\StaffPermission;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * The catalogue in the panel: editors write, reviewers publish, only admins delete. The public API never asks
 * this policy: it shows the published rows to everyone.
 */
class ContentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(StaffPermission::ContentView->value);
    }

    public function view(User $user, Model $record): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can(StaffPermission::ContentEdit->value);
    }

    public function update(User $user, Model $record): bool
    {
        return $this->create($user);
    }

    public function publish(User $user, Model $record): bool
    {
        return $user->can(StaffPermission::ContentPublish->value);
    }

    public function delete(User $user, Model $record): bool
    {
        return $this->deleteAny($user);
    }

    public function deleteAny(User $user): bool
    {
        return $user->can(StaffPermission::ContentDelete->value);
    }

    public function restore(User $user, Model $record): bool
    {
        return $this->deleteAny($user);
    }

    public function forceDelete(User $user, Model $record): bool
    {
        return $this->deleteAny($user);
    }
}

<?php

namespace App\Policies;

use App\Enums\StaffPermission;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Rows about one person (waiting list, feedback, interviews, consents, the app's data). Only who may see personal
 * data opens them, and nobody writes them in the panel: they come from the person, who changes them.
 */
class PersonalDataPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(StaffPermission::PeopleView->value);
    }

    public function view(User $user, Model $record): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Model $record): bool
    {
        return false;
    }

    /** Spam on the waiting list, for example. */
    public function delete(User $user, Model $record): bool
    {
        return $this->viewAny($user);
    }

    public function deleteAny(User $user): bool
    {
        return $this->viewAny($user);
    }

    /** The CSV download. */
    public function export(User $user): bool
    {
        return $user->can(StaffPermission::PeopleExport->value);
    }
}

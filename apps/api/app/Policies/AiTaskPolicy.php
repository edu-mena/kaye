<?php

namespace App\Policies;

use App\Enums\StaffPermission;
use App\Models\AiTask;
use App\Models\User;

/**
 * "Pesquisar com IA": whoever writes content asks for a research; the content team sees the tasks and their cost.
 */
class AiTaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(StaffPermission::ContentView->value);
    }

    public function view(User $user, AiTask $task): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can(StaffPermission::ContentEdit->value);
    }

    public function update(User $user, AiTask $task): bool
    {
        return false;
    }

    public function delete(User $user, AiTask $task): bool
    {
        return false;
    }
}

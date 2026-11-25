<?php

namespace App\Policies;

use App\Enums\StaffPermission;
use App\Models\Revision;
use App\Models\User;

/**
 * Proposed changes: everyone in the content team reads them; editors (and the AI on their behalf) propose; only
 * reviewers approve or reject, never their own (`App\Support\Revisions`). Nobody edits a proposal in place.
 */
class RevisionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(StaffPermission::ContentView->value);
    }

    public function view(User $user, Revision $revision): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->can(StaffPermission::ContentEdit->value);
    }

    public function update(User $user, Revision $revision): bool
    {
        return false;
    }

    public function delete(User $user, Revision $revision): bool
    {
        return false;
    }

    public function review(User $user, Revision $revision): bool
    {
        return $user->can(StaffPermission::ContentPublish->value) && $revision->author_id !== $user->id;
    }
}

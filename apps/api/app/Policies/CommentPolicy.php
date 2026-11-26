<?php

namespace App\Policies;

use App\Enums\StaffPermission;
use App\Models\Comment;
use App\Models\User;

/**
 * Comments: anyone signed in writes; the author deletes their own; moderators see and hide the others.
 */
class CommentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(StaffPermission::CommentsModerate->value);
    }

    public function view(User $user, Comment $comment): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    /** Hiding and showing again: the text itself never changes. */
    public function update(User $user, Comment $comment): bool
    {
        return $this->viewAny($user);
    }

    public function delete(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->getKey() || $this->viewAny($user);
    }
}

<?php

namespace App\Policies;

use App\Enums\MessageStatus;
use App\Enums\StaffPermission;
use App\Models\Message;
use App\Models\User;

/**
 * Emails and push: editors write drafts, only admins send; what went out never changes.
 */
class MessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(StaffPermission::MessagesManage->value);
    }

    public function view(User $user, Message $message): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, Message $message): bool
    {
        return $this->viewAny($user) && $message->status === MessageStatus::Draft;
    }

    public function delete(User $user, Message $message): bool
    {
        return $this->update($user, $message);
    }

    public function send(User $user, Message $message): bool
    {
        return $user->can(StaffPermission::MessagesSend->value) && $message->status === MessageStatus::Draft;
    }
}

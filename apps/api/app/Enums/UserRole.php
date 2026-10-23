<?php

namespace App\Enums;

enum UserRole: string
{
    case User = 'user';
    case Moderator = 'moderator';
    case Admin = 'admin';

    /**
     * Moderators and admins use the Filament panel (curation and moderation).
     */
    public function canAccessAdmin(): bool
    {
        return $this !== self::User;
    }
}

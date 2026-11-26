<?php

namespace App\Enums;

use App\Enums\StaffPermission as P;

/**
 * The team's roles (docs/seguranca.md, "Papéis e permissões"). A role alone does not open the panel: the email
 * must also be in ADMIN_EMAILS, and the second factor (TOTP) is required.
 */
enum StaffRole: string
{
    /** Everything, including roles, personal data and the audit log. */
    case Admin = 'admin';
    /** Writes content and messages; cannot publish, send or see personal data. */
    case Editor = 'editor';
    /** Reviews: publishes content and moderates comments; cannot change the text. */
    case Reviewer = 'reviewer';

    /**
     * @return list<P>
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Admin => P::cases(),
            self::Editor => [P::ContentView, P::ContentEdit, P::MessagesManage],
            self::Reviewer => [P::ContentView, P::ContentPublish, P::CommentsModerate],
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

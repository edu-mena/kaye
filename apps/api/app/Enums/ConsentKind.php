<?php

namespace App\Enums;

/**
 * What a person can consent to (`consents.kind`, docs/base-de-dados.md).
 */
enum ConsentKind: string
{
    case Terms = 'terms';
    case Privacy = 'privacy';
    case GuardianInformed = 'guardian_informed';
    case EmailService = 'email_service';
    case EmailMarketing = 'email_marketing';
    case WhatsappMarketing = 'whatsapp_marketing';
    case Push = 'push';

    /** Marketing never reaches a minor, nor anyone whose age is unknown. */
    public function isMarketing(): bool
    {
        return in_array($this, [self::EmailMarketing, self::WhatsappMarketing], true);
    }
}

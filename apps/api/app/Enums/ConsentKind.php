<?php

namespace App\Enums;

/**
 * What a person can consent to (`consents.kind`, docs/base-de-dados.md). The notices are one consent per
 * channel and purpose: service (the deadlines they saved) or marketing (the news).
 */
enum ConsentKind: string
{
    case Terms = 'terms';
    case Privacy = 'privacy';
    case GuardianInformed = 'guardian_informed';
    case EmailService = 'email_service';
    case EmailMarketing = 'email_marketing';
    case WhatsappMarketing = 'whatsapp_marketing';
    case PushService = 'push_service';
    case PushMarketing = 'push_marketing';
    /** To be counted in the numbers of an area's community (ADR 0025). Not marketing: a minor may give it. */
    case CommunityCount = 'community_count';

    /** The consent a message on this channel and with this purpose needs. */
    public static function for(MessageChannel $channel, MessagePurpose $purpose): self
    {
        return match ($channel) {
            MessageChannel::Email => $purpose === MessagePurpose::Marketing ? self::EmailMarketing : self::EmailService,
            MessageChannel::Push => $purpose === MessagePurpose::Marketing ? self::PushMarketing : self::PushService,
        };
    }

    /** Marketing never reaches a minor, nor anyone whose age is unknown. */
    public function isMarketing(): bool
    {
        return in_array($this, [self::EmailMarketing, self::WhatsappMarketing, self::PushMarketing], true);
    }

    public function isPush(): bool
    {
        return in_array($this, [self::PushService, self::PushMarketing], true);
    }

    public function isEmail(): bool
    {
        return in_array($this, [self::EmailService, self::EmailMarketing], true);
    }
}

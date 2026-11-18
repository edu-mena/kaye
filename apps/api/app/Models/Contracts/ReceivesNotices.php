<?php

namespace App\Models\Contracts;

/**
 * Someone a notice can reach: a person with an account, or someone who is only on the waiting list.
 */
interface ReceivesNotices
{
    /** `user:7` or `waitlist:3`: who a delivery is for (`message_deliveries.recipient`). */
    public function noticeRecipient(): string;

    public function noticeEmail(): ?string;

    public function noticeLocale(): string;

    /** Known to be 18 or older; marketing fails closed without it. */
    public function canReceiveMarketing(): bool;
}

<?php

namespace App\Enums;

/**
 * One person's copy of a message (`message_deliveries.status`). `skipped`: when its turn came the person no
 * longer had the consent, the channel or the age it needs.
 */
enum DeliveryStatus: string
{
    case Queued = 'queued';
    case Sent = 'sent';
    case Failed = 'failed';
    case Skipped = 'skipped';
}

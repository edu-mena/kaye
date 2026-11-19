<?php

namespace App\Enums;

/**
 * Where a message is (`messages.status`): written, going out in batches, or done.
 */
enum MessageStatus: string
{
    case Draft = 'draft';
    case Sending = 'sending';
    case Sent = 'sent';
}

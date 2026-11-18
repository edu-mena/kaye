<?php

namespace App\Enums;

/**
 * How a message reaches the person (`messages.channel`). WhatsApp is sent by hand for now (docs/roadmap.md).
 */
enum MessageChannel: string
{
    case Email = 'email';
    case Push = 'push';
}

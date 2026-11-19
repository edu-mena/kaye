<?php

namespace App\Enums;

/**
 * Why a message is sent (`messages.purpose`): a service notice the person asked for, or news (marketing),
 * which never reaches a minor nor anyone whose age is unknown.
 */
enum MessagePurpose: string
{
    case Service = 'service';
    case Marketing = 'marketing';
}

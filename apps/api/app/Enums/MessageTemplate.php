<?php

namespace App\Enums;

/**
 * What a message says (`messages.template`): a notice written in the panel, the weekly digest of the news,
 * or a saved deadline coming up (sent by the scheduler, never by hand).
 */
enum MessageTemplate: string
{
    case Notice = 'notice';
    case Digest = 'digest';
    case Deadline = 'deadline';
}

<?php

namespace App\Enums;

/**
 * A proposed change (`revisions.status`): it waits for a person, who applies it or turns it down.
 */
enum RevisionStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
}

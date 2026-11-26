<?php

namespace App\Enums;

/**
 * A change to a catalogue row (`revisions.status`). A proposal waits for a person, who applies it or turns it
 * down; a change saved in the panel is applied at once and kept as `edited` (ADR 0028).
 */
enum RevisionStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Edited = 'edited';

    /**
     * The changes that are in the row: `kaye:import` no longer writes their columns or links.
     *
     * @return list<string>
     */
    public static function applied(): array
    {
        return [self::Approved->value, self::Edited->value];
    }
}

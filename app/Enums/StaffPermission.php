<?php

namespace App\Enums;

/**
 * What the team can do in the panel (spatie/laravel-permission). Each staff role has a fixed set
 * (`StaffRole::permissions()`); nobody gets a permission by hand.
 */
enum StaffPermission: string
{
    /** Read the catalogue in the panel, drafts included. */
    case ContentView = 'content.view';
    /** Create and change catalogue rows (they stay drafts until a reviewer publishes). */
    case ContentEdit = 'content.edit';
    /** Publish or unpublish a catalogue row. */
    case ContentPublish = 'content.publish';
    case ContentDelete = 'content.delete';
    /** Hide or delete other people's comments. */
    case CommentsModerate = 'comments.moderate';
    /** Write the messages (email, push) as drafts. */
    case MessagesManage = 'messages.manage';
    /** Send a message to its audience. */
    case MessagesSend = 'messages.send';
    /** See personal data: the waiting list, feedback, interviews, consents. */
    case PeopleView = 'people.view';
    /** Download personal data as CSV. */
    case PeopleExport = 'people.export';
    /** Give and take staff roles, close accounts. */
    case StaffManage = 'staff.manage';
    /** Read the audit log. */
    case AuditView = 'audit.view';
    /** Open Pulse (slow requests, queries, queue). */
    case MonitoringView = 'monitoring.view';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

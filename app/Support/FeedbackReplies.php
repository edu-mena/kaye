<?php

namespace App\Support;

use App\Enums\ConsentKind;
use App\Mail\FeedbackReply;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

/**
 * The team's answer to a critique, by email (the "Responder" action in the panel). Only to someone signed in
 * when they wrote, who accepts service emails; the feedback is then done.
 */
final class FeedbackReplies
{
    public static function canReply(Feedback $feedback): bool
    {
        $user = $feedback->user;

        return $user instanceof User && Consents::has($user, ConsentKind::EmailService);
    }

    public static function send(Feedback $feedback, string $reply): bool
    {
        $user = $feedback->user;
        if (! $user instanceof User || ! self::canReply($feedback) || trim($reply) === '') {
            return false;
        }

        Mail::to($user->email)->queue(new FeedbackReply($user, $feedback, trim($reply)));
        $feedback->update(['status' => 'done']);

        return true;
    }
}

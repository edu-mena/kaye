<?php

namespace App\Messaging;

use App\Enums\ConsentKind;
use App\Enums\MessageChannel;
use App\Enums\MessagePurpose;
use App\Models\Message;
use App\Models\User;
use App\Models\WaitlistEntry;
use App\Support\Consents;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * Who a message may reach (docs/seguranca.md, "Avisos"): the consent of its channel and purpose in force, the
 * audience's provinces and areas, a browser subscribed for push, and, for news, only people known to be 18 or
 * older. The waiting list gets service emails only, after its double opt-in. Not yet given this message.
 */
final class Audience
{
    /**
     * @return Builder<User>
     */
    public static function users(Message $message): Builder
    {
        $kind = ConsentKind::for($message->channel, $message->purpose);
        $audience = $message->audience;

        return User::query()
            ->whereHas('consents', fn (Builder $query) => Consents::inForce($query, $kind, false))
            ->when($message->purpose === MessagePurpose::Marketing, fn (Builder $query) => $query
                ->whereNotNull('birth_year')
                ->where('birth_year', '<=', (int) now()->year - User::ADULT_AGE))
            ->when($message->channel === MessageChannel::Push, fn (Builder $query) => $query->has('pushSubscriptions'))
            ->when($message->channel === MessageChannel::Email, fn (Builder $query) => $query->whereNotNull('email'))
            ->when(isset($audience['users']), fn (Builder $query) => $query->whereIn('id', $audience['users'] ?? []))
            ->when(($audience['provinces'] ?? []) !== [], fn (Builder $query) => $query->whereIn('province', $audience['provinces'] ?? []))
            ->when(($audience['areas'] ?? []) !== [], fn (Builder $query) => $query->whereHas('userData', function (Builder $data) use ($audience): void {
                $data->where(function (Builder $any) use ($audience): void {
                    foreach ($audience['areas'] ?? [] as $area) {
                        $any->orWhereJsonContains('data->subscriptions->areas', $area);
                    }
                });
            }))
            ->whereDoesntHave('deliveries', fn (Builder $query) => $query->where('message_id', $message->id));
    }

    /**
     * @return Builder<WaitlistEntry>
     */
    public static function waitlist(Message $message): Builder
    {
        $audience = $message->audience;
        $reaches = ($audience['waitlist'] ?? false) === true
            && $message->channel === MessageChannel::Email
            && $message->purpose === MessagePurpose::Service
            && ! isset($audience['users'])
            // The list has no province nor areas: a message for some of them is not for it.
            && ($audience['provinces'] ?? []) === [] && ($audience['areas'] ?? []) === [];

        return WaitlistEntry::query()
            ->when(! $reaches, fn (Builder $query) => $query->whereRaw('1 = 0'))
            ->whereNotNull('email')
            ->whereHas('consents', fn (Builder $query) => Consents::inForce($query, ConsentKind::EmailService, true))
            ->whereNotExists(fn (QueryBuilder $query) => $query->from('message_deliveries')
                ->whereColumn('message_deliveries.waitlist_id', 'waitlist.id')
                ->where('message_deliveries.message_id', $message->id));
    }
}

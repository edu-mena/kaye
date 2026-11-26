<?php

namespace App\Support;

use App\Http\Resources\MeResource;
use App\Models\AreaMembership;
use App\Models\Comment;
use App\Models\Consent;
use App\Models\KursoCompletion;
use App\Models\MessageDelivery;
use App\Models\User;
use App\Models\UserData;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use NotificationChannels\WebPush\PushSubscription;
use stdClass;

/**
 * The accounts: who a Google login belongs to, the profile columns the server needs, the export and
 * the deletion (Lei n.º 22/11). docs/arquitetura.md, 5.1.
 */
class Accounts
{
    /**
     * The person behind a Google account. A local account with the same verified email (the admin)
     * is linked to it; a soft-deleted account does not come back by signing in.
     *
     * @param  array{sub: string, email: string, name: string, picture: ?string}  $google
     *
     * @throws AuthorizationException
     */
    public function fromGoogle(array $google): User
    {
        $email = Str::lower($google['email']);
        $user = User::withTrashed()->where('google_sub', $google['sub'])->first()
            ?? User::withTrashed()->whereNull('google_sub')->where('email', $email)->first()
            ?? new User(['name' => $google['name'], 'email' => $email]);

        if ($user->trashed()) {
            throw new AuthorizationException('This account was closed.');
        }

        $user->google_sub = $google['sub'];
        $user->email = $email;
        $user->avatar_url = $google['picture'];
        $user->last_login_at = now();
        $user->save();

        return $user;
    }

    /**
     * The profile in the app's data is the source of the columns the server's rules use (the birth
     * year decides who is a minor). Becoming a minor withdraws any marketing consent.
     */
    public function syncProfile(User $user, stdClass $document): void
    {
        $profile = $document->profile ?? null;
        if (! $profile instanceof stdClass) {
            return;
        }

        $year = (int) now()->year;
        $birthYear = $profile->birthYear ?? null;
        if (is_int($birthYear) && $birthYear >= 1900 && $birthYear >= $year - 100 && $birthYear <= $year) {
            $user->birth_year = $birthYear;
        }
        if (is_string($profile->province ?? null)) {
            $user->province = Str::limit($profile->province, 64, '');
        }
        if (is_string($profile->education ?? null)) {
            $user->current_education_level = Str::limit($profile->education, 32, '');
        }
        $user->save();

        if (! $user->canReceiveMarketing()) {
            $this->revokeMarketing($user);
        }
    }

    public function revokeMarketing(User $user): void
    {
        $user->consents()->active()->get()
            ->filter(fn (Consent $consent): bool => $consent->kind->isMarketing())
            ->each(fn (Consent $consent): bool => $consent->update(['revoked_at' => now()]));
    }

    /**
     * Everything the server keeps about the person, in one JSON document.
     *
     * @return array<string, mixed>
     */
    public function export(User $user): array
    {
        $data = $user->userData;

        return [
            'exportedAt' => now()->toIso8601String(),
            'account' => [
                ...(new MeResource($user))->resolve(),
                'createdAt' => $user->created_at?->toIso8601String(),
                'lastLoginAt' => $user->last_login_at?->toIso8601String(),
            ],
            'data' => $data instanceof UserData ? $data->document() : null,
            'consents' => $user->consents()->oldest('id')->get()->map(fn (Consent $consent): array => [
                'kind' => $consent->kind->value,
                'version' => $consent->version,
                'grantedAt' => $consent->granted_at->toIso8601String(),
                'source' => $consent->source,
                'ipPrefix' => $consent->ip_prefix,
                'revokedAt' => $consent->revoked_at?->toIso8601String(),
            ])->all(),
            'pushSubscriptions' => $user->pushSubscriptions()->oldest('id')->get()->map(fn (PushSubscription $subscription): array => [
                'endpoint' => $subscription->endpoint,
                'createdAt' => $subscription->created_at?->toIso8601String(),
            ])->all(),
            'deliveries' => $user->deliveries()->with('message')->oldest('id')->get()->map(fn (MessageDelivery $delivery): array => [
                'channel' => $delivery->channel->value,
                'subject' => $delivery->message->text('subject', $user->noticeLocale()),
                'status' => $delivery->status->value,
                'sentAt' => $delivery->sent_at?->toIso8601String(),
            ])->all(),
            'kursoCompletions' => KursoCompletion::query()->where('user_id', $user->getKey())->oldest('id')->get()->map(fn (KursoCompletion $done): array => [
                'course' => $done->course,
                'topic' => $done->topic,
                'completedOn' => $done->completed_on->toDateString(),
                'score' => $done->score,
            ])->all(),
            'communities' => AreaMembership::query()->where('user_id', $user->getKey())->oldest('id')->get()->map(fn (AreaMembership $membership): array => [
                'area' => $membership->area,
                'level' => $membership->level,
                'pioneerNumber' => $membership->pioneer_number,
            ])->all(),
            'comments' => Comment::query()->where('user_id', $user->getKey())->oldest('id')->get()->map(fn (Comment $comment): array => [
                'on' => $comment->subject_type.':'.$comment->subject_id,
                'text' => $comment->body,
                'at' => $comment->created_at->toIso8601String(),
                'hidden' => $comment->hidden_at !== null,
            ])->all(),
            'devices' => $user->tokens()->oldest('id')->get()->map(fn ($token): array => [
                'name' => $token->name,
                'createdAt' => $token->created_at?->toIso8601String(),
                'lastUsedAt' => $token->last_used_at?->toIso8601String(),
                'expiresAt' => $token->expires_at?->toIso8601String(),
            ])->all(),
        ];
    }

    /**
     * Deletes the person and everything that is theirs: data, consents, devices and web sessions.
     * Not a soft delete: nothing stays behind.
     */
    public function delete(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $user->tokens()->delete();
            DB::table('sessions')->where('user_id', $user->getKey())->delete();
            $user->userData()->delete();
            $user->consents()->delete();
            // The anonymous counters of kurso_question_stats stay: they never pointed at the person.
            KursoCompletion::query()->where('user_id', $user->getKey())->delete();
            // The membership goes; `area_counters` stays, so the pioneer number is never given again.
            AreaMembership::query()->where('user_id', $user->getKey())->delete();
            Comment::query()->where('user_id', $user->getKey())->delete();
            DB::table('comment_reports')->where('user_id', $user->getKey())->delete();
            // A morph relation: no foreign key deletes them by itself.
            $user->pushSubscriptions()->delete();
            AuditLog::forget($user);
            $user->forceDelete();
        });
    }
}

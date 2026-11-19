<?php

namespace App\Messaging;

use App\Enums\Locale;
use App\Enums\MessageChannel;
use App\Enums\MessagePurpose;
use App\Enums\MessageStatus;
use App\Enums\MessageTemplate;
use App\Models\Admission;
use App\Models\Internship;
use App\Models\Message;
use App\Models\Scholarship;
use App\Models\UserData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

/**
 * The reminders of the deadlines people saved with "Lembrar-me" (`remindedDeadlines` in their data), a few
 * days before they close (`php artisan kaye:deadline-reminders`, daily). The ids are the app's (domain/
 * deadlines.ts): a scholarship's or internship's slug, `<admission>-acesso` and `<admission>-exame-<n>`.
 *
 * One message per deadline, day and channel (`messages.key`), for everyone who saved it; Sender sends them in
 * batches, each to whoever has the service consent of that channel. A service notice: minors get it too.
 */
final class DeadlineReminders
{
    /**
     * @return int How many deadlines got a reminder.
     */
    public function run(): int
    {
        $date = now()->startOfDay()->addDays(Config::integer('kaye.notices.reminder_days'));
        $reminded = 0;
        foreach ($this->deadlinesOn($date) as $id => $title) {
            $users = UserData::query()->whereJsonContains('data->remindedDeadlines', $id)->pluck('user_id')->map(fn (mixed $user): int => is_numeric($user) ? (int) $user : 0)->values()->all();
            $users = array_values($users);
            if ($users === []) {
                continue;
            }
            foreach (MessageChannel::cases() as $channel) {
                $this->remind($id, $title, $date, $channel, $users);
            }
            $reminded++;
        }

        return $reminded;
    }

    /**
     * @param  array<string, string>  $title  By locale.
     * @param  list<int>  $users
     */
    private function remind(string $id, array $title, Carbon $date, MessageChannel $channel, array $users): void
    {
        $days = Config::integer('kaye.notices.reminder_days');
        $subject = [];
        $body = [];
        foreach (Locale::cases() as $locale) {
            $name = $title[$locale->value] ?? $title['pt'] ?? '';
            $localised = $date->copy();
            $localised->locale($locale->value);
            $day = $localised->isoFormat('LL');
            $subject[$locale->value] = __('notices.deadline.subject', ['days' => $days, 'title' => $name], $locale->value);
            $body[$locale->value] = __('notices.deadline.body', ['title' => $name, 'date' => $day], $locale->value);
        }

        $message = Message::query()->firstOrCreate(
            ['key' => "deadline:{$id}:{$date->toDateString()}:{$channel->value}"],
            [
                'channel' => $channel,
                'purpose' => MessagePurpose::Service,
                'template' => MessageTemplate::Deadline,
                'subject' => $subject,
                'body' => $body,
                'url' => '/prazos',
                'audience' => ['users' => $users],
                'status' => MessageStatus::Sending,
            ],
        );
        if (! $message->wasRecentlyCreated) {
            // Run again the same day: whoever saved it since joins; whoever got it already is not sent it again.
            $message->update([
                'audience' => ['users' => array_values(array_unique([...$message->audience['users'] ?? [], ...$users]))],
                'status' => MessageStatus::Sending,
            ]);
        }
    }

    /**
     * The published deadlines on that day, by the app's id, with their title in each language.
     *
     * @return array<string, array<string, string>>
     */
    private function deadlinesOn(Carbon $date): array
    {
        $day = $date->toDateString();
        $found = [];
        foreach ([Scholarship::class, Internship::class] as $model) {
            /** @var Builder<Scholarship|Internship> $query */
            $query = $model::query();
            foreach ($query->published()->whereDate('deadline', $day)->get() as $item) {
                $found[$item->slug] = self::translations($item, 'name');
            }
        }

        foreach (Admission::query()->published()->with('institution')->get() as $admission) {
            $name = $admission->institution !== null ? $admission->institution->name : 'MESCTI';
            $title = ['pt' => $name];
            if ($admission->registration_end?->toDateString() === $day) {
                $found["{$admission->slug}-acesso"] = $title;
            }
            foreach (array_values($admission->exam_dates) as $index => $exam) {
                if ($exam === $day) {
                    $found["{$admission->slug}-exame-{$index}"] = $title;
                }
            }
        }

        return $found;
    }

    /**
     * @return array<string, string>
     */
    private static function translations(Model $item, string $field): array
    {
        $values = method_exists($item, 'getTranslations') ? $item->getTranslations($field) : [];

        $texts = [];
        foreach (is_array($values) ? $values : [] as $locale => $value) {
            if (is_string($locale) && is_string($value)) {
                $texts[$locale] = $value;
            }
        }

        return $texts;
    }
}

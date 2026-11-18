<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Enums\DeliveryStatus;
use App\Enums\MessageStatus;
use App\Jobs\SendDelivery;
use App\Mail\MessageMail;
use App\Models\Message;
use App\Models\MessageDelivery;
use App\Models\News;
use App\Models\User;
use App\Models\UserData;
use App\Models\WaitlistEntry;
use App\Support\Consents;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use RuntimeException;
use Tests\PushKeys;
use Tests\TestCase;

/**
 * Campaigns and reminders (docs/seguranca.md, "Avisos"): nothing without the consent of the channel and
 * purpose, news never to a minor nor to someone whose age is unknown, never the same message twice, within
 * each channel's hourly limit; a dead browser subscription is deleted.
 */
class MessageSendingTest extends TestCase
{
    use PushKeys, RefreshDatabase;

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function consenting(ConsentKind $kind, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        Consents::grant($user, $kind, '2026-11-12', 'app', null);

        return $user;
    }

    private function send(): int
    {
        $this->assertSame(0, Artisan::call('kaye:send-messages'));

        return MessageDelivery::query()->where('status', DeliveryStatus::Sent)->count();
    }

    public function test_without_the_consent_nothing_is_sent(): void
    {
        Mail::fake();
        $with = $this->consenting(ConsentKind::EmailService);
        $this->consenting(ConsentKind::EmailMarketing);
        User::factory()->create();
        Message::factory()->sending()->create();

        $this->assertSame(1, $this->send());

        Mail::assertSentCount(1);
        Mail::assertSent(MessageMail::class, fn (MessageMail $mail): bool => $mail->hasTo($with->email));
    }

    public function test_a_withdrawn_consent_stops_a_delivery_already_queued(): void
    {
        Mail::fake();
        Queue::fake();
        $user = $this->consenting(ConsentKind::EmailService);
        Message::factory()->sending()->create();
        $this->send();
        Consents::revoke($user, ConsentKind::EmailService);

        (new SendDelivery(MessageDelivery::query()->sole()->id))->handle(app(\NotificationChannels\WebPush\WebPushChannel::class));

        Mail::assertNothingSent();
        $this->assertSame(DeliveryStatus::Skipped, MessageDelivery::query()->sole()->status);
    }

    public function test_a_minor_or_someone_without_an_age_never_gets_the_news(): void
    {
        Mail::fake();
        $adult = $this->consenting(ConsentKind::EmailMarketing);
        $minor = User::factory()->minor()->create();
        $unknown = User::factory()->create(['birth_year' => null]);
        foreach ([$minor, $unknown] as $user) {
            // Written straight to the table, as if the rule on the way in had failed: the send checks again.
            $user->consents()->create(['kind' => ConsentKind::EmailMarketing, 'version' => '1', 'granted_at' => now()]);
        }
        Message::factory()->news()->sending()->create();

        $this->send();

        Mail::assertSentCount(1);
        Mail::assertSent(MessageMail::class, fn (MessageMail $mail): bool => $mail->hasTo($adult->email));
    }

    public function test_the_waiting_list_gets_only_service_emails_after_its_double_opt_in(): void
    {
        Mail::fake();
        $confirmed = WaitlistEntry::factory()->confirmed()->create();
        WaitlistEntry::factory()->create();
        Message::factory()->sending()->create(['audience' => ['waitlist' => true]]);
        Message::factory()->news()->sending()->create(['audience' => ['waitlist' => true]]);

        $this->send();

        Mail::assertSentCount(1);
        Mail::assertSent(MessageMail::class, fn (MessageMail $mail): bool => $mail->hasTo((string) $confirmed->email));
    }

    public function test_the_same_message_never_reaches_the_same_person_twice(): void
    {
        Mail::fake();
        $this->consenting(ConsentKind::EmailService);
        $message = Message::factory()->sending()->create();

        $this->send();
        $message->update(['status' => MessageStatus::Sending]);
        $this->send();
        $this->send();

        Mail::assertSentCount(1);
        $this->assertSame(1, MessageDelivery::query()->count());
        $this->assertSame(MessageStatus::Sent, $message->refresh()->status);
    }

    public function test_a_delivery_is_never_sent_twice_even_when_its_job_runs_again(): void
    {
        Mail::fake();
        $this->consenting(ConsentKind::EmailService);
        Message::factory()->sending()->create();
        $this->send();

        (new SendDelivery(MessageDelivery::query()->sole()->id))->handle(app(\NotificationChannels\WebPush\WebPushChannel::class));

        Mail::assertSentCount(1);
    }

    public function test_each_channel_sends_at_most_its_hourly_limit(): void
    {
        Mail::fake();
        config(['kaye.notices.hourly_limit.email' => 2]);
        foreach (range(1, 3) as $ignored) {
            $this->consenting(ConsentKind::EmailService);
        }
        $message = Message::factory()->sending()->create();

        $this->send();
        $this->send();
        $this->assertSame(2, MessageDelivery::query()->count());
        $this->assertSame(MessageStatus::Sending, $message->refresh()->status);

        $this->travel(61)->minutes();
        $this->send();
        $this->send();

        Mail::assertSentCount(3);
        $this->assertSame(MessageStatus::Sent, $message->refresh()->status);
    }

    public function test_the_audience_chooses_provinces_and_areas(): void
    {
        Mail::fake();
        $benguela = $this->consenting(ConsentKind::EmailService, ['province' => 'Benguela']);
        $this->consenting(ConsentKind::EmailService, ['province' => 'Luanda']);
        Message::factory()->sending()->create(['audience' => ['provinces' => ['Benguela']]]);
        $this->send();
        Mail::assertSent(MessageMail::class, 1);
        Mail::assertSent(MessageMail::class, fn (MessageMail $mail): bool => $mail->hasTo($benguela->email));

        $tech = $this->consenting(ConsentKind::EmailService);
        $data = new UserData;
        $data->user()->associate($tech);
        $data->setDocument((object) ['subscriptions' => (object) ['areas' => ['tecnologia'], 'kinds' => []]]);
        $data->save();
        Message::factory()->sending()->create(['audience' => ['areas' => ['tecnologia', 'saude']]]);
        $this->send();

        Mail::assertSent(MessageMail::class, fn (MessageMail $mail): bool => $mail->hasTo($tech->email));
        Mail::assertSentCount(2);
    }

    public function test_a_failed_email_is_marked_without_the_address(): void
    {
        $this->consenting(ConsentKind::EmailService, ['email' => 'ana@example.com']);
        Message::factory()->sending()->create();
        Mail::shouldReceive('to')->andThrow(new RuntimeException('550 ana@example.com unknown'));

        $this->send();

        $delivery = MessageDelivery::query()->sole();
        $this->assertSame(DeliveryStatus::Failed, $delivery->status);
        $this->assertSame(RuntimeException::class, $delivery->error);
    }

    public function test_the_digest_lists_the_news_of_the_week_in_the_persons_language(): void
    {
        News::factory()->create(['status' => 'published', 'date' => now()->subDays(2), 'title' => ['pt' => 'Bolsas novas', 'en' => 'New grants'], 'summary' => ['pt' => 'Resumo', 'en' => 'Summary']]);
        News::factory()->create(['status' => 'published', 'date' => now()->subDays(30), 'title' => ['pt' => 'Antiga', 'en' => 'Old one']]);
        $user = $this->consenting(ConsentKind::EmailMarketing, ['locale' => 'en']);
        $message = Message::factory()->news()->create(['subject' => ['pt' => 'Novidades', 'en' => 'News'], 'body' => ['pt' => 'Olá', 'en' => 'Hello']]);

        $mail = new MessageMail($user, $message);

        $mail->assertHasSubject('News');
        $mail->assertSeeInHtml('New grants');
        $mail->assertDontSeeInHtml('Old one');
        $mail->assertSeeInHtml('This week on Kayé');
        $header = $mail->headers()->text['List-Unsubscribe'] ?? null;
        $this->assertIsString($header);
        $this->assertStringContainsString('kind=email_marketing', $header);
    }

    public function test_push_reaches_the_subscribed_browser(): void
    {
        $this->useVapidKeys();
        Http::fake(['push.example.com/*' => Http::response('', 201)]);
        $user = User::factory()->create(['locale' => 'pt']);
        $this->subscribed($user, 'https://push.example.com/alive');
        User::factory()->create();
        Message::factory()->push()->sending()->create(['url' => '/prazos']);

        $this->assertSame(1, $this->send());

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://push.example.com/alive' && $request->hasHeader('Authorization'));
    }

    public function test_a_dead_subscription_is_deleted(): void
    {
        $this->useVapidKeys();
        Http::fake([
            'push.example.com/gone' => Http::response('', 410),
            'push.example.com/missing' => Http::response('', 404),
        ]);
        $user = User::factory()->create();
        $this->subscribed($user, 'https://push.example.com/gone');
        $this->subscribed($user, 'https://push.example.com/missing');
        Message::factory()->push()->sending()->create();

        $this->send();

        $this->assertSame(0, $user->pushSubscriptions()->count());
        $this->assertSame(DeliveryStatus::Failed, MessageDelivery::query()->sole()->status);
    }

    public function test_push_news_needs_the_push_marketing_consent(): void
    {
        $this->useVapidKeys();
        Http::fake();
        $this->subscribed(User::factory()->create(), 'https://push.example.com/service-only');
        Message::factory()->push()->news()->sending()->create();

        $this->send();

        Http::assertNothingSent();
        $this->assertSame(0, MessageDelivery::query()->count());
    }
}

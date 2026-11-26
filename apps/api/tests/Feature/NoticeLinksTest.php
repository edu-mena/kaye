<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Mail\WaitlistConfirmation;
use App\Mail\Welcome;
use App\Models\Consent;
use App\Models\User;
use App\Models\WaitlistEntry;
use App\Support\Consents;
use App\Support\NoticeLinks;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * The signed links in the emails (docs/seguranca.md, "Avisos"): the waiting list's double opt-in and "deixar de
 * receber", both without signing in. A link that was changed or has expired confirms and withdraws nothing.
 */
class NoticeLinksTest extends TestCase
{
    use RefreshDatabase;

    private function signUp(string $email = 'ana@example.com', string $ip = '10.0.0.1', string $whatsapp = '923456789'): WaitlistEntry
    {
        $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/waitlist', [
            'name' => 'Ana', 'email' => $email, 'whatsapp' => $whatsapp, 'consent' => true, 'lang' => 'fr',
        ])->assertCreated();

        return WaitlistEntry::query()->withEmail($email)->sole();
    }

    public function test_a_signup_records_its_consents_and_asks_to_confirm_the_email(): void
    {
        Mail::fake();

        $entry = $this->signUp(ip: '41.63.1.200');

        $kinds = $entry->consents->map(fn (Consent $consent): string => $consent->kind->value)->all();
        $this->assertEqualsCanonicalizing(['email_service', 'whatsapp_marketing'], $kinds);
        $this->assertSame(['41.63.1.0'], $entry->consents()->distinct()->pluck('ip_prefix')->all());
        $this->assertFalse(Consents::has($entry, ConsentKind::EmailService), 'not confirmed yet');
        Mail::assertQueued(WaitlistConfirmation::class, fn (WaitlistConfirmation $mail): bool => $mail->hasTo('ana@example.com') && $mail->locale === 'fr');
    }

    public function test_a_number_only_signup_sends_no_email(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/waitlist', ['whatsapp' => '931111111', 'consent' => true])->assertCreated();

        Mail::assertNothingQueued();
    }

    public function test_the_confirmation_email_carries_the_link_and_the_one_click_way_out(): void
    {
        $entry = WaitlistEntry::factory()->create(['locale' => 'en']);
        $mail = new WaitlistConfirmation($entry);

        $mail->assertSeeInHtml('Confirm my email');
        $mail->assertSeeInHtml('/waitlist/confirm/waitlist-'.$entry->id);
        $mail->assertSeeInHtml('Unsubscribe');
        $mail->assertHasSubject('Confirm your email on Kayé');
        $headers = $mail->headers()->text;
        $this->assertIsString($headers['List-Unsubscribe'] ?? null);
        $this->assertStringStartsWith('<'.url('/unsubscribe/waitlist-'.$entry->id), $headers['List-Unsubscribe']);
        $this->assertSame('List-Unsubscribe=One-Click', $headers['List-Unsubscribe-Post']);
    }

    public function test_the_signed_link_confirms_the_email_and_welcomes_once(): void
    {
        Mail::fake();
        $entry = $this->signUp();
        $link = NoticeLinks::confirm($entry);

        $this->get($link)->assertOk()->assertSee('Email confirmé')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->get($link)->assertOk();

        $this->assertTrue(Consents::has($entry, ConsentKind::EmailService));
        $this->assertNotNull($entry->refresh()->confirmed_at);
        Mail::assertQueuedCount(2);
        Mail::assertQueued(Welcome::class, 1);
    }

    public function test_a_changed_unsigned_or_expired_link_confirms_nothing(): void
    {
        Mail::fake();
        $entry = $this->signUp();
        $other = $this->signUp('other@example.com', whatsapp: '931111111');
        $link = NoticeLinks::confirm($entry);

        $this->get(str_replace("waitlist-{$entry->id}", "waitlist-{$other->id}", $link))->assertForbidden()->assertSee('Este link não é válido');
        $this->get("/waitlist/confirm/waitlist-{$entry->id}")->assertForbidden();
        $this->travel(8)->days();
        $this->get($link)->assertForbidden();

        $this->assertFalse(Consents::has($entry, ConsentKind::EmailService));
        $this->assertFalse(Consents::has($other, ConsentKind::EmailService));
        Mail::assertNotQueued(Welcome::class);
    }

    public function test_unsubscribing_works_without_signing_in(): void
    {
        $user = User::factory()->create();
        Consents::grant($user, ConsentKind::EmailMarketing, '2026-11-12', 'app', null);
        Consents::grant($user, ConsentKind::EmailService, '2026-11-12', 'app', null);

        $this->get(NoticeLinks::unsubscribe($user, ConsentKind::EmailMarketing))
            ->assertOk()
            ->assertSee('Já não vais receber estes emails');

        $this->assertGuest();
        $this->assertFalse(Consents::has($user, ConsentKind::EmailMarketing));
        $this->assertTrue(Consents::has($user, ConsentKind::EmailService), 'only the kind of that email');
    }

    public function test_the_mail_apps_one_click_post_works_without_a_csrf_token(): void
    {
        $entry = WaitlistEntry::factory()->confirmed()->create();

        $this->post(NoticeLinks::unsubscribe($entry, ConsentKind::EmailService), ['List-Unsubscribe' => 'One-Click'])
            ->assertOk()
            ->assertSee('ok');

        $this->assertFalse(Consents::has($entry, ConsentKind::EmailService));
        $this->assertTrue($entry->consents()->active()->where('kind', 'whatsapp_marketing')->exists(), 'the number stays');
    }

    public function test_leaving_every_channel_marks_the_waiting_list_entry(): void
    {
        $entry = WaitlistEntry::factory()->confirmed()->create(['whatsapp' => null]);

        $this->get(NoticeLinks::unsubscribe($entry, ConsentKind::EmailService))->assertOk();

        $this->assertNotNull($entry->refresh()->unsubscribed_at);
    }

    public function test_a_changed_unsubscribe_link_withdraws_nothing(): void
    {
        $ana = User::factory()->create();
        $rui = User::factory()->create();
        foreach ([$ana, $rui] as $user) {
            Consents::grant($user, ConsentKind::EmailMarketing, '2026-11-12', 'app', null);
            Consents::grant($user, ConsentKind::EmailService, '2026-11-12', 'app', null);
        }
        $link = NoticeLinks::unsubscribe($ana, ConsentKind::EmailMarketing);

        // Someone else's account, another kind, no signature: each one refused.
        $this->get(str_replace("user-{$ana->id}", "user-{$rui->id}", $link))->assertForbidden();
        $this->post(str_replace('kind=email_marketing', 'kind=email_service', $link))->assertForbidden();
        $this->get("/unsubscribe/user-{$ana->id}?kind=email_marketing")->assertForbidden();

        $this->assertTrue(Consents::has($ana, ConsentKind::EmailMarketing));
        $this->assertTrue(Consents::has($ana, ConsentKind::EmailService));
        $this->assertTrue(Consents::has($rui, ConsentKind::EmailMarketing));
    }

    public function test_a_signed_link_for_nobody_or_for_a_non_email_kind_is_refused(): void
    {
        $user = User::factory()->create();
        $gone = NoticeLinks::unsubscribe($user, ConsentKind::EmailService);
        $user->forceDelete();

        $this->get($gone)->assertNotFound();
        $this->post(NoticeLinks::unsubscribe(User::factory()->create(), ConsentKind::Terms))->assertNotFound();
        $this->assertNull(NoticeLinks::resolve('admin-1'));
    }
}

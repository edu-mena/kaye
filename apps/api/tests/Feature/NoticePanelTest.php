<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Enums\DeliveryStatus;
use App\Enums\MessageStatus;
use App\Filament\Resources\Feedback\Pages\ListFeedback;
use App\Filament\Resources\Messages\Pages\CreateMessage;
use App\Filament\Resources\Messages\Pages\ListMessages;
use App\Mail\FeedbackReply;
use App\Models\Feedback;
use App\Models\Message;
use App\Models\MessageDelivery;
use App\Models\User;
use App\Support\Consents;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * The panel: writing and sending a campaign, the report of its deliveries, and replying to a critique.
 */
class NoticePanelTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['boss@kaye.test']]);
        $this->admin = User::factory()->admin()->create(['email' => 'boss@kaye.test']);
        $this->actingAs($this->admin);
    }

    public function test_a_campaign_is_written_as_a_draft_and_sent_with_a_click(): void
    {
        Livewire::test(CreateMessage::class)
            ->fillForm([
                'channel' => 'email',
                'purpose' => 'service',
                'template' => 'notice',
                'url' => '/prazos',
                'subject' => ['pt' => 'O Kayé abriu', 'en' => '', 'fr' => ''],
                'body' => ['pt' => 'Já podes entrar.', 'en' => '', 'fr' => ''],
                'audience' => ['provinces' => ['Luanda'], 'areas' => [], 'waitlist' => true],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $message = Message::query()->sole();
        $this->assertSame(MessageStatus::Draft, $message->status);
        $this->assertSame(['pt' => 'O Kayé abriu'], $message->subject);
        $this->assertSame(['provinces' => ['Luanda'], 'areas' => [], 'waitlist' => true], $message->audience);
        $this->assertSame($this->admin->id, $message->created_by);

        Livewire::test(ListMessages::class)->callTableAction('send', $message);
        $this->assertSame(MessageStatus::Sending, $message->refresh()->status);
    }

    public function test_the_weekly_news_must_be_marketing(): void
    {
        Livewire::test(CreateMessage::class)
            ->fillForm([
                'channel' => 'email', 'purpose' => 'service', 'template' => 'digest',
                'subject' => ['pt' => 'Novidades'], 'body' => ['pt' => 'Olá'],
            ])
            ->call('create')
            ->assertHasFormErrors(['template']);

        $this->assertSame(0, Message::query()->count());
    }

    public function test_the_list_reports_the_deliveries(): void
    {
        $message = Message::factory()->create(['status' => MessageStatus::Sent]);
        MessageDelivery::factory()->for($message)->count(2)->create(['status' => DeliveryStatus::Sent]);
        MessageDelivery::factory()->for($message)->create(['status' => DeliveryStatus::Failed]);

        $this->get('/admin/messages')->assertOk()->assertSee('O Kayé abriu');
        Livewire::test(ListMessages::class)
            ->assertTableColumnStateSet('sent_count', 2, $message)
            ->assertTableColumnStateSet('failed_count', 1, $message)
            ->assertTableActionHidden('send', $message);
    }

    public function test_a_critique_is_answered_by_email_when_the_person_accepts_service_emails(): void
    {
        Mail::fake();
        $ana = User::factory()->create();
        Consents::grant($ana, ConsentKind::EmailService, '2026-11-12', 'app', null);
        $feedback = Feedback::factory()->create(['user_id' => $ana->id, 'message' => 'Falta Benguela']);
        $anonymous = Feedback::factory()->create(['user_id' => null]);

        Livewire::test(ListFeedback::class)
            ->assertTableActionHidden('reply', $anonymous)
            ->callTableAction('reply', $feedback, ['reply' => 'Já está na lista!']);

        Mail::assertQueued(FeedbackReply::class, function (FeedbackReply $mail) use ($ana): bool {
            $mail->assertSeeInHtml('Falta Benguela');
            $mail->assertSeeInHtml('Já está na lista!');

            return $mail->hasTo($ana->email);
        });
        $this->assertSame('done', $feedback->refresh()->status);
    }

    public function test_no_reply_without_the_service_consent(): void
    {
        $feedback = Feedback::factory()->create(['user_id' => User::factory()->create()->id]);

        Livewire::test(ListFeedback::class)->assertTableActionHidden('reply', $feedback);
    }
}

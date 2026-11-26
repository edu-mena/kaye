<?php

namespace Tests\Feature;

use App\Enums\MessageStatus;
use App\Filament\Pages\PasteJob;
use App\Filament\Resources\Comments\Pages\ListComments;
use App\Filament\Resources\Interviews\Pages\ListInterviews;
use App\Filament\Resources\Messages\Pages\ListMessages;
use App\Filament\Resources\Revisions\RevisionResource;
use App\Mail\MessageMail;
use App\Models\Comment;
use App\Models\Dataset;
use App\Models\Institution;
use App\Models\Interview;
use App\Models\JobPosting;
use App\Models\Message;
use App\Models\User;
use App\Support\AuditLog;
use App\Support\ContentEditor;
use App\Support\JobMessage;
use App\Support\TextDiff;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Livewire\Livewire;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

/**
 * The team's daily work in the panel: the AI's inbox side by side, a campaign tried on oneself, the comments and
 * interviews to moderate, and a job ad pasted from WhatsApp.
 */
class PanelWorkTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['boss@kaye.test', 'reviewer@kaye.test']]);
        $this->admin = User::factory()->admin()->create(['email' => 'boss@kaye.test', 'name' => 'Eduardo Mena']);
        Filament::setCurrentPanel(Filament::getPanel('admin'));
    }

    public function test_the_inbox_shows_the_words_that_change_side_by_side_and_escaped(): void
    {
        Institution::factory()->create(['slug' => 'uan', 'address' => 'Avenida 4 de Fevereiro, Luanda', 'sources' => []]);
        $revision = app(ContentEditor::class)->propose('institution', 'uan', ['address' => 'Avenida 21 de Janeiro, <b>Luanda</b>'], 'https://uan.ao', 'Mudou de sede.', User::factory()->editor()->create());

        $html = (string) RevisionResource::diff($revision);

        $this->assertStringContainsString('<del>4</del>', $html);
        $this->assertStringContainsString('<ins>21</ins>', $html);
        $this->assertStringContainsString('&lt;b&gt;Luanda&lt;/b&gt;', $html);
        $this->assertStringNotContainsString('<b>Luanda</b>', $html);
        $this->assertStringContainsString('Mudou de sede.', $html);
        $this->assertStringContainsString('Morada', $html);
    }

    public function test_the_word_diff_keeps_the_text_and_gives_up_on_huge_texts(): void
    {
        $diff = TextDiff::words('o gato preto', 'o cão preto');
        $this->assertSame('o <del>gato</del> preto', $diff['before']);
        $this->assertSame('o <ins>cão</ins> preto', $diff['after']);

        $huge = str_repeat('palavra ', 600);
        $this->assertSame(['before' => e($huge), 'after' => e($huge.'nova')], TextDiff::words($huge, $huge.'nova'));
        $this->assertSame(['before' => '', 'after' => '<ins>tudo</ins>'], TextDiff::words('', 'tudo'));
    }

    public function test_a_campaign_is_tried_on_oneself_and_stays_a_draft(): void
    {
        Mail::fake();
        $message = Message::factory()->create();
        $this->actingAs($this->admin);

        Livewire::test(ListMessages::class)
            ->callAction(TestAction::make('sendTest')->table($message), ['locale' => 'fr'])
            ->assertNotified('Teste enviado para ti.');

        Mail::assertSent(MessageMail::class, function (MessageMail $mail): bool {
            return $mail->hasTo('boss@kaye.test') && $mail->envelope()->subject === '[Teste] Kayé est ouvert';
        });
        Mail::assertSentCount(1);
        $this->assertSame(MessageStatus::Draft, $message->refresh()->status);
        $this->assertSame(0, $message->deliveries()->count());
        $this->assertTrue(Activity::query()->where('event', 'message_test_sent')->exists());
    }

    public function test_a_push_test_needs_this_browser_subscribed(): void
    {
        $message = Message::factory()->create(['channel' => 'push']);
        $this->actingAs($this->admin);

        Livewire::test(ListMessages::class)
            ->callAction(TestAction::make('sendTest')->table($message), ['locale' => 'pt'])
            ->assertNotified('Este browser não está inscrito nos avisos: liga-os na app primeiro.');
    }

    public function test_a_reviewer_hides_a_reported_comment_and_shows_it_again(): void
    {
        $comment = Comment::factory()->create(['reports_count' => 2, 'user_id' => User::factory()->minor()->create(['name' => 'Joana Kiala'])->id]);
        $reviewer = User::factory()->reviewer()->create(['email' => 'reviewer@kaye.test']);
        $this->actingAs($reviewer);

        Livewire::test(ListComments::class)
            ->assertCanSeeTableRecords([$comment])
            ->assertSee('Joana')
            ->assertDontSee('Kiala')
            ->callAction(TestAction::make('hide')->table($comment));
        $this->assertNotNull($comment->refresh()->hidden_at);

        Livewire::test(ListComments::class)->callAction(TestAction::make('show')->table($comment));
        $comment->refresh();
        $this->assertNull($comment->hidden_at);
        $this->assertSame(0, $comment->reports_count);
        $this->assertSame(2, Activity::query()->where('log_name', AuditLog::ADMIN)->whereIn('event', ['comment_hidden', 'comment_shown'])->count());
    }

    public function test_an_interview_is_opened_with_a_record_and_marked_reviewed(): void
    {
        $interview = Interview::factory()->create(['candidate' => ['name' => 'Ana', 'birthYear' => (int) now()->year - 15, 'contact' => 'ana@exemplo.ao', 'guardianInformed' => true]]);
        $this->actingAs($this->admin);

        $page = Livewire::test(ListInterviews::class)->assertSee('Menor')->assertDontSee('ana@exemplo.ao');
        $page->mountAction(TestAction::make('open')->table($interview));
        $page->assertMountedActionModalSee('ana@exemplo.ao');
        $page->assertMountedActionModalSee('Encarregado informado');
        $this->assertTrue(Activity::query()->where('event', 'interview_opened')->where('subject_id', $interview->id)->exists());

        Livewire::test(ListInterviews::class)->callAction(TestAction::make('reviewed')->table($interview));
        $interview->refresh();
        $this->assertSame('reviewed', $interview->status);
        $this->assertSame($this->admin->id, $interview->getAttribute('reviewed_by'));
    }

    public function test_a_job_ad_from_whatsapp_becomes_facts_and_the_text_is_not_kept(): void
    {
        Dataset::factory()->create(['slug' => 'provinces', 'data' => ['Luanda', 'Lunda Norte', 'Benguela']]);
        $message = "*Recrutamento: Técnico de Redes*\nEmpresa: Unitel\nLocal: Lunda Norte\n3 vagas disponíveis.\nCandidaturas: https://unitel.ao/carreiras/123.\nEnvia o CV até sexta.";
        $this->actingAs(User::factory()->editor()->create(['email' => 'boss2@kaye.test']));

        $this->assertSame(
            ['title' => 'Recrutamento: Técnico de Redes', 'url' => 'https://unitel.ao/carreiras/123', 'province' => 'Lunda Norte', 'company' => 'Unitel', 'openings' => 3],
            JobMessage::read($message),
        );

        Livewire::test(PasteJob::class)
            ->fillForm(['message' => $message])
            ->call('read')
            ->assertFormSet(['title' => 'Recrutamento: Técnico de Redes', 'company' => 'Unitel', 'province' => 'Lunda Norte', 'openings' => 3])
            ->call('save')
            ->assertHasNoFormErrors()
            ->assertNotified('Vaga guardada.');
        // The same ad again updates it.
        Livewire::test(PasteJob::class)->fillForm(['message' => $message])->call('read')->call('save')->assertNotified('Esta vaga já estava: atualizada.');

        $posting = JobPosting::query()->sole();
        $this->assertSame('whatsapp', $posting->source);
        $this->assertStringStartsWith('whatsapp:', (string) $posting->external_id);
        $this->assertSame(3, $posting->openings);
        $this->assertStringNotContainsString('Envia o CV', (string) json_encode($posting->toArray()));
    }

    public function test_a_job_ad_needs_a_link_and_a_title(): void
    {
        $this->actingAs($this->admin);

        Livewire::test(PasteJob::class)
            ->fillForm(['message' => 'Precisa-se de cozinheiro.'])
            ->call('read')
            ->call('save')
            ->assertHasFormErrors(['url' => 'required']);
        $this->assertSame(0, JobPosting::query()->count());
    }
}

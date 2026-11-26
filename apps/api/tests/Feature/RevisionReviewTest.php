<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\RevisionStatus;
use App\Filament\Resources\Revisions\Pages\ListRevisions;
use App\Models\Institution;
use App\Models\Revision;
use App\Models\User;
use App\Support\ContentEditor;
use App\Support\InvalidProposal;
use App\Support\Revisions;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

/**
 * The review of the proposals (docs/ia.md): approving applies, adds the source and publishes; rejecting keeps
 * the reason; nothing is published without a reviewer, and a reviewer never approves their own proposal.
 */
class RevisionReviewTest extends TestCase
{
    use RefreshDatabase;

    private User $editor;

    private User $reviewer;

    private Institution $uan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->editor = User::factory()->editor()->create();
        $this->reviewer = User::factory()->reviewer()->create();
        $this->uan = Institution::factory()->create(['slug' => 'uan', 'type' => 'universidade', 'status' => ContentStatus::Draft, 'phone' => null, 'sources' => []]);
    }

    public function test_approving_applies_the_values_adds_the_source_and_publishes(): void
    {
        $revision = $this->propose(['phone' => '+244 222 333 444', 'estimated' => false]);
        $this->actingAs($this->reviewer);

        app(Revisions::class)->approve($revision, $this->reviewer);

        $uan = $this->uan->fresh();
        $this->assertSame('+244 222 333 444', $uan?->phone);
        $this->assertSame(ContentStatus::Published, $uan->status);
        $this->assertSame('https://uan.ao/contactos', $uan->source_url);
        $this->assertSame([['label' => 'uan.ao', 'url' => 'https://uan.ao/contactos']], $uan->sources);
        $this->assertSame(RevisionStatus::Approved, $revision->refresh()->status);
        $this->assertTrue($revision->refresh()->reviewer?->is($this->reviewer));
        $change = Activity::query()->where('subject_id', $uan->id)->where('event', 'updated')->sole();
        $this->assertTrue($change->causer?->is($this->reviewer));
    }

    public function test_a_new_row_is_created_published_on_approval(): void
    {
        $revision = app(ContentEditor::class)->propose('institution', null, [
            'slug' => 'isptec', 'name' => 'ISPTEC', 'type' => 'universidade', 'province' => 'Luanda', 'place' => 'Talatona', 'summary' => ['pt' => 'Politécnico.'],
        ], 'https://isptec.co.ao', null, $this->editor);

        app(Revisions::class)->approve($revision, $this->reviewer);

        $isptec = Institution::query()->where('slug', 'isptec')->sole();
        $this->assertSame(ContentStatus::Published, $isptec->status);
        $this->assertSame('Politécnico.', $isptec->getTranslation('summary', 'pt'));
        $this->assertSame($isptec->id, $revision->refresh()->revisable_id);
    }

    public function test_rejecting_keeps_the_reason_and_changes_nothing(): void
    {
        $revision = $this->propose(['phone' => '+244 222 333 444']);

        try {
            app(Revisions::class)->reject($revision, $this->reviewer, ' ');
            $this->fail('A rejection without a reason was accepted.');
        } catch (InvalidProposal) {
        }
        app(Revisions::class)->reject($revision, $this->reviewer, 'O número é da reitoria antiga.');

        $this->assertSame(RevisionStatus::Rejected, $revision->refresh()->status);
        $this->assertSame('O número é da reitoria antiga.', $revision->refresh()->rejection_reason);
        $this->assertNull($this->uan->fresh()?->phone);
        $this->assertSame(ContentStatus::Draft, $this->uan->fresh()?->status);
    }

    public function test_only_a_reviewer_other_than_the_author_reviews(): void
    {
        $revision = $this->propose(['phone' => '+244 222 333 444']);
        $admin = User::factory()->admin()->create();
        $ownProposal = app(ContentEditor::class)->propose('institution', 'uan', ['address' => 'Rua X'], 'https://uan.ao', null, $admin);

        foreach ([[$revision, $this->editor], [$ownProposal, $admin]] as [$proposal, $who]) {
            try {
                app(Revisions::class)->approve($proposal, $who);
                $this->fail('The approval was accepted.');
            } catch (InvalidProposal) {
            }
        }

        $this->assertNull($this->uan->fresh()?->phone);
        $this->assertNull($this->uan->fresh()?->address);
    }

    public function test_a_value_changed_after_the_proposal_blocks_the_approval(): void
    {
        $revision = $this->propose(['phone' => '+244 222 333 444']);
        $this->uan->update(['phone' => '+244 999 000 111']);

        $this->expectException(InvalidProposal::class);
        app(Revisions::class)->approve($revision, $this->reviewer);
    }

    public function test_a_reviewed_revision_cannot_be_reviewed_again(): void
    {
        $revision = $this->propose(['phone' => '+244 222 333 444']);
        app(Revisions::class)->reject($revision, $this->reviewer, 'Não.');

        $this->expectException(InvalidProposal::class);
        app(Revisions::class)->approve($revision->fresh() ?? $revision, $this->reviewer);
    }

    public function test_each_row_keeps_its_history(): void
    {
        $first = $this->propose(['phone' => '+244 222 333 444']);
        app(Revisions::class)->approve($first, $this->reviewer);
        $second = $this->propose(['address' => 'Avenida 4 de Fevereiro']);

        $this->assertSame([$second->id, $first->id], Revision::query()->of($this->uan)->pluck('id')->all());
    }

    public function test_the_panel_approves_with_one_click_and_shows_the_difference(): void
    {
        config(['kaye.admin_emails' => [$this->reviewer->email]]);
        $revision = $this->propose(['phone' => '+244 222 333 444']);
        $this->actingAs($this->reviewer);
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(ListRevisions::class)
            ->assertCanSeeTableRecords([$revision])
            ->callAction(TestAction::make('approve')->table($revision))
            ->assertNotified('Aprovada e publicada.');

        $this->assertSame('+244 222 333 444', $this->uan->fresh()?->phone);
        $this->assertStringContainsString('&lt;b&gt;', (string) \App\Filament\Resources\Revisions\RevisionResource::diff(
            $this->propose(['address' => '<b>injected</b>']),
        ));
    }

    /**
     * @param  array<string, mixed>  $changes
     */
    private function propose(array $changes): Revision
    {
        return app(ContentEditor::class)->propose('institution', 'uan', $changes, 'https://uan.ao/contactos', null, $this->editor);
    }
}

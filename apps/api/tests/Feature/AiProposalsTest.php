<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\RevisionStatus;
use App\Mcp\Servers\KayeServer;
use App\Mcp\Tools\GetContent;
use App\Mcp\Tools\ListMissing;
use App\Mcp\Tools\ListSources;
use App\Mcp\Tools\ProposeChange;
use App\Mcp\Tools\SearchContent;
use App\Models\Career;
use App\Models\Institution;
use App\Models\Revision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The MCP tools (docs/ia.md): reading is free; writing is only a pending proposal, with a source, validated by
 * the rules of App\Support\ContentTypes. Nothing is published by the AI.
 */
class AiProposalsTest extends TestCase
{
    use RefreshDatabase;

    private User $editor;

    private Institution $uan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->editor = User::factory()->editor()->create();
        $this->uan = Institution::factory()->create([
            'slug' => 'uan', 'name' => 'Universidade Agostinho Neto', 'type' => 'universidade', 'status' => ContentStatus::Published,
            'phone' => null, 'website' => 'https://uan.ao', 'sources' => [['label' => 'UAN', 'url' => 'https://uan.ao']],
        ]);
    }

    public function test_a_proposal_without_a_source_is_refused(): void
    {
        KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'institution', 'slug' => 'uan', 'changes' => ['phone' => '+244 222 333 444'], 'source_url' => '',
        ])->assertHasErrors(['source_url is required']);

        KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'institution', 'slug' => 'uan', 'changes' => ['phone' => '+244 222 333 444'], 'source_url' => 'javascript:alert(1)',
        ])->assertHasErrors(['source_url is required']);

        $this->assertSame(0, Revision::query()->count());
    }

    public function test_a_valid_proposal_waits_for_review_and_touches_nothing(): void
    {
        KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'institution', 'slug' => 'uan', 'source_url' => 'https://uan.ao/contactos', 'note' => 'Página de contactos.',
            'changes' => ['phone' => '+244 222 333 444', 'website' => 'https://uan.ao'],
        ])->assertHasNoErrors()->assertSee('Waiting for review');

        $revision = Revision::query()->sole();
        $this->assertSame(RevisionStatus::Pending, $revision->status);
        // The website did not change, so only the phone is proposed.
        $this->assertSame(['phone' => '+244 222 333 444'], $revision->changes);
        $this->assertSame(['phone' => null], $revision->original);
        $this->assertTrue($revision->author?->is($this->editor));
        $this->assertNull($this->uan->fresh()?->phone);
    }

    public function test_values_follow_the_same_rules_as_the_panel(): void
    {
        $tool = fn (array $changes) => KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'institution', 'slug' => 'uan', 'source_url' => 'https://uan.ao', 'changes' => $changes,
        ]);

        $tool(['email' => 'not an email'])->assertHasErrors(['email']);
        $tool(['website' => 'ftp://uan.ao'])->assertHasErrors(['website']);
        $tool(['type' => 'escola-inventada'])->assertHasErrors(['type']);
        $tool(['summary' => ['en' => 'Only English']])->assertHasErrors(['summary.pt']);
        $tool(['status' => 'published'])->assertHasErrors(['cannot be changed here: status']);
        $tool(['logo' => 'https://evil.example/x.png'])->assertHasErrors(['cannot be changed here: logo']);
        $tool(['website' => 'https://uan.ao'])->assertHasErrors(['Nothing changes']);

        $this->assertSame(0, Revision::query()->count());
    }

    public function test_a_new_row_is_only_a_proposal_until_approved(): void
    {
        KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'institution', 'source_url' => 'https://isptec.co.ao',
            'changes' => ['slug' => 'isptec', 'name' => 'ISPTEC', 'type' => 'universidade', 'province' => 'Luanda', 'place' => 'Talatona', 'summary' => ['pt' => 'Instituto politécnico.']],
        ])->assertHasNoErrors();

        $this->assertTrue(Revision::query()->sole()->isNewRow());
        $this->assertFalse(Institution::query()->where('slug', 'isptec')->exists());

        KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'institution', 'source_url' => 'https://x.ao', 'changes' => ['slug' => 'uan', 'name' => 'Outra'],
        ])->assertHasErrors(['already a institution']);
        KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'institution', 'source_url' => 'https://x.ao', 'changes' => ['slug' => 'nova', 'name' => 'Nova'],
        ])->assertHasErrors(['also needs: type']);
    }

    public function test_the_ai_never_creates_a_career(): void
    {
        KayeServer::actingAs($this->editor)->tool(ProposeChange::class, [
            'type' => 'career', 'source_url' => 'https://x.ao', 'changes' => ['slug' => 'astronauta'],
        ])->assertHasErrors(['created by the team']);
    }

    public function test_reading_tools_find_rows_their_values_what_is_missing_and_the_sources(): void
    {
        Career::factory()->create(['slug' => 'enfermeiro']);
        $server = KayeServer::actingAs($this->editor);

        $server->tool(SearchContent::class, ['type' => 'institution', 'text' => 'Agostinho'])->assertSee('"slug":"uan"');
        $server->tool(GetContent::class, ['type' => 'institution', 'slug' => 'uan'])->assertSee(['"website":"https://uan.ao"', '"status":"published"']);
        $server->tool(GetContent::class, ['type' => 'institution', 'slug' => 'nao-existe'])->assertHasErrors(['There is no institution']);
        $server->tool(ListMissing::class, ['type' => 'institution'])->assertSee(['"slug":"uan"', 'phone']);
        $server->tool(ListSources::class, ['type' => 'institution'])->assertSee('https://uan.ao');
        $server->tool(SearchContent::class, ['type' => 'planet', 'text' => 'x'])->assertHasErrors();
    }
}

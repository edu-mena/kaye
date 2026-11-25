<?php

namespace Tests\Feature;

use App\Enums\AiTaskStatus;
use App\Enums\ContentStatus;
use App\Enums\RevisionStatus;
use App\Filament\Resources\AiTasks\Pages\ListAiTasks;
use App\Models\AiTask;
use App\Models\Institution;
use App\Models\Revision;
use App\Models\User;
use App\Support\AiTasks;
use App\Support\InvalidProposal;
use App\Support\JsonValue;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * "Pesquisar com IA" (docs/ia.md): a queued task calls the Claude API with web search and the write tools, within a
 * daily budget; what it finds becomes pending revisions, never published content. The API is faked here.
 */
class AiResearchTaskTest extends TestCase
{
    use RefreshDatabase;

    private const API = 'api.anthropic.com/*';

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        config(['ai.key' => 'test-key', 'ai.daily_budget_usd' => 1.0]);
        $this->editor = User::factory()->editor()->create();
        Institution::factory()->create(['slug' => 'uan', 'type' => 'universidade', 'status' => ContentStatus::Published, 'phone' => null, 'sources' => []]);
    }

    public function test_a_fake_answer_with_a_tool_call_becomes_a_pending_revision(): void
    {
        Http::fake([self::API => Http::sequence()
            ->push($this->answer('tool_use', [
                ['type' => 'thinking', 'thinking' => '', 'signature' => 'sig'],
                ['type' => 'server_tool_use', 'id' => 'srv_1', 'name' => 'web_search', 'input' => ['query' => 'UAN contactos']],
                ['type' => 'tool_use', 'id' => 'tu_1', 'name' => 'propose_change', 'input' => [
                    'type' => 'institution', 'slug' => 'uan', 'changes' => ['phone' => '+244 222 333 444'],
                    'source_url' => 'https://uan.ao/contactos', 'note' => 'Página oficial.',
                ]],
            ], searches: 1))
            ->push($this->answer('end_turn', [['type' => 'text', 'text' => 'Propus o telefone da UAN.']])),
        ]);

        $task = AiTasks::request($this->editor, 'institution', 'uan', 'Completa os contactos das universidades de Luanda.');

        $task->refresh();
        $this->assertSame(AiTaskStatus::Done, $task->status);
        $this->assertSame('Propus o telefone da UAN.', $task->result);
        $this->assertSame(['https://uan.ao/contactos'], $task->sources);
        // 2 × (1000 in, 500 out) on claude-sonnet-5-5 + 1 search: 2 × 0.007 + 0.01.
        $this->assertEqualsWithDelta(0.024, (float) $task->cost_usd, 0.0001);
        $this->assertSame(1, $task->web_searches);

        $revision = Revision::query()->sole();
        $this->assertSame($task->id, $revision->ai_task_id);
        $this->assertSame(RevisionStatus::Pending, $revision->status);
        $this->assertNull($revision->author_id);
        $this->assertNull(Institution::query()->sole()->phone);
        $this->assertSame(0, Institution::query()->where('status', '!=', ContentStatus::Published->value)->count());
    }

    public function test_the_request_carries_the_model_the_tools_the_budget_guards_and_the_conversation_unchanged(): void
    {
        Http::fake([self::API => Http::sequence()
            ->push($this->answer('tool_use', [
                ['type' => 'thinking', 'thinking' => '', 'signature' => 'keep-me'],
                ['type' => 'tool_use', 'id' => 'tu_1', 'name' => 'get_content', 'input' => ['type' => 'institution', 'slug' => 'nao-existe']],
            ]))
            ->push($this->answer('end_turn', [['type' => 'text', 'text' => 'Nada.']])),
        ]);

        AiTasks::request($this->editor, 'institution', null, 'Completa os contactos.');

        Http::assertSentCount(2);
        Http::assertSent(function (Request $request): bool {
            $tools = array_column(JsonValue::list($request['tools']), 'name');

            return $request->hasHeader('x-api-key', 'test-key')
                && $request->hasHeader('anthropic-beta', 'server-side-fallback-2026-07-01')
                && $request['model'] === 'claude-sonnet-5-5'
                && $request['fallbacks'] === 'default'
                && $request['output_config'] === ['effort' => 'medium']
                && in_array('web_search', $tools, true) && in_array('propose_change', $tools, true)
                && in_array('web_search_20260209', array_column(JsonValue::list($request['tools']), 'type'), true);
        });
        // The second request sends back the thinking block untouched and the tool's error as a tool_result.
        $second = Http::recorded()->get(1)[0] ?? null;
        $this->assertInstanceOf(Request::class, $second);
        $this->assertSame('keep-me', data_get($second['messages'], '1.content.0.signature'));
        $this->assertTrue(data_get($second['messages'], '2.content.0.is_error'));
        $this->assertStringContainsString('There is no institution', JsonValue::string(data_get($second['messages'], '2.content.0.content')));
    }

    public function test_a_spent_budget_stops_the_queue_without_calling_the_api(): void
    {
        Http::fake();
        AiTask::factory()->create(['cost_usd' => 1.0, 'status' => AiTaskStatus::Done]);

        $task = AiTasks::request($this->editor, 'institution', null, 'Completa os contactos.');

        $this->assertSame(AiTaskStatus::Skipped, $task->refresh()->status);
        Http::assertNothingSent();
    }

    public function test_the_budget_also_stops_a_task_between_turns(): void
    {
        // One turn of 600,000 input tokens costs 1.20 USD: over the 1.00 budget, under the token limit.
        config(['ai.task_max_tokens' => 10_000_000]);
        Http::fake([self::API => Http::sequence()
            ->push($this->answer('tool_use', [['type' => 'tool_use', 'id' => 'tu_1', 'name' => 'list_missing', 'input' => ['type' => 'institution']]], input: 600_000))
            ->push($this->answer('end_turn', [['type' => 'text', 'text' => 'Nunca chega aqui.']])),
        ]);

        $task = AiTasks::request($this->editor, 'institution', null, 'Completa os contactos.');

        Http::assertSentCount(1);
        $this->assertSame(AiTaskStatus::Done, $task->refresh()->status);
        $this->assertStringContainsString('budget', (string) $task->refresh()->error);
    }

    public function test_a_refusal_or_an_api_error_fails_the_task_without_drafts(): void
    {
        Http::fake([self::API => Http::sequence()
            ->push(['model' => 'claude-sonnet-5-5', 'stop_reason' => 'refusal', 'stop_details' => ['category' => 'cyber'], 'content' => [], 'usage' => []])
            ->push(['error' => ['message' => 'echo of the request']], 500)]);

        $refused = AiTasks::request($this->editor, 'institution', null, 'Completa os contactos.');
        $broken = AiTasks::request($this->editor, 'institution', null, 'Completa os contactos.');

        $this->assertSame(AiTaskStatus::Failed, $refused->refresh()->status);
        $this->assertStringContainsString('cyber', (string) $refused->refresh()->error);
        $this->assertSame(AiTaskStatus::Failed, $broken->refresh()->status);
        $this->assertStringNotContainsString('echo of the request', (string) $broken->refresh()->error);
        $this->assertSame(0, Revision::query()->count());
    }

    public function test_without_a_key_or_permission_nothing_is_queued(): void
    {
        $this->expectException(InvalidProposal::class);
        try {
            AiTasks::request(User::factory()->reviewer()->create(), 'institution', null, 'Completa os contactos.');
        } finally {
            config(['ai.key' => '']);
            try {
                AiTasks::request($this->editor, 'institution', null, 'Completa os contactos.');
            } catch (InvalidProposal) {
            }
            $this->assertSame(0, AiTask::query()->count());
        }
    }

    public function test_the_panel_asks_for_a_research(): void
    {
        Http::fake([self::API => Http::response($this->answer('end_turn', [['type' => 'text', 'text' => 'Feito.']]))]);
        config(['kaye.admin_emails' => [$this->editor->email]]);
        $this->actingAs($this->editor);
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(ListAiTasks::class)
            ->callAction('researchWithAi', ['type' => 'institution', 'slug' => '', 'prompt' => 'Completa os contactos das universidades de Luanda.'])
            ->assertNotified();

        $this->assertSame(AiTaskStatus::Done, AiTask::query()->sole()->status);
    }

    /**
     * @param  list<array<string, mixed>>  $content
     * @return array<string, mixed>
     */
    private function answer(string $stop, array $content, int $input = 1000, int $searches = 0): array
    {
        return [
            'id' => 'msg_'.uniqid(), 'type' => 'message', 'role' => 'assistant', 'model' => 'claude-sonnet-5-5',
            'stop_reason' => $stop, 'content' => $content,
            'usage' => ['input_tokens' => $input, 'output_tokens' => 500, 'server_tool_use' => ['web_search_requests' => $searches]],
        ];
    }
}

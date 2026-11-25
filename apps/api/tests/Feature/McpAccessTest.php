<?php

namespace Tests\Feature;

use App\Filament\Pages\AiConnection;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\PersonalAccessToken;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * /mcp (docs/ia.md): only an MCP token made in the panel, of someone who writes content and is on ADMIN_EMAILS.
 */
class McpAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['ed@kaye.test', 'out@kaye.test']]);
    }

    public function test_without_a_token_the_answer_is_401(): void
    {
        $this->listTools()->assertUnauthorized();
        $this->listTools('1|not-a-real-token')->assertUnauthorized();
    }

    public function test_the_apps_own_token_with_every_ability_is_refused(): void
    {
        $editor = User::factory()->editor()->create(['email' => 'ed@kaye.test']);

        // The Android app's token has `*`: Sanctum's tokenCan('mcp') would say yes.
        $this->listTools($editor->createToken('android')->plainTextToken)->assertForbidden();
        $this->listTools($editor->createToken('other', ['read'])->plainTextToken)->assertForbidden();
    }

    public function test_a_session_cookie_is_not_an_mcp_token(): void
    {
        $this->actingAs(User::factory()->editor()->create(['email' => 'ed@kaye.test']))
            ->postJson('/mcp', $this->body())->assertForbidden();
    }

    public function test_an_mcp_token_of_someone_who_cannot_write_content_is_refused(): void
    {
        $user = User::factory()->create(['email' => 'out@kaye.test']);
        $outsider = User::factory()->editor()->create(['email' => 'not-listed@kaye.test']);
        $reviewer = User::factory()->reviewer()->create(['email' => 'ed@kaye.test']);

        $this->listTools($user->createToken('mcp', ['mcp'])->plainTextToken)->assertForbidden();
        $this->listTools($outsider->createToken('mcp', ['mcp'])->plainTextToken)->assertForbidden();
        $this->listTools($reviewer->createToken('mcp', ['mcp'])->plainTextToken)->assertForbidden();
    }

    public function test_an_expired_mcp_token_is_refused(): void
    {
        $editor = User::factory()->editor()->create(['email' => 'ed@kaye.test']);
        $token = $editor->createToken('mcp', ['mcp'], now()->subMinute())->plainTextToken;

        $this->listTools($token)->assertUnauthorized();
    }

    public function test_an_mcp_token_lists_the_six_tools(): void
    {
        $editor = User::factory()->editor()->create(['email' => 'ed@kaye.test']);

        $tools = $this->listTools($editor->createToken('mcp', ['mcp'])->plainTextToken)->assertOk()->json('result.tools.*.name');

        $this->assertEqualsCanonicalizing(['search_content', 'get_content', 'list_missing', 'list_sources', 'propose_change', 'attach_image'], $tools);
    }

    public function test_the_panel_creates_a_token_with_only_the_mcp_ability_and_revokes_it(): void
    {
        $editor = User::factory()->editor()->create(['email' => 'ed@kaye.test']);
        $this->actingAs($editor);
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(AiConnection::class)->callAction('createToken', ['name' => 'Claude Code'])->assertNotified();

        $token = PersonalAccessToken::query()->sole();
        $this->assertSame(['mcp'], $token->abilities);
        $this->assertEqualsWithDelta(now()->addDays(90)->timestamp, $token->expires_at?->timestamp, 5);

        Livewire::test(AiConnection::class)->call('revoke', $token->id);
        $this->assertSame(0, PersonalAccessToken::query()->count());
    }

    public function test_the_connection_page_is_only_for_who_writes_content(): void
    {
        config(['kaye.admin_emails' => ['rev@kaye.test']]);

        $this->actingAs(User::factory()->reviewer()->create(['email' => 'rev@kaye.test']))->get('/admin/ai-connection')->assertForbidden();
    }

    /**
     * @return TestResponse<\Illuminate\Http\JsonResponse>
     */
    private function listTools(?string $token = null): TestResponse
    {
        return $this->postJson('/mcp', $this->body(), $token === null ? [] : ['Authorization' => 'Bearer '.$token]);
    }

    /**
     * @return array<string, mixed>
     */
    private function body(): array
    {
        return ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list', 'params' => (object) []];
    }
}

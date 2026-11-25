<?php

namespace Tests\Feature;

use App\Enums\StaffRole;
use App\Filament\Widgets\ContentStatus;
use App\Filament\Widgets\MissingFields;
use App\Filament\Widgets\OverviewStats;
use App\Filament\Widgets\SystemStatus;
use App\Models\Career;
use App\Models\MessageDelivery;
use App\Models\Revision;
use App\Models\User;
use App\Models\WaitlistEntry;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * The panel's own pages (docs/design.md, "Painel"): each opens for the role that needs it and is closed (403) to a
 * role without the permission. The theme is the site's: our font, colours and logo, nothing from another domain.
 */
class PanelPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['admin@kaye.test', 'editor@kaye.test', 'reviewer@kaye.test']]);
    }

    /**
     * @return iterable<string, array{string, StaffRole, StaffRole|null}>
     */
    public static function pages(): iterable
    {
        // path, a role that opens it, a role that does not (null: every staff role opens it)
        yield 'Painel inicial' => ['/admin', StaffRole::Reviewer, null];
        yield 'Caixa da IA' => ['/admin/revisions', StaffRole::Reviewer, null];
        yield 'Pesquisas' => ['/admin/ai-tasks', StaffRole::Reviewer, null];
        yield 'Tokens MCP' => ['/admin/ai-connection', StaffRole::Editor, StaffRole::Reviewer];
        yield 'Comentários' => ['/admin/comments', StaffRole::Reviewer, StaffRole::Editor];
        yield 'Críticas' => ['/admin/feedback', StaffRole::Admin, StaffRole::Editor];
        yield 'Entrevistas' => ['/admin/interviews', StaffRole::Admin, StaffRole::Reviewer];
        yield 'Colar vaga' => ['/admin/paste-job', StaffRole::Editor, StaffRole::Reviewer];
        yield 'Campanhas' => ['/admin/messages', StaffRole::Editor, StaffRole::Reviewer];
        yield 'Modelos' => ['/admin/message-templates', StaffRole::Editor, StaffRole::Reviewer];
        yield 'Consentimentos' => ['/admin/consents', StaffRole::Admin, StaffRole::Editor];
        yield 'Relatórios' => ['/admin/communication-reports', StaffRole::Editor, StaffRole::Reviewer];
        yield 'Pessoas' => ['/admin/pessoas', StaffRole::Admin, StaffRole::Editor];
        yield 'Lista de espera' => ['/admin/waitlist-entries', StaffRole::Admin, StaffRole::Reviewer];
        yield 'Equipa e papéis' => ['/admin/equipa', StaffRole::Admin, StaffRole::Editor];
        yield 'Auditoria' => ['/admin/auditoria', StaffRole::Admin, StaffRole::Reviewer];
        yield 'Definições' => ['/admin/definicoes', StaffRole::Admin, StaffRole::Editor];
    }

    #[DataProvider('pages')]
    public function test_each_page_opens_only_for_who_needs_it(string $path, StaffRole $allowed, ?StaffRole $refused): void
    {
        $this->actingAs(self::staff($allowed))->get($path)->assertOk();
        if ($refused !== null) {
            $this->actingAs(self::staff($refused))->get($path)->assertForbidden();
        }
    }

    public function test_the_dashboard_counts_what_matters(): void
    {
        Career::factory()->count(2)->create(['source_url' => null]);
        WaitlistEntry::factory()->count(3)->create();
        MessageDelivery::factory()->create(['status' => 'failed']);
        Revision::factory()->create();

        $this->actingAs(self::staff(StaffRole::Admin));
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(OverviewStats::class)
            ->assertSee('Lista de espera')
            ->assertSee('+3 em 7 dias')
            ->assertSee('Entregas (7 dias)')
            ->assertSee('1 falharam')
            ->assertSee('Caixa da IA')
            ->assertSee('Custo da IA hoje');
        Livewire::test(ContentStatus::class)->assertSee('Registos por estado')->assertSee('Carreiras');
        Livewire::test(MissingFields::class)->assertSee('Campos em falta por área')->assertSee('Instituição de ensino');
        Livewire::test(SystemStatus::class)->assertSee('Saúde')->assertSee('Base de dados');
    }

    public function test_a_reviewer_does_not_see_the_people_or_the_system_on_the_dashboard(): void
    {
        WaitlistEntry::factory()->create();
        $this->actingAs(self::staff(StaffRole::Reviewer));
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        $this->assertTrue(ContentStatus::canView());
        $this->assertFalse(SystemStatus::canView());
        Livewire::test(OverviewStats::class)->assertSee('Caixa da IA')->assertDontSee('Lista de espera')->assertDontSee('Entregas');
    }

    public function test_the_panel_wears_the_site_theme_from_our_own_domain(): void
    {
        $page = $this->actingAs(self::staff(StaffRole::Admin))->get('/admin')->assertOk();

        $page->assertSee('Bricolage Grotesque Variable', false)
            ->assertSee('images/kaye-logo.png', false)
            ->assertSee('images/favicon.svg', false)
            ->assertDontSee('fonts.bunny.net', false)
            ->assertDontSee('fonts.googleapis.com', false);
        $this->assertStringContainsString("script-src 'self' 'unsafe-inline' 'unsafe-eval'", (string) $page->headers->get('Content-Security-Policy'));
        $this->assertStringContainsString("frame-ancestors 'none'", (string) $page->headers->get('Content-Security-Policy'));
    }

    public function test_the_panel_speaks_portuguese_whatever_the_browser_asks(): void
    {
        $this->actingAs(self::staff(StaffRole::Admin))
            ->withHeader('Accept-Language', 'fr-FR,fr;q=0.9')
            ->get('/admin/careers')
            ->assertOk()
            ->assertSee('Carreiras')
            ->assertSee('Pesquisar');
    }

    private static function staff(StaffRole $role): User
    {
        return User::factory()->staff($role)->create(['email' => $role->value.'@kaye.test']);
    }
}

<?php

namespace Tests\Feature;

use App\Filament\Pages\SettingsPage;
use App\Models\User;
use App\Support\AuditLog;
use App\Support\Settings;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Livewire\Livewire;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

/**
 * "Definições" (ADR 0028): a key saved in the panel replaces the .env's, is stored encrypted and is never shown
 * again, not on the page, not in the audit log. Only an admin changes them.
 */
class PanelSettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['boss@kaye.test', 'editor@kaye.test'], 'ai.key' => '', 'ai.daily_budget_usd' => 2.0]);
        $this->admin = User::factory()->admin()->create(['email' => 'boss@kaye.test']);
        Filament::setCurrentPanel(Filament::getPanel('admin'));
    }

    public function test_a_saved_key_replaces_the_env_is_encrypted_and_never_shown_again(): void
    {
        $this->actingAs($this->admin);
        Livewire::test(SettingsPage::class)
            ->callAction(TestAction::make('change')->arguments(['key' => 'anthropic_api_key']), ['value' => 'sk-ant-segredo-123'])
            ->assertHasNoActionErrors()
            ->assertDontSee('sk-ant-segredo-123')
            ->assertSee('Definida (escondida)');

        $stored = DB::table('settings')->where('key', 'anthropic_api_key')->value('value');
        $this->assertIsString($stored);
        $this->assertStringNotContainsString('sk-ant-segredo-123', $stored);

        // The next boot reads it.
        config(['ai.key' => '']);
        Settings::apply();
        $this->assertSame('sk-ant-segredo-123', config('ai.key'));

        $this->get('/admin/definicoes')->assertOk()->assertDontSee('sk-ant-segredo-123');
        $log = Activity::query()->where('log_name', AuditLog::ADMIN)->where('event', 'setting_changed')->sole();
        $this->assertSame('{"key":"anthropic_api_key"}', $log->getRawOriginal('properties'));
        $this->assertStringNotContainsString('sk-ant', (string) json_encode(Activity::query()->get()->toArray()));
    }

    public function test_a_limit_is_a_number_and_going_back_restores_the_env(): void
    {
        $this->actingAs($this->admin);
        Livewire::test(SettingsPage::class)
            ->callAction(TestAction::make('change')->arguments(['key' => 'ai_daily_budget_usd']), ['value' => 'muito'])
            ->assertHasActionErrors(['value']);

        Livewire::test(SettingsPage::class)
            ->callAction(TestAction::make('change')->arguments(['key' => 'ai_daily_budget_usd']), ['value' => '5.5'])
            ->assertHasNoActionErrors()
            ->assertSee('5.5');
        Settings::apply();
        $this->assertSame(5.5, config('ai.daily_budget_usd'));

        Livewire::test(SettingsPage::class)->callAction(TestAction::make('forget')->arguments(['key' => 'ai_daily_budget_usd']));
        $this->assertFalse(DB::table('settings')->exists());
    }

    public function test_a_value_saved_with_another_app_key_is_ignored(): void
    {
        DB::table('settings')->insert(['key' => 'health_token', 'value' => 'not-encrypted-with-this-key', 'created_at' => now(), 'updated_at' => now()]);
        config(['kaye.health_token' => 'from-env']);

        Settings::apply();

        $this->assertSame('from-env', config('kaye.health_token'));
    }

    public function test_only_an_admin_changes_the_settings(): void
    {
        $editor = User::factory()->editor()->create(['email' => 'editor@kaye.test']);

        $this->actingAs($editor)->get('/admin/definicoes')->assertForbidden();
        $this->expectException(InvalidArgumentException::class);
        Settings::save('app_key', 'x', $this->admin);
    }
}

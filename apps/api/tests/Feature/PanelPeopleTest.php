<?php

namespace Tests\Feature;

use App\Filament\Resources\Activities\Pages\ListActivities;
use App\Filament\Resources\People\Pages\ListPeople;
use App\Filament\Resources\Staff\Pages\ListStaff;
use App\Models\User;
use App\Support\AuditLog;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Livewire\Livewire;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

/**
 * "Pessoas", "Equipa e papéis" and "Auditoria": the accounts only to answer a request (the least about minors),
 * the team's roles, and who did what.
 */
class PanelPeopleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['boss@kaye.test', 'nova@kaye.test']]);
        $this->admin = User::factory()->admin()->create(['email' => 'boss@kaye.test']);
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        $this->actingAs($this->admin);
    }

    public function test_people_show_the_least_and_a_minor_even_less(): void
    {
        $adult = User::factory()->create(['name' => 'Carlos Neto', 'email' => 'carlos.neto@gmail.com', 'province' => 'Huíla']);
        $minor = User::factory()->minor()->create(['name' => 'Joana Kiala', 'email' => 'joana.k@gmail.com', 'province' => 'Benguela']);

        Livewire::test(ListPeople::class)
            ->assertCanSeeTableRecords([$adult, $minor])
            ->assertCanNotSeeTableRecords([$this->admin])
            ->assertSee('Carlos Neto')
            ->assertSee('Huíla')
            ->assertSee('Menor: J.K.')
            ->assertDontSee('Joana')
            ->assertDontSee('Benguela')
            ->assertDontSee('joana.k@gmail.com')
            ->assertSee('j••••••@gmail.com');
    }

    public function test_an_account_is_found_by_its_whole_email_or_number_only(): void
    {
        $person = User::factory()->create(['email' => 'carlos.neto@gmail.com']);
        $other = User::factory()->create();

        Livewire::test(ListPeople::class)->searchTable('carlos.neto@gmail.com')
            ->assertCanSeeTableRecords([$person])->assertCanNotSeeTableRecords([$other]);
        Livewire::test(ListPeople::class)->searchTable('carlos')
            ->assertCanNotSeeTableRecords([$person, $other]);
        Livewire::test(ListPeople::class)->searchTable('#'.$person->id)
            ->assertCanSeeTableRecords([$person])->assertCanNotSeeTableRecords([$other]);
    }

    public function test_a_request_downloads_the_data_or_deletes_the_account_with_a_record(): void
    {
        $person = User::factory()->create();

        Livewire::test(ListPeople::class)->callAction(TestAction::make('export')->table($person))->assertFileDownloaded("kaye-conta-{$person->id}.json");
        $this->assertTrue(Activity::query()->where('event', 'account_exported')->where('subject_id', $person->id)->exists());

        Livewire::test(ListPeople::class)
            ->callAction(TestAction::make('erase')->table($person), ['confirm' => 'apagar'])
            ->assertHasActionErrors(['confirm']);
        $this->assertNotNull($person->fresh());

        Livewire::test(ListPeople::class)->callAction(TestAction::make('erase')->table($person), ['confirm' => 'APAGAR']);
        $this->assertNull(User::withTrashed()->find($person->id));
        $this->assertTrue(Activity::query()->where('log_name', AuditLog::ADMIN)->where('event', 'account_deleted')->exists());
    }

    public function test_a_role_is_given_to_an_account_with_a_password_shown_once(): void
    {
        $person = User::factory()->create(['email' => 'nova@kaye.test', 'password' => null]);

        Livewire::test(ListStaff::class)
            ->callAction(TestAction::make('add')->table(), ['user' => $person->id, 'role' => 'editor'])
            ->assertNotified();

        $person->refresh();
        $this->assertTrue($person->hasRole('editor'));
        $this->assertNotNull($person->getAttribute('password'));
        $this->assertTrue(Activity::query()->where('event', 'staff_password_reset')->exists());
    }

    public function test_the_team_is_managed_but_nobody_changes_their_own_account(): void
    {
        $editor = User::factory()->editor()->create(['email' => 'nova@kaye.test']);

        Livewire::test(ListStaff::class)
            ->assertCanSeeTableRecords([$this->admin, $editor])
            ->assertActionHidden(TestAction::make('role')->table($this->admin))
            ->callAction(TestAction::make('role')->table($editor), ['role' => 'reviewer']);
        $this->assertTrue($editor->refresh()->hasRole('reviewer'));
        $this->assertFalse($editor->hasRole('editor'));

        Livewire::test(ListStaff::class)->callAction(TestAction::make('resetTotp')->table($editor));
        $this->assertNull($editor->refresh()->getAppAuthenticationSecret());

        $old = $this->passwordOf($editor);
        Livewire::test(ListStaff::class)->callAction(TestAction::make('password')->table($editor));
        $this->assertNotSame($old, $this->passwordOf($editor->refresh()));
        $this->assertFalse(Hash::check('password', $this->passwordOf($editor)));

        Livewire::test(ListStaff::class)->callAction(TestAction::make('remove')->table($editor));
        $editor->refresh();
        $this->assertFalse($editor->isStaff());
        $this->assertNull($editor->getAttribute('password'));
        $this->get('/admin')->assertOk();
    }

    public function test_the_audit_log_shows_who_did_what_escaped(): void
    {
        AuditLog::admin('csv_export', $this->admin, ['kind' => '<script>alert(1)</script>']);
        $entry = Activity::query()->where('event', 'csv_export')->sole();

        $page = Livewire::test(ListActivities::class)->assertCanSeeTableRecords([$entry]);
        $page->mountAction(TestAction::make('details')->table($entry));
        $page->assertMountedActionModalSeeHtml('&lt;script&gt;');
        $page->assertMountedActionModalDontSeeHtml('<script>alert(1)</script>');
    }

    private function passwordOf(User $user): string
    {
        $password = $user->getAttribute('password');

        return is_string($password) ? $password : '';
    }
}

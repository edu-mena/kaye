<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\RevisionStatus;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\Resources\Careers\CareerResource;
use App\Filament\Resources\Careers\Pages\EditCareer;
use App\Filament\Resources\Careers\Pages\ListCareers;
use App\Filament\Resources\Companies\Pages\EditCompany;
use App\Filament\Resources\Institutions\Pages\EditInstitution;
use App\Models\Area;
use App\Models\Career;
use App\Models\Company;
use App\Models\Institution;
use App\Models\Revision;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * What the team saves in the panel (ADR 0028): it reaches the app at once (the API's cache is cleared), it is kept
 * in the row's history, and the next deploy's `kaye:import` does not undo it, a field or a link.
 */
class PanelEditsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['boss@kaye.test', 'editor@kaye.test', 'reviewer@kaye.test']]);
        $this->admin = User::factory()->admin()->create(['email' => 'boss@kaye.test']);
        Filament::setCurrentPanel(Filament::getPanel('admin'));
    }

    public function test_a_change_in_the_panel_reaches_the_app_at_once(): void
    {
        $career = Career::factory()->create(['slug' => 'enfermeiro', 'status' => ContentStatus::Published, 'detailed' => true, 'summary' => ['pt' => 'Cuida dos doentes.']]);
        $this->getJson('/api/v1/occupations/enfermeiro')->assertOk()->assertJsonPath('summary', 'Cuida dos doentes.');

        $this->actingAs($this->admin);
        Livewire::test(EditCareer::class, ['record' => $career->getRouteKey()])
            ->fillForm(['summary' => ['pt' => 'Cuida das pessoas no hospital e no centro de saúde.']])
            ->call('save')
            ->assertHasNoFormErrors();

        // The answer was cached for 5 minutes: the save cleared it.
        $this->getJson('/api/v1/occupations/enfermeiro')->assertOk()
            ->assertJsonPath('summary', 'Cuida das pessoas no hospital e no centro de saúde.');
    }

    public function test_an_edited_field_and_link_survive_the_next_import(): void
    {
        $this->seed();
        $company = Company::query()->has('careers', '>=', 2)->orderBy('id')->firstOrFail();
        $dropped = $company->careers()->firstOrFail();
        $institution = Institution::query()->orderBy('id')->firstOrFail();
        $place = $institution->place;
        $this->actingAs($this->admin);

        Livewire::test(EditInstitution::class, ['record' => $institution->getRouteKey()])
            ->fillForm(['address' => 'Rua Direita do Panel, 12'])
            ->call('save')
            ->assertHasNoFormErrors();
        Livewire::test(LinkedCareersRelationManager::class, ['ownerRecord' => $company, 'pageClass' => EditCompany::class])
            ->callAction(TestAction::make('detach')->table($dropped));
        // Changed without the panel: not protected, the export wins, as before.
        $institution->refresh()->forceFill(['place' => 'Mudado à mão'])->save();

        $this->assertSame(0, Artisan::call('kaye:import'));

        $institution->refresh();
        $this->assertSame('Rua Direita do Panel, 12', $institution->address);
        $this->assertSame($place, $institution->place);
        $this->assertFalse($company->careers()->whereKey($dropped->id)->exists(), 'The import linked the career again.');

        $edit = Revision::query()->where('revisable_type', $institution->getMorphClass())->where('revisable_id', $institution->id)->sole();
        $this->assertSame(RevisionStatus::Edited, $edit->status);
        $this->assertSame(['address' => 'Rua Direita do Panel, 12'], $edit->changes);
        $this->assertSame($this->admin->id, $edit->author_id);
    }

    public function test_an_empty_language_is_taken_out_and_a_list_stays_a_list(): void
    {
        $career = Career::factory()->create([
            'summary' => ['pt' => 'Resumo.', 'en' => 'Summary.'],
            'stages' => ['pt' => [['level' => 'junior', 'title' => 'Júnior']]],
        ]);
        $this->actingAs($this->admin);

        Livewire::test(EditCareer::class, ['record' => $career->getRouteKey()])
            ->assertFormSet(['summary' => ['pt' => 'Resumo.', 'en' => 'Summary.', 'fr' => null]])
            ->fillForm([
                'summary' => ['pt' => 'Resumo novo.', 'en' => '', 'fr' => 'Résumé.'],
                'stages' => ['pt' => '[{"level": "junior", "title": "Júnior"}, {"level": "senior", "title": "Sénior"}]'],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $career->refresh();
        $this->assertSame(['pt' => 'Resumo novo.', 'fr' => 'Résumé.'], $career->getTranslations('summary'));
        $this->assertSame([['level' => 'junior', 'title' => 'Júnior'], ['level' => 'senior', 'title' => 'Sénior']], $career->getTranslation('stages', 'pt'));
    }

    public function test_a_list_with_broken_json_is_refused(): void
    {
        $company = Company::factory()->create();
        $this->actingAs($this->admin);

        Livewire::test(EditCompany::class, ['record' => $company->getRouteKey()])
            ->fillForm(['sources' => '[{"label": "Site", "url": "https://x.ao"},]'])
            ->call('save')
            ->assertHasFormErrors(['sources']);
    }

    public function test_an_uploaded_image_needs_its_origin_which_joins_the_sources(): void
    {
        Storage::fake('public');
        $company = Company::factory()->create(['sources' => []]);
        $this->actingAs($this->admin);

        Livewire::test(EditCompany::class, ['record' => $company->getRouteKey()])
            ->fillForm(['uploads' => ['logo' => UploadedFile::fake()->image('logo.png', 200, 200)]])
            ->call('save')
            ->assertHasFormErrors(['origins.logo' => 'required']);

        Livewire::test(EditCompany::class, ['record' => $company->getRouteKey()])
            ->fillForm([
                'uploads' => ['logo' => UploadedFile::fake()->image('logo.png', 200, 200)],
                'origins' => ['logo' => 'https://www.empresa.ao/marca'],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $company->refresh();
        $this->assertStringContainsString('/storage/catalogue/companies/', (string) $company->logo);
        $this->assertSame([['label' => 'Imagem: www.empresa.ao', 'url' => 'https://www.empresa.ao/marca']], $company->sources);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', (string) parse_url((string) $company->logo, PHP_URL_PATH)));
        $this->assertSame('https://www.empresa.ao/marca', Revision::query()->where('revisable_id', $company->id)->sole()->source_url);
    }

    public function test_an_editor_writes_but_only_a_reviewer_publishes(): void
    {
        $career = Career::factory()->create(['status' => ContentStatus::Draft]);
        $editor = User::factory()->editor()->create(['email' => 'editor@kaye.test']);
        $reviewer = User::factory()->reviewer()->create(['email' => 'reviewer@kaye.test']);

        $this->actingAs($editor);
        Livewire::test(EditCareer::class, ['record' => $career->getRouteKey()])
            ->assertFormFieldDisabled('status')
            ->fillForm(['status' => 'published', 'position' => 3])
            ->call('save')
            ->assertHasNoFormErrors();
        $this->assertSame(ContentStatus::Draft, $career->refresh()->status, 'An editor published.');
        $this->assertSame(3, $career->position);
        Livewire::test(ListCareers::class)->assertActionHidden(TestAction::make('publish')->table()->bulk());

        $this->actingAs($reviewer);
        Livewire::test(ListCareers::class)
            ->selectTableRecords([$career])
            ->callAction(TestAction::make('publish')->table()->bulk());
        $this->assertSame(ContentStatus::Published, $career->refresh()->status);

        Livewire::test(ListCareers::class)->assertActionHidden(TestAction::make('reviewed')->table()->bulk());
    }

    public function test_marking_rows_reviewed_sets_today_and_keeps_it_from_the_import(): void
    {
        $careers = Career::factory()->count(2)->create(['source_checked_at' => '2025-01-01']);
        $this->actingAs($this->admin);

        Livewire::test(ListCareers::class)
            ->selectTableRecords($careers)
            ->callAction(TestAction::make('reviewed')->table()->bulk());

        foreach ($careers as $career) {
            $this->assertSame(now()->toDateString(), $career->refresh()->source_checked_at?->toDateString());
            $this->assertSame(['source_checked_at' => now()->toDateString()], Revision::query()->where('revisable_id', $career->id)->where('revisable_type', $career->getMorphClass())->sole()->changes);
        }
    }

    public function test_filters_find_rows_without_a_source_and_by_area(): void
    {
        $sourced = Career::factory()->create(['source_url' => 'https://ine.gov.ao']);
        $unsourced = Career::factory()->create(['source_url' => null]);
        $this->actingAs($this->admin);

        Livewire::test(ListCareers::class)
            ->filterTable('without_source', true)
            ->assertCanSeeTableRecords([$unsourced])
            ->assertCanNotSeeTableRecords([$sourced]);

        $slug = Area::query()->whereKey($sourced->group()->value('area_id'))->value('slug');
        Livewire::test(ListCareers::class)
            ->filterTable('area', $slug)
            ->assertCanSeeTableRecords([$sourced]);
    }

    public function test_ver_na_app_opens_the_row_in_the_app(): void
    {
        $career = Career::factory()->create(['slug' => 'enfermeiro']);
        $this->actingAs($this->admin);

        Livewire::test(ListCareers::class)
            ->assertActionHasUrl(TestAction::make('preview')->table($career), url('/carreiras/enfermeiro'));
        $this->assertSame('/carreiras/enfermeiro', CareerResource::previewPath($career));
    }
}

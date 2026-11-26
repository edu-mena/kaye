<?php

namespace Tests\Feature;

use App\Enums\RevisionStatus;
use App\Filament\Content\Column;
use App\Filament\Content\ContentColumns;
use App\Filament\Content\ContentForm;
use App\Filament\Content\ContentResource;
use App\Models\Revision;
use App\Models\User;
use App\Support\ContentEditor;
use BackedEnum;
use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Every catalogue resource of the panel (docs/design.md, "Painel"), one generic test per table: it lists, it
 * creates, it opens and saves without changing anything, it keeps the change in the history, and it refuses who
 * may not.
 */
class PanelResourcesTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.admin_emails' => ['boss@kaye.test', 'reviewer@kaye.test', 'person@kaye.test']]);
        $this->admin = User::factory()->admin()->create(['email' => 'boss@kaye.test']);
        Filament::setCurrentPanel(Filament::getPanel('admin'));
    }

    /**
     * @return iterable<string, array{class-string<ContentResource>}>
     */
    public static function catalogue(): iterable
    {
        foreach (glob(__DIR__.'/../../app/Filament/Resources/*/*Resource.php') ?: [] as $file) {
            $class = 'App\\Filament\\Resources\\'.basename(dirname($file)).'\\'.basename($file, '.php');
            if (is_subclass_of($class, ContentResource::class)) {
                yield class_basename($class) => [$class];
            }
        }
    }

    /**
     * @param  class-string<ContentResource>  $resource
     */
    #[DataProvider('catalogue')]
    public function test_it_lists_creates_and_edits(string $resource): void
    {
        $model = $resource::getModel();
        $existing = Factory::factoryForModel($model)->createOne();
        $this->actingAs($this->admin);

        $this->get($resource::getUrl('index'))->assertOk();
        Livewire::test($resource::getPages()['index']->getPage())->assertCanSeeTableRecords([$existing]);

        $new = Factory::factoryForModel($model)->makeOne();
        Livewire::test($resource::getPages()['create']->getPage())
            ->fillForm(self::formState($new))
            ->call('create')
            ->assertHasNoFormErrors();
        $this->assertSame(2, $model::query()->count(), "{$resource}: the new row was not created.");

        // Opening and saving without a change changes nothing: every value survives the trip through the form.
        $before = self::values($existing->refresh());
        $this->get($resource::getUrl('edit', ['record' => $existing]))->assertOk();
        Livewire::test($resource::getPages()['edit']->getPage(), ['record' => $existing->getRouteKey()])
            ->call('save')
            ->assertHasNoFormErrors();
        $this->assertSame($before, self::values($existing->refresh()), "{$resource}: saving the form unchanged changed the row.");
        $this->assertFalse(Revision::query()->where('revisable_type', $existing->getMorphClass())->where('revisable_id', $existing->getKey())->exists());

        if (ContentColumns::has($model, 'position')) {
            Livewire::test($resource::getPages()['edit']->getPage(), ['record' => $existing->getRouteKey()])
                ->fillForm(['position' => 7])
                ->call('save')
                ->assertHasNoFormErrors();
            $this->assertSame(7, $existing->refresh()->getAttribute('position'));
            $edit = Revision::query()->where('revisable_type', $existing->getMorphClass())->where('revisable_id', $existing->getKey())->sole();
            $this->assertSame(RevisionStatus::Edited, $edit->status);
            $this->assertSame(['position' => 7], $edit->changes);
        }
    }

    /**
     * @param  class-string<ContentResource>  $resource
     */
    #[DataProvider('catalogue')]
    public function test_without_permission_it_is_forbidden(string $resource): void
    {
        // Allowlisted but without a staff role: no panel at all.
        $this->actingAs(User::factory()->create(['email' => 'person@kaye.test']))
            ->get($resource::getUrl('index'))->assertForbidden();

        // A reviewer reads and publishes, but writes nothing.
        $reviewer = User::factory()->reviewer()->create(['email' => 'reviewer@kaye.test']);
        $this->actingAs($reviewer)->get($resource::getUrl('index'))->assertOk();
        $this->actingAs($reviewer)->get($resource::getUrl('create'))->assertForbidden();
    }

    /**
     * The form's state for a model made by its factory: what the edit page would show.
     *
     * @return array<string, mixed>
     */
    private static function formState(Model $model): array
    {
        $columns = ContentColumns::of($model::class);
        $data = ContentForm::fill($model, $model->attributesToArray());
        $state = [];
        foreach ($data as $key => $value) {
            if (isset($columns[$key]) && ! $columns[$key]->isImage()) {
                $state[$key] = $value instanceof BackedEnum ? $value->value : $value;
            }
        }

        return $state;
    }

    /**
     * @return array<string, mixed>
     */
    private static function values(Model $record): array
    {
        $values = [];
        foreach (ContentColumns::of($record::class) as $column) {
            $value = app(ContentEditor::class)->value($record, $column->name);
            // A decimal comes back as "12.50" from the database and as 12.5 from a fresh model: compare numbers.
            $values[$column->name] = $column->kind === Column::DECIMAL && is_numeric($value) ? (float) $value : $value;
        }

        return $values;
    }
}

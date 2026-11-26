<?php

namespace Tests\Feature;

use App\Models\Institution;
use App\Models\User;
use App\Support\ContentEditor;
use App\Support\Revisions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

/**
 * `kaye:import` runs on every deploy with the frontend's export. A field a reviewer approved now belongs to the
 * database: before, the next deploy put the old value back. The other fields keep coming from the export.
 */
class ImportKeepsApprovalsTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_approved_field_survives_the_next_import(): void
    {
        $this->seed();
        $institution = Institution::query()->whereNull('phone')->orderBy('id')->firstOrFail();
        $place = $institution->place;

        $revision = app(ContentEditor::class)->propose('institution', (string) $institution->slug, ['phone' => '+244 222 333 444'], 'https://example.ao/contactos', null, User::factory()->editor()->create());
        app(Revisions::class)->approve($revision, User::factory()->reviewer()->create());
        // A change made without a revision is not protected: the export wins, as before.
        $institution->refresh()->forceFill(['place' => 'Mudado à mão'])->save();

        $this->assertSame(0, Artisan::call('kaye:import'));

        $institution->refresh();
        $this->assertSame('+244 222 333 444', $institution->phone);
        $this->assertSame('https://example.ao/contactos', $institution->source_url);
        $this->assertSame($place, $institution->place);
    }
}

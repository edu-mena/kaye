<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Filament\Resources\Feedback\Pages\ListFeedback;
use App\Filament\Resources\WaitlistEntries\Pages\ListWaitlistEntries;
use App\Models\Feedback;
use App\Models\User;
use App\Models\WaitlistEntry;
use App\Support\Consents;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * The waiting list and the feedback as CSV: GET /waitlist/export with WAITLIST_EXPORT_TOKEN, and the panel.
 */
class WaitlistExportTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'a-long-export-token-1234';

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.waitlist_export_token' => self::TOKEN]);
        Carbon::setTestNow('2026-11-18 09:30:00');

        $entries = [
            WaitlistEntry::query()->create([
                'name' => 'Ana "A"', 'email' => 'ana@example.com', 'whatsapp' => '+244923456789', 'source' => 'landing',
                'locale' => 'pt', 'consent_at' => now(), 'created_at' => '2026-11-13 10:00:00',
            ]),
            WaitlistEntry::query()->create([
                'name' => '=HYPERLINK("x")', 'email' => null, 'whatsapp' => '+244931111111', 'source' => 'onboarding',
                'locale' => 'en', 'consent_at' => now(), 'created_at' => '2026-11-14 11:00:00',
            ]),
        ];
        foreach ($entries as $entry) {
            Consents::forWaitlist($entry, null);
        }
        Feedback::query()->create([
            'kind' => 'idea', 'message' => "-1 linha\ncom quebra", 'page' => 'support', 'locale' => 'fr', 'created_at' => '2026-11-15 12:00:00',
        ]);
    }

    public function test_the_waiting_list_downloads_as_csv(): void
    {
        $response = $this->get('/api/v1/waitlist/export', ['X-Export-Token' => self::TOKEN]);

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertHeader('Content-Disposition', 'attachment; filename=kaye-waitlist-2026-11-18.csv')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
        $this->assertSame(
            "\u{FEFF}date,source,name,email,whatsapp,lang\r\n"
            ."\"2026-11-13T10:00:00.000Z\",\"landing\",\"Ana \"\"A\"\"\",\"ana@example.com\",\"+244923456789\",\"pt\"\r\n"
            ."\"2026-11-14T11:00:00.000Z\",\"onboarding\",\"'=HYPERLINK(\"\"x\"\")\",\"\",\"+244931111111\",\"en\"\r\n",
            $response->streamedContent(),
        );
    }

    public function test_a_withdrawn_consent_takes_its_contact_out_of_the_list(): void
    {
        $ana = WaitlistEntry::query()->where('email', 'ana@example.com')->sole();
        Consents::revoke($ana, ConsentKind::WhatsappMarketing);
        $other = WaitlistEntry::query()->where('whatsapp', '+244931111111')->sole();
        Consents::revoke($other, ConsentKind::WhatsappMarketing);

        $csv = $this->get('/api/v1/waitlist/export', ['X-Export-Token' => self::TOKEN])->streamedContent();

        $this->assertStringContainsString('"ana@example.com","","pt"', $csv);
        $this->assertStringNotContainsString('+244923456789', $csv);
        // Nothing left to reach this person by: the row goes.
        $this->assertStringNotContainsString('HYPERLINK', $csv);
    }

    public function test_the_feedback_downloads_as_csv_with_a_bearer_or_query_token(): void
    {
        $expected = "\u{FEFF}date,kind,page,lang,message\r\n\"2026-11-15T12:00:00.000Z\",\"idea\",\"support\",\"fr\",\"'-1 linha\ncom quebra\"\r\n";

        $this->get('/api/v1/waitlist/export?kind=feedback', ['Authorization' => 'Bearer '.self::TOKEN])
            ->assertOk()
            ->assertStreamedContent($expected);
        $this->get('/api/v1/waitlist/export?kind=feedback&token='.self::TOKEN)->assertOk()->assertStreamedContent($expected);
    }

    public function test_a_wrong_or_missing_token_is_refused(): void
    {
        $this->getJson('/api/v1/waitlist/export')->assertUnauthorized()->assertExactJson(['error' => 'unauthorised']);
        $this->getJson('/api/v1/waitlist/export', ['X-Export-Token' => self::TOKEN.'x'])->assertUnauthorized();
        $this->getJson('/api/v1/waitlist/export?token=a-long-export-token-123')->assertUnauthorized();
    }

    public function test_a_short_or_empty_configured_token_locks_the_export(): void
    {
        config(['kaye.waitlist_export_token' => 'short']);
        $this->getJson('/api/v1/waitlist/export', ['X-Export-Token' => 'short'])->assertUnauthorized();

        config(['kaye.waitlist_export_token' => '']);
        $this->getJson('/api/v1/waitlist/export?token=')->assertUnauthorized();
    }

    public function test_an_unknown_list_is_invalid(): void
    {
        $this->getJson('/api/v1/waitlist/export?kind=users', ['X-Export-Token' => self::TOKEN])
            ->assertUnprocessable()
            ->assertExactJson(['error' => 'invalid']);
    }

    public function test_the_panel_lists_and_downloads_both(): void
    {
        config(['kaye.admin_emails' => ['boss@kaye.test']]);
        $this->actingAs(User::factory()->admin()->create(['email' => 'boss@kaye.test']));

        $this->get('/admin/waitlist-entries')->assertOk()->assertSee('ana@example.com');
        $this->get('/admin/feedback')->assertOk()->assertSee('com quebra');

        Livewire::test(ListWaitlistEntries::class)->callAction('downloadCsv')->assertFileDownloaded('kaye-waitlist-2026-11-18.csv');
        Livewire::test(ListFeedback::class)->callAction('downloadCsv')->assertFileDownloaded('kaye-feedback-2026-11-18.csv');
    }

    public function test_the_panel_lists_are_closed_to_people_outside_the_team(): void
    {
        config(['kaye.admin_emails' => ['boss@kaye.test']]);

        $this->get('/admin/waitlist-entries')->assertRedirect('/admin/login');
        $this->actingAs(User::factory()->create(['email' => 'boss@kaye.test']))->get('/admin/feedback')->assertForbidden();
    }
}

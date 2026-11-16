<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * GET/PUT /api/v1/me/data and POST /me/data/merge: the person's `UserData`, versioned so two devices
 * never overwrite each other, merged at the first login without losing anything.
 */
class UserDataTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['birth_year' => null]);
        Sanctum::actingAs($this->user);
    }

    public function test_a_new_account_has_no_data_yet(): void
    {
        $this->getJson('/api/v1/me/data')->assertOk()->assertExactJson(['version' => 0, 'data' => null]);
    }

    public function test_each_write_raises_the_version_and_an_old_version_gets_409_with_the_current_copy(): void
    {
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => $this->data(['savedCareers' => ['medico']])])
            ->assertOk()->assertJsonPath('version', 1);
        $this->putJson('/api/v1/me/data', ['version' => 1, 'data' => $this->data(['savedCareers' => ['medico', 'enfermeiro']])])
            ->assertOk()->assertJsonPath('version', 2);

        // A second device still at version 1 would erase "enfermeiro": refused.
        $this->putJson('/api/v1/me/data', ['version' => 1, 'data' => $this->data(['savedCareers' => []])])
            ->assertConflict()
            ->assertJsonPath('version', 2)
            ->assertJsonPath('data.savedCareers', ['medico', 'enfermeiro']);

        $this->getJson('/api/v1/me/data')->assertJsonPath('version', 2)->assertJsonPath('data.savedCareers', ['medico', 'enfermeiro']);
    }

    public function test_the_first_login_merges_the_device_with_the_server_and_loses_nothing(): void
    {
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => $this->data([
            'savedCareers' => ['medico'],
            'answers' => ['R1' => 4],
            'cvs' => [['id' => 'cv-a', 'title' => 'Servidor']],
            'history' => [['type' => 'visit', 'at' => '2026-11-01T10:00:00Z', 'ref' => 'medico']],
            'kursos' => ['economia' => ['done' => ['u1/l1'], 'seconds' => 300, 'scores' => ['u1' => 0.5]]],
            'plan' => ['career' => 'medico', 'pathway' => 'p1', 'done' => ['s1']],
        ])])->assertOk();

        $merged = $this->postJson('/api/v1/me/data/merge', ['data' => $this->data([
            'savedCareers' => ['enfermeiro', 'medico'],
            'answers' => ['I1' => 5],
            'cvs' => [['id' => 'cv-b', 'title' => 'Aparelho']],
            'history' => [['type' => 'test', 'at' => '2026-11-05T10:00:00Z']],
            'kursos' => ['economia' => ['done' => ['u1/l2'], 'seconds' => 120, 'scores' => ['u1' => 0.9]], 'dados' => ['done' => ['u1/l1']]],
            'plan' => ['career' => 'advogado', 'pathway' => 'p9', 'done' => []],
        ])])->assertOk()->assertJsonPath('version', 2);

        $merged->assertJsonPath('data.savedCareers', ['medico', 'enfermeiro'])
            ->assertJsonPath('data.answers', ['R1' => 4, 'I1' => 5])
            ->assertJsonPath('data.cvs.*.id', ['cv-a', 'cv-b'])
            ->assertJsonPath('data.history.*.at', ['2026-11-05T10:00:00Z', '2026-11-01T10:00:00Z'])
            ->assertJsonPath('data.kursos.economia.done', ['u1/l1', 'u1/l2'])
            ->assertJsonPath('data.kursos.economia.seconds', 300)
            ->assertJsonPath('data.kursos.economia.scores.u1', 0.9)
            ->assertJsonPath('data.kursos.dados.done', ['u1/l1'])
            // Two different plans are never mixed: the server's stays whole.
            ->assertJsonPath('data.plan.career', 'medico')
            ->assertJsonPath('data.plan.done', ['s1']);
    }

    public function test_merging_into_an_empty_account_keeps_the_device_copy(): void
    {
        $this->postJson('/api/v1/me/data/merge', ['data' => $this->data(['savedCareers' => ['medico']])])
            ->assertOk()->assertJsonPath('version', 1)->assertJsonPath('data.savedCareers', ['medico']);
    }

    public function test_empty_records_stay_records(): void
    {
        $this->call('PUT', '/api/v1/me/data', server: ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'],
            content: '{"version":0,"data":{"version":1,"answers":{},"kursos":{},"savedCareers":[]}}')->assertOk();

        $body = $this->getJson('/api/v1/me/data')->getContent();
        $this->assertIsString($body);
        $this->assertStringContainsString('"answers":{}', $body);
        $this->assertStringContainsString('"kursos":{}', $body);
        $this->assertStringContainsString('"savedCareers":[]', $body);
    }

    public function test_the_photo_and_the_cover_never_reach_the_server(): void
    {
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => $this->data(['photo' => 'data:image/jpeg;base64,AAAA', 'cover' => 'data:image/jpeg;base64,BBBB'])])
            ->assertOk()->assertJsonMissingPath('data.photo')->assertJsonMissingPath('data.cover');
        $this->postJson('/api/v1/me/data/merge', ['data' => $this->data(['photo' => 'data:image/jpeg;base64,AAAA'])])
            ->assertJsonMissingPath('data.photo');

        $stored = $this->user->userData()->value('data');
        $this->assertIsString($stored);
        $this->assertStringNotContainsString('base64', $stored);
    }

    public function test_the_profile_in_the_data_sets_the_birth_year_that_decides_who_is_a_minor(): void
    {
        $year = (int) now()->year;
        $this->user->consents()->create(['kind' => ConsentKind::EmailMarketing, 'version' => '1', 'granted_at' => now()]);

        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => $this->data([
            'profile' => ['name' => 'Ana', 'birthYear' => $year - 15, 'province' => 'Luanda', 'education' => 'medio_tecnico', 'guardianInformed' => true],
        ])])->assertOk();

        $this->user->refresh();
        $this->assertSame($year - 15, $this->user->birth_year);
        $this->assertSame('Luanda', $this->user->province);
        $this->assertSame('medio_tecnico', $this->user->current_education_level);
        $this->assertTrue($this->user->isMinor());
        // Now known to be a minor: the marketing consent is withdrawn.
        $this->assertSame(0, $this->user->consents()->active()->count());
        $this->getJson('/api/v1/me')->assertJsonPath('minor', true)->assertJsonPath('birthYear', $year - 15);
    }

    public function test_an_impossible_birth_year_is_not_copied(): void
    {
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => $this->data(['profile' => ['birthYear' => 1700]])])->assertOk();

        $this->assertNull($this->user->refresh()->birth_year);
    }

    public function test_invalid_data_is_refused(): void
    {
        $this->putJson('/api/v1/me/data', ['data' => $this->data()])->assertUnprocessable()->assertJsonValidationErrors('version');
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => ['version' => 2]])->assertUnprocessable()->assertJsonValidationErrors('data.version');
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => 'text'])->assertUnprocessable();
        $this->postJson('/api/v1/me/data/merge', [])->assertUnprocessable();
        $this->call('PUT', '/api/v1/me/data', ['version' => 0, 'data' => ['version' => 1]], server: ['HTTP_ACCEPT' => 'application/json'])
            ->assertUnprocessable();

        $this->assertNull($this->user->userData()->first());
    }

    public function test_a_document_too_large_is_refused(): void
    {
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => $this->data(['searches' => [str_repeat('a', 1_100_000)]])])
            ->assertStatus(413);
    }

    public function test_one_person_never_reads_another_persons_data(): void
    {
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => $this->data(['savedCareers' => ['medico']])])->assertOk();

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/me/data')->assertExactJson(['version' => 0, 'data' => null]);
    }

    /**
     * @param  array<string, mixed>  $fields
     * @return array<string, mixed>
     */
    private function data(array $fields = []): array
    {
        return ['version' => 1, ...$fields];
    }
}

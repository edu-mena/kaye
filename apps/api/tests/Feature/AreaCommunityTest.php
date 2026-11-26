<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Models\AreaMembership;
use App\Models\Kurso;
use App\Models\KursoUnit;
use App\Models\User;
use App\Support\Accounts;
use App\Support\Communities;
use App\Support\Consents;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * ADR 0025: self-declared level by area, the count only from 50, and unique pioneer numbers after the first topic.
 */
class AreaCommunityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $kurso = Kurso::factory()->create(['slug' => 'contabilidade', 'status' => 'published']);
        KursoUnit::factory()->create(['kurso_id' => $kurso->id, 'slug' => 't1', 'status' => 'published']);
    }

    private function declare(User $user, string $level = 'graduate'): void
    {
        Sanctum::actingAs($user);
        $this->putJson('/api/v1/me/communities/business', ['level' => $level])->assertOk();
    }

    private function finishTopic(): void
    {
        $this->postJson('/api/v1/kursos/contabilidade/topics/t1/complete', ['day' => now()->toDateString()])->assertOk();
    }

    public function test_the_number_comes_only_after_the_first_topic_and_is_unique(): void
    {
        $numbers = [];
        foreach (range(1, 3) as $ignored) {
            $user = User::factory()->create();
            $this->declare($user);
            $this->getJson('/api/v1/me/communities/business')->assertJsonPath('pioneerNumber', null);
            $this->finishTopic();
            $numbers[] = $this->getJson('/api/v1/me/communities/business')->json('pioneerNumber');
        }

        $this->assertSame([1, 2, 3], $numbers);
        // Finishing again, or declaring again, keeps the same number.
        $this->putJson('/api/v1/me/communities/business', ['level' => 'professional'])->assertJsonPath('pioneerNumber', 3);
    }

    public function test_a_topic_before_declaring_gives_the_number_when_declaring(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->finishTopic();

        $this->putJson('/api/v1/me/communities/business', ['level' => 'student'])->assertJsonPath('pioneerNumber', 1);
    }

    public function test_below_fifty_there_is_no_count_and_at_fifty_only_those_who_agreed_count(): void
    {
        $this->getJson('/api/v1/areas/business/community')->assertOk()->assertExactJson(['count' => null]);

        User::factory()->count(Communities::MIN_PUBLIC)->create()->each(function (User $user): void {
            AreaMembership::query()->create(['user_id' => $user->id, 'area' => 'business', 'level' => 'student']);
            Consents::grant($user, ConsentKind::CommunityCount, 'v1', 'app', null);
        });
        $this->getJson('/api/v1/areas/business/community')->assertExactJson(['count' => 50]);

        // One person withdraws: 49 is below the minimum again.
        Consents::revoke(User::query()->firstOrFail(), ConsentKind::CommunityCount);
        $this->getJson('/api/v1/areas/business/community')->assertExactJson(['count' => null]);
        $this->getJson('/api/v1/areas/nope/community')->assertNotFound();
    }

    public function test_a_minor_is_a_student_with_no_number(): void
    {
        Sanctum::actingAs(User::factory()->minor()->create());
        $this->finishTopic();

        $this->putJson('/api/v1/me/communities/business', ['level' => 'professional'])
            ->assertOk()->assertJson(['level' => 'student', 'pioneerNumber' => null]);
    }

    public function test_deleting_the_account_removes_the_membership_and_never_reuses_the_number(): void
    {
        $first = User::factory()->create();
        $this->declare($first);
        $this->finishTopic();
        app(Accounts::class)->delete($first);
        $this->assertSame(0, AreaMembership::query()->count());

        $this->declare(User::factory()->create());
        $this->finishTopic();
        $this->getJson('/api/v1/me/communities/business')->assertJsonPath('pioneerNumber', 2);
    }

    public function test_the_level_is_validated_and_needs_a_session(): void
    {
        $this->putJson('/api/v1/me/communities/business', ['level' => 'student'])->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create());
        $this->putJson('/api/v1/me/communities/business', ['level' => 'king'])->assertUnprocessable();
        $this->putJson('/api/v1/me/communities/nope', ['level' => 'student'])->assertNotFound();
    }
}

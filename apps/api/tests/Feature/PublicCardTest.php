<?php

namespace Tests\Feature;

use App\Models\PublicCard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * /public-cards (ADR 0014): the same rules and answers as apps/web/api/_publicCards.ts.
 */
class PublicCardTest extends TestCase
{
    use RefreshDatabase;

    private const CARD = [
        'name' => 'Carla Mendes',
        'accent' => '#FFC000',
        'headline' => 'Enfermeira',
        'photo' => 'data:image/jpeg;base64,AAAA',
        'email' => 'carla@example.com',
        'whatsapp' => '+244923456789',
        'linkedin' => 'https://linkedin.com/in/carla',
    ];

    /**
     * @return array{slug: string, secret: string}
     */
    private function create(): array
    {
        $response = $this->postJson('/api/v1/public-cards', [...self::CARD, 'unknown' => 'dropped'])->assertCreated();
        $slug = $response->json('slug');
        $secret = $response->json('secret');
        $this->assertIsString($slug);
        $this->assertIsString($secret);

        return ['slug' => $slug, 'secret' => $secret];
    }

    public function test_a_card_is_created_shown_and_only_its_secret_hash_is_kept(): void
    {
        ['slug' => $slug, 'secret' => $secret] = $this->create();

        $this->assertMatchesRegularExpression('/^[A-Za-z0-9_-]{12}$/', $slug);
        $this->assertSame(43, strlen($secret));
        $stored = PublicCard::query()->sole();
        $this->assertSame(hash('sha256', $secret), $stored->secret_hash);
        $this->assertSame(self::CARD, $stored->card);

        $this->getJson("/api/v1/public-cards/{$slug}")
            ->assertOk()
            ->assertExactJson(self::CARD)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    public function test_an_unknown_or_malformed_slug_is_not_found(): void
    {
        $this->getJson('/api/v1/public-cards/AAAAAAAAAAAA')->assertNotFound()->assertExactJson(['error' => 'not_found']);
        $this->getJson('/api/v1/public-cards/short')->assertNotFound();
    }

    public function test_only_the_owner_changes_the_card(): void
    {
        ['slug' => $slug, 'secret' => $secret] = $this->create();
        $changed = ['name' => 'Carla M.', 'accent' => '#1b2a43'];

        $this->putJson("/api/v1/public-cards/{$slug}", $changed)->assertForbidden()->assertExactJson(['error' => 'forbidden']);
        $this->putJson("/api/v1/public-cards/{$slug}", $changed, ['Authorization' => 'Bearer wrong'])->assertForbidden();
        $this->putJson("/api/v1/public-cards/{$slug}", ['name' => 'x'], ['Authorization' => "Bearer {$secret}"])->assertUnprocessable();
        $this->putJson('/api/v1/public-cards/AAAAAAAAAAAA', $changed, ['Authorization' => "Bearer {$secret}"])->assertNotFound();

        $this->putJson("/api/v1/public-cards/{$slug}", $changed, ['Authorization' => "Bearer {$secret}"])
            ->assertOk()
            ->assertExactJson($changed);
        $this->getJson("/api/v1/public-cards/{$slug}")->assertExactJson($changed);
    }

    public function test_only_the_owner_switches_the_card_off_at_once(): void
    {
        ['slug' => $slug, 'secret' => $secret] = $this->create();

        $this->deleteJson("/api/v1/public-cards/{$slug}", [], ['Authorization' => 'Bearer wrong'])->assertForbidden();
        $this->deleteJson("/api/v1/public-cards/{$slug}", [], ['Authorization' => "Bearer {$secret}"])->assertNoContent();
        $this->getJson("/api/v1/public-cards/{$slug}")->assertNotFound();
        // Switching off a page that is gone succeeds.
        $this->deleteJson("/api/v1/public-cards/{$slug}", [], ['Authorization' => "Bearer {$secret}"])->assertNoContent();
        $this->assertSame(0, PublicCard::query()->count());
    }

    /**
     * @return array<string, array{array<string, mixed>}>
     */
    public static function invalidCards(): array
    {
        return [
            'no name' => [['name' => '  ']],
            'no accent' => [['accent' => null]],
            'bad accent' => [['accent' => 'gold']],
            'invalid email' => [['email' => 'carla@']],
            'invalid number' => [['whatsapp' => '92 345']],
            'not a link' => [['linkedin' => 'javascript:alert(1)']],
            'photo not a jpeg' => [['photo' => 'data:image/svg+xml;base64,AAAA']],
            'photo too big' => [['photo' => 'data:image/jpeg;base64,'.str_repeat('A', 120_000)]],
            'headline too long' => [['headline' => str_repeat('a', 121)]],
        ];
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('invalidCards')]
    public function test_an_invalid_card_is_refused(array $overrides): void
    {
        $this->postJson('/api/v1/public-cards', [...self::CARD, ...$overrides])
            ->assertUnprocessable()
            ->assertExactJson(['error' => 'invalid']);
    }

    public function test_thirty_writes_per_hour_per_ip_then_too_many(): void
    {
        ['slug' => $slug, 'secret' => $secret] = $this->create();
        for ($i = 1; $i < 30; $i++) {
            $this->putJson("/api/v1/public-cards/{$slug}", self::CARD, ['Authorization' => "Bearer {$secret}"])->assertOk();
        }

        $this->postJson('/api/v1/public-cards', self::CARD)->assertTooManyRequests()->assertExactJson(['error' => 'too_many']);
        // Reading and switching off are never blocked by it.
        $this->getJson("/api/v1/public-cards/{$slug}")->assertOk();
        $this->deleteJson("/api/v1/public-cards/{$slug}", [], ['Authorization' => "Bearer {$secret}"])->assertNoContent();
    }
}

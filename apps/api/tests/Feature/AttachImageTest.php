<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Mcp\Servers\KayeServer;
use App\Mcp\Tools\AttachImage;
use App\Models\Company;
use App\Models\Revision;
use App\Models\User;
use App\Support\RemoteImage;
use App\Support\Revisions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * attach_image (docs/ia.md): the server's own download, so guarded like one (https, public hosts only, no
 * redirects, real images of a sane size), kept out of public/ until a reviewer approves.
 */
class AttachImageTest extends TestCase
{
    use RefreshDatabase;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('public');
        $this->editor = User::factory()->editor()->create();
        Company::factory()->create(['slug' => 'sonangol', 'status' => ContentStatus::Published, 'logo' => null, 'sources' => []]);
        $this->resolveTo('93.184.216.34');
    }

    public function test_a_valid_image_is_kept_privately_and_published_on_approval(): void
    {
        Http::fake(['cdn.example.com/*' => Http::response($this->png(), 200, ['Content-Type' => 'image/png'])]);

        $this->attach('https://cdn.example.com/logo.png')->assertHasNoErrors();

        $revision = Revision::query()->sole();
        $value = $revision->changes['logo'] ?? null;
        $this->assertIsString($value);
        $private = substr($value, strlen(Revisions::IMAGE_PREFIX));
        Storage::disk('local')->assertExists($private);
        $this->assertNull(Company::query()->sole()->logo);

        app(Revisions::class)->approve($revision, User::factory()->reviewer()->create());

        $logo = (string) Company::query()->sole()->logo;
        $this->assertStringContainsString('/storage/catalogue/company/sonangol-logo-', $logo);
        Storage::disk('public')->assertExists(substr((string) parse_url($logo, PHP_URL_PATH), strlen('/storage/')));
        Storage::disk('local')->assertMissing($private);
    }

    public function test_only_https_and_public_hosts_are_fetched(): void
    {
        Http::fake();

        $this->attach('http://cdn.example.com/logo.png')->assertHasErrors(['must be https']);
        $this->attach('https://user:pass@cdn.example.com/logo.png')->assertHasErrors(['must be https']);
        $this->attach('https://127.0.0.1/logo.png')->assertHasErrors(['private or reserved']);
        $this->resolveTo('10.0.0.5');
        $this->attach('https://intranet.example.com/logo.png')->assertHasErrors(['private or reserved']);
        $this->resolveTo('169.254.169.254');
        $this->attach('https://metadata.example.com/logo.png')->assertHasErrors(['private or reserved']);

        Http::assertNothingSent();
        $this->assertSame(0, Revision::query()->count());
    }

    public function test_redirects_other_files_and_huge_images_are_refused(): void
    {
        Http::fake([
            'cdn.example.com/moved.png' => Http::response('', 302, ['Location' => 'https://127.0.0.1/x.png']),
            'cdn.example.com/page.png' => Http::response('<html>not an image</html>', 200, ['Content-Type' => 'image/png']),
            'cdn.example.com/huge.png' => Http::response(str_repeat('a', 3_000_001), 200),
            'cdn.example.com/tiny.png' => Http::response($this->png(10), 200),
        ]);

        $this->attach('https://cdn.example.com/moved.png')->assertHasErrors(['redirects']);
        $this->attach('https://cdn.example.com/page.png')->assertHasErrors(['Only JPEG, PNG or WebP']);
        $this->attach('https://cdn.example.com/huge.png')->assertHasErrors(['larger than']);
        $this->attach('https://cdn.example.com/tiny.png')->assertHasErrors(['between 64 and 8000']);

        $this->assertSame(0, Revision::query()->count());
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_the_field_and_the_origin_page_are_checked(): void
    {
        $this->attach('https://cdn.example.com/logo.png', field: 'website')->assertHasErrors(['no image field']);
        $this->attach('https://cdn.example.com/logo.png', origin: '')->assertHasErrors(['origin_url is required']);
    }

    private function attach(string $url, string $field = 'logo', string $origin = 'https://sonangol.co.ao'): \Laravel\Mcp\Server\Testing\TestResponse
    {
        return KayeServer::actingAs($this->editor)->tool(AttachImage::class, [
            'type' => 'company', 'slug' => 'sonangol', 'field' => $field, 'image_url' => $url, 'origin_url' => $origin,
        ]);
    }

    private function resolveTo(string $address): void
    {
        $this->app->instance(RemoteImage::class, new RemoteImage(fn (string $host): array => [$address]));
    }

    /**
     * @param  int<1, max>  $side
     */
    private function png(int $side = 128): string
    {
        $image = imagecreatetruecolor($side, $side);
        $this->assertNotFalse($image);
        ob_start();
        imagepng($image);

        return (string) ob_get_clean();
    }
}

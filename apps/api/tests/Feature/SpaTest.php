<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SpaTest extends TestCase
{
    private string $index;

    private ?string $original = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->index = public_path('spa/index.html');
        $this->original = is_file($this->index) ? File::get($this->index) : null;

        File::ensureDirectoryExists(dirname($this->index));
        File::put($this->index, '<!doctype html><title>Kayé</title><div id="root"></div>');
    }

    protected function tearDown(): void
    {
        $this->original === null ? File::delete($this->index) : File::put($this->index, $this->original);

        parent::tearDown();
    }

    public function test_root_serves_the_react_app(): void
    {
        $this->get('/')->assertOk()->assertSee('<div id="root">', false);
    }

    public function test_deep_links_serve_the_react_app(): void
    {
        $this->get('/carreiras')->assertOk()->assertSee('<div id="root">', false);
        $this->get('/oportunidades')->assertOk()->assertSee('<div id="root">', false);
        // A career that does not exist still gets the app (React shows "not found"), with a real 404 (SeoTest).
        $this->get('/carreiras/desenvolvedor-backend')->assertNotFound()->assertSee('<div id="root">', false);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function pathsThatAreNotPages(): array
    {
        return [
            'dotfile' => ['/.env'],
            'git folder' => ['/.git/config'],
            'project file' => ['/composer.json'],
            'missing asset' => ['/spa/assets/missing.js'],
            'missing image' => ['/logo.png'],
        ];
    }

    #[DataProvider('pathsThatAreNotPages')]
    public function test_files_and_dotfiles_get_a_real_404_not_the_app(string $path): void
    {
        $this->get($path)->assertNotFound()->assertDontSee('<div id="root">', false);
    }
}

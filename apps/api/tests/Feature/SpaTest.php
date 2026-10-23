<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
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
        $this->get('/carreiras/desenvolvedor-backend')->assertOk()->assertSee('<div id="root">', false);
    }
}

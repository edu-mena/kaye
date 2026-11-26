<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The panel's theme is built by Vite (npm run build in apps/api); the tests do not need the files.
        $this->withoutVite();
    }
}

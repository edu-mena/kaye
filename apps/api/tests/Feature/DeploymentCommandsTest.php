<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

/**
 * The commands the container entrypoint and the deploy run on every release
 * must work on a clean checkout (no ignored or empty folders).
 *
 * Artisan::call is used on purpose: with $this->artisan() the command runs in
 * a destructor, where its exception is lost and the test passes anyway.
 */
class DeploymentCommandsTest extends TestCase
{
    public function test_views_can_be_cached(): void
    {
        try {
            $this->assertSame(0, Artisan::call('view:cache'));
        } finally {
            Artisan::call('view:clear');
        }
    }

    public function test_routes_can_be_cached(): void
    {
        try {
            $this->assertSame(0, Artisan::call('route:cache'));
        } finally {
            Artisan::call('route:clear');
        }
    }
}

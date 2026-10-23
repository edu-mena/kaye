<?php

namespace Tests\Feature;

use Tests\TestCase;

class ErrorTrackingTest extends TestCase
{
    public function test_sentry_never_sends_personal_data(): void
    {
        putenv('SENTRY_SEND_DEFAULT_PII=true');

        try {
            $config = require config_path('sentry.php');
        } finally {
            putenv('SENTRY_SEND_DEFAULT_PII');
        }

        $this->assertIsArray($config);
        $this->assertFalse($config['send_default_pii']);
    }

    public function test_sentry_is_off_without_a_dsn(): void
    {
        $this->assertEmpty(config('sentry.dsn'));
    }
}

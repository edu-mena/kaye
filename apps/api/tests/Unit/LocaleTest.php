<?php

namespace Tests\Unit;

use App\Enums\Locale;
use PHPUnit\Framework\TestCase;

class LocaleTest extends TestCase
{
    public function test_portuguese_is_the_fallback(): void
    {
        $this->assertSame(Locale::Pt, Locale::fallback());
    }

    /**
     * Request::getPreferredLanguage() answers with the first value when nothing
     * matches, so the fallback must stay first (SetLocaleFromRequest relies on it).
     */
    public function test_the_fallback_comes_first(): void
    {
        $this->assertSame(['pt', 'en', 'fr'], Locale::values());
        $this->assertSame(Locale::fallback()->value, Locale::values()[0]);
    }
}

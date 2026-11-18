<?php

namespace Tests\Feature;

use App\Enums\Locale;
use App\Mail\Welcome;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use Tests\TestCase;

/**
 * The texts of the emails and of the links' pages exist in pt, en and fr (lang/<locale>/notices.php).
 */
class NoticeTextsTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_language_has_the_same_texts(): void
    {
        $keys = function (string $locale): array {
            $texts = require lang_path("{$locale}/notices.php");
            $this->assertIsArray($texts);

            return array_keys(Arr::dot($texts));
        };
        $portuguese = $keys('pt');

        $this->assertNotEmpty($portuguese);
        foreach (Locale::cases() as $locale) {
            $this->assertSame($portuguese, $keys($locale->value), "lang/{$locale->value}/notices.php differs from pt");
        }
    }

    public function test_the_welcome_is_written_in_the_persons_language_with_the_site_colours(): void
    {
        foreach (['pt' => 'Bem-vindo ao Kayé', 'en' => 'Welcome to Kayé', 'fr' => 'Bienvenue sur Kayé'] as $locale => $subject) {
            $mail = new Welcome(WaitlistEntry::factory()->confirmed()->create(['locale' => $locale]));

            $mail->assertHasSubject($subject);
            // The kaye theme (resources/views/mail/kaye.css): the navy of the site on the button.
            $mail->assertSeeInHtml('#1b2a43', false);
        }
    }
}

<?php

namespace Tests\Feature;

use App\Support\SentryScrubber;
use RuntimeException;
use Sentry\Breadcrumb;
use Sentry\Event;
use Sentry\ExceptionDataBag;
use Sentry\UserDataBag;
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

    public function test_before_send_takes_out_every_personal_detail_left_in_an_event(): void
    {
        $event = Event::createEvent();
        $event->setUser(new UserDataBag(7, 'ana@example.com', '41.223.10.5', 'ana'));
        $event->setRequest([
            'url' => 'https://kayeangola.com/api/v1/waitlist/export?token=secret-1234567890',
            'query_string' => 'token=secret-1234567890',
            'data' => ['email' => 'ana@example.com', 'whatsapp' => '+244 923 456 789'],
            'cookies' => ['kaye_session' => 'abc'],
            'headers' => ['Cookie' => ['kaye_session=abc'], 'Authorization' => ['Bearer 1|abcdef'], 'X-Forwarded-For' => ['41.223.10.5'], 'Accept-Language' => ['pt']],
        ]);
        $event->setMessage('Falhou o envio para ana@example.com (+244 923 456 789) a partir de 41.223.10.5');
        $event->setExceptions([new ExceptionDataBag(new RuntimeException('SQLSTATE: Duplicate entry "ana@example.com" with Bearer 1|abcdef'))]);
        $event->setBreadcrumb([new Breadcrumb('info', 'default', 'mail', 'Enviado a joana@example.com', ['to' => 'joana@example.com'])]);
        $event->setExtra(['contact' => 'ana@example.com']);

        $scrubbed = SentryScrubber::beforeSend($event);
        $json = (string) json_encode([
            $scrubbed->getUser()?->getEmail(), $scrubbed->getUser()?->getIpAddress(), $scrubbed->getUser()?->getUsername(),
            $scrubbed->getRequest(), $scrubbed->getMessage(), $scrubbed->getExceptions()[0]->getValue(),
            $scrubbed->getBreadcrumbs()[0]->getMessage(), $scrubbed->getBreadcrumbs()[0]->getMetadata(), $scrubbed->getExtra(),
        ]);

        foreach (['ana@example.com', 'joana@example.com', '923 456 789', '41.223.10.5', 'secret-1234567890', 'abcdef', 'kaye_session'] as $personal) {
            $this->assertStringNotContainsString($personal, $json);
        }
        $this->assertSame(7, $scrubbed->getUser()?->getId());
        $this->assertSame(['Accept-Language' => ['pt']], $scrubbed->getRequest()['headers']);
        $this->assertSame('https://kayeangola.com/api/v1/waitlist/export', $scrubbed->getRequest()['url']);
    }

    public function test_the_scrubber_is_wired_into_the_sentry_config(): void
    {
        $this->assertSame([SentryScrubber::class, 'beforeSend'], config('sentry.before_send'));
        $this->assertSame([SentryScrubber::class, 'beforeSend'], config('sentry.before_send_transaction'));
    }
}

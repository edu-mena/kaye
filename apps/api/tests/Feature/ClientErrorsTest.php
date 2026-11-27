<?php

namespace Tests\Feature;

use Illuminate\Testing\TestResponse;
use Sentry\ClientBuilder;
use Sentry\Event;
use Sentry\SentrySdk;
use Sentry\Transport\Result;
use Sentry\Transport\ResultStatus;
use Sentry\Transport\TransportInterface;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class ClientErrorsTest extends TestCase
{
    private FakeSentryTransport $transport;

    protected function setUp(): void
    {
        parent::setUp();

        // A Sentry client with the production before_send, whose transport keeps the events instead of sending them.
        $this->transport = new FakeSentryTransport;
        SentrySdk::getCurrentHub()->bindClient(ClientBuilder::create([
            'dsn' => 'https://public@sentry.invalid/1',
            'before_send' => config('sentry.before_send'),
            'default_integrations' => false,
        ])->setTransport($this->transport)->getClient());
    }

    protected function tearDown(): void
    {
        SentrySdk::getCurrentHub()->bindClient(ClientBuilder::create([])->getClient());

        parent::tearDown();
    }

    public function test_an_error_from_the_app_reaches_sentry_tagged_as_web(): void
    {
        $this->report([
            'message' => "TypeError: Cannot read properties of undefined (reading 'name')",
            'stack' => "TypeError: Cannot read properties of undefined\n    at Career (https://kayeangola.com/spa/assets/index-Ab12Cd34.js:1:2345)",
            'path' => '/carreiras/enfermeiro',
            'source' => 'react',
        ])->assertStatus(202)->assertHeader('Cache-Control', 'no-store, private');

        $this->assertCount(1, $this->transport->sent);
        $event = $this->transport->sent[0];
        $this->assertSame("TypeError: Cannot read properties of undefined (reading 'name')", $event->getMessage());
        $this->assertSame(['layer' => 'web', 'source' => 'react', 'page' => '/carreiras/enfermeiro'], $event->getTags());
        $stack = $event->getExtra()['stack'] ?? null;
        $this->assertIsString($stack);
        $this->assertStringContainsString('index-Ab12Cd34.js:1:2345', $stack);
        $this->assertSame('web', $event->getLogger());
    }

    public function test_no_personal_data_reaches_sentry(): void
    {
        $this->report([
            'message' => 'Falhou o envio para ana@example.com (+244 923 456 789)',
            'stack' => 'Error at https://kayeangola.com/c/ana-silva?token=xxxxxxxxxxxx',
            'path' => '/c/ana-silva?token=xxxxxxxxxxxx#perfil',
            'source' => 'window',
        ])->assertStatus(202);

        $event = $this->transport->sent[0];
        $json = (string) json_encode([$event->getMessage(), $event->getTags(), $event->getExtra(), $event->getRequest()]);
        foreach (['ana@example.com', '923 456 789', 'xxxxxxxxxxxx', 'ana-silva'] as $personal) {
            $this->assertStringNotContainsString($personal, $json, $personal);
        }
        $this->assertSame('/c/:slug', $event->getTags()['page']);
    }

    public function test_a_path_that_is_not_a_plain_path_is_not_kept(): void
    {
        $this->report(['message' => 'Error', 'path' => 'javascript:alert(1)', 'source' => 'promise'])->assertStatus(202);

        $this->assertSame('/?', $this->transport->sent[0]->getTags()['page']);
    }

    public function test_a_report_that_is_not_valid_is_refused_and_sends_nothing(): void
    {
        foreach ([
            ['path' => '/', 'source' => 'window'],
            ['message' => '   ', 'path' => '/', 'source' => 'window'],
            ['message' => str_repeat('x', 501), 'path' => '/', 'source' => 'window'],
            ['message' => 'Error', 'path' => '/', 'source' => 'server'],
            ['message' => 'Error', 'source' => 'window'],
            ['message' => 'Error', 'path' => '/', 'source' => 'window', 'stack' => ['not', 'text']],
        ] as $body) {
            $this->report($body)->assertStatus(422)->assertExactJson(['error' => 'invalid']);
        }
        $this->postJson('/api/v1/client-errors', [])->assertStatus(422);

        $this->assertSame([], $this->transport->sent);
    }

    public function test_one_ip_can_report_only_30_errors_an_hour(): void
    {
        for ($i = 0; $i < 30; $i++) {
            $this->report(['message' => "Error $i", 'path' => '/', 'source' => 'window'])->assertStatus(202);
        }

        $this->report(['message' => 'Error 31', 'path' => '/', 'source' => 'window'])
            ->assertStatus(429)
            ->assertExactJson(['error' => 'too_many']);
        $this->assertCount(30, $this->transport->sent);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return TestResponse<Response>
     */
    private function report(array $body): TestResponse
    {
        return $this->postJson('/api/v1/client-errors', $body);
    }
}

final class FakeSentryTransport implements TransportInterface
{
    /** @var list<Event> */
    public array $sent = [];

    public function send(Event $event): Result
    {
        $this->sent[] = $event;

        return new Result(ResultStatus::success(), $event);
    }

    public function close(?int $timeout = null): Result
    {
        return new Result(ResultStatus::success());
    }
}

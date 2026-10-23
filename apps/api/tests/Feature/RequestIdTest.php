<?php

namespace Tests\Feature;

use App\Http\Middleware\AssignRequestId;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;

class RequestIdTest extends TestCase
{
    public function test_every_response_gets_a_new_request_id(): void
    {
        $first = $this->get('/up')->headers->get(AssignRequestId::HEADER);
        $second = $this->get('/up')->headers->get(AssignRequestId::HEADER);

        $this->assertTrue(Str::isUuid($first));
        $this->assertTrue(Str::isUuid($second));
        $this->assertNotSame($first, $second);
    }

    public function test_a_safe_incoming_id_is_kept_for_tracing(): void
    {
        $this->get('/up', [AssignRequestId::HEADER => 'app-1234abcd'])
            ->assertHeader(AssignRequestId::HEADER, 'app-1234abcd');
    }

    public function test_an_unsafe_incoming_id_is_replaced(): void
    {
        $id = $this->get('/up', [AssignRequestId::HEADER => "bad id\ninjected log line"])
            ->headers->get(AssignRequestId::HEADER);

        $this->assertTrue(Str::isUuid($id));
    }

    public function test_the_id_is_added_to_every_log_line(): void
    {
        $id = $this->get('/up')->headers->get(AssignRequestId::HEADER);

        $this->assertSame($id, Log::sharedContext()['request_id'] ?? null);
    }
}

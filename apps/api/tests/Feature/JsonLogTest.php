<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class JsonLogTest extends TestCase
{
    public function test_the_json_channel_writes_one_json_object_per_line_with_the_request_id(): void
    {
        $directory = storage_path('framework/testing/logs-'.uniqid());
        config(['logging.channels.json.path' => "{$directory}/kaye.json.log"]);

        Log::shareContext(['request_id' => 'req-12345678']);
        Log::channel('json')->warning('Scraper found {count} jobs', ['count' => 3]);

        $files = File::glob("{$directory}/kaye.json*.log");
        $this->assertCount(1, $files);
        $this->assertIsString($files[0]);

        $record = json_decode(trim(File::get($files[0])), true, flags: JSON_THROW_ON_ERROR);
        File::deleteDirectory($directory);

        $this->assertIsArray($record);
        $this->assertSame('Scraper found 3 jobs', $record['message']);
        $this->assertSame('WARNING', $record['level_name']);
        $this->assertSame('req-12345678', data_get($record, 'context.request_id'));
    }
}

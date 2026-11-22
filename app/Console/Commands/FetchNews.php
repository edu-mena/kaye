<?php

namespace App\Console\Commands;

use App\Support\NewsCollector;
use Illuminate\Console\Command;

/**
 * Collects the news about training, work and careers from the sources of config/news.php (scheduled every 2 hours).
 */
class FetchNews extends Command
{
    protected $signature = 'kaye:fetch-news';

    protected $description = 'Collect the news about training, work, grants and careers from the Angolan sources';

    public function handle(NewsCollector $collector): int
    {
        $result = $collector->run();
        $this->info("News: {$result['created']} new, {$result['skipped']} skipped, {$collector->summarise()} summarised.");
        if ($result['failed'] !== []) {
            $this->warn('Sources that did not answer: '.implode(', ', $result['failed']));
        }

        return self::SUCCESS;
    }
}

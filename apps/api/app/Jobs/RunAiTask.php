<?php

namespace App\Jobs;

use App\Enums\AiTaskStatus;
use App\Models\AiTask;
use App\Support\AiBudget;
use App\Support\ResearchAgent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

/**
 * One "Pesquisar com IA" task, from the queue (docs/ia.md). Tried once: a retry would pay twice. On a spent day it
 * does not call the API at all (`skipped`). An error keeps only its class, never its text.
 */
class RunAiTask implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    /** A research takes several turns of up to three minutes; DB_QUEUE_RETRY_AFTER is above this. */
    public int $timeout = 840;

    public function __construct(public int $taskId) {}

    public function handle(ResearchAgent $agent): void
    {
        $task = AiTask::query()->find($this->taskId);
        if (! $task instanceof AiTask || $task->status !== AiTaskStatus::Queued) {
            return;
        }
        if (AiBudget::exhausted()) {
            $task->forceFill(['status' => AiTaskStatus::Skipped, 'error' => 'The day\'s budget (AI_DAILY_BUDGET_USD) is spent.', 'finished_at' => now()])->save();

            return;
        }

        $task->forceFill(['status' => AiTaskStatus::Running, 'started_at' => now()])->save();
        try {
            $agent->run($task);
        } catch (Throwable $error) {
            report($error);
            $task->forceFill(['status' => AiTaskStatus::Failed, 'error' => $error::class.': '.mb_substr($error->getMessage(), 0, 120), 'finished_at' => now()])->save();
        }
    }
}

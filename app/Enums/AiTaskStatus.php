<?php

namespace App\Enums;

/**
 * Where a research asked to the AI stands (`ai_tasks.status`).
 */
enum AiTaskStatus: string
{
    case Queued = 'queued';
    case Running = 'running';
    case Done = 'done';
    case Failed = 'failed';
    /** Not run: the day's budget (AI_DAILY_BUDGET_USD) was spent. */
    case Skipped = 'skipped';
}

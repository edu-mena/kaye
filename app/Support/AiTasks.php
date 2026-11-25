<?php

namespace App\Support;

use App\Jobs\RunAiTask;
use App\Models\AiTask;
use App\Models\User;
use Illuminate\Support\Facades\Config;

/**
 * Asking for a research ("Pesquisar com IA", on a type or on one row): the task is written and queued. The panel's
 * buttons all come here.
 */
final class AiTasks
{
    /**
     * @throws InvalidProposal
     */
    public static function request(User $user, string $type, ?string $slug, string $prompt): AiTask
    {
        if ($user->cannot('create', AiTask::class)) {
            throw new InvalidProposal(['Only who writes content asks for a research.']);
        }
        if (Config::string('ai.key') === '') {
            throw new InvalidProposal(['The research with AI is off: ANTHROPIC_API_KEY is not set.']);
        }
        if (! ContentTypes::exists($type)) {
            throw new InvalidProposal(["Unknown type {$type}."]);
        }
        if ($slug !== null && $slug !== '') {
            app(ContentEditor::class)->find($type, $slug);
        }
        $prompt = trim($prompt);
        if (mb_strlen($prompt) < 5 || mb_strlen($prompt) > 2000) {
            throw new InvalidProposal(['Write what to research, in 5 to 2000 characters.']);
        }

        $task = AiTask::query()->create([
            'content_type' => $type,
            'target_slug' => $slug === '' ? null : $slug,
            'prompt' => $prompt,
            'model' => Config::string('ai.model'),
            'requested_by' => $user->id,
        ]);
        RunAiTask::dispatch($task->id);

        return $task;
    }
}

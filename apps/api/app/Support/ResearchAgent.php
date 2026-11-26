<?php

namespace App\Support;

use App\Enums\AiTaskStatus;
use App\Mcp\Servers\KayeServer;
use App\Mcp\Tools\AttachImage;
use App\Mcp\Tools\GetContent;
use App\Mcp\Tools\ListMissing;
use App\Mcp\Tools\ListSources;
use App\Mcp\Tools\ProposeChange;
use App\Mcp\Tools\SearchContent;
use App\Models\AiTask;
use App\Models\Revision;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Laravel\Mcp\Server\Tool;
use RuntimeException;

/**
 * "Pesquisar com IA" (docs/ia.md): Claude with Anthropic's web search and the same write tools as the MCP server,
 * in a loop until it has nothing more to propose, within the task's token limit and the day's budget. What it
 * finds becomes pending revisions; it never publishes. The conversation is only appended to, thinking blocks
 * included, as the API requires.
 */
final class ResearchAgent
{
    /** The server-side fallback when the model declines a request (claude-api: on by default). */
    private const BETA = 'server-side-fallback-2026-07-01';

    private const TOOLS = [SearchContent::class, GetContent::class, ListMissing::class, ListSources::class, ProposeChange::class, AttachImage::class];

    public function __construct(private readonly ContentEditor $editor) {}

    public function run(AiTask $task): void
    {
        $messages = [['role' => 'user', 'content' => $this->request($task)]];
        $tokens = 0;
        $final = '';

        for ($turn = 1; $turn <= Config::integer('ai.max_turns'); $turn++) {
            if (AiBudget::exhausted()) {
                $this->finish($task, AiTaskStatus::Done, $final, 'The day\'s budget ran out before the research ended.');

                return;
            }

            $response = $this->call($messages);
            $model = JsonValue::string($response['model'] ?? null) ?: $task->model;
            $usage = JsonValue::map($response['usage'] ?? null);
            $task->forceFill([
                'input_tokens' => $task->input_tokens + JsonValue::int($usage['input_tokens'] ?? 0) + JsonValue::int($usage['cache_read_input_tokens'] ?? 0) + JsonValue::int($usage['cache_creation_input_tokens'] ?? 0),
                'output_tokens' => $task->output_tokens + JsonValue::int($usage['output_tokens'] ?? 0),
                'web_searches' => $task->web_searches + JsonValue::int(data_get($usage, 'server_tool_use.web_search_requests', 0)),
                'cost_usd' => round((float) $task->cost_usd + AiBudget::cost($model, $usage), 4),
                'model' => $model,
            ])->save();
            $tokens = $task->input_tokens + $task->output_tokens;

            $content = JsonValue::list($response['content'] ?? null);
            $messages[] = ['role' => 'assistant', 'content' => $content];
            $final = $this->text($content) ?: $final;

            $stop = $response['stop_reason'] ?? null;
            if ($stop === 'refusal') {
                $category = data_get($response, 'stop_details.category');
                $this->finish($task, AiTaskStatus::Failed, $final, 'The model declined'.(is_string($category) ? " ({$category})" : '').'.');

                return;
            }
            if ($stop === 'tool_use') {
                // Every result goes back in one message, so the model keeps calling tools in parallel.
                $messages[] = ['role' => 'user', 'content' => $this->runTools($content, $task)];
            } elseif ($stop !== 'pause_turn') {
                $this->finish($task, AiTaskStatus::Done, $final, $stop === 'max_tokens' ? 'The last answer was cut at max_tokens.' : null);

                return;
            }
            if ($tokens >= Config::integer('ai.task_max_tokens')) {
                $this->finish($task, AiTaskStatus::Done, $final, 'The task reached AI_TASK_MAX_TOKENS.');

                return;
            }
        }

        $this->finish($task, AiTaskStatus::Done, $final, 'The task reached the turn limit.');
    }

    /**
     * The custom tools, from the MCP tools themselves: one description and one schema for both doors.
     *
     * @return list<array<string, mixed>>
     */
    public static function tools(): array
    {
        $tools = [
            ['type' => 'web_search_20260209', 'name' => 'web_search', 'max_uses' => Config::integer('ai.max_web_uses'), 'user_location' => ['type' => 'approximate', 'country' => 'AO']],
            ['type' => 'web_fetch_20260209', 'name' => 'web_fetch', 'max_uses' => Config::integer('ai.max_web_uses')],
        ];
        foreach (self::TOOLS as $class) {
            /** @var Tool $tool */
            $tool = app($class);
            $definition = $tool->toArray();
            $tools[] = ['name' => $definition['name'], 'description' => (string) ($definition['description'] ?? ''), 'input_schema' => $definition['inputSchema'] ?? ['type' => 'object']];
        }

        return $tools;
    }

    /**
     * @param  list<array<string, mixed>>  $messages
     * @return array<string, mixed>
     */
    private function call(array $messages): array
    {
        $response = Http::withHeaders([
            'x-api-key' => Config::string('ai.key'),
            'anthropic-version' => '2023-06-01',
            'anthropic-beta' => self::BETA,
        ])->timeout(Config::integer('ai.timeout'))->post(Config::string('ai.url'), [
            'model' => Config::string('ai.model'),
            'max_tokens' => Config::integer('ai.max_tokens_per_turn'),
            'system' => KayeServer::INSTRUCTIONS."\n\nYou are running alone, without a person to answer you. Research, propose what you can prove with a source, and finish with a short summary in Portuguese of what you proposed and what you could not find.",
            'messages' => $messages,
            'tools' => self::tools(),
            'output_config' => ['effort' => Config::string('ai.effort')],
            'fallbacks' => 'default',
            'cache_control' => ['type' => 'ephemeral'],
        ]);
        if (! $response->successful()) {
            // The status only: an error body may echo the request.
            throw new RuntimeException("The Claude API answered {$response->status()}.");
        }

        return JsonValue::map($response->json());
    }

    private function request(AiTask $task): string
    {
        $target = $task->target_slug === null ? 'Every '.$task->content_type.' that needs it (start with list_missing).' : "The {$task->content_type} with the slug {$task->target_slug}.";

        return "Tipo: {$task->content_type}\nRegisto: {$target}\n\nPedido da equipa:\n{$task->prompt}";
    }

    /**
     * @param  list<mixed>  $content
     * @return list<array<string, mixed>>
     */
    private function runTools(array $content, AiTask $task): array
    {
        $results = [];
        foreach ($content as $block) {
            if (! is_array($block) || ($block['type'] ?? null) !== 'tool_use' || ! is_string($block['id'] ?? null)) {
                continue;
            }
            $input = JsonValue::map($block['input'] ?? null);
            try {
                $output = $this->tool(JsonValue::string($block['name'] ?? null), $input, $task);
                $results[] = ['type' => 'tool_result', 'tool_use_id' => $block['id'], 'content' => (string) json_encode($output, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)];
            } catch (InvalidProposal $refused) {
                $results[] = ['type' => 'tool_result', 'tool_use_id' => $block['id'], 'content' => $refused->getMessage(), 'is_error' => true];
            }
        }

        return $results;
    }

    /**
     * @param  array<string, mixed>  $input
     *
     * @throws InvalidProposal
     */
    private function tool(string $name, array $input, AiTask $task): mixed
    {
        $text = fn (string $key): string => is_string($input[$key] ?? null) ? trim($input[$key]) : '';
        $optional = fn (string $key): ?string => $text($key) === '' ? null : $text($key);
        $type = $text('type');

        return match ($name) {
            'search_content' => $this->editor->search($type, $text('text')),
            'get_content' => $this->editor->get($type, $text('slug')),
            'list_missing' => $this->editor->missing($type, is_int($input['limit'] ?? null) ? max(1, min(50, $input['limit'])) : 50),
            'list_sources' => $this->editor->sources($type, $optional('slug')),
            'propose_change' => ['revision' => $this->editor->propose($type, $optional('slug'), JsonValue::map($input['changes'] ?? null), $text('source_url'), $optional('note'), null, $task)->id],
            'attach_image' => ['revision' => $this->editor->proposeImage($type, $text('slug'), $text('field'), $text('image_url'), $text('origin_url'), $optional('note'), null, $task)->id],
            default => throw new InvalidProposal(["Unknown tool {$name}."]),
        };
    }

    /**
     * @param  list<mixed>  $content
     */
    private function text(array $content): string
    {
        $parts = [];
        foreach ($content as $block) {
            if (is_array($block) && ($block['type'] ?? null) === 'text' && is_string($block['text'] ?? null)) {
                $parts[] = $block['text'];
            }
        }

        return trim(implode("\n", $parts));
    }

    private function finish(AiTask $task, AiTaskStatus $status, string $result, ?string $note): void
    {
        $task->forceFill([
            'status' => $status,
            'result' => mb_substr($result, 0, 10_000) ?: null,
            'error' => $note,
            'sources' => Revision::query()->where('ai_task_id', $task->id)->distinct()->pluck('source_url')->values()->all(),
            'finished_at' => now(),
        ])->save();
    }
}

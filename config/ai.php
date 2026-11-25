<?php

/*
 * The link to the team's AI (docs/ia.md, ADR 0027): the MCP server at /mcp and the research run from the panel.
 * The AI never publishes: everything it writes is a revision waiting for a person (`revisions`).
 */

return [

    // The same Claude API key as the news summaries. Empty = "Pesquisar com IA" is off (the MCP server still works:
    // there the AI is the person's own Claude, which pays for itself).
    'key' => (string) env('ANTHROPIC_API_KEY', ''),

    'url' => 'https://api.anthropic.com/v1/messages',

    // The latest Sonnet by default; Opus only when asked (AI_MODEL=claude-opus-5-5).
    'model' => (string) env('AI_MODEL', 'claude-sonnet-5-5'),

    // low | medium | high | xhigh | max. Medium suits multistep research with tools.
    'effort' => (string) env('AI_EFFORT', 'medium'),

    // What one day of research may cost, in dollars, over every task. When it is spent, the next tasks wait for
    // tomorrow (status `skipped`) without calling the API.
    'daily_budget_usd' => (float) env('AI_DAILY_BUDGET_USD', 2),

    // The tokens (input + output) one task may use over all its turns, and the turns themselves.
    'task_max_tokens' => (int) env('AI_TASK_MAX_TOKENS', 300000),
    'max_turns' => 12,
    'max_tokens_per_turn' => 16000,
    'timeout' => 180,

    // Web search on Anthropic's side: at most this many searches and page reads per task.
    'max_web_uses' => 8,

    // Dollars per million tokens (input, output, cache read), and per 1,000 web searches. A model that is not here
    // is priced as the most expensive one, so the budget never runs over by mistake.
    'prices' => [
        'claude-sonnet-5-5' => ['input' => 2.00, 'output' => 10.00, 'cache_read' => 0.10],
        'claude-sonnet-5' => ['input' => 2.00, 'output' => 10.00, 'cache_read' => 0.20],
        'claude-opus-5-5' => ['input' => 4.00, 'output' => 20.00, 'cache_read' => 0.20],
    ],
    'web_search_per_1000' => 10.00,

    // MCP tokens made in the panel expire after this many days.
    'mcp_token_days' => (int) env('MCP_TOKEN_DAYS', 90),

    // attach_image: the biggest file accepted, and the types.
    'image_max_bytes' => 3_000_000,
    'image_types' => ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'],

];

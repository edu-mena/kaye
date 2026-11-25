<?php

namespace App\Support;

use App\Models\AiTask;
use Illuminate\Support\Facades\Config;

/**
 * AI_DAILY_BUDGET_USD: what all the research of one day (Angola time) may cost. A task never starts on a spent day,
 * and stops between turns when it is spent.
 */
final class AiBudget
{
    public static function spentToday(): float
    {
        $start = now(Config::string('app.schedule_timezone', 'Africa/Luanda'))->startOfDay()->utc();

        return (float) AiTask::query()->where('created_at', '>=', $start)->sum('cost_usd');
    }

    public static function exhausted(float $extra = 0.0): bool
    {
        return self::spentToday() + $extra >= Config::float('ai.daily_budget_usd');
    }

    /**
     * What a response cost, from its usage, at the prices of the model that answered (a fallback may answer).
     *
     * @param  array<string, mixed>  $usage
     */
    public static function cost(string $model, array $usage): float
    {
        $prices = Config::array('ai.prices');
        $price = $prices[$model] ?? null;
        if (! is_array($price)) {
            // An unknown model is priced as the most expensive one: the budget never runs over by mistake.
            $price = collect($prices)->sortByDesc(fn (mixed $row): float => is_array($row) ? JsonValue::float($row['output'] ?? 0) : 0.0)->first();
        }
        $price = JsonValue::map($price);
        $rate = fn (string $key): float => JsonValue::float($price[$key] ?? 0);
        $number = fn (string $key): float => JsonValue::float($usage[$key] ?? 0);

        return ($number('input_tokens') * $rate('input')
            + $number('cache_creation_input_tokens') * $rate('input') * 1.25
            + $number('cache_read_input_tokens') * $rate('cache_read')
            + $number('output_tokens') * $rate('output')) / 1_000_000
            + JsonValue::float(data_get($usage, 'server_tool_use.web_search_requests')) * Config::float('ai.web_search_per_1000') / 1000;
    }
}

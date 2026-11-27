<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * "Definições" (ADR 0028): the keys and limits the team changes in the panel instead of the .env. Each value is
 * encrypted with the APP_KEY in `settings` and replaces the .env's at boot (apply()). A key is never shown again
 * after it is saved: the panel only says where the value comes from, who changed it and when. Taking a value out
 * goes back to the .env's.
 */
final class Settings
{
    public const SECRET = 'secret';

    public const INTEGER = 'integer';

    public const NUMBER = 'number';

    /**
     * Setting => [config key, kind, label, what it is for, the .env variable].
     */
    public const KEYS = [
        'anthropic_api_key' => ['ai.key', self::SECRET, 'Chave da API da Anthropic', 'A pesquisa com IA no painel (docs/ia.md).', 'ANTHROPIC_API_KEY'],
        'ai_daily_budget_usd' => ['ai.daily_budget_usd', self::NUMBER, 'Orçamento diário da IA (USD)', 'O que todas as pesquisas de um dia podem custar.', 'AI_DAILY_BUDGET_USD'],
        'ai_task_max_tokens' => ['ai.task_max_tokens', self::INTEGER, 'Tokens por pesquisa', 'O máximo que uma pesquisa pode gastar.', 'AI_TASK_MAX_TOKENS'],
        'mcp_token_days' => ['ai.mcp_token_days', self::INTEGER, 'Dias de um token MCP', 'Quanto tempo vale um token novo.', 'MCP_TOKEN_DAYS'],
        'mail_hourly_limit' => ['kaye.notices.hourly_limit.email', self::INTEGER, 'Emails por hora', 'O limite do SMTP da Hostinger.', 'MAIL_HOURLY_LIMIT'],
        'push_hourly_limit' => ['kaye.notices.hourly_limit.push', self::INTEGER, 'Push por hora', 'Avisos no browser enviados por hora.', 'PUSH_HOURLY_LIMIT'],
        'health_token' => ['kaye.health_token', self::SECRET, 'Token da saúde', 'Mostra o detalhe de /api/v1/health (UptimeRobot).', 'HEALTH_TOKEN'],
        'ingest_token' => ['kaye.ingest_token', self::SECRET, 'Token das vagas', 'Os scrapers enviam as vagas com ele (GitHub Actions).', 'INGEST_TOKEN'],
        'waitlist_export_token' => ['kaye.waitlist_export_token', self::SECRET, 'Token do CSV da lista de espera', 'O link de descarga da lista de espera.', 'WAITLIST_EXPORT_TOKEN'],
    ];

    private const CACHE = 'settings:values';

    /**
     * Puts the saved values in the config. Called at every boot; reads the database once and keeps the (still
     * encrypted) values in the cache until a setting changes.
     */
    public static function apply(): void
    {
        try {
            /** @var array<string, string> $stored */
            $stored = Cache::store(Config::string('cache.limiter'))->rememberForever(self::CACHE, fn (): array => DB::table('settings')->pluck('value', 'key')->all());
        } catch (QueryException) {
            // The table does not exist yet (a fresh database before its migrations): the .env rules.
            return;
        }
        foreach ($stored as $key => $encrypted) {
            if (! isset(self::KEYS[$key])) {
                continue;
            }
            try {
                $value = Crypt::decryptString($encrypted);
            } catch (DecryptException) {
                // Saved with another APP_KEY: ignored until saved again.
                continue;
            }
            [$config, $kind] = self::KEYS[$key];
            Config::set($config, match ($kind) {
                self::INTEGER => (int) $value,
                self::NUMBER => (float) $value,
                default => $value,
            });
        }
    }

    /**
     * @throws InvalidArgumentException a key the panel does not manage, or a limit that is not a number
     */
    public static function save(string $key, string $value, User $by): void
    {
        [, $kind] = self::KEYS[$key] ?? throw new InvalidArgumentException("Unknown setting {$key}.");
        $value = trim($value);
        if ($value === '' || ($kind !== self::SECRET && (! is_numeric($value) || (float) $value < 0))) {
            throw new InvalidArgumentException("{$key} needs a value".($kind === self::SECRET ? '.' : ' that is a number of 0 or more.'));
        }
        DB::table('settings')->updateOrInsert(['key' => $key], [
            'value' => Crypt::encryptString($value),
            'updated_by' => $by->id,
            'updated_at' => now(),
            'created_at' => now(),
        ]);
        self::changed($key, 'setting_changed');
    }

    /** Back to the .env's value. */
    public static function forget(string $key): void
    {
        if (DB::table('settings')->where('key', $key)->delete() > 0) {
            self::changed($key, 'setting_removed');
        }
    }

    /**
     * Where each value comes from, never the value of a key.
     *
     * @return list<array{key: string, label: string, help: string, env: string, kind: string, source: string, value: string|null, updated_at: Carbon|null, updated_by: string|null}>
     */
    public static function overview(): array
    {
        $saved = DB::table('settings')->leftJoin('users', 'users.id', '=', 'settings.updated_by')
            ->get(['settings.key', 'settings.updated_at', 'users.name'])->keyBy('key');
        $rows = [];
        foreach (self::KEYS as $key => [$config, $kind, $label, $help, $env]) {
            $row = $saved[$key] ?? null;
            $current = Config::get($config);
            $rows[] = [
                'key' => $key,
                'label' => $label,
                'help' => $help,
                'env' => $env,
                'kind' => $kind,
                'source' => $row !== null ? 'painel' : (filled($current) ? '.env' : 'vazio'),
                // Limits are not secret; keys are never shown.
                'value' => $kind === self::SECRET || ! is_scalar($current) ? null : (string) $current,
                'updated_at' => $row !== null && is_string($row->updated_at ?? null) ? Carbon::parse($row->updated_at) : null,
                'updated_by' => $row !== null && is_string($row->name ?? null) ? $row->name : null,
            ];
        }

        return $rows;
    }

    private static function changed(string $key, string $action): void
    {
        Cache::store(Config::string('cache.limiter'))->forget(self::CACHE);
        AuditLog::admin($action, details: ['key' => $key]);
    }
}

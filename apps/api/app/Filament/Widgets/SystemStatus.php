<?php

namespace App\Filament\Widgets;

use App\Enums\StaffPermission;
use App\Support\SystemHealth;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;

/**
 * "Saúde": the same checks as /api/v1/health with the token (docs/observabilidade.md), for whoever watches the
 * system: the database, the queue, the cron's heartbeat and the disk, with a link to Pulse.
 */
class SystemStatus extends Widget
{
    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.system-status';

    public static function canView(): bool
    {
        return Auth::user()?->can(StaffPermission::MonitoringView->value) ?? false;
    }

    /**
     * @return list<array{name: string, ok: bool, detail: string}>
     */
    public function checks(): array
    {
        $queue = SystemHealth::queue();
        $cron = SystemHealth::cron();
        $disk = SystemHealth::disk();

        return [
            ['name' => 'Base de dados', 'ok' => SystemHealth::databaseIsUp(), 'detail' => 'Responde.'],
            [
                'name' => 'Fila',
                'ok' => $queue['status'] === 'ok' && $queue['failed'] === 0,
                'detail' => "{$queue['pending']} à espera"
                    .($queue['oldest_seconds'] === null ? '' : ', a mais antiga há '.self::minutes($queue['oldest_seconds']))
                    .", {$queue['failed']} falhadas.",
            ],
            [
                'name' => 'Cron',
                'ok' => $cron['status'] === 'ok',
                'detail' => $cron['last_beat_seconds'] === null ? 'Ainda não bateu.' : 'Último batimento há '.self::minutes($cron['last_beat_seconds']).'.',
            ],
            [
                'name' => 'Disco',
                'ok' => $disk['status'] === 'ok',
                'detail' => $disk['free_percent'] === null ? 'Sem leitura.' : "{$disk['free_percent']}% livre ({$disk['free_mb']} MB).",
            ],
        ];
    }

    private static function minutes(int $seconds): string
    {
        return $seconds < 120 ? "{$seconds} s" : intdiv($seconds, 60).' min';
    }
}

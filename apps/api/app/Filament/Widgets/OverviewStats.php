<?php

namespace App\Filament\Widgets;

use App\Enums\DeliveryStatus;
use App\Enums\StaffPermission;
use App\Filament\Resources\Revisions\RevisionResource;
use App\Models\MessageDelivery;
use App\Models\Revision;
use App\Models\User;
use App\Models\WaitlistEntry;
use App\Support\AiBudget;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Number;

/**
 * The numbers at the top of the dashboard: the waiting list, the deliveries of the last 7 days, the AI's inbox and
 * what the AI cost today. Each one only for who may see it.
 */
class OverviewStats extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        $user = Auth::user();
        if (! $user instanceof User) {
            return [];
        }
        $stats = [];
        if ($user->can(StaffPermission::PeopleView->value)) {
            $week = WaitlistEntry::query()->where('created_at', '>=', now()->subDays(7))->count();
            $confirmed = WaitlistEntry::query()->whereNotNull('confirmed_at')->count();
            $stats[] = Stat::make('Lista de espera', Number::format(WaitlistEntry::query()->count(), locale: 'pt'))
                ->description("{$confirmed} confirmados · +{$week} em 7 dias")
                ->icon(Heroicon::QueueList);
        }
        if ($user->can(StaffPermission::MessagesManage->value)) {
            $recent = MessageDelivery::query()->where('created_at', '>=', now()->subDays(7));
            $sent = (clone $recent)->where('status', DeliveryStatus::Sent)->count();
            $failed = (clone $recent)->where('status', DeliveryStatus::Failed)->count();
            $stats[] = Stat::make('Entregas (7 dias)', Number::format($sent, locale: 'pt'))
                ->description($failed > 0 ? "{$failed} falharam" : 'Nenhuma falhou')
                ->color($failed > 0 ? 'danger' : 'success')
                ->icon(Heroicon::PaperAirplane);
        }
        if ($user->can(StaffPermission::ContentView->value)) {
            $pending = Revision::query()->pending()->count();
            $stats[] = Stat::make('Caixa da IA', (string) $pending)
                ->description($pending === 1 ? 'proposta à espera' : 'propostas à espera')
                ->url(RevisionResource::getUrl())
                ->icon(Heroicon::Inbox);
        }
        if ($user->can(StaffPermission::ContentEdit->value)) {
            $spent = AiBudget::spentToday();
            $budget = Config::float('ai.daily_budget_usd');
            $stats[] = Stat::make('Custo da IA hoje', '$'.number_format($spent, 2))
                ->description('Orçamento do dia: $'.number_format($budget, 2))
                ->color($spent >= $budget ? 'danger' : 'gray')
                ->icon(Heroicon::Sparkles);
        }

        return $stats;
    }
}

<?php

namespace App\Filament\Resources\AiTasks\Pages;

use App\Filament\Actions\ResearchWithAi;
use App\Filament\Resources\AiTasks\AiTaskResource;
use App\Support\AiBudget;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Config;

class ListAiTasks extends ListRecords
{
    protected static string $resource = AiTaskResource::class;

    public function getSubheading(): string
    {
        return sprintf('Gasto hoje: %.2f de %.2f USD (AI_DAILY_BUDGET_USD). Tudo o que a IA encontra vai para a "Caixa da IA".',
            AiBudget::spentToday(), Config::float('ai.daily_budget_usd'));
    }

    protected function getHeaderActions(): array
    {
        return [ResearchWithAi::make()];
    }
}

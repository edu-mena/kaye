<?php

namespace App\Filament\Resources\KursoQuestionStats;

use App\Filament\Resources\KursoQuestionStats\Pages\ListKursoQuestionStats;
use App\Models\KursoQuestionStat;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * «Perguntas mais falhadas»: the Kurso questions people get wrong most, from anonymous counters (ADR 0025).
 *
 * @extends resource<KursoQuestionStat>
 */
class KursoQuestionStatResource extends Resource
{
    protected static ?string $model = KursoQuestionStat::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ExclamationTriangle;

    protected static ?string $modelLabel = 'pergunta';

    protected static ?string $pluralModelLabel = 'perguntas mais falhadas';

    protected static ?string $navigationLabel = 'Perguntas mais falhadas';

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query
                ->where('answered', '>=', KursoQuestionStat::MIN_ANSWERS)
                ->orderByRaw('(answered - correct) / answered desc'))
            ->columns([
                TextColumn::make('course')->label('Kurso'),
                TextColumn::make('question_id')->label('Pergunta')->searchable(),
                TextColumn::make('answered')->label('Respostas'),
                TextColumn::make('error_rate')->label('Taxa de erro')
                    ->state(fn (KursoQuestionStat $record): string => round($record->errorRate() * 100).' %'),
            ]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return ['index' => ListKursoQuestionStats::route('/')];
    }
}

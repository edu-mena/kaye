<?php

namespace App\Filament\Resources\Internships;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\Internships\Pages\CreateInternship;
use App\Filament\Resources\Internships\Pages\EditInternship;
use App\Filament\Resources\Internships\Pages\ListInternships;
use App\Models\Internship;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Internships and traineeships.
 */
class InternshipResource extends ContentResource
{
    protected static ?string $model = Internship::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ClipboardDocumentList;

    protected static string|UnitEnum|null $navigationGroup = 'Oportunidades';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'estágio';

    protected static ?string $pluralModelLabel = 'estágios';

    protected static array $tableColumns = ['provider', 'deadline'];

    public static function previewPath(Model $record): ?string
    {
        return '/estagios';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListInternships::route('/'),
            'create' => CreateInternship::route('/create'),
            'edit' => EditInternship::route('/{record}/edit'),
        ];
    }
}

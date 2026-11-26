<?php

namespace App\Filament\Resources\Companies;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\InternshipsRelationManager;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\RelationManagers\PartnersRelationManager;
use App\Filament\RelationManagers\ScholarshipsRelationManager;
use App\Filament\RelationManagers\TestimonialsRelationManager;
use App\Filament\Resources\Companies\Pages\CreateCompany;
use App\Filament\Resources\Companies\Pages\EditCompany;
use App\Filament\Resources\Companies\Pages\ListCompanies;
use App\Models\Company;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Companies, with the careers they hire and their programs for young people.
 */
class CompanyResource extends ContentResource
{
    protected static ?string $model = Company::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::BuildingOffice2;

    protected static string|UnitEnum|null $navigationGroup = 'Oportunidades';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'empresa';

    protected static ?string $pluralModelLabel = 'empresas';

    protected static array $tableColumns = ['sector', 'province'];

    public static function previewPath(Model $record): ?string
    {
        return '/empresas/'.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            LinkedCareersRelationManager::class,
            PartnersRelationManager::class,
            ScholarshipsRelationManager::class,
            InternshipsRelationManager::class,
            TestimonialsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCompanies::route('/'),
            'create' => CreateCompany::route('/create'),
            'edit' => EditCompany::route('/{record}/edit'),
        ];
    }
}

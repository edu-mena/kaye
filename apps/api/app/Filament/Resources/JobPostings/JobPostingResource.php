<?php

namespace App\Filament\Resources\JobPostings;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\JobPostings\Pages\CreateJobPosting;
use App\Filament\Resources\JobPostings\Pages\EditJobPosting;
use App\Filament\Resources\JobPostings\Pages\ListJobPostings;
use App\Models\JobPosting;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The facts of job posts (never the text): they feed the Mercado counts.
 */
class JobPostingResource extends ContentResource
{
    protected static ?string $model = JobPosting::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::InboxStack;

    protected static string|UnitEnum|null $navigationGroup = 'Mercado';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'vaga';

    protected static ?string $pluralModelLabel = 'vagas';

    protected static array $tableColumns = ['source', 'date', 'province'];

    public static function previewPath(Model $record): ?string
    {
        return '/mercado';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListJobPostings::route('/'),
            'create' => CreateJobPosting::route('/create'),
            'edit' => EditJobPosting::route('/{record}/edit'),
        ];
    }
}

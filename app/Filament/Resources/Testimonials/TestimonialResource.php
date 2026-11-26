<?php

namespace App\Filament\Resources\Testimonials;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\Testimonials\Pages\CreateTestimonial;
use App\Filament\Resources\Testimonials\Pages\EditTestimonial;
use App\Filament\Resources\Testimonials\Pages\ListTestimonials;
use App\Models\Testimonial;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * What people who do the job say about it.
 */
class TestimonialResource extends ContentResource
{
    protected static ?string $model = Testimonial::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ChatBubbleBottomCenterText;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 7;

    protected static ?string $modelLabel = 'testemunho';

    protected static ?string $pluralModelLabel = 'testemunhos';

    protected static ?string $areaRelation = 'career.group.area';

    public static function previewPath(Model $record): ?string
    {
        return '/carreiras/'.static::slugOf($record->getRelationValue('career'));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTestimonials::route('/'),
            'create' => CreateTestimonial::route('/create'),
            'edit' => EditTestimonial::route('/{record}/edit'),
        ];
    }
}

<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\CourseOffers\CourseOfferResource;

class OffersRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'offers';

    protected static string $childResource = CourseOfferResource::class;
}

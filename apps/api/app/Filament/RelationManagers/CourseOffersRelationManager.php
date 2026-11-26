<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\CourseOffers\CourseOfferResource;

class CourseOffersRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'courseOffers';

    protected static string $childResource = CourseOfferResource::class;
}

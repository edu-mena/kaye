<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Testimonials\TestimonialResource;

class TestimonialsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'testimonials';

    protected static string $childResource = TestimonialResource::class;
}

<?php

namespace App\Filament\Resources\Testimonials\Pages;

use App\Filament\Content\Pages\ListContent;
use App\Filament\Resources\Testimonials\TestimonialResource;

class ListTestimonials extends ListContent
{
    protected static string $resource = TestimonialResource::class;
}

<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\TuitionFees\TuitionFeeResource;

class TuitionFeesRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'tuitionFees';

    protected static string $childResource = TuitionFeeResource::class;
}

<?php

namespace App\Filament\Widgets;

use App\Enums\StaffPermission;
use App\Filament\Content\ContentColumns;
use App\Filament\Content\ContentResource;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * "Registos por estado": how many rows of each catalogue table are drafts, in review or published, and how many
 * are estimated or have no source. One small query per table.
 */
class ContentStatus extends Widget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.content-status';

    public static function canView(): bool
    {
        return Auth::user()?->can(StaffPermission::ContentView->value) ?? false;
    }

    /**
     * @return list<array{label: string, url: string, total: int, draft: int|null, review: int|null, published: int|null, estimated: int|null, without_source: int|null}>
     */
    public function rows(): array
    {
        $rows = [];
        foreach (ContentResource::all() as $resource) {
            $model = $resource::getModel();
            $query = $model::query()->selectRaw('count(*) as total');
            if (ContentColumns::has($model, 'status')) {
                $query->selectRaw("coalesce(sum(case when status = 'draft' then 1 else 0 end), 0) as draft")
                    ->selectRaw("coalesce(sum(case when status = 'review' then 1 else 0 end), 0) as review")
                    ->selectRaw("coalesce(sum(case when status = 'published' then 1 else 0 end), 0) as published");
            }
            if (ContentColumns::has($model, 'estimated')) {
                $query->selectRaw('coalesce(sum(case when estimated = 1 then 1 else 0 end), 0) as estimated');
            }
            if (ContentColumns::has($model, 'source_url')) {
                $query->selectRaw("coalesce(sum(case when source_url is null or source_url = '' then 1 else 0 end), 0) as without_source");
            }
            $counts = (array) $query->toBase()->first();
            $number = fn (string $key): ?int => isset($counts[$key]) && is_numeric($counts[$key]) ? (int) $counts[$key] : null;
            $rows[] = [
                'label' => Str::ucfirst($resource::getPluralModelLabel()),
                'url' => $resource::getUrl(),
                'total' => $number('total') ?? 0,
                'draft' => $number('draft'),
                'review' => $number('review'),
                'published' => $number('published'),
                'estimated' => $number('estimated'),
                'without_source' => $number('without_source'),
            ];
        }

        return $rows;
    }
}

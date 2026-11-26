<?php

namespace App\Filament\Widgets;

use App\Enums\StaffPermission;
use App\Filament\Content\ContentLabels;
use App\Models\Area;
use App\Support\ContentTypes;
use Filament\Widgets\Widget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * "Campos em falta": the careers of each area of the catalogue without a guide, a salary or a photo, and, for the
 * types the AI completes, how many rows lack each important field (the same list as the MCP's list_missing).
 */
class MissingFields extends Widget
{
    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.missing-fields';

    public static function canView(): bool
    {
        return Auth::user()?->can(StaffPermission::ContentView->value) ?? false;
    }

    /**
     * @return list<array{area: string, total: int, published: int, guide: int, salary: int, image: int, estimated: int}>
     */
    public function byArea(): array
    {
        $counts = DB::table('careers')
            ->join('career_groups', 'career_groups.id', '=', 'careers.career_group_id')
            ->whereNull('careers.deleted_at')
            ->groupBy('career_groups.area_id')
            ->selectRaw('career_groups.area_id as area_id, count(*) as total')
            ->selectRaw("sum(case when careers.status = 'published' then 1 else 0 end) as published")
            ->selectRaw('sum(case when careers.description is null then 1 else 0 end) as guide')
            ->selectRaw('sum(case when careers.salary_median is null then 1 else 0 end) as salary')
            ->selectRaw('sum(case when careers.image is null then 1 else 0 end) as image')
            ->selectRaw('sum(case when careers.estimated = 1 then 1 else 0 end) as estimated')
            ->get()->keyBy('area_id');

        $rows = [];
        foreach (Area::query()->orderBy('position')->get() as $area) {
            $count = (array) ($counts[$area->id] ?? []);
            $number = fn (string $key): int => is_numeric($count[$key] ?? null) ? (int) $count[$key] : 0;
            $rows[] = [
                'area' => ContentLabels::of($area),
                'total' => $number('total'), 'published' => $number('published'), 'guide' => $number('guide'),
                'salary' => $number('salary'), 'image' => $number('image'), 'estimated' => $number('estimated'),
            ];
        }

        return $rows;
    }

    /**
     * @return list<array{type: string, total: int, missing: array<string, int>}>
     */
    public function byType(): array
    {
        $rows = [];
        foreach (ContentTypes::keys() as $type) {
            $model = ContentTypes::model($type);
            $missing = [];
            foreach (ContentTypes::important($type) as $field) {
                $missing[ContentLabels::column($field)] = $model::query()
                    ->where(fn (Builder $empty): Builder => $empty->whereNull($field)->orWhere($field, ''))->count();
            }
            $rows[] = ['type' => ContentTypes::label($type), 'total' => $model::query()->count(), 'missing' => $missing];
        }

        return $rows;
    }
}

<?php

namespace App\Support;

use App\Enums\ConsentKind;
use App\Models\AreaMembership;
use App\Models\Consent;
use App\Models\KursoCompletion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * The communities by area (ADR 0025): self-declared level, a count shown only from `MIN_PUBLIC` people, and the
 * pioneer number, given once after the first topic finished in the area. Nobody is ever listed.
 */
final class Communities
{
    /** Below this many people the count is not shown: the community "is being born". */
    public const MIN_PUBLIC = 50;

    public const LEVELS = ['student', 'aspirant', 'graduate', 'professional'];

    /** The Kursos that belong to each Mercado area (an area without a Kurso gives no number yet). */
    private const COURSES = [
        'technology' => ['programacao', 'analise-dados', 'ciberseguranca'],
        'business' => ['contabilidade', 'gestao-projetos'],
        'communication' => ['marketing-digital'],
    ];

    /** @return list<string> */
    public static function areas(): array
    {
        return ['technology', 'engineering', 'oil_mining', 'health', 'education', 'business', 'legal', 'public', 'communication', 'agriculture', 'hospitality', 'logistics', 'sciences'];
    }

    /** The people counted, or null while there are fewer than `MIN_PUBLIC`. Only those who agreed to be counted. */
    public static function count(string $area): ?int
    {
        $count = AreaMembership::query()->where('area', $area)
            ->whereIn('user_id', Consent::query()->active()->where('kind', ConsentKind::CommunityCount)->select('user_id'))
            ->count();

        return $count >= self::MIN_PUBLIC ? $count : null;
    }

    /** Sets the level (a minor, or anyone whose age is unknown, is always a student) and gives the number if it is due. */
    public static function join(User $user, string $area, string $level): AreaMembership
    {
        $membership = AreaMembership::query()->updateOrCreate(
            ['user_id' => $user->getKey(), 'area' => $area],
            ['level' => $user->isAdult() ? $level : 'student'],
        );
        self::assignPioneer($user, $area);

        return $membership->refresh();
    }

    /** After a topic: the areas of that Kurso may now give the number. */
    public static function afterTopic(User $user, string $course): void
    {
        foreach (self::COURSES as $area => $courses) {
            if (in_array($course, $courses, true)) {
                self::assignPioneer($user, $area);
            }
        }
    }

    /**
     * The next number of the area, once, for an adult who declared a level and finished a topic there. In a
     * transaction with the counter's row locked, so two requests never get the same number.
     */
    private static function assignPioneer(User $user, string $area): void
    {
        $courses = self::COURSES[$area] ?? [];
        if (! $user->isAdult() || $courses === []
            || ! KursoCompletion::query()->where('user_id', $user->getKey())->whereIn('course', $courses)->where('topic', '!=', KursoCompletion::EXAM)->exists()) {
            return;
        }

        DB::transaction(function () use ($user, $area): void {
            $membership = AreaMembership::query()->where(['user_id' => $user->getKey(), 'area' => $area])->lockForUpdate()->first();
            if (! $membership instanceof AreaMembership || $membership->pioneer_number !== null) {
                return;
            }
            DB::table('area_counters')->insertOrIgnore(['area' => $area, 'last_number' => 0]);
            $stored = DB::table('area_counters')->where('area', $area)->lockForUpdate()->value('last_number');
            $last = is_numeric($stored) ? (int) $stored : 0;
            DB::table('area_counters')->where('area', $area)->update(['last_number' => $last + 1]);
            $membership->update(['pioneer_number' => $last + 1]);
        });
    }
}

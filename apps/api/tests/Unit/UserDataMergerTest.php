<?php

namespace Tests\Unit;

use App\Support\UserDataMerger;
use PHPUnit\Framework\TestCase;
use stdClass;

/**
 * The merge never loses what either side has (docs/arquitetura.md, 5.1).
 */
class UserDataMergerTest extends TestCase
{
    public function test_empty_values_take_the_other_sides_value(): void
    {
        $merged = $this->merge(
            ['targetCareer' => null, 'assessmentCompletedAt' => '2026-11-01', 'skills' => new stdClass],
            ['targetCareer' => 'medico', 'assessmentCompletedAt' => null, 'skills' => ['react' => 'sei']],
        );

        $this->assertSame('medico', $merged['targetCareer']);
        $this->assertSame('2026-11-01', $merged['assessmentCompletedAt']);
        $this->assertSame(['react' => 'sei'], $merged['skills']);
    }

    public function test_two_different_values_keep_the_servers_except_counters_that_only_grow(): void
    {
        $merged = $this->merge(
            ['targetCareer' => 'medico', 'notificationsSeenAt' => '2026-11-01T00:00:00Z', 'kursos' => ['k' => ['seconds' => 10]]],
            ['targetCareer' => 'advogado', 'notificationsSeenAt' => '2026-11-09T00:00:00Z', 'kursos' => ['k' => ['seconds' => 99]]],
        );

        $this->assertSame('medico', $merged['targetCareer']);
        $this->assertSame('2026-11-09T00:00:00Z', $merged['notificationsSeenAt']);
        $this->assertSame(99, data_get($merged, 'kursos.k.seconds'));
    }

    public function test_records_with_an_id_count_once_and_the_servers_copy_wins(): void
    {
        $merged = $this->merge(
            ['cvs' => [['id' => 'a', 'title' => 'Servidor']]],
            ['cvs' => [['id' => 'a', 'title' => 'Aparelho'], ['id' => 'b', 'title' => 'Novo']]],
        );

        $this->assertSame([['id' => 'a', 'title' => 'Servidor'], ['id' => 'b', 'title' => 'Novo']], $merged['cvs']);
    }

    public function test_the_same_dated_event_counts_once_whatever_the_order_of_its_keys(): void
    {
        $merged = $this->merge(
            ['psychotech' => [['at' => '2026-11-01', 'mode' => 'treino']]],
            ['psychotech' => [['mode' => 'treino', 'at' => '2026-11-01'], ['at' => '2026-11-03', 'mode' => 'exame']]],
        );

        $this->assertSame(['2026-11-03', '2026-11-01'], data_get($merged, 'psychotech.*.at'));
    }

    public function test_lists_mixing_records_and_names_are_joined_without_repeats(): void
    {
        $merged = $this->merge(['mixed' => ['a', ['x' => 1]]], ['mixed' => [['x' => 1], 'b']]);

        $this->assertSame(['a', ['x' => 1], 'b'], $merged['mixed']);
    }

    public function test_whole_records_are_never_mixed(): void
    {
        $merged = $this->merge(
            ['profile' => ['name' => 'Ana', 'birthYear' => 2008]],
            ['profile' => ['name' => 'Ana', 'birthYear' => 2000, 'province' => 'Huíla']],
        );

        $this->assertSame(['name' => 'Ana', 'birthYear' => 2008], $merged['profile']);
    }

    public function test_the_photo_and_cover_are_dropped(): void
    {
        $merged = $this->merge(['photo' => 'data:a'], ['cover' => 'data:b', 'version' => 1]);

        $this->assertSame(['version' => 1], $merged);
    }

    /**
     * @param  array<string, mixed>  $server
     * @param  array<string, mixed>  $device
     * @return array<string, mixed>
     */
    private function merge(array $server, array $device): array
    {
        $merged = (new UserDataMerger)->merge(self::object($server), self::object($device));

        /** @var array<string, mixed> */
        return json_decode((string) json_encode($merged), true);
    }

    /**
     * @param  array<string, mixed>  $value
     */
    private static function object(array $value): stdClass
    {
        $decoded = json_decode((string) json_encode($value), false);

        return $decoded instanceof stdClass ? $decoded : new stdClass;
    }
}

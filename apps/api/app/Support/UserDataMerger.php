<?php

namespace App\Support;

use stdClass;

/**
 * Merges the `UserData` a device sends with the one the server has, without ever losing anything
 * (docs/arquitetura.md, 5.1). Used at the first login and when two devices wrote at the same time.
 *
 * - Something empty on one side takes the other side's value.
 * - Lists are joined: names once each (saved careers), records with an `id` once each (CVs, the
 *   server's copy wins), anything else once each and, when dated (`at`), newest first (history, tests).
 * - Records are merged key by key, except the ones that only make sense whole (the profile, the
 *   plan): two different ones are never mixed, and the server's wins.
 * - Two different values: the server's wins, except counters that only grow (Kurso study time and
 *   grades) and the last time the notifications were opened or the home's news were seen, where the larger wins.
 */
class UserDataMerger
{
    /** The photo and the cover never leave the device (docs/base-de-dados.md, `user_data`). */
    public const DEVICE_ONLY = ['photo', 'cover'];

    private const WHOLE = ['profile', 'discovery', 'plan', 'publicPage'];

    private const LARGEST = ['/^kursos\.[^.]+\.seconds$/', '/^kursos\.[^.]+\.scores\.[^.]+$/', '/^notificationsSeenAt$/', '/^newsSeenAt$/'];

    public function merge(stdClass $server, stdClass $device): stdClass
    {
        $merged = $this->value($this->withoutDeviceOnly($server), $this->withoutDeviceOnly($device), '');

        return $merged instanceof stdClass ? $merged : new stdClass;
    }

    public function withoutDeviceOnly(stdClass $document): stdClass
    {
        $copy = clone $document;
        foreach (self::DEVICE_ONLY as $key) {
            unset($copy->{$key});
        }

        return $copy;
    }

    private function value(mixed $server, mixed $device, string $path): mixed
    {
        if ($this->isEmpty($server)) {
            return $device;
        }
        if ($this->isEmpty($device)) {
            return $server;
        }
        if (is_array($server) && is_array($device)) {
            return $this->lists(array_values($server), array_values($device));
        }
        if ($server instanceof stdClass && $device instanceof stdClass) {
            return in_array($path, self::WHOLE, true) ? $server : $this->records($server, $device, $path);
        }

        return $this->isLargest($path) && $this->comparable($server, $device) && $device > $server ? $device : $server;
    }

    private function records(stdClass $server, stdClass $device, string $path): stdClass
    {
        $merged = clone $server;
        foreach (get_object_vars($device) as $key => $value) {
            $merged->{$key} = $this->value($server->{$key} ?? null, $value, $path === '' ? (string) $key : "{$path}.{$key}");
        }

        return $merged;
    }

    /**
     * @param  list<mixed>  $server
     * @param  list<mixed>  $device
     * @return list<mixed>
     */
    private function lists(array $server, array $device): array
    {
        $byId = $this->allHaveId($server) && $this->allHaveId($device);
        $seen = [];
        $merged = [];
        foreach ([...$server, ...$device] as $item) {
            $key = $byId && $item instanceof stdClass ? 'id:'.$this->scalarKey($item->id) : 'json:'.$this->canonical($item);
            if (! isset($seen[$key])) {
                $seen[$key] = true;
                $merged[] = $item;
            }
        }

        return $this->allDated($merged) ? $this->newestFirst($merged) : $merged;
    }

    /**
     * @param  list<mixed>  $items
     */
    private function allHaveId(array $items): bool
    {
        foreach ($items as $item) {
            if (! $item instanceof stdClass || ! is_string($item->id ?? null)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  list<mixed>  $items
     */
    private function allDated(array $items): bool
    {
        foreach ($items as $item) {
            if (! $item instanceof stdClass || ! is_string($item->at ?? null)) {
                return false;
            }
        }

        return true;
    }

    /**
     * ISO dates sort as text. Equal dates keep their order (usort is stable).
     *
     * @param  list<mixed>  $items
     * @return list<mixed>
     */
    private function newestFirst(array $items): array
    {
        usort($items, fn (mixed $left, mixed $right): int => strcmp($this->date($right), $this->date($left)));

        return $items;
    }

    private function date(mixed $item): string
    {
        return $item instanceof stdClass && is_string($item->at ?? null) ? $item->at : '';
    }

    private function scalarKey(mixed $value): string
    {
        return is_scalar($value) ? (string) $value : '';
    }

    /** The same JSON whatever the order of the keys, so two copies of one item count once. */
    private function canonical(mixed $value): string
    {
        return json_encode($this->sorted($value), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }

    private function sorted(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map(fn (mixed $item): mixed => $this->sorted($item), $value);
        }
        if ($value instanceof stdClass) {
            $fields = get_object_vars($value);
            ksort($fields);

            return (object) array_map(fn (mixed $item): mixed => $this->sorted($item), $fields);
        }

        return $value;
    }

    private function isEmpty(mixed $value): bool
    {
        return $value === null || $value === '' || $value === [] || ($value instanceof stdClass && get_object_vars($value) === []);
    }

    private function isLargest(string $path): bool
    {
        foreach (self::LARGEST as $pattern) {
            if (preg_match($pattern, $path) === 1) {
                return true;
            }
        }

        return false;
    }

    private function comparable(mixed $server, mixed $device): bool
    {
        return (is_int($server) || is_float($server)) && (is_int($device) || is_float($device))
            || is_string($server) && is_string($device);
    }
}

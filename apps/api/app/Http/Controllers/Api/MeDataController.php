<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserData;
use App\Support\Accounts;
use App\Support\UserDataMerger;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use JsonException;
use stdClass;

/**
 * The person's `UserData` (docs/arquitetura.md, 6): read it, replace it with the version it was
 * read at (an older version gets 409 and the current copy), or merge a device's copy into it.
 */
class MeDataController extends Controller
{
    /** Without the photo and the cover, a full `UserData` is far below this. */
    private const MAX_BYTES = 1_000_000;

    public function __construct(private readonly UserDataMerger $merger, private readonly Accounts $accounts) {}

    public function show(Request $request): JsonResponse
    {
        $row = MeController::user($request)->userData;

        return self::document($row->version ?? 0, $row?->document());
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'version' => ['required', 'integer', 'min:0'],
            'data' => ['required', 'array'],
            'data.version' => ['required', 'integer', 'in:1'],
        ]);
        $device = $this->deviceDocument($request);
        $version = $request->integer('version');

        return $this->write(MeController::user($request), function (?UserData $row) use ($device, $version): stdClass|JsonResponse {
            $current = $row->version ?? 0;

            return $current === $version
                ? $this->merger->withoutDeviceOnly($device)
                : self::document($current, $row?->document(), 409);
        });
    }

    public function merge(Request $request): JsonResponse
    {
        $request->validate([
            'data' => ['required', 'array'],
            'data.version' => ['required', 'integer', 'in:1'],
        ]);
        $device = $this->deviceDocument($request);

        return $this->write(
            MeController::user($request),
            fn (?UserData $row): stdClass => $this->merger->merge($row?->document() ?? new stdClass, $device),
        );
    }

    /**
     * One write at a time per person: the row is locked while the new document is decided.
     *
     * @param  callable(?UserData): (stdClass|JsonResponse)  $decide  The new document, or a response that stops the write
     */
    private function write(User $user, callable $decide): JsonResponse
    {
        try {
            return DB::transaction(function () use ($user, $decide): JsonResponse {
                $row = UserData::query()->where('user_id', $user->getKey())->lockForUpdate()->first();
                $document = $decide($row);
                if ($document instanceof JsonResponse) {
                    return $document;
                }

                $row ??= new UserData;
                $row->user()->associate($user);
                $row->setDocument($document);
                $row->version = ($row->exists ? $row->version : 0) + 1;
                $row->save();
                $this->accounts->syncProfile($user, $document);

                return self::document($row->version, $document);
            });
        } catch (UniqueConstraintViolationException) {
            // Another device created the row in the same instant: this one gets it and tries again.
            $row = $user->userData()->first();

            return self::document($row->version ?? 0, $row?->document(), 409);
        }
    }

    /**
     * The `data` field decoded as JSON objects, so an empty record stays a record: the input
     * Laravel parses turns it into an empty list.
     */
    private function deviceDocument(Request $request): stdClass
    {
        $raw = $request->getContent();
        abort_if(strlen($raw) > self::MAX_BYTES, 413, 'User data too large.');

        try {
            $body = json_decode($raw, false, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            abort(422, 'Invalid JSON.');
        }
        abort_unless($body instanceof stdClass && ($body->data ?? null) instanceof stdClass, 422, 'The data must be an object.');

        return $body->data;
    }

    private static function document(int $version, ?stdClass $data, int $status = 200): JsonResponse
    {
        return response()->json(['version' => $version, 'data' => $data], $status, options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}

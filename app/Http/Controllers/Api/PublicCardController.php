<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicCard;
use App\Support\Contact;
use App\Support\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * /public-cards: the public page of a business card (ADR 0014). Creating it gives back a secret once; only the
 * device that keeps it can change or switch off the page (Authorization: Bearer <secret>).
 */
class PublicCardController extends Controller
{
    private const MAX_BODY = 200_000;

    private const MAX_PHOTO = 120_000;

    private const SLUG = '/^[A-Za-z0-9_-]{12}$/';

    public function store(Request $request): JsonResponse
    {
        $card = self::read($request);
        if ($card === null) {
            return Submission::invalid();
        }
        $slug = Submission::randomId();
        $secret = Submission::randomId(32);
        PublicCard::query()->create(['slug' => $slug, 'secret_hash' => PublicCard::hashSecret($secret), 'card' => $card]);

        return Submission::json(['slug' => $slug, 'secret' => $secret], 201);
    }

    public function show(string $slug): JsonResponse
    {
        $stored = self::find($slug);

        return $stored === null ? self::notFound() : Submission::json($stored->card);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $stored = self::find($slug);
        if ($stored === null) {
            return self::notFound();
        }
        if (! $stored->isOwnedBy((string) $request->bearerToken())) {
            return Submission::json(['error' => 'forbidden'], 403);
        }
        $card = self::read($request);
        if ($card === null) {
            return Submission::invalid();
        }
        $stored->update(['card' => $card]);

        return Submission::json($card);
    }

    /**
     * Switching off a page that is not there succeeds: the link is dead either way.
     */
    public function destroy(Request $request, string $slug): Response|JsonResponse
    {
        $stored = self::find($slug);
        if ($stored === null) {
            return response()->noContent();
        }
        if (! $stored->isOwnedBy((string) $request->bearerToken())) {
            return Submission::json(['error' => 'forbidden'], 403);
        }
        $stored->delete();

        return response()->noContent();
    }

    private static function find(string $slug): ?PublicCard
    {
        return preg_match(self::SLUG, $slug) === 1 ? PublicCard::query()->where('slug', $slug)->first() : null;
    }

    private static function notFound(): JsonResponse
    {
        return Submission::json(['error' => 'not_found'], 404);
    }

    /**
     * The card if every field is valid; null otherwise. Only these fields are ever kept; a name and an accent
     * colour are required.
     *
     * @return array<string, string>|null
     */
    private static function read(Request $request): ?array
    {
        $body = Submission::read($request, self::MAX_BODY);
        if ($body === null) {
            return null;
        }
        $card = [];
        foreach (self::rules() as $field => $rule) {
            if (! array_key_exists($field, $body)) {
                continue;
            }
            $value = $body[$field];
            if (! is_string($value) || ! $rule($value)) {
                return null;
            }
            $card[$field] = $value;
        }

        return isset($card['name'], $card['accent']) ? $card : null;
    }

    /**
     * @return array<string, callable(string): bool>
     */
    private static function rules(): array
    {
        $under = fn (int $max): callable => fn (string $value): bool => mb_strlen($value) <= $max;

        return [
            'name' => fn (string $value): bool => $under(80)($value) && trim($value) !== '',
            'accent' => fn (string $value): bool => preg_match('/^#[0-9a-f]{6}$/i', $value) === 1,
            'headline' => $under(120),
            'photo' => fn (string $value): bool => strlen($value) <= self::MAX_PHOTO
                && preg_match('#^data:image/jpeg;base64,[A-Za-z0-9+/=]+$#', $value) === 1,
            'email' => fn (string $value): bool => $under(120)($value) && Contact::isEmail($value),
            'whatsapp' => Contact::isPhone(...),
            'linkedin' => fn (string $value): bool => $under(200)($value) && self::isLink($value),
            'portfolio' => fn (string $value): bool => $under(200)($value) && self::isLink($value),
        ];
    }

    private static function isLink(string $value): bool
    {
        $scheme = parse_url($value, PHP_URL_SCHEME);
        $host = parse_url($value, PHP_URL_HOST);

        return in_array($scheme, ['http', 'https'], true) && is_string($host) && $host !== '';
    }
}

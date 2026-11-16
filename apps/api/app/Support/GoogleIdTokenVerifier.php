<?php

namespace App\Support;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use stdClass;
use Throwable;
use UnexpectedValueException;

/**
 * Checks a Google ID token from the Android app (docs/arquitetura.md, 5.1): signed by one of Google's
 * keys, issued by Google, for the Kayé client (`aud`), not expired, with a verified email.
 */
class GoogleIdTokenVerifier
{
    public const KEYS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

    private const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

    private const CACHE_KEY = 'google-id-token-keys';

    /** Google keeps each key for days; an hour keeps a rotation from locking anyone out. */
    private const KEYS_TTL = 3600;

    /** Seconds of clock difference tolerated between Google and this server. */
    private const LEEWAY = 30;

    /**
     * @return array{sub: string, email: string, name: string, picture: ?string}
     *
     * @throws InvalidGoogleToken
     */
    public function verify(string $idToken): array
    {
        $claims = $this->decode($idToken);

        $audiences = Config::array('services.google.audiences');
        if (! is_string($claims->aud ?? null) || ! in_array($claims->aud, $audiences, true)) {
            throw new InvalidGoogleToken('The token was issued for another app.');
        }
        if (! in_array($claims->iss ?? null, self::ISSUERS, true)) {
            throw new InvalidGoogleToken('The token was not issued by Google.');
        }
        if (($claims->email_verified ?? false) !== true || ! is_string($claims->email ?? null)) {
            throw new InvalidGoogleToken('The Google account has no verified email.');
        }
        if (! is_string($claims->sub ?? null) || $claims->sub === '') {
            throw new InvalidGoogleToken('The token has no subject.');
        }

        return [
            'sub' => $claims->sub,
            'email' => $claims->email,
            'name' => is_string($claims->name ?? null) ? $claims->name : $claims->email,
            'picture' => is_string($claims->picture ?? null) ? $claims->picture : null,
        ];
    }

    /**
     * The signature and the dates. Google rotates its keys: a key id we do not know yet fetches them again, once.
     */
    private function decode(string $idToken): stdClass
    {
        JWT::$leeway = self::LEEWAY;

        try {
            try {
                return JWT::decode($idToken, JWK::parseKeySet($this->keys(), 'RS256'));
            } catch (UnexpectedValueException $exception) {
                if (! str_contains($exception->getMessage(), '"kid"')) {
                    throw $exception;
                }
                Cache::forget(self::CACHE_KEY);

                return JWT::decode($idToken, JWK::parseKeySet($this->keys(), 'RS256'));
            }
        } catch (Throwable $exception) {
            throw new InvalidGoogleToken($exception->getMessage(), previous: $exception);
        }
    }

    /**
     * Google's public keys, kept for an hour.
     *
     * @return array{keys: list<array<string, string>>}
     */
    private function keys(): array
    {
        /** @var array{keys: list<array<string, string>>} */
        return Cache::remember(self::CACHE_KEY, self::KEYS_TTL, function (): array {
            $response = Http::timeout(5)->get(self::KEYS_URL)->throw();
            $keys = $response->json('keys');

            return ['keys' => is_array($keys) ? array_values($keys) : []];
        });
    }
}

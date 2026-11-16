<?php

namespace Tests;

use App\Support\GoogleIdTokenVerifier;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use OpenSSLAsymmetricKey;
use RuntimeException;

/**
 * Signs ID tokens the way Google does, with RSA keys made for the test, and serves the public half
 * where the verifier looks for Google's keys. Nothing is sent to Google.
 */
trait GoogleTokens
{
    protected const CLIENT_ID = 'kaye-web.apps.googleusercontent.com';

    /** @var array<string, OpenSSLAsymmetricKey> */
    private static array $keys = [];

    protected function fakeGoogleKeys(): void
    {
        Config::set('services.google.audiences', [self::CLIENT_ID]);
        Http::preventStrayRequests();
        Http::fake([GoogleIdTokenVerifier::KEYS_URL => Http::response(['keys' => [$this->publicJwk('google')]])]);
    }

    /**
     * @param  array<string, mixed>  $claims  What changes from a valid token
     */
    protected function googleToken(array $claims = [], string $signer = 'google', ?string $kid = 'google'): string
    {
        $payload = array_merge([
            'iss' => 'https://accounts.google.com',
            'aud' => self::CLIENT_ID,
            'sub' => '110000000000000000001',
            'email' => 'joana@example.com',
            'email_verified' => true,
            'name' => 'Joana Silva',
            'picture' => 'https://lh3.googleusercontent.com/a/joana',
            'iat' => time() - 10,
            'exp' => time() + 3600,
        ], $claims);

        return JWT::encode($payload, self::key($signer), 'RS256', $kid);
    }

    /**
     * @return array<string, string>
     */
    private function publicJwk(string $name): array
    {
        $details = openssl_pkey_get_details(self::key($name));
        $modulus = is_array($details) ? data_get($details, 'rsa.n') : null;
        $exponent = is_array($details) ? data_get($details, 'rsa.e') : null;
        if (! is_string($modulus) || ! is_string($exponent)) {
            throw new RuntimeException('Not an RSA key.');
        }

        return [
            'kty' => 'RSA',
            'alg' => 'RS256',
            'use' => 'sig',
            'kid' => $name,
            'n' => JWT::urlsafeB64Encode($modulus),
            'e' => JWT::urlsafeB64Encode($exponent),
        ];
    }

    private static function key(string $name): OpenSSLAsymmetricKey
    {
        if (! isset(self::$keys[$name])) {
            $key = openssl_pkey_new([
                'private_key_bits' => 2048,
                'private_key_type' => OPENSSL_KEYTYPE_RSA,
                'config' => self::opensslConfig(),
            ]);
            if ($key === false) {
                throw new RuntimeException('Could not create a test key: '.openssl_error_string());
            }
            self::$keys[$name] = $key;
        }

        return self::$keys[$name];
    }

    /** Some PHP builds (Windows) have no OpenSSL config where they look for it; this minimal one is enough. */
    private static function opensslConfig(): string
    {
        $path = sys_get_temp_dir().DIRECTORY_SEPARATOR.'kaye-test-openssl.cnf';
        if (! is_file($path)) {
            file_put_contents($path, "[req]\ndistinguished_name=dn\n[dn]\n");
        }

        return $path;
    }
}

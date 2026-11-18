<?php

namespace Tests;

use App\Enums\ConsentKind;
use App\Models\User;
use App\Support\Consents;
use Minishlink\WebPush\VAPID;
use NotificationChannels\WebPush\PushSubscription;
use RuntimeException;

/**
 * Real VAPID keys for the server and a real browser key pair for a subscription, so Web Push encrypts and
 * signs as in production; only the push service's answer is faked (Http::fake).
 */
trait PushKeys
{
    protected function useVapidKeys(): void
    {
        $keys = VAPID::createVapidKeys();
        config(['webpush.vapid.public_key' => $keys['publicKey'], 'webpush.vapid.private_key' => $keys['privateKey'], 'webpush.vapid.subject' => 'mailto:ola@kaye.ao']);
    }

    /** A person with the push consent and one browser subscribed at this endpoint. */
    protected function subscribed(User $user, string $endpoint, ConsentKind $kind = ConsentKind::PushService): PushSubscription
    {
        Consents::grant($user, $kind, '2026-11-12', 'app', null);

        return $user->updatePushSubscription($endpoint, $this->browserKey(), $this->base64url(random_bytes(16)), 'aes128gcm');
    }

    /** The browser's P-256 public key as `p256dh`: an uncompressed point, base64url. */
    private function browserKey(): string
    {
        $key = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
        $details = $key === false ? false : openssl_pkey_get_details($key);
        if (! is_array($details) || ! is_array($details['ec'] ?? null) || ! is_string($details['ec']['x'] ?? null) || ! is_string($details['ec']['y'] ?? null)) {
            throw new RuntimeException('No EC key');
        }

        return $this->base64url("\x04".$details['ec']['x'].$details['ec']['y']);
    }

    private function base64url(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }
}

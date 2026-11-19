<?php

namespace App\Http\Controllers\Api;

use App\Enums\ConsentKind;
use App\Http\Controllers\Controller;
use App\Support\Consents;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;

/**
 * Web Push (VAPID). GET /push/key: the public key the browser subscribes with (null: push is off).
 * POST and DELETE /me/push-subscriptions: this browser's subscription, kept only with a push consent.
 */
class PushSubscriptionController extends Controller
{
    public function key(): JsonResponse
    {
        $key = Config::get('webpush.vapid.public_key');

        return response()->json(['key' => is_string($key) && $key !== '' ? $key : null]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // A push service's address: always HTTPS. 500 is the column's size.
            'endpoint' => ['required', 'string', 'url:https', 'max:500'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'contentEncoding' => ['nullable', 'string', 'in:aesgcm,aes128gcm'],
        ]);
        $user = MeController::user($request);
        abort_unless(Consents::has($user, ConsentKind::PushService) || Consents::has($user, ConsentKind::PushMarketing), 403, 'A push consent is needed first.');

        $subscription = $user->updatePushSubscription(
            $request->string('endpoint')->value(),
            $request->string('keys.p256dh')->value(),
            $request->string('keys.auth')->value(),
            $request->string('contentEncoding', 'aes128gcm')->value(),
        );

        return response()->json(['ok' => true], $subscription->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request): Response
    {
        $request->validate(['endpoint' => ['required', 'string', 'max:500']]);
        MeController::user($request)->deletePushSubscription($request->string('endpoint')->value());

        return response()->noContent();
    }
}

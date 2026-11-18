<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

/**
 * One notice by Web Push, to every browser the person subscribed. The service worker (apps/web/public/
 * push-sw.js) shows it and opens `url`, a page of the app, when it is tapped.
 */
class PushNotice extends Notification
{
    public function __construct(public string $title, public string $body, public string $url = '/') {}

    /**
     * @return list<class-string>
     */
    public function via(User $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(User $notifiable, self $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title($this->title)
            ->body($this->body)
            ->icon('/spa/pwa-192.png')
            ->badge('/spa/pwa-192.png')
            ->data(['url' => $this->url])
            ->options(['TTL' => 86_400, 'urgency' => 'normal']);
    }
}

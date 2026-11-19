<?php

namespace Database\Factories;

use App\Enums\DeliveryStatus;
use App\Enums\MessageChannel;
use App\Models\Message;
use App\Models\MessageDelivery;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MessageDelivery>
 */
class MessageDeliveryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'message_id' => Message::factory(),
            'user_id' => User::factory(),
            'recipient' => fn (array $attributes): string => 'user:'.(is_scalar($attributes['user_id']) ? $attributes['user_id'] : ''),
            'channel' => MessageChannel::Email,
            'status' => DeliveryStatus::Queued,
        ];
    }
}

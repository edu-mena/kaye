<?php

namespace Database\Factories;

use App\Enums\MessageChannel;
use App\Enums\MessagePurpose;
use App\Enums\MessageStatus;
use App\Enums\MessageTemplate;
use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'channel' => MessageChannel::Email,
            'purpose' => MessagePurpose::Service,
            'template' => MessageTemplate::Notice,
            'subject' => ['pt' => 'O Kayé abriu', 'en' => 'Kayé is open', 'fr' => 'Kayé est ouvert'],
            'body' => ['pt' => 'Já podes entrar.', 'en' => 'You can sign in now.', 'fr' => 'Tu peux entrer.'],
            'url' => '/',
            'audience' => [],
            'status' => MessageStatus::Draft,
        ];
    }

    public function sending(): static
    {
        return $this->state(['status' => MessageStatus::Sending]);
    }

    public function news(): static
    {
        return $this->state(['purpose' => MessagePurpose::Marketing, 'template' => MessageTemplate::Digest]);
    }

    public function push(): static
    {
        return $this->state(['channel' => MessageChannel::Push]);
    }
}

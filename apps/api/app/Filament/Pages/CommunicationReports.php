<?php

namespace App\Filament\Pages;

use App\Enums\ConsentKind;
use App\Enums\DeliveryStatus;
use App\Enums\MessageChannel;
use App\Enums\StaffPermission;
use App\Filament\Resources\Consents\ConsentResource;
use App\Models\Consent;
use App\Models\Message;
use App\Models\MessageDelivery;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

/**
 * "Relatórios" (Comunicação): what left in the last 30 days by channel and how it went, the consents in force by
 * kind (who can be reached), and the last campaigns with their deliveries. Only counts: no person shows here.
 */
class CommunicationReports extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::ChartBar;

    protected static string|UnitEnum|null $navigationGroup = 'Comunicação';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Relatórios';

    protected static ?string $title = 'Relatórios da comunicação';

    protected string $view = 'filament.pages.communication-reports';

    public const DAYS = 30;

    public static function canAccess(): bool
    {
        return Auth::user()?->can(StaffPermission::MessagesManage->value) ?? false;
    }

    /**
     * Channel => status => deliveries in the last 30 days.
     *
     * @return array<string, array<string, int>>
     */
    public function deliveries(): array
    {
        $rows = MessageDelivery::query()
            ->join('messages', 'messages.id', '=', 'message_deliveries.message_id')
            ->where('message_deliveries.created_at', '>=', now()->subDays(self::DAYS))
            ->groupBy('messages.channel', 'message_deliveries.status')
            ->selectRaw('messages.channel as channel, message_deliveries.status as status, count(*) as total')
            ->toBase()->get();

        $table = [];
        foreach (MessageChannel::cases() as $channel) {
            $table[$channel->value] = array_fill_keys(array_column(DeliveryStatus::cases(), 'value'), 0);
        }
        foreach ($rows as $row) {
            $channel = is_string($row->channel ?? null) ? $row->channel : '';
            $status = is_string($row->status ?? null) ? $row->status : '';
            if (isset($table[$channel][$status])) {
                $table[$channel][$status] = is_numeric($row->total ?? null) ? (int) $row->total : 0;
            }
        }

        return $table;
    }

    /**
     * Kind => [label, consents in force].
     *
     * @return list<array{label: string, active: int}>
     */
    public function consents(): array
    {
        $counts = Consent::query()->active()->groupBy('kind')->selectRaw('kind, count(*) as total')->toBase()->pluck('total', 'kind');

        return array_map(fn (ConsentKind $kind): array => [
            'label' => ConsentResource::KINDS[$kind->value],
            'active' => is_numeric($counts[$kind->value] ?? null) ? (int) $counts[$kind->value] : 0,
        ], ConsentKind::cases());
    }

    /**
     * @return list<array{subject: string, channel: string, status: string, sent: int, failed: int, skipped: int}>
     */
    public function campaigns(): array
    {
        $counts = [];
        foreach (DeliveryStatus::cases() as $status) {
            $counts["deliveries as {$status->value}_count"] = fn (Builder $query): Builder => $query->where('status', $status);
        }

        return array_values(Message::query()->withCount($counts)->latest('id')->limit(10)->get()
            ->map(fn (Message $message): array => [
                'subject' => $message->text('subject', 'pt'),
                'channel' => $message->channel->value,
                'status' => $message->status->value,
                'sent' => self::count($message, 'sent_count'),
                'failed' => self::count($message, 'failed_count'),
                'skipped' => self::count($message, 'skipped_count'),
            ])->all());
    }

    private static function count(Message $message, string $attribute): int
    {
        $value = $message->getAttribute($attribute);

        return is_numeric($value) ? (int) $value : 0;
    }
}

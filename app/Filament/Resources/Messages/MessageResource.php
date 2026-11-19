<?php

namespace App\Filament\Resources\Messages;

use App\Enums\DeliveryStatus;
use App\Enums\MessagePurpose;
use App\Enums\MessageStatus;
use App\Enums\MessageTemplate;
use App\Filament\Resources\Messages\Pages\CreateMessage;
use App\Filament\Resources\Messages\Pages\EditMessage;
use App\Filament\Resources\Messages\Pages\ListMessages;
use App\Models\Message;
use BackedEnum;
use Closure;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Campaigns by email or push (docs/seguranca.md, "Avisos"): write, choose the audience, send in batches, and
 * read the report of the deliveries. The deadline reminders show here too; the scheduler makes them.
 *
 * @extends resource<Message>
 */
class MessageResource extends Resource
{
    protected static ?string $model = Message::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Megaphone;

    protected static ?string $modelLabel = 'mensagem';

    protected static ?string $pluralModelLabel = 'mensagens';

    protected static ?string $navigationLabel = 'Mensagens';

    /** What a person in the panel may choose: the deadline reminders belong to the scheduler. */
    private const TEMPLATES = [
        'notice' => 'Aviso (o texto abaixo)',
        'digest' => 'Novidades da semana (o texto abaixo e as notícias dos últimos 7 dias)',
    ];

    private const LOCALES = ['pt' => 'Português', 'en' => 'Inglês', 'fr' => 'Francês'];

    public static function form(Schema $schema): Schema
    {
        $texts = [];
        foreach (self::LOCALES as $locale => $name) {
            $texts[] = TextInput::make("subject.{$locale}")->label("Assunto ({$name})")->required($locale === 'pt')->maxLength(120);
            $texts[] = Textarea::make("body.{$locale}")->label("Texto ({$name})")->required($locale === 'pt')->rows(5)->maxLength(2000);
        }

        return $schema->components([
            Section::make('Mensagem')->columns(2)->schema([
                Select::make('channel')->label('Canal')->required()->live()
                    ->options(['email' => 'Email', 'push' => 'Push (browser)']),
                Select::make('purpose')->label('Tipo')->required()->live()
                    ->options(['service' => 'Aviso de serviço', 'marketing' => 'Novidades (só maiores de 18)']),
                Select::make('template')->label('Modelo')->required()->options(self::TEMPLATES)
                    ->rule(fn (Get $get): Closure => function (string $attribute, mixed $value, Closure $fail) use ($get): void {
                        if ($value === MessageTemplate::Digest->value && $get('purpose') !== MessagePurpose::Marketing->value) {
                            $fail('As novidades da semana são do tipo "Novidades".');
                        }
                    }),
                TextInput::make('url')->label('Página que abre')->default('/')->maxLength(255)
                    ->regex('#^/\S*$#')->helperText('Um caminho da app, por exemplo /prazos.'),
            ]),
            Section::make('Texto')->columns(2)->schema($texts),
            Section::make('Público')->schema([
                TagsInput::make('audience.provinces')->label('Províncias')->helperText('Vazio: todas.'),
                TagsInput::make('audience.areas')->label('Áreas das Novidades')->helperText('Vazio: todas.'),
                Toggle::make('audience.waitlist')->label('Também a lista de espera (só avisos de serviço por email)')
                    ->visible(fn (Get $get): bool => $get('channel') === 'email' && $get('purpose') === 'service'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        $counts = [];
        foreach (DeliveryStatus::cases() as $status) {
            $counts["deliveries as {$status->value}_count"] = fn (Builder $query) => $query->where('status', $status);
        }

        return $table
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn (Builder $query) => $query->withCount($counts))
            ->columns([
                TextColumn::make('created_at')->label('Data')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('subject.pt')->label('Assunto')->wrap()->limit(60),
                TextColumn::make('channel')->label('Canal')->badge(),
                TextColumn::make('purpose')->label('Tipo')->badge(),
                TextColumn::make('status')->label('Estado')->badge(),
                TextColumn::make('queued_count')->label('Na fila'),
                TextColumn::make('sent_count')->label('Enviadas'),
                TextColumn::make('failed_count')->label('Falharam'),
                TextColumn::make('skipped_count')->label('Sem consentimento'),
            ])
            ->recordActions([
                EditAction::make(),
                Action::make('send')->label('Enviar')->icon(Heroicon::PaperAirplane)
                    ->requiresConfirmation()
                    ->modalDescription('Sai em lotes, dentro do limite por hora, só para quem consentiu neste canal. As novidades nunca chegam a menores.')
                    ->visible(fn (Message $record): bool => $record->status === MessageStatus::Draft)
                    ->action(fn (Message $record): bool => $record->update(['status' => MessageStatus::Sending])),
            ]);
    }

    /** Only a draft changes: what went out stays as it was sent. */
    public static function canEdit(Model $record): bool
    {
        return $record instanceof Message && $record->status === MessageStatus::Draft;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMessages::route('/'),
            'create' => CreateMessage::route('/create'),
            'edit' => EditMessage::route('/{record}/edit'),
        ];
    }
}

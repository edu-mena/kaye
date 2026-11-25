<?php

namespace App\Filament\Pages;

use App\Enums\StaffPermission;
use App\Support\JobMessage;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

/**
 * "Colar vaga" (Moderação): a job ad from a WhatsApp group or a message to the Kayé becomes the facts of a job post
 * for the Mercado counts. Paste the text, check what was read, save. The text is never kept (App\Support\JobMessage).
 *
 * @property-read Schema $form
 */
class PasteJob extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::ClipboardDocumentCheck;

    protected static string|UnitEnum|null $navigationGroup = 'Moderação';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Colar vaga';

    protected static ?string $title = 'Colar uma vaga do WhatsApp';

    protected string $view = 'filament.pages.paste-job';

    /** @var array<string, mixed> */
    public array $data = [];

    public static function canAccess(): bool
    {
        return Auth::user()?->can(StaffPermission::ContentEdit->value) ?? false;
    }

    public function mount(): void
    {
        $this->form->fill(['date' => now('Africa/Luanda')->toDateString()]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema->statePath('data')->components([
            Section::make('A mensagem')
                ->description('Cola o anúncio tal como chegou. Só servem os factos: o texto não fica guardado.')
                ->schema([
                    Textarea::make('message')->label('Mensagem')->rows(8)->maxLength(10000),
                    Actions::make([
                        Action::make('read')->label('Ler a mensagem')->icon(Heroicon::Sparkles)->action(fn () => $this->read()),
                    ]),
                ]),
            Section::make('Os factos')
                ->description('Confirma ou corrige antes de guardar. A ligação é a da vaga ou, se não houver, a da empresa.')
                ->columns(2)
                ->schema([
                    TextInput::make('title')->label('Título')->required()->maxLength(500)->columnSpanFull(),
                    TextInput::make('url')->label('Ligação')->required()->url()->maxLength(2048)->columnSpanFull(),
                    TextInput::make('company')->label('Empresa')->maxLength(255),
                    Select::make('province')->label('Província')->options(fn (): array => array_combine(JobMessage::provinces(), JobMessage::provinces()) ?: [])->searchable(),
                    DatePicker::make('date')->label('Data do anúncio')->required()->maxDate(now()->addDay()),
                    TextInput::make('openings')->label('Vagas')->integer()->minValue(1)->maxValue(65535),
                ]),
        ]);
    }

    /** Suggests the facts from the pasted text; what is already filled stays. */
    public function read(): void
    {
        $message = is_string($this->data['message'] ?? null) ? $this->data['message'] : '';
        foreach (JobMessage::read($message) as $field => $value) {
            if ($value !== null && blank($this->data[$field] ?? null)) {
                $this->data[$field] = $value;
            }
        }
    }

    public function save(): void
    {
        /** @var array{title: string, url: string, date: string, company?: string|null, province?: string|null, openings?: int|string|null} $facts */
        $facts = $this->form->getState();
        $openings = $facts['openings'] ?? null;
        $posting = JobMessage::save([
            'title' => $facts['title'],
            'url' => $facts['url'],
            'date' => $facts['date'],
            'company' => $facts['company'] ?? null,
            'province' => $facts['province'] ?? null,
            'openings' => is_numeric($openings) ? (int) $openings : null,
        ]);

        Notification::make()->title($posting->wasRecentlyCreated ? 'Vaga guardada.' : 'Esta vaga já estava: atualizada.')->success()->send();
        $this->form->fill(['date' => now('Africa/Luanda')->toDateString()]);
    }
}

<?php

namespace App\Filament\Pages;

use App\Enums\Locale;
use App\Enums\StaffPermission;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

/**
 * "Modelos" (Comunicação): every email the Kayé sends, when it goes, the consent it needs and its fixed texts in
 * the three languages (lang/<locale>/notices.php). The texts change in the code, with a test that the three
 * languages have the same keys; a campaign's own text is written in "Campanhas".
 */
class MessageTemplates extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::DocumentDuplicate;

    protected static string|UnitEnum|null $navigationGroup = 'Comunicação';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Modelos';

    protected static ?string $title = 'Modelos de email';

    protected string $view = 'filament.pages.message-templates';

    /**
     * Template => when it goes, the consent, and the keys of its fixed texts.
     */
    public const TEMPLATES = [
        'confirm' => ['Confirmação', 'Quando alguém entra na lista de espera com o email (confirmação dupla).', 'Nenhum: é o pedido de consentimento', ['confirm.subject', 'confirm.intro', 'confirm.action']],
        'welcome' => ['Boas-vindas', 'Depois de confirmar o email da lista de espera.', 'Email: avisos de serviço', ['welcome.subject', 'welcome.heading', 'welcome.intro']],
        'notice' => ['Aviso', 'Uma campanha "Aviso": o texto é o da campanha.', 'Email ou push: avisos de serviço, ou novidades (só maiores)', ['notice.action']],
        'digest' => ['Novidades da semana', 'Uma campanha "Novidades da semana": o texto da campanha e as notícias dos últimos 7 dias.', 'Email ou push: novidades (só maiores)', ['digest.heading', 'digest.empty', 'digest.action']],
        'deadline' => ['Prazo a chegar', 'Sozinho, às 08:00, 3 dias antes de um prazo que a pessoa guardou.', 'Email ou push: avisos de serviço', ['deadline.subject', 'deadline.body', 'deadline.action']],
        'feedback' => ['Resposta a uma crítica', 'Quando a equipa responde em "Críticas e ideias".', 'Email: avisos de serviço', ['feedback.subject', 'feedback.original']],
    ];

    public static function canAccess(): bool
    {
        return Auth::user()?->can(StaffPermission::MessagesManage->value) ?? false;
    }

    /**
     * @return list<array{name: string, when: string, consent: string, texts: array<string, list<string>>}>
     */
    public function templates(): array
    {
        $templates = [];
        foreach (self::TEMPLATES as [$name, $when, $consent, $keys]) {
            $texts = [];
            foreach (Locale::cases() as $locale) {
                $texts[$locale->value] = array_map(function (string $key) use ($locale): string {
                    $text = __("notices.{$key}", [], $locale->value);

                    return is_string($text) ? $text : $key;
                }, $keys);
            }
            $templates[] = ['name' => $name, 'when' => $when, 'consent' => $consent, 'texts' => $texts];
        }

        return $templates;
    }
}

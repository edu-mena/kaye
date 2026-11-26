<?php

namespace App\Filament\Content;

use App\Models\User;
use App\Support\PanelEdits;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Saves a catalogue row from the panel's form (a page or a relation manager): the values ContentForm reads from
 * the form, a language left empty taken out, and the change kept in the row's history (PanelEdits, ADR 0028).
 * Saving clears the public API's cache (the models' FlushesPublicContent).
 */
final class ContentSaver
{
    /**
     * @param  array<string, mixed>  $data  what the form sent
     */
    public static function save(Model $record, array $data): Model
    {
        [$values, $origin] = ContentForm::save($record::class, $data, $record->exists ? $record : null);

        foreach (ContentColumns::of($record::class) as $column) {
            if ($column->kind === Column::TRANSLATABLE && array_key_exists($column->name, $values)) {
                $translations = $values[$column->name];
                unset($values[$column->name]);
                self::translate($record, $column->name, is_array($translations) ? array_filter($translations, 'is_string', ARRAY_FILTER_USE_KEY) : null);
            }
        }
        $record->fill($values);

        $edits = app(PanelEdits::class);
        $before = $edits->before($record);
        $record->save();
        $user = Auth::user();
        if ($user instanceof User) {
            $edits->record($record, $before, $user, $origin);
        }

        return $record;
    }

    /**
     * @param  array<string, mixed>|null  $translations
     */
    private static function translate(Model $record, string $column, ?array $translations): void
    {
        if ($translations === null || $translations === [] || ! method_exists($record, 'setTranslations')) {
            $record->setRawAttributes([...$record->getAttributes(), $column => $translations === null ? null : '[]']);

            return;
        }
        foreach (array_keys(ContentForm::LOCALES) as $locale) {
            if (! array_key_exists($locale, $translations) && method_exists($record, 'forgetTranslation')) {
                $record->forgetTranslation($column, $locale);
            }
        }
        $record->setTranslations($column, $translations);
    }
}

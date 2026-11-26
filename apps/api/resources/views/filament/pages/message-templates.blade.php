<x-filament-panels::page>
    <p class="kaye-muted">
        Os textos fixos de cada email, nas três línguas. Mudam no código (lang/&lt;língua&gt;/notices.php), com um teste
        que obriga as três línguas a terem os mesmos textos. O texto de uma campanha escreve-se em "Campanhas".
    </p>

    @foreach ($this->templates() as $template)
        <x-filament::section :heading="$template['name']" :description="$template['when']">
            <p class="text-sm"><strong>Consentimento:</strong> {{ $template['consent'] }}</p>
            <div class="mt-3 overflow-x-auto">
                <table class="kaye-table">
                    <thead>
                        <tr>
                            <th>Português</th>
                            <th>English</th>
                            <th>Français</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach (array_keys($template['texts']['pt']) as $index)
                            <tr>
                                @foreach (['pt', 'en', 'fr'] as $locale)
                                    <td>{{ $template['texts'][$locale][$index] }}</td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </x-filament::section>
    @endforeach
</x-filament-panels::page>

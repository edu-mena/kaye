<x-filament-panels::page>
    <p class="kaye-muted">
        Um valor gravado aqui vale em vez do .env do servidor, cifrado com a APP_KEY. As chaves nunca voltam a
        aparecer depois de gravadas: só se vê de onde vem cada valor, quem o mudou e quando. "Voltar ao .env" apaga o
        valor do painel.
    </p>

    <x-filament::section>
        <div class="overflow-x-auto">
            <table class="kaye-table">
                <thead>
                    <tr>
                        <th>Definição</th>
                        <th>Valor</th>
                        <th>De onde vem</th>
                        <th>Mudada</th>
                        <th><span class="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($this->settings() as $setting)
                        <tr>
                            <td>
                                <span class="font-semibold">{{ $setting['label'] }}</span>
                                <span class="kaye-muted block">{{ $setting['help'] }} <code>{{ $setting['env'] }}</code></span>
                            </td>
                            <td>
                                @if ($setting['kind'] === \App\Support\Settings::SECRET)
                                    {{ $setting['source'] === 'vazio' ? 'Sem chave' : 'Definida (escondida)' }}
                                @else
                                    <span class="tabular-nums">{{ $setting['value'] ?? '—' }}</span>
                                @endif
                            </td>
                            <td>
                                <x-filament::badge :color="match ($setting['source']) { 'painel' => 'success', '.env' => 'gray', default => 'warning' }">
                                    {{ $setting['source'] === 'painel' ? 'Painel' : ($setting['source'] === '.env' ? '.env' : 'Vazio') }}
                                </x-filament::badge>
                            </td>
                            <td class="kaye-muted">
                                @if ($setting['updated_at'] !== null)
                                    {{ $setting['updated_at']->timezone('Africa/Luanda')->format('d/m/Y H:i') }} · {{ $setting['updated_by'] ?? '—' }}
                                @else
                                    —
                                @endif
                            </td>
                            <td class="whitespace-nowrap">
                                {{ ($this->changeAction)(['key' => $setting['key']]) }}
                                @if ($setting['source'] === 'painel')
                                    {{ ($this->forgetAction)(['key' => $setting['key']]) }}
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </x-filament::section>

</x-filament-panels::page>

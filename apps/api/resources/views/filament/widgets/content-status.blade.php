{{-- "Registos por estado" (App\Filament\Widgets\ContentStatus). A dash: the table has no such column. --}}
<x-filament-widgets::widget>
    <x-filament::section heading="Registos por estado" description="Quantos registos de cada tabela do catálogo estão em rascunho, em revisão ou publicados. Conta de 5 em 5 minutos.">
        <div class="overflow-x-auto">
            <table class="kaye-table">
                <thead>
                    <tr>
                        <th>Tabela</th>
                        <th class="kaye-num">Total</th>
                        <th class="kaye-num">Rascunho</th>
                        <th class="kaye-num">Em revisão</th>
                        <th class="kaye-num">Publicados</th>
                        <th class="kaye-num">Estimados</th>
                        <th class="kaye-num">Sem fonte</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($this->rows() as $row)
                        <tr>
                            <td><x-filament::link :href="$row['url']">{{ $row['label'] }}</x-filament::link></td>
                            <td class="kaye-num">{{ $row['total'] }}</td>
                            @foreach (['draft', 'review', 'published', 'estimated', 'without_source'] as $key)
                                <td class="kaye-num">{{ $row[$key] ?? '—' }}</td>
                            @endforeach
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>

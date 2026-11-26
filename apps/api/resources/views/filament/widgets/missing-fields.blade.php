{{-- "Campos em falta" (App\Filament\Widgets\MissingFields). --}}
<x-filament-widgets::widget>
    <x-filament::section heading="Campos em falta por área" description="As carreiras de cada área do catálogo a que falta o guia, o salário ou a fotografia.">
        <div class="overflow-x-auto">
            <table class="kaye-table">
                <thead>
                    <tr>
                        <th>Área</th>
                        <th class="kaye-num">Carreiras</th>
                        <th class="kaye-num">Publicadas</th>
                        <th class="kaye-num">Sem guia</th>
                        <th class="kaye-num">Sem salário</th>
                        <th class="kaye-num">Sem fotografia</th>
                        <th class="kaye-num">Estimadas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($this->byArea() as $row)
                        <tr>
                            <td>{{ $row['area'] }}</td>
                            @foreach (['total', 'published', 'guide', 'salary', 'image', 'estimated'] as $key)
                                <td class="kaye-num">{{ $row[$key] }}</td>
                            @endforeach
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </x-filament::section>

    <x-filament::section heading="Campos importantes em falta" description="Nos tipos que a IA ajuda a completar: quantos registos não têm cada campo. Pede-os em &quot;Pesquisar com IA&quot;." class="mt-6">
        <div class="overflow-x-auto">
            <table class="kaye-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th class="kaye-num">Registos</th>
                        <th>Em falta</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($this->byType() as $row)
                        <tr>
                            <td>{{ $row['type'] }}</td>
                            <td class="kaye-num">{{ $row['total'] }}</td>
                            <td>
                                @foreach ($row['missing'] as $field => $count)
                                    <span class="me-3 whitespace-nowrap">{{ $field }}: <strong class="tabular-nums">{{ $count }}</strong></span>
                                @endforeach
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>

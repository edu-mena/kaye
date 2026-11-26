<x-filament-panels::page>
    @php
        $states = ['queued' => 'Na fila', 'sent' => 'Enviadas', 'failed' => 'Falharam', 'skipped' => 'Sem consentimento'];
        $channels = ['email' => 'Email', 'push' => 'Push'];
    @endphp

    <x-filament::section heading="Entregas nos últimos {{ \App\Filament\Pages\CommunicationReports::DAYS }} dias" description="Por canal. &quot;Sem consentimento&quot;: a pessoa retirou-o entre o envio e a entrega.">
        <table class="kaye-table">
            <thead>
                <tr>
                    <th>Canal</th>
                    @foreach ($states as $label)
                        <th class="kaye-num">{{ $label }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($this->deliveries() as $channel => $counts)
                    <tr>
                        <td>{{ $channels[$channel] ?? $channel }}</td>
                        @foreach (array_keys($states) as $status)
                            <td class="kaye-num">{{ $counts[$status] ?? 0 }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    </x-filament::section>

    <x-filament::section heading="Consentimentos em vigor" description="Quantas pessoas se podem contactar por cada canal. As novidades nunca chegam a menores.">
        <table class="kaye-table">
            <tbody>
                @foreach ($this->consents() as $row)
                    <tr>
                        <td>{{ $row['label'] }}</td>
                        <td class="kaye-num">{{ $row['active'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </x-filament::section>

    <x-filament::section heading="Últimas campanhas">
        <table class="kaye-table">
            <thead>
                <tr>
                    <th>Assunto</th>
                    <th>Canal</th>
                    <th>Estado</th>
                    <th class="kaye-num">Enviadas</th>
                    <th class="kaye-num">Falharam</th>
                    <th class="kaye-num">Sem consentimento</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($this->campaigns() as $row)
                    <tr>
                        <td>{{ $row['subject'] }}</td>
                        <td>{{ $channels[$row['channel']] ?? $row['channel'] }}</td>
                        <td>{{ $row['status'] }}</td>
                        <td class="kaye-num">{{ $row['sent'] }}</td>
                        <td class="kaye-num">{{ $row['failed'] }}</td>
                        <td class="kaye-num">{{ $row['skipped'] }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6">Ainda não houve campanhas.</td></tr>
                @endforelse
            </tbody>
        </table>
    </x-filament::section>
</x-filament-panels::page>

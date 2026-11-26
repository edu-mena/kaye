{{-- "Saúde" (App\Filament\Widgets\SystemStatus): the state in words and a dot, never only a colour. --}}
<x-filament-widgets::widget>
    <x-filament::section heading="Saúde" description="As mesmas verificações de /api/v1/health. O detalhe dos pedidos lentos está no Pulse.">
        <x-slot name="afterHeader">
            <x-filament::link href="{{ url('/admin/pulse') }}">Abrir o Pulse</x-filament::link>
        </x-slot>
        <table class="kaye-table">
            <tbody>
                @foreach ($this->checks() as $check)
                    <tr>
                        <td>{{ $check['name'] }}</td>
                        <td>
                            <x-filament::badge :color="$check['ok'] ? 'success' : 'danger'">{{ $check['ok'] ? 'Bem' : 'Atenção' }}</x-filament::badge>
                        </td>
                        <td>{{ $check['detail'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </x-filament::section>
</x-filament-widgets::widget>

<x-filament-panels::page>
    <form wire:submit="save" class="grid gap-6">
        {{ $this->form }}

        <div>
            <x-filament::button type="submit" icon="heroicon-m-check">Guardar a vaga</x-filament::button>
        </div>
    </form>
</x-filament-panels::page>

{{-- A proposal side by side (RevisionResource::diff). The values come escaped from App\Support\TextDiff: only its
     <del> and <ins> marks are HTML. --}}
<table class="kaye-diff">
    <thead>
        <tr>
            <th class="w-40">Campo</th>
            <th>Antes</th>
            <th>Depois</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($fields as $field)
            <tr>
                <th>{{ $field['label'] }}</th>
                <td>@if ($field['before'] === '')<span class="kaye-muted">(vazio)</span>@else{!! $field['before'] !!}@endif</td>
                <td>@if ($field['after'] === '')<span class="kaye-muted">(vazio)</span>@else{!! $field['after'] !!}@endif</td>
            </tr>
        @endforeach
    </tbody>
</table>

<dl class="mt-4 grid gap-1 text-sm">
    <div><dt class="inline font-semibold">Fonte:</dt> <dd class="inline break-all"><x-filament::link :href="$revision->source_url" target="_blank" rel="noopener noreferrer">{{ $revision->source_url }}</x-filament::link></dd></div>
    <div><dt class="inline font-semibold">De:</dt> <dd class="inline">{{ $author }} · {{ $states[$revision->status->value] ?? $revision->status->value }}</dd></div>
    @if ($revision->note !== null)
        <div><dt class="inline font-semibold">Nota:</dt> <dd class="inline">{{ $revision->note }}</dd></div>
    @endif
    @if ($revision->rejection_reason !== null)
        <div><dt class="inline font-semibold">Motivo da rejeição:</dt> <dd class="inline">{{ $revision->rejection_reason }}</dd></div>
    @endif
</dl>

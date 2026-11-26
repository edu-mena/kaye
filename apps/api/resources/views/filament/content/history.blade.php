{{-- The history of one catalogue row (EditContent): proposals of the AI and the changes saved in the panel. --}}
@php
    $states = ['pending' => 'À espera', 'approved' => 'Aprovada', 'rejected' => 'Rejeitada', 'edited' => 'Editado no painel'];
@endphp
@if ($revisions->isEmpty())
    <p class="kaye-muted">Ainda não há alterações registadas: o registo está como veio da importação.</p>
@else
    <table class="kaye-table">
        <thead>
            <tr>
                <th>Data</th>
                <th>Quem</th>
                <th>O quê</th>
                <th>Campos</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($revisions as $revision)
                <tr>
                    <td>{{ $revision->created_at->timezone('Africa/Luanda')->format('d/m/Y H:i') }}</td>
                    <td>{{ $revision->ai_task_id !== null ? 'IA (pesquisa #'.$revision->ai_task_id.')' : ($revision->author->name ?? 'IA (MCP)') }}</td>
                    <td>{{ $states[$revision->status->value] ?? $revision->status->value }}</td>
                    <td>{{ implode(', ', array_keys($revision->changes)) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endif

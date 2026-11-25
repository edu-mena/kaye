<x-filament-panels::page>
    <p>
        Liga o teu Claude (Claude Code ou Claude Desktop) ao catálogo do Kayé em <code>{{ url('/mcp') }}</code>.
        A IA pesquisa e propõe; nada é publicado sem uma pessoa aprovar em "Propostas a rever". Passos em <code>docs/ia.md</code>.
    </p>

    <table style="width:100%;font-size:14px">
        <thead>
            <tr>
                <th style="text-align:left">Nome</th>
                <th style="text-align:left">Criado</th>
                <th style="text-align:left">Expira</th>
                <th style="text-align:left">Último uso</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            @forelse ($this->tokens() as $token)
                <tr>
                    <td>{{ $token->name }}</td>
                    <td>{{ $token->created_at?->format('d/m/Y') }}</td>
                    <td>{{ $token->expires_at?->format('d/m/Y') }}</td>
                    <td>{{ $token->last_used_at?->format('d/m/Y H:i') ?? 'nunca' }}</td>
                    <td><x-filament::button color="danger" size="sm" wire:click="revoke({{ $token->id }})">Revogar</x-filament::button></td>
                </tr>
            @empty
                <tr><td colspan="5">Ainda não há tokens.</td></tr>
            @endforelse
        </tbody>
    </table>
</x-filament-panels::page>

<x-filament-panels::page>
    <p class="kaye-muted">
        Liga o teu Claude (Claude Code ou Claude Desktop) ao catálogo do Kayé em <code>{{ url('/mcp') }}</code>.
        A IA pesquisa e propõe; nada é publicado sem uma pessoa aprovar na "Caixa da IA". Passos em <code>docs/ia.md</code>.
        Um token só serve para o MCP, expira e aparece uma única vez.
    </p>

    <x-filament::section heading="Os teus tokens">
        <table class="kaye-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Criado</th>
                    <th>Expira</th>
                    <th>Último uso</th>
                    <th><span class="sr-only">Ações</span></th>
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
    </x-filament::section>
</x-filament-panels::page>

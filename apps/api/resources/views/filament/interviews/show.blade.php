{{-- One interview (InterviewResource, "Abrir"). Opening it is recorded in the audit log. --}}
@php
    $candidate = $interview->candidate;
@endphp
<div class="grid gap-6">
    <x-filament::section heading="Quem respondeu" :description="$minor ? 'Menor: contacta só com o encarregado a saber.' : null">
        <dl class="grid gap-1 text-sm">
            <div><dt class="inline font-semibold">Nome:</dt> <dd class="inline">{{ $candidate['name'] ?? '—' }}</dd></div>
            <div><dt class="inline font-semibold">Contacto:</dt> <dd class="inline">{{ $candidate['contact'] ?? '—' }}</dd></div>
            <div><dt class="inline font-semibold">Província:</dt> <dd class="inline">{{ $candidate['province'] ?? '—' }}</dd></div>
            @if ($minor)
                <div><dt class="inline font-semibold">Encarregado informado:</dt> <dd class="inline">{{ ($candidate['guardianInformed'] ?? false) ? 'Sim' : 'Não' }}</dd></div>
            @endif
            <div><dt class="inline font-semibold">Profissão:</dt> <dd class="inline">{{ $interview->career_name ?? '—' }} ({{ $interview->area }})</dd></div>
        </dl>
    </x-filament::section>

    <x-filament::section heading="Respostas">
        <ol class="grid gap-4">
            @foreach ($interview->answers as $answer)
                <li>
                    <p class="font-semibold">{{ $answer['question'] ?? '' }}</p>
                    <p class="mt-1 whitespace-pre-wrap">{{ $answer['answer'] ?? '' }}</p>
                    <p class="kaye-muted mt-1">{{ $answer['seconds'] ?? 0 }} s{{ ($answer['dictated'] ?? false) ? ' · ditada' : '' }}</p>
                </li>
            @endforeach
        </ol>
    </x-filament::section>
</div>

{{-- The end of every Kayé email: who sends it and the signed link to stop receiving it. --}}
{{ __('notices.signature', [], $locale) }}

<x-mail::subcopy>
{{ __('notices.why', [], $locale) }} [{{ __('notices.unsubscribe', [], $locale) }}]({{ $unsubscribeUrl }})
</x-mail::subcopy>

<x-mail::message>
{{ $body }}

<x-mail::button :url="$url">
{{ __('notices.notice.action', [], $locale) }}
</x-mail::button>

@include('mail.footer')
</x-mail::message>

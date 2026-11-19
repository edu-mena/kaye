<x-mail::message>
# {{ __('notices.deadline.heading', [], $locale) }}

{{ $body }}

<x-mail::button :url="$url">
{{ __('notices.deadline.action', [], $locale) }}
</x-mail::button>

@include('mail.footer')
</x-mail::message>

<x-mail::message>
# {{ __('notices.greeting', [], $locale) }}

{{ __('notices.feedback.original', [], $locale) }}

<x-mail::panel>
{{ $original }}
</x-mail::panel>

{{ $reply }}

@include('mail.footer')
</x-mail::message>

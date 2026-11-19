<x-mail::message>
# {{ __('notices.welcome.heading', [], $locale) }}

{{ __('notices.welcome.intro', [], $locale) }}

<x-mail::button :url="$siteUrl">
{{ __('notices.welcome.action', [], $locale) }}
</x-mail::button>

@include('mail.footer')
</x-mail::message>

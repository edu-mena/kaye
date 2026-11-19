<x-mail::message>
# {{ $name !== '' ? __('notices.greeting_name', ['name' => $name], $locale) : __('notices.greeting', [], $locale) }}

{{ __('notices.confirm.intro', [], $locale) }}

<x-mail::button :url="$confirmUrl">
{{ __('notices.confirm.action', [], $locale) }}
</x-mail::button>

{{ __('notices.confirm.ignore', [], $locale) }}

@include('mail.footer')
</x-mail::message>

<x-mail::message>
# {{ __('notices.digest.heading', [], $locale) }}

{{ $body }}

@forelse ($news as $item)
**{{ $item['title'] }}**<br>
{{ $item['summary'] }}

@empty
{{ __('notices.digest.empty', [], $locale) }}

@endforelse
<x-mail::button :url="$url">
{{ __('notices.digest.action', [], $locale) }}
</x-mail::button>

@include('mail.footer')
</x-mail::message>

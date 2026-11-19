<!doctype html>
<html lang="{{ $locale }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ __("notices.pages.{$state}_title", [], $locale) }} · Kayé</title>
    {{-- A file of our own, not inline: the app's CSP allows no inline style. --}}
    <link rel="stylesheet" href="{{ asset('notices.css') }}">
</head>
<body>
    <main>
        <p class="brand">Kayé</p>
        <h1>{{ __("notices.pages.{$state}_title", [], $locale) }}</h1>
        <p>{{ __("notices.pages.{$state}_body", [], $locale) }}</p>
        <a href="{{ url('/') }}">{{ __('notices.pages.site', [], $locale) }}</a>
    </main>
</body>
</html>

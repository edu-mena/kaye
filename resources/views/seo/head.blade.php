{{-- The <head> of one page (App\Support\Seo\SeoDocument). docs/seo.md --}}
    <title>{{ str_starts_with($page['title'], 'Kayé') ? $page['title'] : $page['title'].' | Kayé' }}</title>
    <meta name="description" content="{{ $page['description'] }}" />
    <meta name="robots" content="{{ $page['index'] ? 'index, follow, max-image-preview:large' : 'noindex, follow' }}" />
@if ($page['index'])
    <link rel="canonical" href="{{ $url }}" />
@endif
    <meta property="og:type" content="{{ $page['type'] }}" />
    <meta property="og:site_name" content="Kayé" />
    <meta property="og:locale" content="pt_AO" />
    <meta property="og:url" content="{{ $url }}" />
    <meta property="og:title" content="{{ $page['title'] }}" />
    <meta property="og:description" content="{{ $page['description'] }}" />
    <meta property="og:image" content="{{ $image }}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $page['title'] }}" />
    <meta name="twitter:description" content="{{ $page['description'] }}" />
    <meta name="twitter:image" content="{{ $image }}" />
@foreach ($jsonLd as $json)
    <script type="application/ld+json">{!! $json !!}</script>
@endforeach

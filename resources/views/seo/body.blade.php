{{-- The page's content as plain HTML, for search engines and link previews; React replaces it (docs/seo.md). --}}
<main class="mx-auto w-full max-w-3xl px-4 py-8">
@if ($page['breadcrumbs'] !== [])
  <nav aria-label="Navegação estrutural" class="text-sm text-muted">
    <a href="/">Início</a>@foreach ($page['breadcrumbs'] as $crumb) › <a href="{{ $crumb['href'] }}">{{ $crumb['label'] }}</a>@endforeach
  </nav>
@endif
  <h1 class="mt-4 text-2xl font-semibold">{{ $page['h1'] }}</h1>
@if ($page['lead'])
  <p class="mt-3">{{ $page['lead'] }}</p>
@endif
@if ($page['facts'] !== [])
  <dl class="mt-4">
@foreach ($page['facts'] as $fact)
    <dt class="font-semibold">{{ $fact['label'] }}</dt>
    <dd>{{ $fact['value'] }}</dd>
@endforeach
  </dl>
@endif
@foreach ($page['sections'] as $section)
  <section class="mt-6">
    <h2 class="text-lg font-semibold">{{ $section['heading'] }}</h2>
@if (($section['text'] ?? '') !== '')
    <p class="mt-2">{{ $section['text'] }}</p>
@endif
@if (($section['items'] ?? []) !== [])
    <ul class="mt-2">
@foreach ($section['items'] as $item)
      <li>@if (isset($item['href']))<a href="{{ $item['href'] }}"@if (str_starts_with($item['href'], 'http')) rel="nofollow noopener"@endif>{{ $item['label'] }}</a>@else{{ $item['label'] }}@endif @if (($item['note'] ?? '') !== '')<span class="text-muted">· {{ $item['note'] }}</span>@endif</li>
@endforeach
    </ul>
@endif
  </section>
@endforeach
  <footer class="mt-10 text-sm">
    <nav aria-label="Kayé">
      <a href="/carreiras">Carreiras</a> · <a href="/cursos">Cursos</a> · <a href="/academias">Onde estudar</a> · <a href="/empresas">Empresas</a> · <a href="/bolsas">Bolsas</a> · <a href="/estagios">Estágios</a> · <a href="/mercado">Mercado de trabalho</a> · <a href="/novidades">Notícias</a> · <a href="/kursos">Kursos</a>
    </nav>
    <p class="mt-2">Segue o Kayé: @foreach ($socials as $network => $link)<a href="{{ $link }}" rel="me noopener">{{ $network }}</a>@if (! $loop->last) · @endif @endforeach</p>
  </footer>
</main>

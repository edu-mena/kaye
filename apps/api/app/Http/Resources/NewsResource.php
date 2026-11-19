<?php

namespace App\Http\Resources;

use App\Models\News;
use App\Models\NewsEvent;
use Illuminate\Http\Request;

/**
 * A piece of Novidades (`NewsItem`). Loaded: `careers`, `companies` and `event`.
 *
 * @extends ContentResource<News>
 */
class NewsResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $careers = $this->slugs('careers');
        $companies = $this->slugs('companies');
        $event = $this->resource->getRelationValue('event');

        return self::shape([
            'id' => $this->resource->slug,
            'date' => $this->date('date'),
            'kind' => $this->value('kind'),
            'title' => $this->value('title'),
            'summary' => $this->value('summary'),
        ], [
            'body' => $this->value('body'),
            'image' => $this->value('image'),
            'to' => $this->value('to'),
            'source' => $this->value('source'),
            'example' => $this->flag('example'),
            'careers' => $careers === [] ? null : $careers,
            'companies' => $companies === [] ? null : $companies,
            'event' => $event instanceof NewsEvent ? self::event($event) : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private static function event(NewsEvent $event): array
    {
        return self::shape([
            'starts' => $event->starts_on->toDateString(),
            'venue' => $event->getAttribute('venue'),
            'city' => $event->getAttribute('city'),
            'formats' => $event->getAttribute('formats'),
            'free' => $event->getAttribute('free'),
        ], [
            'ends' => $event->ends_on?->toDateString(),
            'time' => $event->getAttribute('time'),
            'price' => $event->getAttribute('price'),
            'organizer' => $event->getAttribute('organizer'),
            'register' => $event->getAttribute('register'),
            'unconfirmed' => $event->getAttribute('unconfirmed') === true ? true : null,
        ]);
    }
}

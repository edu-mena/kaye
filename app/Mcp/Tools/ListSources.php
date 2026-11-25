<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_sources')]
#[Description('The sources the catalogue already uses for a type (or one row), the most used first: official pages to start from.')]
#[IsReadOnly]
class ListSources extends ContentTool
{
    public function __construct(private readonly ContentEditor $editor) {}

    public function handle(Request $request): Response
    {
        $slug = $this->string($request, 'slug');

        return $this->answer(fn (): array => $this->editor->sources($this->string($request, 'type'), $slug === '' ? null : $slug));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $this->type($schema),
            'slug' => $schema->string()->description('Optional: only this row\'s sources.'),
        ];
    }
}

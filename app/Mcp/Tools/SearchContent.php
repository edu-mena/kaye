<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search_content')]
#[Description('Search the catalogue by slug or name (drafts included). Returns up to 20 rows: slug, name, status and whether the values are estimated.')]
#[IsReadOnly]
class SearchContent extends ContentTool
{
    public function __construct(private readonly ContentEditor $editor) {}

    public function handle(Request $request): Response
    {
        return $this->answer(fn (): array => $this->editor->search($this->string($request, 'type'), $this->string($request, 'text')));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $this->type($schema),
            'text' => $schema->string()->description('Part of the slug or the name. Empty: the first rows.'),
        ];
    }
}

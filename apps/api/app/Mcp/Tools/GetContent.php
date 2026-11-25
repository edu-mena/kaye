<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_content')]
#[Description('Read one row: every field that can be changed, its sources and the proposals still waiting for review.')]
#[IsReadOnly]
class GetContent extends ContentTool
{
    public function __construct(private readonly ContentEditor $editor) {}

    public function handle(Request $request): Response
    {
        return $this->answer(fn (): array => $this->editor->get($this->string($request, 'type'), $this->string($request, 'slug')));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $this->type($schema),
            'slug' => $schema->string()->required()->description('The row\'s slug (from search_content).'),
        ];
    }
}

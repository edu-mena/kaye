<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_missing')]
#[Description('The rows with an important field empty, or marked as estimated: where research helps most. Up to 50.')]
#[IsReadOnly]
class ListMissing extends ContentTool
{
    public function __construct(private readonly ContentEditor $editor) {}

    public function handle(Request $request): Response
    {
        $limit = $request->get('limit');

        return $this->answer(fn (): array => $this->editor->missing($this->string($request, 'type'), is_int($limit) ? max(1, min(50, $limit)) : 50));
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $this->type($schema),
            'limit' => $schema->integer()->description('How many rows, 1 to 50 (default 50).'),
        ];
    }
}

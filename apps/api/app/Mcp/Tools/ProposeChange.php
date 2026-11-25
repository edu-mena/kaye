<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use App\Support\JsonValue;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('propose_change')]
#[Description('Propose new values for a row, or a new row (leave slug empty and put the new slug in changes.slug). Nothing is published: a person reviews each proposal. source_url is required, and must be the public page where every value can be checked. Never invent a phone, a salary or the name of a person; leave unknown fields out. Translated fields take {"pt": "...", "en": "...", "fr": "..."} (pt required).')]
class ProposeChange extends ContentTool
{
    public function __construct(private readonly ContentEditor $editor) {}

    public function handle(Request $request): Response
    {
        $changes = $request->get('changes');
        $slug = $this->string($request, 'slug');
        $note = $this->string($request, 'note');

        return $this->answer(function () use ($request, $changes, $slug, $note): array {
            $revision = $this->editor->propose(
                $this->string($request, 'type'),
                $slug === '' ? null : $slug,
                JsonValue::map($changes),
                $this->string($request, 'source_url'),
                $note === '' ? null : $note,
                $this->author($request),
            );

            return ['revision' => $revision->id, 'status' => $revision->status->value, 'fields' => array_keys($revision->changes), 'message' => 'Waiting for review in the panel.'];
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $this->type($schema),
            'slug' => $schema->string()->description('The row to change. Empty: a new row.'),
            'changes' => $schema->object()->required()->description('Field => new value. Only the fields that change (get_content lists them).'),
            'source_url' => $schema->string()->required()->description('The public page (official site, Facebook page, LinkedIn, the press) with these values.'),
            'note' => $schema->string()->description('For the reviewer: what you checked, and anything uncertain.'),
        ];
    }
}

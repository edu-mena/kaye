<?php

namespace App\Mcp\Tools;

use App\Support\ContentEditor;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;

#[Name('attach_image')]
#[Description('Propose an image (logo or banner) for a row from its URL. The server downloads it now and checks it (https only, JPEG, PNG or WebP, up to 3 MB); it is published only when a person approves. origin_url is the page that shows the image with its owner or licence.')]
class AttachImage extends ContentTool
{
    public function __construct(private readonly ContentEditor $editor) {}

    public function handle(Request $request): Response
    {
        $note = $this->string($request, 'note');

        return $this->answer(function () use ($request, $note): array {
            $revision = $this->editor->proposeImage(
                $this->string($request, 'type'),
                $this->string($request, 'slug'),
                $this->string($request, 'field'),
                $this->string($request, 'image_url'),
                $this->string($request, 'origin_url'),
                $note === '' ? null : $note,
                $this->author($request),
            );

            return ['revision' => $revision->id, 'status' => $revision->status->value, 'message' => 'Image kept privately until a person approves it.'];
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $this->type($schema),
            'slug' => $schema->string()->required(),
            'field' => $schema->string()->required()->description('logo or banner.'),
            'image_url' => $schema->string()->required()->description('The https address of the image file itself.'),
            'origin_url' => $schema->string()->required()->description('The page where the image is published.'),
            'note' => $schema->string(),
        ];
    }
}

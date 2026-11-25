<?php

namespace App\Mcp\Tools;

use App\Models\User;
use App\Support\ContentTypes;
use App\Support\InvalidProposal;
use Closure;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

/**
 * What every Kayé tool shares: the catalogue type argument and the answer to a refused request, a plain
 * sentence the AI can act on (never a stack trace).
 */
abstract class ContentTool extends Tool
{
    protected function type(JsonSchema $schema): Type
    {
        return $schema->string()->enum(ContentTypes::keys())->required()
            ->description('The catalogue type: '.implode(', ', ContentTypes::keys()).'.');
    }

    /**
     * @param  Closure(): mixed  $work
     */
    protected function answer(Closure $work): Response
    {
        try {
            return Response::json($work());
        } catch (InvalidProposal $refused) {
            return Response::error($refused->getMessage());
        }
    }

    protected function string(Request $request, string $key): string
    {
        $value = $request->get($key);

        return is_string($value) ? trim($value) : '';
    }

    protected function author(Request $request): ?User
    {
        $user = $request->user();

        return $user instanceof User ? $user : null;
    }
}

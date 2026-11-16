<?php

namespace App\Http\Resources;

use App\Models\AccessExamQuestion;
use Illuminate\Http\Request;

/**
 * A question of the access exam practice bank.
 *
 * @extends ContentResource<AccessExamQuestion>
 */
class AccessExamQuestionResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'subject' => $this->value('subject'),
            'topic' => $this->value('topic'),
            'level' => $this->value('level'),
            'text' => $this->value('text'),
            'options' => $this->value('options'),
            'answer' => $this->value('answer'),
            'explanation' => $this->value('explanation'),
        ], [
            'passage' => $this->value('passage'),
        ]);
    }
}

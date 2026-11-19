<?php

namespace App\Http\Resources;

use App\Models\KursoExamQuestion;
use Illuminate\Http\Request;

/**
 * A question of a Kurso's exam (`ExamQuestion`). Loaded: `unit`.
 *
 * @extends ContentResource<KursoExamQuestion>
 */
class KursoExamQuestionResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'unit' => $this->slugOf('unit'),
            'kind' => $this->value('kind'),
            'prompt' => $this->value('prompt'),
        ], [
            'options' => $this->value('options'),
            'answer' => $this->value('answer'),
            'answers' => $this->value('answers'),
        ]);
    }
}

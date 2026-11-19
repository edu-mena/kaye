<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CompanyResource;
use App\Models\Company;
use App\Support\Catalog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /companies and /companies/{slug}.
 */
class CompanyController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => CompanyResource::collection(self::companies()->get()));
    }

    public function show(Request $request, string $slug): Response
    {
        return $this->content->respond($request, function () use ($slug): ?CompanyResource {
            $company = self::companies()->where('slug', $slug)->first();

            return $company === null ? null : new CompanyResource($company);
        });
    }

    /**
     * @return Builder<Company>
     */
    private static function companies(): Builder
    {
        return self::published(Company::class)->with([...Catalog::links(), ...Catalog::links('partners', 'institutions')]);
    }
}

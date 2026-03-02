<?php

declare(strict_types=1);

namespace App\Traits;

use App\Services\ModelListService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Trait to add filterable listing capabilities to controllers
 *
 * @example
 * class UsersApiController extends Controller
 * {
 *     use HasFilterableList;
 *
 *     public function index(Request $request)
 *     {
 *         return $this->listResource(
 *             User::class,
 *             UserResource::class,
 *             [
 *                 'searchable' => ['name', 'email'],
 *                 'filterable' => ['account_type', 'document'],
 *             ]
 *         );
 *     }
 * }
 */
trait HasFilterableList
{
    /**
     * List resource with filters, search, sorting, and pagination
     *
     * @param string $modelClass The model class to query
     * @param string $resourceClass The resource class to transform results
     * @param array $config Configuration options (see ModelListService for details)
     *
     * @return AnonymousResourceCollection
     */
    protected function listResource(
        string $modelClass,
        string $resourceClass,
        array $config = []
    ): AnonymousResourceCollection {
        $service = new ModelListService(request());
        $results = $service->list($modelClass, $config);

        return $resourceClass::collection($results);
    }

    /**
     * Get the model list service instance
     *
     * Useful when you need more control over the query
     *
     * @return ModelListService
     */
    protected function getListService(): ModelListService
    {
        return new ModelListService(request());
    }
}

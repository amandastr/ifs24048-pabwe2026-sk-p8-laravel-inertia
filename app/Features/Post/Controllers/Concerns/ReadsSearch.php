<?php

namespace App\Features\Post\Controllers\Concerns;

use Illuminate\Http\Request;

trait ReadsSearch
{
    protected function searchTerm(Request $request): ?string
    {
        $term = $request->query('search');
        $term = is_string($term) ? trim($term) : '';

        return $term !== '' ? $term : null;
    }
}

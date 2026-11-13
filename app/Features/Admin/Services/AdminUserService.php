<?php

namespace App\Features\Admin\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class AdminUserService
{
    public function paginateUsers(?string $search, int $perPage = 10): LengthAwarePaginator
    {
        return User::query()
            ->withCount('posts')
            ->when($search, function (Builder $query, string $term): void {
                $like = '%'.mb_strtolower($term).'%';
                $query->where(
                    fn (Builder $w) => $w->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(username) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                );
            })
            ->orderBy('name')
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();
    }
}

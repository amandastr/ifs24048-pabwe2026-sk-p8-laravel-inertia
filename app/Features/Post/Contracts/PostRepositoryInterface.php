<?php

namespace App\Features\Post\Contracts;

use App\Features\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PostRepositoryInterface
{
    public function paginatePublic(?string $search, ?string $category, int $perPage = 9): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): ?Post;

    public function paginateForUser(int $userId, ?string $search, int $perPage = 10): LengthAwarePaginator;

    public function paginateAll(?string $search, int $perPage = 10): LengthAwarePaginator;

    public function allForUser(int $userId): Collection;

    public function all(): Collection;

    /** @return array{total: int, published: int, draft: int} */
    public function statsForUser(int $userId): array;

    public function create(array $data): Post;

    public function update(Post $post, array $data): Post;

    public function delete(Post $post): void;

    public function slugExists(string $slug): bool;
}

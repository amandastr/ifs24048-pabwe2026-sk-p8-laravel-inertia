<?php

namespace App\Features\Post\Repositories;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PostRepository implements PostRepositoryInterface
{
    private const LIST_COLUMNS = [
        'id', 'user_id', 'title', 'slug', 'category', 'excerpt',
        'cover_image_path', 'is_published', 'published_at', 'created_at',
    ];

    public function paginatePublic(?string $search, ?string $category, int $perPage = 9): LengthAwarePaginator
    {
        return Post::query()
            ->published()
            ->select(self::LIST_COLUMNS)
            ->with('user:id,name')
            ->when($category, fn (Builder $q) => $q->where('category', $category))
            ->when($search, fn (Builder $q) => $this->search($q, $search))
            ->orderByDesc('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findPublishedBySlug(string $slug): ?Post
    {
        return Post::query()->published()->with('user:id,name')->where('slug', $slug)->first();
    }

    public function paginateForUser(int $userId, ?string $search, int $perPage = 10): LengthAwarePaginator
    {
        return Post::query()
            ->where('user_id', $userId)
            ->when($search, fn (Builder $q) => $this->search($q, $search))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function paginateAll(?string $search, int $perPage = 10): LengthAwarePaginator
    {
        return Post::query()
            ->select(self::LIST_COLUMNS)
            ->with('user:id,name,username')
            ->when($search, fn (Builder $q) => $this->search($q, $search))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function allForUser(int $userId): Collection
    {
        return Post::query()->where('user_id', $userId)->orderBy('id')->get();
    }

    public function all(): Collection
    {
        return Post::query()->with('user:id,name,username')->orderBy('id')->get();
    }

    public function statsForUser(int $userId): array
    {
        $base = Post::query()->where('user_id', $userId);

        return [
            'total' => (clone $base)->count(),
            'published' => (clone $base)->where('is_published', true)->count(),
            'draft' => (clone $base)->where('is_published', false)->count(),
        ];
    }

    public function create(array $data): Post
    {
        return Post::query()->create($data);
    }

    public function update(Post $post, array $data): Post
    {
        $post->update($data);

        return $post;
    }

    public function delete(Post $post): void
    {
        $post->delete();
    }

    public function slugExists(string $slug): bool
    {
        return Post::query()->where('slug', $slug)->exists();
    }

    private function search(Builder $query, string $term): Builder
    {
        $like = '%'.mb_strtolower($term).'%';

        return $query->where(
            fn (Builder $w) => $w->whereRaw('LOWER(title) LIKE ?', [$like])
                ->orWhereRaw('LOWER(content) LIKE ?', [$like])
        );
    }
}

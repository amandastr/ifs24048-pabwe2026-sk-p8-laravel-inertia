<?php

namespace App\Features\Post\Services;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    public function __construct(private readonly PostRepositoryInterface $posts)
    {
    }

    public function publicList(?string $search, ?string $category, int $perPage = 9): LengthAwarePaginator
    {
        return $this->posts->paginatePublic($search, $category, $perPage);
    }

    public function publicShow(string $slug): ?Post
    {
        return $this->posts->findPublishedBySlug($slug);
    }

    public function memberList(User $user, ?string $search): LengthAwarePaginator
    {
        return $this->posts->paginateForUser($user->id, $search);
    }

    public function userPosts(User $user, ?string $search): LengthAwarePaginator
    {
        return $this->posts->paginateForUser($user->id, $search);
    }

    public function adminList(?string $search): LengthAwarePaginator
    {
        return $this->posts->paginateAll($search);
    }

    public function stats(User $user): array
    {
        return $this->posts->statsForUser($user->id);
    }

    public function forExport(User $user): Collection
    {
        return $this->posts->allForUser($user->id);
    }

    public function forAdminExport(): Collection
    {
        return $this->posts->all();
    }

    public function create(User $user, array $data, ?UploadedFile $cover = null): Post
    {
        $published = (bool) ($data['is_published'] ?? false);

        $post = $this->posts->create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['title']),
            'category' => $data['category'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'is_published' => $published,
            'published_at' => $published ? now() : null,
        ]);

        if ($cover) {
            $this->storeCover($post, $cover);
        }

        return $post;
    }

    public function update(Post $post, array $data, ?UploadedFile $cover = null): Post
    {
        $published = (bool) ($data['is_published'] ?? false);

        $this->posts->update($post, [
            'title' => $data['title'],
            'category' => $data['category'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'is_published' => $published,
            'published_at' => $published ? ($post->published_at ?? now()) : null,
        ]);

        if ($cover) {
            $this->storeCover($post, $cover);
        }

        return $post;
    }

    public function delete(Post $post): void
    {
        $this->deleteCoverFile($post);
        $this->posts->delete($post);
    }

    public function togglePublish(Post $post): Post
    {
        $publish = ! $post->is_published;

        return $this->posts->update($post, [
            'is_published' => $publish,
            'published_at' => $publish ? now() : null,
        ]);
    }

    public function storeCover(Post $post, UploadedFile $file): Post
    {
        $this->deleteCoverFile($post);

        return $this->posts->update($post, [
            'cover_image_path' => $file->store('covers', 'public'),
        ]);
    }

    public function removeCover(Post $post): Post
    {
        $this->deleteCoverFile($post);

        return $this->posts->update($post, ['cover_image_path' => null]);
    }

    /** @param array<int, array<string, mixed>> $items */
    public function saveGenerated(User $user, array $items): int
    {
        foreach ($items as $item) {
            $this->create($user, [
                'title' => $item['title'],
                'category' => $item['category'],
                'excerpt' => $item['excerpt'] ?? null,
                'content' => $item['content'],
                'is_published' => false,
            ]);
        }

        return count($items);
    }

    public function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'artikel';
        $slug = $base;
        $counter = 2;

        while ($this->posts->slugExists($slug)) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }

    private function deleteCoverFile(Post $post): void
    {
        if ($post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
        }
    }
}

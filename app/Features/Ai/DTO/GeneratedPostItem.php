<?php

namespace App\Features\Ai\DTO;

use App\Features\Post\Enums\PostCategory;

final class GeneratedPostItem
{
    public function __construct(
        public readonly string $title,
        public readonly string $category,
        public readonly string $excerpt,
        public readonly string $content,
    ) {
    }

    public static function fromArray(array $data, ?string $forcedCategory = null): self
    {
        $category = $forcedCategory ?? (string) ($data['category'] ?? '');

        return new self(
            trim((string) ($data['title'] ?? 'Artikel Tanpa Judul')),
            PostCategory::tryFrom($category)?->value ?? PostCategory::Umum->value,
            trim((string) ($data['excerpt'] ?? '')),
            trim((string) ($data['content'] ?? '')),
        );
    }

    /** @return array{title: string, category: string, excerpt: string, content: string} */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'category' => $this->category,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
        ];
    }
}

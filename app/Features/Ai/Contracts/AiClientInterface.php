<?php

namespace App\Features\Ai\Contracts;

use App\Features\Ai\DTO\GeneratedPostItem;

interface AiClientInterface
{
    /**
     * @return array<int, GeneratedPostItem>
     *
     * @throws \RuntimeException
     */
    public function generatePosts(string $topic, int $count, ?string $category = null): array;
}

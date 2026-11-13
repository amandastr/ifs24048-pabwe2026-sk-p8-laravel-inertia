<?php

namespace Database\Factories;

use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Post> */
class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $title = rtrim(fake()->unique()->sentence(5), '.');
        $published = fake()->boolean(70);

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1000, 999999),
            'category' => fake()->randomElement(PostCategory::values()),
            'excerpt' => fake()->sentence(14),
            'content' => "## {$title}\n\n".implode("\n\n", fake()->paragraphs(4)),
            'cover_image_path' => null,
            'is_published' => $published,
            'published_at' => $published ? now()->subDays(fake()->numberBetween(0, 30)) : null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => ['is_published' => true, 'published_at' => now()]);
    }

    public function draft(): static
    {
        return $this->state(fn () => ['is_published' => false, 'published_at' => null]);
    }
}

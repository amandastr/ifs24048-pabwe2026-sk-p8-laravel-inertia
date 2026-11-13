<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPostTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_lists_only_published_posts(): void
    {
        Post::factory()->count(3)->published()->create();
        Post::factory()->count(2)->draft()->create();

        $this->get('/')->assertOk()->assertInertia(
            fn (Assert $p) => $p->component('Public/PostIndex')->where('mode', 'home')->has('posts.data', 3)->has('categories', 6)
        );
    }

    public function test_articles_index_supports_search_and_category_filter(): void
    {
        Post::factory()->published()->create(['title' => 'Belajar Laravel Inertia', 'category' => 'Teknologi', 'content' => 'isi']);
        Post::factory()->published()->create(['title' => 'Resep Nasi Goreng', 'category' => 'Gaya Hidup', 'content' => 'isi']);

        $this->get('/articles?search=LARAVEL')->assertInertia(fn (Assert $p) => $p->where('mode', 'index')->has('posts.data', 1));
        $this->get('/articles?category=Gaya%20Hidup')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1)->where('filters.category', 'Gaya Hidup'));
        $this->get('/articles?category=Tidak-Ada')->assertInertia(fn (Assert $p) => $p->has('posts.data', 2)->where('filters.category', null));
        $this->get('/articles?search[]=x')->assertOk();
    }

    public function test_show_renders_published_post_and_hides_drafts(): void
    {
        $post = Post::factory()->published()->create(['slug' => 'artikel-publik']);
        $draft = Post::factory()->draft()->create(['slug' => 'artikel-draf']);

        $this->get('/articles/artikel-publik')->assertOk()->assertInertia(
            fn (Assert $p) => $p->component('Public/PostShow')->where('post.title', $post->title)->where('post.cover_url', null)
        );
        $this->get("/articles/{$draft->slug}")->assertNotFound();
        $this->get('/articles/tidak-ada')->assertNotFound();
    }
}

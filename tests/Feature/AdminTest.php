<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_users_list_with_search_and_post_counts(): void
    {
        $writer = User::factory()->create(['name' => 'Siti Nurhaliza']);
        Post::factory()->count(2)->create(['user_id' => $writer->id]);

        $this->actingAs($this->admin)->get('/admin/users')->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Admin/UserList')->has('users.data', 2));
        $this->actingAs($this->admin)->get('/admin/users?search=siti')
            ->assertInertia(fn (Assert $p) => $p->has('users.data', 1)->where('users.data.0.posts_count', 2));
    }

    public function test_admin_can_monitor_posts_of_one_user(): void
    {
        $writer = User::factory()->create();
        Post::factory()->count(2)->create(['user_id' => $writer->id]);
        Post::factory()->create();

        $this->actingAs($this->admin)->get("/admin/users/{$writer->id}/posts")->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Admin/UserPostList')->has('posts.data', 2)->where('owner.id', $writer->id));
    }

    public function test_admin_can_monitor_all_posts_with_search(): void
    {
        Post::factory()->create(['title' => 'Unik Sekali', 'content' => 'x']);
        Post::factory()->count(2)->create();

        $this->actingAs($this->admin)->get('/admin/posts')->assertInertia(fn (Assert $p) => $p->component('Admin/PostList')->has('posts.data', 3));
        $this->actingAs($this->admin)->get('/admin/posts?search=unik')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1));
    }

    public function test_admin_exports(): void
    {
        $writer = User::factory()->create();
        Post::factory()->count(2)->create(['user_id' => $writer->id]);

        $all = $this->actingAs($this->admin)->get('/admin/posts/export');
        $all->assertDownload('semua-artikel.xlsx');
        $this->assertStringStartsWith('PK', $all->streamedContent());

        $one = $this->actingAs($this->admin)->get("/admin/users/{$writer->id}/posts/export");
        $one->assertDownload("artikel-user-{$writer->id}.xlsx");
        $this->assertStringStartsWith('PK', $one->streamedContent());
    }

    public function test_members_cannot_open_admin_pages(): void
    {
        $member = User::factory()->create();

        foreach (['/admin/users', '/admin/posts', '/admin/posts/export'] as $url) {
            $this->actingAs($member)->get($url)->assertForbidden();
        }
    }
}

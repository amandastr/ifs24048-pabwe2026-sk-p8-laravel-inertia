<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class MemberPostTest extends TestCase
{
    use RefreshDatabase;

    private User $member;

    protected function setUp(): void
    {
        parent::setUp();
        $this->member = User::factory()->create();
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'title' => 'Artikel Baru', 'category' => 'Teknologi', 'excerpt' => 'Ringkas',
            'content' => '## Isi', 'is_published' => true,
        ], $override);
    }

    private function xlsx(array $rows): UploadedFile
    {
        $book = new Spreadsheet();
        $book->getActiveSheet()->fromArray($rows);
        $path = tempnam(sys_get_temp_dir(), 'xls');
        (new Xlsx($book))->save($path);

        return new UploadedFile($path, 'artikel.xlsx', null, null, true);
    }

    public function test_index_shows_posts_stats_and_search(): void
    {
        Post::factory()->published()->count(2)->create(['user_id' => $this->member->id]);
        Post::factory()->draft()->create(['user_id' => $this->member->id, 'title' => 'Catatan Rahasia']);
        Post::factory()->create();

        $this->actingAs($this->member)->get('/dashboard/posts')->assertOk()->assertInertia(
            fn (Assert $p) => $p->component('Post/Index')->has('posts.data', 3)
                ->where('stats.total', 3)->where('stats.published', 2)->where('stats.draft', 1)
        );
        $this->actingAs($this->member)->get('/dashboard/posts?search=rahasia')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1));
    }

    public function test_store_creates_post_with_cover_and_unique_slug(): void
    {
        Storage::fake('public');

        $this->actingAs($this->member)->post('/dashboard/posts', $this->payload(['cover' => UploadedFile::fake()->image('c.jpg')]))
            ->assertRedirect('/dashboard/posts');
        $this->actingAs($this->member)->post('/dashboard/posts', $this->payload(['is_published' => false]))->assertRedirect();

        $first = Post::firstWhere('slug', 'artikel-baru');
        $second = Post::firstWhere('slug', 'artikel-baru-2');
        $this->assertTrue($first->is_published);
        $this->assertNotNull($first->published_at);
        $this->assertNotNull($first->cover_url);
        Storage::disk('public')->assertExists($first->cover_image_path);
        $this->assertFalse($second->is_published);
        $this->assertNull($second->published_at);
    }

    public function test_store_validates_input_and_uses_fallback_slug(): void
    {
        $this->actingAs($this->member)->post('/dashboard/posts', [])->assertSessionHasErrors(['title', 'category', 'content']);
        $this->actingAs($this->member)->post('/dashboard/posts', $this->payload(['title' => '!!!']))->assertRedirect();
        $this->assertNotNull(Post::firstWhere('slug', 'artikel'));
    }

    public function test_show_displays_own_post(): void
    {
        $post = Post::factory()->create(['user_id' => $this->member->id]);

        $this->actingAs($this->member)->get("/dashboard/posts/{$post->id}")->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Post/Show')->where('post.id', $post->id));
    }

    public function test_update_changes_post_and_publication_state(): void
    {
        Storage::fake('public');
        $post = Post::factory()->draft()->create(['user_id' => $this->member->id]);

        $this->actingAs($this->member)->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Judul Baru', 'cover' => UploadedFile::fake()->image('a.jpg')]))
            ->assertRedirect('/dashboard/posts');
        $post->refresh();
        $this->assertSame('Judul Baru', $post->title);
        $this->assertTrue($post->is_published);
        $firstPublished = $post->published_at;
        Storage::disk('public')->assertExists($post->cover_image_path);

        $this->actingAs($this->member)->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Judul Lagi']))->assertRedirect();
        $this->assertEquals($firstPublished, $post->refresh()->published_at);

        $this->actingAs($this->member)->put("/dashboard/posts/{$post->id}", $this->payload(['is_published' => false]))->assertRedirect();
        $this->assertNull($post->refresh()->published_at);
    }

    public function test_destroy_removes_post_and_cover_file(): void
    {
        Storage::fake('public');
        $post = Post::factory()->create(['user_id' => $this->member->id]);
        $this->actingAs($this->member)->post("/dashboard/posts/{$post->id}/cover", ['cover' => UploadedFile::fake()->image('c.jpg')])->assertRedirect();
        $path = $post->refresh()->cover_image_path;

        $this->actingAs($this->member)->delete("/dashboard/posts/{$post->id}")->assertRedirect('/dashboard/posts');
        $this->assertModelMissing($post);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_publish_toggles_both_directions(): void
    {
        $post = Post::factory()->draft()->create(['user_id' => $this->member->id]);

        $this->actingAs($this->member)->patch("/dashboard/posts/{$post->id}/publish")->assertRedirect()->assertSessionHas('success', 'Artikel dipublikasikan.');
        $this->assertTrue($post->refresh()->is_published);
        $this->actingAs($this->member)->patch("/dashboard/posts/{$post->id}/publish")->assertSessionHas('success', 'Artikel dijadikan draf.');
        $this->assertFalse($post->refresh()->is_published);
    }

    public function test_cover_can_be_replaced_and_removed(): void
    {
        Storage::fake('public');
        $post = Post::factory()->create(['user_id' => $this->member->id]);

        $this->actingAs($this->member)->post("/dashboard/posts/{$post->id}/cover", ['cover' => UploadedFile::fake()->image('1.jpg')]);
        $old = $post->refresh()->cover_image_path;
        $this->actingAs($this->member)->post("/dashboard/posts/{$post->id}/cover", ['cover' => UploadedFile::fake()->image('2.jpg')]);
        $new = $post->refresh()->cover_image_path;
        $this->assertNotSame($old, $new);
        Storage::disk('public')->assertMissing($old);

        $this->actingAs($this->member)->post("/dashboard/posts/{$post->id}/cover", [])->assertSessionHasErrors('cover');
        $this->actingAs($this->member)->delete("/dashboard/posts/{$post->id}/cover")->assertRedirect();
        $this->assertNull($post->refresh()->cover_image_path);
        $this->actingAs($this->member)->delete("/dashboard/posts/{$post->id}/cover")->assertRedirect();
    }

    public function test_other_users_and_admins_cannot_touch_the_post(): void
    {
        $post = Post::factory()->create();
        $stranger = User::factory()->create();

        $this->actingAs($stranger)->get("/dashboard/posts/{$post->id}")->assertForbidden();
        $this->actingAs($stranger)->put("/dashboard/posts/{$post->id}", $this->payload())->assertForbidden();
        $this->actingAs($stranger)->delete("/dashboard/posts/{$post->id}")->assertForbidden();
        $this->actingAs(User::factory()->admin()->create())->get('/dashboard/posts')->assertForbidden();
        $this->actingAs($stranger)->get('/dashboard/posts/99999')->assertNotFound();
    }

    public function test_export_streams_an_excel_file(): void
    {
        Post::factory()->count(2)->create(['user_id' => $this->member->id]);

        $response = $this->actingAs($this->member)->get('/dashboard/posts/export');
        $response->assertOk()->assertDownload('artikel-saya.xlsx');
        $this->assertStringStartsWith('PK', $response->streamedContent());
    }

    public function test_import_creates_posts_from_excel(): void
    {
        $file = $this->xlsx([
            ['Judul', 'Kategori', 'Ringkasan', 'Konten', 'Status'],
            ['Impor Satu', 'Bisnis', 'Ringkas', 'Isi satu', 'Dipublikasikan'],
            ['Impor Dua', 'Kategori Ngawai', '', '=1+1', 'Draf'],
            ['', 'Umum', '', '', ''],
        ]);

        $this->actingAs($this->member)->post('/dashboard/posts/import', ['file' => $file])
            ->assertRedirect('/dashboard/posts')->assertSessionHas('success', '2 artikel berhasil diimpor.');

        $one = Post::firstWhere('title', 'Impor Satu');
        $two = Post::firstWhere('title', 'Impor Dua');
        $this->assertTrue($one->is_published);
        $this->assertSame('Bisnis', $one->category);
        $this->assertFalse($two->is_published);
        $this->assertSame('Umum', $two->category);
        $this->assertNull($two->excerpt);
    }

    public function test_import_rejects_invalid_files(): void
    {
        $this->actingAs($this->member)->post('/dashboard/posts/import', [])->assertSessionHasErrors('file');
        $this->actingAs($this->member)->post('/dashboard/posts/import', ['file' => UploadedFile::fake()->createWithContent('rusak.xlsx', 'bukan excel')])
            ->assertRedirect()->assertSessionHas('error');
    }

    public function test_ai_generate_flashes_generated_posts(): void
    {
        config(['services.openai.key' => 'test-key']);
        Http::fake(['api.openai.com/*' => Http::response(['choices' => [['message' => ['content' => json_encode(['posts' => [
            ['title' => 'AI Satu', 'category' => 'Bisnis', 'excerpt' => 'e', 'content' => 'c'],
            ['title' => 'AI Dua', 'category' => 'Opini', 'excerpt' => 'e', 'content' => 'c'],
        ]])]]]])]);

        $this->actingAs($this->member)->post('/dashboard/posts/ai-generate', ['topic' => 'Startup', 'count' => 2])
            ->assertRedirect('/dashboard/posts')->assertSessionHas('generated');
    }

    public function test_ai_generate_reports_failures_and_validates(): void
    {
        config(['services.openai.key' => null]);
        $this->actingAs($this->member)->post('/dashboard/posts/ai-generate', ['topic' => 'X', 'count' => 1])->assertSessionHasErrors('ai');
        $this->actingAs($this->member)->post('/dashboard/posts/ai-generate', ['topic' => '', 'count' => 99])->assertSessionHasErrors(['topic', 'count']);
    }

    public function test_ai_save_stores_drafts(): void
    {
        $this->actingAs($this->member)->post('/dashboard/posts/ai-save', ['posts' => [
            ['title' => 'Draf AI', 'category' => 'Umum', 'excerpt' => '', 'content' => '## Isi'],
        ]])->assertRedirect('/dashboard/posts');

        $this->assertFalse(Post::firstWhere('title', 'Draf AI')->is_published);
        $this->actingAs($this->member)->post('/dashboard/posts/ai-save', [])->assertSessionHasErrors('posts');
    }

    public function test_inertia_shares_flash_and_auth(): void
    {
        $this->actingAs($this->member)->withSession(['success' => 'Halo', 'error' => 'Gagal'])->get('/dashboard/posts')
            ->assertInertia(fn (Assert $p) => $p->where('flash.success', 'Halo')->where('flash.error', 'Gagal')->where('auth.user.id', $this->member->id));
    }
}

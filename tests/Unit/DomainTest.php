<?php

namespace Tests\Unit;

use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Ai\Services\OpenAiPostGeneratorService;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Policies\PostPolicy;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class DomainTest extends TestCase
{
    public function test_post_category_labels_options_and_values(): void
    {
        foreach (PostCategory::cases() as $case) {
            $this->assertNotSame('', $case->label());
        }
        $this->assertCount(6, PostCategory::options());
        $this->assertSame(['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'], PostCategory::values());
    }

    public function test_generated_post_item_normalises_data(): void
    {
        $item = GeneratedPostItem::fromArray(['title' => ' Judul ', 'category' => 'Ngawur', 'excerpt' => ' e ', 'content' => ' c ']);
        $this->assertSame(['title' => 'Judul', 'category' => 'Umum', 'excerpt' => 'e', 'content' => 'c'], $item->toArray());
        $this->assertSame('Bisnis', GeneratedPostItem::fromArray([], 'Bisnis')->category);
        $this->assertSame('Artikel Tanpa Judul', GeneratedPostItem::fromArray([])->title);
    }

    public function test_post_policy_checks_ownership(): void
    {
        $user = User::factory()->make(['id' => 1]);
        $own = Post::factory()->make(['user_id' => 1]);
        $foreign = Post::factory()->make(['user_id' => 2]);
        $policy = new PostPolicy();

        $this->assertTrue($policy->view($user, $own) && $policy->update($user, $own) && $policy->delete($user, $own));
        $this->assertFalse($policy->view($user, $foreign) || $policy->update($user, $foreign) || $policy->delete($user, $foreign));
    }

    public function test_openai_service_parses_a_successful_response(): void
    {
        config(['services.openai.key' => 'k']);
        Http::fake(['*' => Http::response(['choices' => [['message' => ['content' => json_encode(['posts' => [
            ['title' => 'A', 'category' => 'Opini', 'excerpt' => 'e', 'content' => 'c'], 'bukan-array', ['title' => 'C'],
        ]])]]]])]);

        $items = (new OpenAiPostGeneratorService())->generatePosts('Topik', 2, null);
        $this->assertCount(2, $items);
        $this->assertSame('Opini', $items[0]->category);
        $this->assertSame('Umum', $items[1]->category);

        $forced = (new OpenAiPostGeneratorService())->generatePosts('Topik', 1, 'Bisnis');
        $this->assertSame('Bisnis', $forced[0]->category);
    }

    public function test_openai_service_requires_api_key(): void
    {
        config(['services.openai.key' => null]);
        $this->expectException(RuntimeException::class);
        (new OpenAiPostGeneratorService())->generatePosts('x', 1);
    }

    public function test_openai_service_fails_on_http_error(): void
    {
        config(['services.openai.key' => 'k']);
        Http::fake(['*' => Http::response([], 500)]);
        $this->expectExceptionMessage('HTTP 500');
        (new OpenAiPostGeneratorService())->generatePosts('x', 1);
    }

    public function test_openai_service_fails_on_unreadable_response(): void
    {
        config(['services.openai.key' => 'k']);
        Http::fake(['*' => Http::response(['choices' => [['message' => ['content' => 'bukan json']]]])]);
        $this->expectExceptionMessage('tidak dapat dipahami');
        (new OpenAiPostGeneratorService())->generatePosts('x', 1);
    }

    public function test_openai_service_wraps_connection_errors(): void
    {
        config(['services.openai.key' => 'k']);
        Http::fake(fn () => throw new ConnectionException('boom'));
        $this->expectExceptionMessage('Tidak dapat terhubung');
        (new OpenAiPostGeneratorService())->generatePosts('x', 1);
    }
}

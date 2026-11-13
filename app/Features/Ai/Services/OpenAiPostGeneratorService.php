<?php

namespace App\Features\Ai\Services;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiPostGeneratorService implements AiClientInterface
{
    private const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    public function generatePosts(string $topic, int $count, ?string $category = null): array
    {
        $key = config('services.openai.key');
        if (! $key) {
            throw new RuntimeException('OPENAI_API_KEY belum dikonfigurasi di file .env.');
        }

        try {
            $response = Http::withToken($key)->acceptJson()->timeout(90)->post(self::ENDPOINT, [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $this->systemPrompt()],
                    ['role' => 'user', 'content' => $this->userPrompt($topic, $count, $category)],
                ],
            ]);
        } catch (ConnectionException) {
            throw new RuntimeException('Tidak dapat terhubung ke layanan OpenAI.');
        }

        if ($response->failed()) {
            throw new RuntimeException('Layanan OpenAI gagal merespons (HTTP '.$response->status().').');
        }

        $decoded = json_decode((string) $response->json('choices.0.message.content'), true);
        $posts = is_array($decoded) ? ($decoded['posts'] ?? []) : [];

        if (! is_array($posts) || $posts === []) {
            throw new RuntimeException('Respons OpenAI tidak dapat dipahami. Silakan coba lagi.');
        }

        return array_map(
            fn ($item) => GeneratedPostItem::fromArray(is_array($item) ? $item : [], $category),
            array_slice($posts, 0, $count)
        );
    }

    private function systemPrompt(): string
    {
        return 'Kamu adalah penulis blog profesional berbahasa Indonesia. Balas HANYA dengan JSON valid '
            .'berbentuk {"posts":[{"title":"","category":"","excerpt":"","content":""}]}. '
            .'category harus salah satu dari: Teknologi, Pendidikan, Gaya Hidup, Bisnis, Opini, Umum. '
            .'excerpt berisi 1-2 kalimat. content berupa Markdown (gunakan heading ## dan ###, tanpa heading #).';
    }

    private function userPrompt(string $topic, int $count, ?string $category): string
    {
        $prompt = "Buat {$count} artikel blog berbeda dengan topik: {$topic}.";

        return $category ? $prompt." Gunakan kategori {$category}." : $prompt;
    }
}

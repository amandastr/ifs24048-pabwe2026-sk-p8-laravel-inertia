<?php

namespace Database\Seeders;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'admin'],
            ['name' => 'Administrator', 'email' => 'admin@example.com', 'password' => 'password', 'role' => 'admin']
        );

        $writer = User::updateOrCreate(
            ['username' => 'penulis'],
            ['name' => 'Penulis Contoh', 'email' => 'penulis@example.com', 'password' => 'password', 'role' => 'member']
        );

        $categories = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'];

        for ($i = 1; $i <= 13; $i++) {
            $title = "Artikel Contoh {$i}";
            $published = $i <= 10;

            Post::updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'user_id' => $writer->id,
                    'title' => $title,
                    'category' => $categories[($i - 1) % count($categories)],
                    'excerpt' => "Ringkasan singkat untuk {$title}.",
                    'content' => "## {$title}\n\nIni adalah isi contoh untuk {$title}. Tulisan ini dibuat otomatis sebagai data awal aplikasi blog.\n\nSilakan ganti dengan tulisan Anda sendiri.",
                    'cover_image_path' => null,
                    'is_published' => $published,
                    'published_at' => $published ? now()->subDays($i) : null,
                ]
            );
        }
    }
}
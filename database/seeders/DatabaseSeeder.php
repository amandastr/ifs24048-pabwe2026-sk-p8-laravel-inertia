<?php

namespace Database\Seeders;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Administrator',
            'username' => 'admin',
            'email' => 'admin@example.com',
        ]);

        $writer = User::factory()->create([
            'name' => 'Penulis Contoh',
            'username' => 'penulis',
            'email' => 'penulis@example.com',
        ]);

        Post::factory()->count(10)->published()->create(['user_id' => $writer->id]);
        Post::factory()->count(3)->draft()->create(['user_id' => $writer->id]);
    }
}

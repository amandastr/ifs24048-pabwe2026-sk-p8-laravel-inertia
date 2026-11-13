<?php

namespace App\Features\Post\Models;

use App\Models\User;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'slug', 'category', 'excerpt', 'content',
        'cover_image_path', 'is_published', 'published_at',
    ];

    protected $appends = ['cover_url'];

    protected static function newFactory(): PostFactory
    {
        return PostFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    protected function coverUrl(): Attribute
    {
        return Attribute::get(
            fn () => $this->cover_image_path ? asset('storage/'.$this->cover_image_path) : null
        );
    }
}

<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Controllers\Concerns\ReadsSearch;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Services\PostService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPostController extends Controller
{
    use ReadsSearch;

    public function __construct(private readonly PostService $posts)
    {
    }

    public function home(): Response
    {
        return Inertia::render('Public/PostIndex', [
            'mode' => 'home',
            'posts' => $this->posts->publicList(null, null, 6),
            'filters' => ['search' => null, 'category' => null],
            'categories' => PostCategory::options(),
        ]);
    }

    public function index(Request $request): Response
    {
        $search = $this->searchTerm($request);
        $category = PostCategory::tryFrom((string) $request->query('category'))?->value;

        return Inertia::render('Public/PostIndex', [
            'mode' => 'index',
            'posts' => $this->posts->publicList($search, $category),
            'filters' => ['search' => $search, 'category' => $category],
            'categories' => PostCategory::options(),
        ]);
    }

    public function show(string $slug): Response
    {
        $post = $this->posts->publicShow($slug);
        abort_if($post === null, 404);

        return Inertia::render('Public/PostShow', ['post' => $post]);
    }
}

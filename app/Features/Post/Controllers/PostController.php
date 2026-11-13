<?php

namespace App\Features\Post\Controllers;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Controllers\Concerns\ReadsSearch;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Reader\Exception as ReaderException;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostController extends Controller
{
    use ReadsSearch;

    public function __construct(
        private readonly PostService $posts,
        private readonly PostExcelService $excel,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $this->searchTerm($request);

        return Inertia::render('Post/Index', [
            'posts' => $this->posts->memberList($user, $search),
            'stats' => $this->posts->stats($user),
            'filters' => ['search' => $search],
            'categories' => PostCategory::options(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedPost($request);
        $this->posts->create($request->user(), Arr::except($data, ['cover']), $request->file('cover'));

        return redirect()->route('posts.index')->with('success', 'Artikel berhasil disimpan.');
    }

    public function show(Post $post): Response
    {
        Gate::authorize('view', $post);

        return Inertia::render('Post/Show', [
            'post' => $post->load('user:id,name'),
            'categories' => PostCategory::options(),
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        $data = $this->validatedPost($request);
        $this->posts->update($post, Arr::except($data, ['cover']), $request->file('cover'));

        return redirect()->route('posts.index')->with('success', 'Artikel berhasil diperbarui.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        Gate::authorize('delete', $post);
        $this->posts->delete($post);

        return redirect()->route('posts.index')->with('success', 'Artikel berhasil dihapus.');
    }

    public function publish(Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);
        $post = $this->posts->togglePublish($post);

        return back()->with('success', $post->is_published ? 'Artikel dipublikasikan.' : 'Artikel dijadikan draf.');
    }

    public function storeCover(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);
        $request->validate(['cover' => ['required', 'image', 'max:2048']]);
        $this->posts->storeCover($post, $request->file('cover'));

        return back()->with('success', 'Foto sampul berhasil diunggah.');
    }

    public function destroyCover(Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);
        $this->posts->removeCover($post);

        return back()->with('success', 'Foto sampul dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->excel->export($this->posts->forExport($request->user()), 'artikel-saya.xlsx');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate(['file' => ['required', 'file', 'extensions:xlsx,xls', 'max:5120']]);

        try {
            $count = $this->excel->import($request->user(), $request->file('file'));
        } catch (ReaderException) {
            return back()->with('error', 'Berkas Excel tidak dapat dibaca. Pastikan formatnya .xlsx yang valid.');
        }

        return redirect()->route('posts.index')->with('success', "{$count} artikel berhasil diimpor.");
    }

    public function aiGenerate(Request $request, AiClientInterface $ai): RedirectResponse
    {
        $data = $request->validate([
            'topic' => ['required', 'string', 'max:200'],
            'count' => ['required', 'integer', 'min:1', 'max:5'],
            'category' => ['nullable', Rule::enum(PostCategory::class)],
        ]);

        try {
            $items = $ai->generatePosts($data['topic'], (int) $data['count'], $data['category'] ?? null);
        } catch (RuntimeException $e) {
            return back()->withErrors(['ai' => $e->getMessage()]);
        }

        return redirect()->route('posts.index')->with('generated', array_map(
            fn (GeneratedPostItem $item) => $item->toArray(),
            $items
        ));
    }

    public function aiSave(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'posts' => ['required', 'array', 'min:1', 'max:5'],
            'posts.*.title' => ['required', 'string', 'max:255'],
            'posts.*.category' => ['required', Rule::enum(PostCategory::class)],
            'posts.*.excerpt' => ['nullable', 'string', 'max:500'],
            'posts.*.content' => ['required', 'string'],
        ]);

        $count = $this->posts->saveGenerated($request->user(), $data['posts']);

        return redirect()->route('posts.index')->with('success', "{$count} artikel AI disimpan sebagai draf.");
    }

    private function validatedPost(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(PostCategory::class)],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'is_published' => ['sometimes', 'boolean'],
            'cover' => ['nullable', 'image', 'max:2048'],
        ]);
    }
}

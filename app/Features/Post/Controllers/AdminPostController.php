<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Controllers\Concerns\ReadsSearch;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPostController extends Controller
{
    use ReadsSearch;

    public function __construct(
        private readonly PostService $posts,
        private readonly PostExcelService $excel,
    ) {
    }

    public function index(Request $request): Response
    {
        $search = $this->searchTerm($request);

        return Inertia::render('Admin/PostList', [
            'posts' => $this->posts->adminList($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function export(): StreamedResponse
    {
        return $this->excel->export($this->posts->forAdminExport(), 'semua-artikel.xlsx', true);
    }
}

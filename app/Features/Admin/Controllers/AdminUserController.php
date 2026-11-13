<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Services\AdminUserService;
use App\Features\Post\Controllers\Concerns\ReadsSearch;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminUserController extends Controller
{
    use ReadsSearch;

    public function __construct(
        private readonly AdminUserService $users,
        private readonly PostService $posts,
        private readonly PostExcelService $excel,
    ) {
    }

    public function index(Request $request): Response
    {
        $search = $this->searchTerm($request);

        return Inertia::render('Admin/UserList', [
            'users' => $this->users->paginateUsers($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function posts(Request $request, User $user): Response
    {
        $search = $this->searchTerm($request);

        return Inertia::render('Admin/UserPostList', [
            'owner' => $user->only(['id', 'name', 'username', 'email']),
            'posts' => $this->posts->userPosts($user, $search),
            'filters' => ['search' => $search],
        ]);
    }

    public function export(User $user): StreamedResponse
    {
        return $this->excel->export($this->posts->forExport($user), 'artikel-user-'.$user->id.'.xlsx');
    }
}

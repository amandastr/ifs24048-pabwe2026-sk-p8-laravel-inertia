<?php

namespace App\Features\Auth\Actions;

use Illuminate\Support\Facades\Auth;

class LoginUserAction
{
    public function execute(string $identifier, string $password, bool $remember = false): bool
    {
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        return Auth::attempt([$field => $identifier, 'password' => $password], $remember);
    }
}

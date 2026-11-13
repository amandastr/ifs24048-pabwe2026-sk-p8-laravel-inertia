<?php

namespace App\Features\Profile\Services;

use App\Models\User;

class ProfileService
{
    public function update(User $user, array $data): User
    {
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return $user;
    }
}

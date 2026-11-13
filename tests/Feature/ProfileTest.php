<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_renders_for_members_and_admins(): void
    {
        $this->actingAs(User::factory()->create())->get('/profile')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Profile/Edit'));
        $this->actingAs(User::factory()->admin()->create())->get('/profile')->assertOk();
    }

    public function test_profile_can_be_updated_without_password(): void
    {
        $user = User::factory()->create();
        $hash = $user->password;

        $this->actingAs($user)->put('/profile', [
            'name' => 'Nama Baru', 'username' => 'nama_baru', 'email' => 'baru@example.com', 'password' => '',
        ])->assertRedirect('/profile');

        $user->refresh();
        $this->assertSame('Nama Baru', $user->name);
        $this->assertSame($hash, $user->password);
    }

    public function test_profile_password_can_be_changed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->put('/profile', [
            'name' => $user->name, 'username' => $user->username, 'email' => $user->email,
            'password' => 'sandibaru123', 'password_confirmation' => 'sandibaru123',
        ])->assertRedirect('/profile');

        $this->assertTrue(Hash::check('sandibaru123', $user->refresh()->password));
    }

    public function test_profile_validates_unique_fields(): void
    {
        $other = User::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($user)->put('/profile', ['name' => 'X', 'username' => $other->username, 'email' => $other->email])
            ->assertSessionHasErrors(['username', 'email']);
    }
}

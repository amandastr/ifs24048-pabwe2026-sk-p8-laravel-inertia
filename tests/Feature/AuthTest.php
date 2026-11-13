<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_and_register_pages_render(): void
    {
        $this->get('/login')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Auth/Login'));
        $this->get('/register')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Auth/Register'));
    }

    public function test_member_logs_in_with_username(): void
    {
        $user = User::factory()->create(['username' => 'penulis1']);

        $this->post('/login', ['username' => 'penulis1', 'password' => 'password'])->assertRedirect('/dashboard/posts');
        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_logs_in_with_email(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'admin@example.com']);

        $this->post('/login', ['username' => 'admin@example.com', 'password' => 'password', 'remember' => true])->assertRedirect('/admin/users');
        $this->assertAuthenticatedAs($admin);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['username' => 'penulis1']);

        $this->post('/login', ['username' => 'penulis1', 'password' => 'salah'])->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_login_requires_fields(): void
    {
        $this->post('/login', [])->assertSessionHasErrors(['username', 'password']);
    }

    public function test_register_creates_member_and_logs_in(): void
    {
        $this->post('/register', [
            'name' => 'Budi', 'username' => 'budi_01', 'email' => 'budi@example.com',
            'password' => 'rahasia123', 'password_confirmation' => 'rahasia123',
        ])->assertRedirect('/dashboard/posts');

        $user = User::firstWhere('username', 'budi_01');
        $this->assertSame('member', $user->role);
        $this->assertAuthenticatedAs($user);
    }

    public function test_register_validates_input(): void
    {
        User::factory()->create(['username' => 'dipakai']);

        $this->post('/register', ['name' => '', 'username' => 'dipakai', 'email' => 'x', 'password' => '123'])
            ->assertSessionHasErrors(['name', 'username', 'email', 'password']);
    }

    public function test_logout_clears_session(): void
    {
        $this->actingAs(User::factory()->create())->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_authenticated_user_is_redirected_away_from_login(): void
    {
        $this->actingAs(User::factory()->create())->get('/login')->assertRedirect('/dashboard/posts');
        $this->actingAs(User::factory()->admin()->create())->get('/login')->assertRedirect('/admin/users');
    }

    public function test_guest_is_redirected_to_login_for_protected_pages(): void
    {
        $this->get('/dashboard/posts')->assertRedirect('/login');
        $this->get('/admin/users')->assertRedirect('/login');
        $this->get('/profile')->assertRedirect('/login');
    }

    public function test_user_model_helpers(): void
    {
        $this->assertTrue(User::factory()->admin()->make()->isAdmin());
        $this->assertFalse(User::factory()->make()->isAdmin());
        $this->assertCount(0, User::factory()->create()->posts);
    }
}

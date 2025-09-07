<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('authenticated user can access game create page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/games/create');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Game/Create')
    );
});

test('authenticated user can access dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
    );
});

test('games index page loads for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/games');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Game/Index')
    );
});

test('unauthenticated users are redirected to login', function () {
    $response = $this->get('/games/create');
    $response->assertRedirect('/login');

    $response = $this->get('/games');
    $response->assertRedirect('/login');

    $response = $this->get('/dashboard');
    $response->assertRedirect('/login');
});

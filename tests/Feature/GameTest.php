<?php

use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can create a new game with players', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/games', [
            'players' => ['Alice', 'Bob', 'Charlie'],
        ]);

    $response->assertRedirect();

    $game = Game::latest()->first();
    expect($game->created_by)->toBe($user->id);
    expect($game->status)->toBe('active');
    expect($game->players)->toHaveCount(3);
    expect($game->players->pluck('name')->toArray())->toBe(['Alice', 'Bob', 'Charlie']);
});

it('requires at least 2 players', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/games', [
            'players' => ['Alice'],
        ]);

    $response->assertSessionHasErrors('players');
});

it('requires authenticated user to create game', function () {
    $response = $this->post('/games', [
        'players' => ['Alice', 'Bob'],
    ]);

    $response->assertRedirect('/login');
});

it('can view the create game page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/games/create');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('Game/Create'));
});

it('can view a game with players', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['created_by' => $user->id]);

    $game->players()->createMany([
        ['name' => 'Alice', 'points' => 0],
        ['name' => 'Bob', 'points' => 15],
        ['name' => 'Charlie', 'points' => 7],
    ]);

    $response = $this->actingAs($user)->get("/games/{$game->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('Game/Show')
        ->has('game.players', 3)
        ->where('game.id', $game->id)
    );
});

it('can add points to a player', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['created_by' => $user->id]);
    $player = $game->players()->create(['name' => 'Alice', 'points' => 10]);

    $response = $this->actingAs($user)
        ->post("/games/{$game->id}/players/{$player->id}/add-points", [
            'points' => 25,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Added 25 points to Alice');

    $player->refresh();
    expect($player->points)->toBe(35);
});

it('validates points when adding to player', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['created_by' => $user->id]);
    $player = $game->players()->create(['name' => 'Alice', 'points' => 10]);

    // Test negative points
    $response = $this->actingAs($user)
        ->post("/games/{$game->id}/players/{$player->id}/add-points", [
            'points' => -5,
        ]);

    $response->assertSessionHasErrors('points');

    // Test too large points
    $response = $this->actingAs($user)
        ->post("/games/{$game->id}/players/{$player->id}/add-points", [
            'points' => 1001,
        ]);

    $response->assertSessionHasErrors('points');

    // Test missing points
    $response = $this->actingAs($user)
        ->post("/games/{$game->id}/players/{$player->id}/add-points", []);

    $response->assertSessionHasErrors('points');
});

it('prevents adding points to player from different game', function () {
    $user = User::factory()->create();
    $game1 = Game::factory()->create(['created_by' => $user->id]);
    $game2 = Game::factory()->create(['created_by' => $user->id]);
    $player = $game2->players()->create(['name' => 'Alice', 'points' => 10]);

    $response = $this->actingAs($user)
        ->post("/games/{$game1->id}/players/{$player->id}/add-points", [
            'points' => 25,
        ]);

    $response->assertNotFound();
});

it('requires authentication to add points', function () {
    $game = Game::factory()->create();
    $player = $game->players()->create(['name' => 'Alice', 'points' => 10]);

    $response = $this->post("/games/{$game->id}/players/{$player->id}/add-points", [
        'points' => 25,
    ]);

    $response->assertRedirect('/login');
});

it('declares winner when player reaches 500 points', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['created_by' => $user->id]);
    $player = $game->players()->create(['name' => 'Alice', 'points' => 480]);

    $response = $this->actingAs($user)
        ->post("/games/{$game->id}/players/{$player->id}/add-points", [
            'points' => 25,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('winner', 'Alice');

    $player->refresh();
    $game->refresh();

    expect($player->points)->toBe(505);
    expect($game->status)->toBe('completed');
    expect($game->winner_id)->toBe($player->id);
    expect($game->ended_at)->not->toBeNull();
});

it('can start a new game with play again', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create([
        'created_by' => $user->id,
        'status' => 'completed',
    ]);

    $game->players()->createMany([
        ['name' => 'Alice', 'points' => 505],
        ['name' => 'Bob', 'points' => 250],
        ['name' => 'Charlie', 'points' => 100],
    ]);

    $response = $this->actingAs($user)
        ->post("/games/{$game->id}/play-again");

    $response->assertRedirect();
    $response->assertSessionHas('success', 'New game started with the same players!');

    $newGame = Game::where('id', '!=', $game->id)->latest()->first();
    expect($newGame)->not->toBeNull();
    expect($newGame->id)->not->toBe($game->id);
    expect($newGame->status)->toBe('active');
    expect($newGame->players)->toHaveCount(3);
    expect($newGame->players->pluck('name')->toArray())->toBe(['Alice', 'Bob', 'Charlie']);
    expect($newGame->players->pluck('points')->toArray())->toBe([0, 0, 0]);
});

it('requires authentication for play again', function () {
    $game = Game::factory()->create();

    $response = $this->post("/games/{$game->id}/play-again");

    $response->assertRedirect('/login');
});

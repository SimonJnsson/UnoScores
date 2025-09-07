<?php

use App\Models\Game;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('shows active games on games index page', function () {
    $user = User::factory()->create();

    // Create an active game
    $activeGame = Game::factory()->create([
        'created_by' => $user->id,
        'status' => 'active',
        'started_at' => now(),
    ]);

    // Create players for the game
    Player::factory()->count(3)->create([
        'game_id' => $activeGame->id,
    ]);

    // Create a completed game (should not be shown)
    $completedGame = Game::factory()->create([
        'created_by' => $user->id,
        'status' => 'completed',
        'ended_at' => now(),
    ]);

    $response = $this->actingAs($user)->get('/games');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Game/Index')
            ->has('activeGames', 1)
            ->has('activeGames.0', fn ($game) => $game
                ->where('id', $activeGame->id)
                ->where('status', 'active')
                ->has('players', 3)
                ->etc()
            )
        );
});

test('can continue an active game by navigating to show page', function () {
    $user = User::factory()->create();

    $game = Game::factory()->create([
        'created_by' => $user->id,
        'status' => 'active',
        'started_at' => now(),
    ]);

    Player::factory()->count(2)->create([
        'game_id' => $game->id,
    ]);

    $response = $this->actingAs($user)->get("/games/{$game->id}");

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Game/Show')
            ->has('game', fn ($gameData) => $gameData
                ->where('id', $game->id)
                ->where('status', 'active')
                ->has('players', 2)
                ->etc()
            )
        );
});

test('does not show active games from other users', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    // Create game for user1
    $game1 = Game::factory()->create([
        'created_by' => $user1->id,
        'status' => 'active',
    ]);

    // Create game for user2
    $game2 = Game::factory()->create([
        'created_by' => $user2->id,
        'status' => 'active',
    ]);

    // User1 should only see their own game
    $response = $this->actingAs($user1)->get('/games');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Game/Index')
            ->has('activeGames', 1)
            ->has('activeGames.0', fn ($game) => $game
                ->where('id', $game1->id)
                ->etc()
            )
        );
});

test('shows games with waiting_for_players status as continuable', function () {
    $user = User::factory()->create();

    $waitingGame = Game::factory()->create([
        'created_by' => $user->id,
        'status' => 'waiting_for_players',
    ]);

    Player::factory()->count(2)->create([
        'game_id' => $waitingGame->id,
    ]);

    $response = $this->actingAs($user)->get('/games');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Game/Index')
            ->has('activeGames', 1)
            ->has('activeGames.0', fn ($game) => $game
                ->where('id', $waitingGame->id)
                ->where('status', 'waiting_for_players')
                ->etc()
            )
        );
});

test('active games are ordered by most recent first', function () {
    $user = User::factory()->create();

    $olderGame = Game::factory()->create([
        'created_by' => $user->id,
        'status' => 'active',
        'created_at' => now()->subHour(),
    ]);

    $newerGame = Game::factory()->create([
        'created_by' => $user->id,
        'status' => 'active',
        'created_at' => now(),
    ]);

    $response = $this->actingAs($user)->get('/games');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Game/Index')
            ->has('activeGames', 2)
            ->has('activeGames.0', fn ($game) => $game
                ->where('id', $newerGame->id)
                ->etc()
            )
            ->has('activeGames.1', fn ($game) => $game
                ->where('id', $olderGame->id)
                ->etc()
            )
        );
});

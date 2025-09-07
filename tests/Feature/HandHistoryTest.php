<?php

use App\Models\Game;
use App\Models\HandHistory;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->game = Game::factory()->create(['created_by' => $this->user->id]);
    $this->player = Player::factory()->create(['game_id' => $this->game->id]);
});

it('creates hand history when points are added to player', function () {
    expect(HandHistory::count())->toBe(0);

    $this->actingAs($this->user)
        ->post("/games/{$this->game->id}/players/{$this->player->id}/add-points", [
            'points' => 25,
        ]);

    expect(HandHistory::count())->toBe(1);

    $handHistory = HandHistory::first();
    expect($handHistory->game_id)->toBe($this->game->id);
    expect($handHistory->player_id)->toBe($this->player->id);
    expect($handHistory->points_received)->toBe(25);
});

it('creates multiple hand history records for multiple point additions', function () {
    $this->actingAs($this->user)
        ->post("/games/{$this->game->id}/players/{$this->player->id}/add-points", [
            'points' => 25,
        ]);

    $this->actingAs($this->user)
        ->post("/games/{$this->game->id}/players/{$this->player->id}/add-points", [
            'points' => 50,
        ]);

    expect(HandHistory::count())->toBe(2);

    $histories = HandHistory::orderBy('created_at')->get();
    expect($histories[0]->points_received)->toBe(25);
    expect($histories[1]->points_received)->toBe(50);
});

it('loads hand histories with player data on game show page', function () {
    // Create some hand history
    HandHistory::create([
        'game_id' => $this->game->id,
        'player_id' => $this->player->id,
        'points_received' => 75,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/games/{$this->game->id}");

    $response->assertSuccessful();

    // Test that the response contains Inertia data
    $response->assertInertia(fn ($assert) => $assert
        ->component('Game/Show')
        ->has('game.hand_histories', 1)
        ->where('game.hand_histories.0.points_received', 75)
        ->where('game.hand_histories.0.player.name', $this->player->name)
    );
});

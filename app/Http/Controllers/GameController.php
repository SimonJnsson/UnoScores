<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Player;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Game/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'players' => 'required|array|min:2|max:10',
            'players.*' => 'required|string|max:255',
        ]);

        $game = Game::create([
            'created_by' => auth()->id(),
            'status' => 'waiting_for_players',
        ]);

        foreach ($request->players as $playerName) {
            Player::create([
                'game_id' => $game->id,
                'name' => $playerName,
            ]);
        }

        return redirect()->route('games.show', $game);
    }

    public function show(Game $game): Response
    {
        $game->load(['players', 'winner']);

        return Inertia::render('Game/Show', [
            'game' => $game,
        ]);
    }

    public function addPoints(Request $request, Game $game, Player $player)
    {
        $request->validate([
            'points' => 'required|integer|min:1|max:1000',
        ]);

        // Ensure the player belongs to this game
        if ($player->game_id !== $game->id) {
            abort(404);
        }

        $player->increment('points', $request->points);

        // Check if player reached 500 points or more
        if ($player->points >= 500) {
            $game->update([
                'winner_id' => $player->id,
                'status' => 'completed',
                'ended_at' => now(),
            ]);

            return back()->with('winner', $player->name);
        }

        return back()->with('success', "Added {$request->points} points to {$player->name}");
    }

    public function playAgain(Game $game)
    {
        // Create a new game with the same players
        $newGame = Game::create([
            'created_by' => auth()->id(),
            'status' => 'waiting_for_players',
        ]);

        // Copy all players with reset points
        foreach ($game->players as $player) {
            Player::create([
                'game_id' => $newGame->id,
                'name' => $player->name,
                'points' => 0,
            ]);
        }

        return redirect()->route('games.show', $newGame)
            ->with('success', 'New game started with the same players!');
    }
}

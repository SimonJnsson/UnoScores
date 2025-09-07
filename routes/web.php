<?php

use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('games/create', [GameController::class, 'create'])->name('games.create');
    Route::post('games', [GameController::class, 'store'])->name('games.store');
    Route::get('games/{game}', [GameController::class, 'show'])->name('games.show');
    Route::post('games/{game}/players/{player}/add-points', [GameController::class, 'addPoints'])->name('games.players.add-points');
    Route::post('games/{game}/play-again', [GameController::class, 'playAgain'])->name('games.play-again');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

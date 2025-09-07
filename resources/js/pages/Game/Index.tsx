import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useOffline } from '@/hooks/use-offline';
import OfflineGame from '@/pages/Game/Offline';
import { PlusIcon, PlayIcon, UsersIcon, TrophyIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface Player {
    id: number;
    name: string;
    points: number;
}

interface Game {
    id: number;
    status: string;
    players: Player[];
    winner?: Player;
    created_at: string;
}

interface GameIndexProps {
    activeGames: Game[];
}

export default function GameIndex({ activeGames = [] }: GameIndexProps) {
    const [players, setPlayers] = useState(['', '']);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showOfflineGame, setShowOfflineGame] = useState(false);
    const {
        currentOfflineGame,
        isOnline,
        isOffline,
        createOfflineGame,
        storageStats,
        isSyncing,
        lastSyncResult,
        refreshCurrentGame
    } = useOffline();

    const addPlayer = () => {
        if (players.length < 10) {
            setPlayers([...players, '']);
        }
    };

    const removePlayer = (index: number) => {
        if (players.length > 2) {
            setPlayers(players.filter((_, i) => i !== index));
        }
    };

    const updatePlayer = (index: number, name: string) => {
        const newPlayers = [...players];
        newPlayers[index] = name;
        setPlayers(newPlayers);
    };

    const handleStartGame = () => {
        const validPlayers = players.filter(p => p.trim()).map(p => p.trim());
        if (validPlayers.length >= 2) {
            if (isOnline) {
                // Create online game via API
                router.post('/games', {
                    players: validPlayers
                });
            } else {
                // Create offline game
                createOfflineGame(validPlayers);
                setShowOfflineGame(true);
                setShowCreateForm(false);
            }
        }
    };

    const handleContinueGame = () => {
        console.log(currentOfflineGame)
        if (currentOfflineGame) {
            refreshCurrentGame(); // Refresh game data before showing
            setShowOfflineGame(true);
        }
    };

    const handleNewGame = () => {
        setPlayers(['', '']);
        setShowCreateForm(true);
        setShowOfflineGame(false);
    };

    // If offline game is active, show it
    if (showOfflineGame && currentOfflineGame) {
        return <OfflineGame onBackToCreate={() => setShowOfflineGame(false)} />;
    }

    return (
        <AppLayout>
            <Head title="UNO Game" />

            <div className="min-h-screen bg-gray-800 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        onClick={() => router.visit('/dashboard')}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                        <Cog6ToothIcon className="h-5 w-5" />
                    </Button>

                    <div className="text-center">
                        <h1 className="text-6xl font-black text-white font-mono tracking-wider">
                            UNO
                        </h1>
                    </div>

                    <Badge variant={isOnline ? "default" : "secondary"} className="bg-gray-700 text-gray-300 border-gray-600">
                        {isOnline ? "●" : "○"}
                    </Badge>
                </div>

                {/* Offline Notice */}
                {isOffline && (
                    <div className="max-w-sm mx-auto mb-6 bg-yellow-400 text-black p-3 rounded-xl text-center font-bold">
                        ⚡ OFFLINE MODE
                    </div>
                )}

                {/* Main Game Area */}
                <div className="max-w-sm mx-auto space-y-4">

                    {/* Continue Active Online Games */}
                    {isOnline && activeGames.length > 0 && activeGames.map((game) => (
                        <div key={`online-${game.id}`} className="bg-blue-500 rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-transform">
                            <div className="text-8xl font-black text-white mb-3 font-mono">▶</div>
                            <h2 className="text-xl font-bold text-white mb-2">CONTINUE</h2>
                            <p className="text-blue-100 text-sm mb-4">
                                {game.players.length} players • {game.status === 'waiting_for_players' ? 'WAITING' : 'ACTIVE'}
                            </p>
                            <Button
                                onClick={() => router.visit(`/games/${game.id}`)}
                                className="w-full bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 text-lg rounded-lg"
                            >
                                PLAY
                            </Button>
                        </div>
                    ))}

                    {/* Continue Current Offline Game */}
                    {currentOfflineGame && (
                        <div className="bg-green-500 rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-transform">
                            <div className="text-8xl font-black text-white mb-3 font-mono">▶</div>
                            <h2 className="text-xl font-bold text-white mb-2">CONTINUE</h2>
                            <p className="text-green-100 text-sm mb-4">
                                {currentOfflineGame.players.length} players • {currentOfflineGame.status}
                            </p>
                            <Button
                                onClick={handleContinueGame}
                                className="w-full bg-white hover:bg-gray-100 text-green-600 font-bold py-3 text-lg rounded-lg"
                            >
                                PLAY
                            </Button>
                        </div>
                    )}

                    {/* New Game Card */}
                    {!showCreateForm && (
                        <div className="bg-red-500 rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-transform">
                            <div className="text-8xl font-black text-white mb-3 font-mono">+</div>
                            <h2 className="text-xl font-bold text-white mb-2">NEW GAME</h2>
                            <p className="text-red-100 text-sm mb-4">
                                2-10 players
                            </p>
                            <Button
                                onClick={handleNewGame}
                                className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 text-lg rounded-lg"
                            >
                                START
                            </Button>
                        </div>
                    )}

                    {/* Create Game Form */}
                    {showCreateForm && (
                        <div className="bg-blue-500 rounded-xl p-6 shadow-xl">
                            <div className="text-center mb-4">
                                <div className="text-6xl font-black text-white mb-2 font-mono">👥</div>
                                <h2 className="text-xl font-bold text-white">ADD PLAYERS</h2>
                            </div>
                            <div className="space-y-3 mb-4">
                                {players.map((player, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder={`Player ${index + 1}`}
                                            value={player}
                                            onChange={(e) => updatePlayer(index, e.target.value)}
                                            className="flex-1 bg-white border-0 font-bold text-lg py-3 rounded-lg text-blue-600 placeholder-blue-300"
                                        />
                                        {players.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removePlayer(index)}
                                                className="bg-red-500 border-0 text-white hover:bg-red-600 font-bold text-xl rounded-lg p-3 w-12"
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                onClick={addPlayer}
                                disabled={players.length >= 10}
                                className="w-full mb-4 bg-blue-400 hover:bg-blue-300 text-blue-800 font-bold py-3 rounded-lg"
                            >
                                + ADD PLAYER
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg"
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    onClick={handleStartGame}
                                    disabled={players.filter(p => p.trim()).length < 2}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg"
                                >
                                    GO!
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    {storageStats.totalGames > 0 && (
                        <div className="bg-gray-700 rounded-xl p-4 text-center">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="font-bold text-2xl text-white">{storageStats.totalGames}</div>
                                    <div className="text-gray-400">GAMES</div>
                                </div>
                                {storageStats.unsyncedGames > 0 && (
                                    <div>
                                        <div className="font-bold text-2xl text-yellow-400">{storageStats.unsyncedGames}</div>
                                        <div className="text-gray-400">PENDING</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-2xl">{lastSyncResult?.success ? '✓' : '○'}</div>
                                    <div className="text-gray-400">SYNC</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

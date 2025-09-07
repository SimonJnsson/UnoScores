import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useOffline } from '@/hooks/use-offline';
import OfflineGame from '@/pages/Game/Offline';
import { PlusIcon, PlayIcon, UsersIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function GameIndex() {
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
        lastSyncResult 
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
            createOfflineGame(validPlayers);
            setShowOfflineGame(true);
            setShowCreateForm(false);
        }
    };

    const handleContinueGame = () => {
        setShowOfflineGame(true);
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
            
            <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 p-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-lg transform -rotate-2">
                        UNO!
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant={isOnline ? "default" : "secondary"} className="bg-white/20 text-white border-white/30">
                            {isOnline ? "🟢 Online" : "🔴 Offline"}
                        </Badge>
                        {isSyncing && (
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                🔄 Syncing...
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Offline Notice */}
                {isOffline && (
                    <Card className="mb-6 border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                                <div className="text-2xl">🎮</div>
                                <div>
                                    <p className="font-semibold">Playing Offline</p>
                                    <p className="text-sm">Your games will sync when you're back online!</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Game Area */}
                <div className="max-w-md mx-auto space-y-4">
                    
                    {/* Continue Current Game */}
                    {currentOfflineGame && (
                        <Card className="border-4 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 transform hover:scale-105 transition-transform">
                            <CardHeader className="text-center">
                                <div className="text-4xl mb-2">🎯</div>
                                <CardTitle className="text-xl text-green-800 dark:text-green-200">
                                    Continue Game
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center space-y-3">
                                <div className="flex items-center justify-center gap-4 text-sm text-green-700 dark:text-green-300">
                                    <div className="flex items-center gap-1">
                                        <UsersIcon className="h-4 w-4" />
                                        {currentOfflineGame.players.length} players
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <TrophyIcon className="h-4 w-4" />
                                        {currentOfflineGame.status}
                                    </div>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Started {new Date(currentOfflineGame.started_at).toLocaleDateString()}
                                </p>
                                <Button 
                                    onClick={handleContinueGame}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
                                    size="lg"
                                >
                                    <PlayIcon className="h-5 w-5 mr-2" />
                                    Continue Playing
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* New Game Card */}
                    {!showCreateForm && (
                        <Card className="border-4 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 transform hover:scale-105 transition-transform">
                            <CardHeader className="text-center">
                                <div className="text-4xl mb-2">🎲</div>
                                <CardTitle className="text-xl text-blue-800 dark:text-blue-200">
                                    Start New Game
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-blue-600 dark:text-blue-400 mb-4">
                                    Gather 2-10 players and let the fun begin!
                                </p>
                                <Button 
                                    onClick={handleNewGame}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
                                    size="lg"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    New Game
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Create Game Form */}
                    {showCreateForm && (
                        <Card className="border-4 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                            <CardHeader className="text-center">
                                <div className="text-3xl mb-2">👥</div>
                                <CardTitle className="text-xl text-purple-800 dark:text-purple-200">
                                    Add Players
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {players.map((player, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder={`Player ${index + 1}`}
                                                value={player}
                                                onChange={(e) => updatePlayer(index, e.target.value)}
                                                className="flex-1 border-2 border-purple-200 focus:border-purple-400 font-medium text-lg py-3"
                                            />
                                            {players.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removePlayer(index)}
                                                    className="border-2 border-red-300 text-red-600 hover:bg-red-50 p-3"
                                                >
                                                    ✕
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addPlayer}
                                        disabled={players.length >= 10}
                                        className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold py-3"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Player
                                    </Button>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={() => setShowCreateForm(false)}
                                        variant="outline"
                                        className="flex-1 border-2 border-gray-300 py-3"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleStartGame}
                                        disabled={players.filter(p => p.trim()).length < 2}
                                        className="flex-1 bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white font-bold py-3 text-lg"
                                    >
                                        <PlayIcon className="h-5 w-5 mr-2" />
                                        Start!
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Card */}
                    {storageStats.totalGames > 0 && (
                        <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <div className="text-2xl mb-2">📊</div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="font-bold text-xl text-orange-600">{storageStats.totalGames}</div>
                                            <div className="text-orange-500">Games</div>
                                        </div>
                                        {storageStats.unsyncedGames > 0 && (
                                            <div>
                                                <div className="font-bold text-xl text-yellow-600">{storageStats.unsyncedGames}</div>
                                                <div className="text-yellow-500">Pending</div>
                                            </div>
                                        )}
                                        {lastSyncResult?.success && (
                                            <div>
                                                <div className="text-xl">✅</div>
                                                <div className="text-green-500">Synced</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
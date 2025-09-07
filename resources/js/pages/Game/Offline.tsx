import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useOffline } from '@/hooks/use-offline';
import { TrophyIcon, ArrowLeftIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

interface OfflineGameProps {
    onBackToCreate?: () => void;
}

export default function OfflineGame({ onBackToCreate }: OfflineGameProps) {
    const {
        currentOfflineGame,
        addPointsOffline,
        endOfflineGame,
        startNewOfflineGame,
        refreshCurrentGame,
        isOnline,
        isOffline
    } = useOffline();

    const [pointInputs, setPointInputs] = useState<{ [playerId: string]: string }>({});

    useEffect(() => {
        console.log(currentOfflineGame)
        if (!currentOfflineGame && onBackToCreate) {
            onBackToCreate();
        }
    }, [currentOfflineGame, onBackToCreate]);

    if (!currentOfflineGame) {
        return null;
    }

    const handlePointsChange = (playerId: string, value: string) => {
        setPointInputs(prev => ({ ...prev, [playerId]: value }));
    };

    const handleAddPoints = (playerId: string) => {
        const points = parseInt(pointInputs[playerId] || '0');
        if (isNaN(points) || points === 0) return;

        const success = addPointsOffline(playerId, points);
        if (success) {
            setPointInputs(prev => ({ ...prev, [playerId]: '' }));
        }
    };

    const handleEndGame = (winnerId?: string) => {
        const success = endOfflineGame(winnerId);
        if (success) {
            // Game ended successfully
        }
    };

    const handleNewGame = () => {
        const newGame = startNewOfflineGame();
        if (newGame) {
            setPointInputs({});
        }
    };

    const sortedPlayers = [...currentOfflineGame.players].sort((a, b) => a.points - b.points);
    const winner = currentOfflineGame.status === 'completed'
        ? currentOfflineGame.players.find(p => p.id === currentOfflineGame.winner_id)
        : null;

    return (
        <AppLayout>
            <Head title="UNO Game" />

            <div className="min-h-screen bg-gray-800 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        onClick={() => onBackToCreate ? onBackToCreate() : router.visit('/games')}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-1" />
                        BACK
                    </Button>
                    <div className="text-center">
                        <h1 className="text-4xl font-black text-white font-mono tracking-wider">
                            UNO
                        </h1>
                    </div>
                    <Badge variant={isOnline ? "default" : "secondary"} className="bg-gray-700 text-gray-300 border-gray-600">
                        {isOnline ? "●" : "○"}
                    </Badge>
                </div>

                <div className="max-w-sm mx-auto space-y-4">
                    {/* Game Status */}
                    <div className="bg-gray-700 rounded-xl p-4 text-center">
                        <div className="text-white text-sm">
                            {currentOfflineGame.players.length} PLAYERS • {currentOfflineGame.status === 'active' ? 'PLAYING' : 'FINISHED'}
                        </div>
                        {isOffline && (
                            <div className="mt-2 text-yellow-400 text-xs font-bold">⚡ OFFLINE MODE</div>
                        )}
                    </div>

                    {/* Winner Celebration */}
                    {currentOfflineGame.status === 'completed' && winner && (
                        <div className="bg-yellow-500 rounded-xl p-6 text-center shadow-xl">
                            <div className="text-8xl font-black text-white mb-3 font-mono">🏆</div>
                            <h2 className="text-2xl font-black text-white mb-2">WINNER!</h2>
                            <p className="text-xl font-bold text-yellow-100">{winner.name}</p>
                            <p className="text-yellow-200">{winner.points} POINTS</p>
                        </div>
                    )}

                    {/* Players */}
                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => {
                            const cardColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                            const cardColor = cardColors[index % cardColors.length];
                            const isLeader = index === 0 && currentOfflineGame.status === 'active';

                            return (
                                <div
                                    key={player.id}
                                    className={`${cardColor} rounded-xl p-4 text-white shadow-lg ${
                                        isLeader ? 'ring-4 ring-yellow-300 scale-105' : ''
                                    } transition-all duration-200`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {isLeader && <div className="text-2xl">👑</div>}
                                            <span className="font-bold text-xl font-mono">
                                                {player.name}
                                            </span>
                                        </div>
                                        <div className="bg-white text-black font-black text-2xl px-3 py-1 rounded-lg font-mono">
                                            {player.points}
                                        </div>
                                    </div>

                                    {currentOfflineGame.status === 'active' && (
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="POINTS"
                                                value={pointInputs[player.id] || ''}
                                                onChange={(e) => handlePointsChange(player.id, e.target.value)}
                                                className="flex-1 bg-white text-black font-bold text-lg py-3 rounded-lg border-0 placeholder-gray-500"
                                            />
                                            <Button
                                                onClick={() => handleAddPoints(player.id)}
                                                disabled={!pointInputs[player.id] || parseInt(pointInputs[player.id]) === 0}
                                                className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-3 rounded-lg"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Game Actions */}
                    <div className="space-y-3 pt-4">
                        {currentOfflineGame.status === 'active' && (
                            <div className="space-y-3">
                                <div className="bg-gray-700 rounded-xl p-4">
                                    <h3 className="text-white text-center font-bold mb-3">END GAME</h3>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        {sortedPlayers.map(player => (
                                            <Button
                                                key={`end-${player.id}`}
                                                onClick={() => handleEndGame(player.id)}
                                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg text-sm"
                                            >
                                                {player.name}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={() => handleEndGame()}
                                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm"
                                    >
                                        NO WINNER
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentOfflineGame.status === 'completed' && (
                            <Button
                                onClick={handleNewGame}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-lg rounded-xl"
                            >
                                PLAY AGAIN
                            </Button>
                        )}

                        <Button
                            onClick={() => onBackToCreate ? onBackToCreate() : router.visit('/games')}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl"
                        >
                            BACK TO GAMES
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

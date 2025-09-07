import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useOffline } from '@/hooks/use-offline';

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
            
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">UNO Game</h1>
                        <p className="text-muted-foreground">
                            Started {new Date(currentOfflineGame.started_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={isOnline ? "default" : "secondary"}>
                            {isOnline ? "Online" : "Offline"}
                        </Badge>
                        <Badge variant={currentOfflineGame.status === 'active' ? "default" : "outline"}>
                            {currentOfflineGame.status === 'active' ? 'Active' : 'Completed'}
                        </Badge>
                    </div>
                </div>

                {isOffline && (
                    <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
                        <p><strong>Offline Mode:</strong> Changes are saved locally and will sync when you're back online.</p>
                    </div>
                )}

                {currentOfflineGame.status === 'completed' && winner && (
                    <Card className="mb-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                                    🎉 Game Over!
                                </h2>
                                <p className="text-green-700 dark:text-green-300">
                                    <strong>{winner.name}</strong> wins with {winner.points} points!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedPlayers.map((player, index) => (
                        <Card key={player.id} className={index === 0 && currentOfflineGame.status === 'active' ? 'ring-2 ring-green-500' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <span>{player.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-lg px-2 py-1">
                                            {player.points}
                                        </Badge>
                                        {index === 0 && currentOfflineGame.status === 'active' && (
                                            <Badge variant="default" className="text-xs">
                                                Leading
                                            </Badge>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            
                            {currentOfflineGame.status === 'active' && (
                                <CardContent className="pt-0">
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Points"
                                            value={pointInputs[player.id] || ''}
                                            onChange={(e) => handlePointsChange(player.id, e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={() => handleAddPoints(player.id)}
                                            disabled={!pointInputs[player.id] || parseInt(pointInputs[player.id]) === 0}
                                            size="sm"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    {currentOfflineGame.status === 'active' && (
                        <>
                            {sortedPlayers.map(player => (
                                <Button
                                    key={`end-${player.id}`}
                                    onClick={() => handleEndGame(player.id)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {player.name} Wins
                                </Button>
                            ))}
                            <Button
                                onClick={() => handleEndGame()}
                                variant="outline"
                                size="sm"
                            >
                                End Without Winner
                            </Button>
                        </>
                    )}
                    
                    {currentOfflineGame.status === 'completed' && (
                        <Button
                            onClick={handleNewGame}
                            size="lg"
                        >
                            Play Again
                        </Button>
                    )}
                    
                    <Button
                        onClick={() => onBackToCreate ? onBackToCreate() : router.visit('/games/create')}
                        variant="outline"
                    >
                        New Game with Different Players
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
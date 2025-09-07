import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useOffline } from '@/hooks/use-offline';
import { Badge } from '@/components/ui/badge';
import OfflineGame from '@/pages/Game/Offline';

export default function CreateGame() {
    const [players, setPlayers] = useState(['', '']);
    const [showOfflineGame, setShowOfflineGame] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        players: ['', ''],
    });
    const { isOnline, isOffline, createOfflineGame } = useOffline();

    const addPlayer = () => {
        const newPlayers = [...players, ''];
        setPlayers(newPlayers);
        setData('players', newPlayers);
    };

    const removePlayer = (index: number) => {
        const newPlayers = players.filter((_, i) => i !== index);
        setPlayers(newPlayers);
        setData('players', newPlayers);
    };

    const updatePlayer = (index: number, name: string) => {
        const newPlayers = [...players];
        newPlayers[index] = name;
        setPlayers(newPlayers);
        setData('players', newPlayers);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const validPlayers = players.filter(p => p.trim()).map(p => p.trim());
        
        if (isOffline) {
            // Create offline game and show it directly
            const game = createOfflineGame(validPlayers);
            setShowOfflineGame(true);
        } else {
            // Try online first, fallback to offline
            post('/games', {
                onError: () => {
                    // If server is unreachable, create offline game
                    const game = createOfflineGame(validPlayers);
                    setShowOfflineGame(true);
                }
            });
        }
    };

    // If offline game is created, show the game interface directly
    if (showOfflineGame) {
        return <OfflineGame onBackToCreate={() => setShowOfflineGame(false)} />;
    }

    return (
        <AppLayout>
            <Head title="Start New UNO Game" />
            
            <div className="max-w-2xl mx-auto p-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Start New UNO Game</h1>
                        <Badge variant={isOnline ? "default" : "secondary"}>
                            {isOnline ? "Online" : "Offline"}
                        </Badge>
                    </div>
                    
                    {isOffline && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200">
                            <p><strong>Offline Mode:</strong> Your game will be saved locally and synced when you're back online.</p>
                        </div>
                    )}
                    
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium mb-3 block">
                                Player Names (minimum 2 players)
                            </label>
                            
                            <div className="space-y-3">
                                {players.map((player, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder={`Player ${index + 1} name`}
                                            value={player}
                                            onChange={(e) => updatePlayer(index, e.target.value)}
                                            className="flex-1"
                                        />
                                        {players.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removePlayer(index)}
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {errors.players && (
                                <p className="text-destructive text-sm mt-1">{errors.players}</p>
                            )}
                            
                            <div className="flex gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addPlayer}
                                    disabled={players.length >= 10}
                                >
                                    Add Player
                                </Button>
                                
                                <Button
                                    type="submit"
                                    disabled={processing || players.filter(p => p.trim()).length < 2}
                                >
                                    {processing ? 'Starting Game...' : 'Start Game'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
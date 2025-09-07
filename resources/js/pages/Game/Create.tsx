import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

export default function CreateGame() {
    const [players, setPlayers] = useState(['', '']);
    const { data, setData, post, processing, errors } = useForm({
        players: ['', ''],
    });

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
        post('/games');
    };

    return (
        <AppLayout>
            <Head title="Start New UNO Game" />
            
            <div className="max-w-2xl mx-auto p-6">
                <Card className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Start New UNO Game</h1>
                    
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
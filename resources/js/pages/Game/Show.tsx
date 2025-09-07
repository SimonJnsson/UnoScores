import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Form, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

interface Props {
    game: Game;
}

export default function ShowGame({ game }: Props) {
    const [addingPointsFor, setAddingPointsFor] = useState<number | null>(null);
    const page = usePage();
    const flash = page.props.flash as any;


    const playAgain = () => {
        router.post(`/games/${game.id}/play-again`);
    };

    return (
        <AppLayout>
            <Head title={`UNO Game #${game.id}`} />

            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">UNO Game #{game.id}</h1>
                </div>


                {/* Check if game is completed - show winner regardless of flash */}
                {game.status === 'completed' && game.winner && (
                    <Card className="p-6 mb-6 bg-green-50 border-green-200">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-green-800 mb-2">
                                🎉 {game.winner.name} Wins! 🎉
                            </h2>
                            <p className="text-green-700 mb-4">
                                {game.winner.name} won with {game.winner.points} points!
                            </p>
                            <Button onClick={playAgain} size="lg">
                                Play Again
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Flash Messages */}
                {flash?.winner && game.status !== 'completed' && (
                    <Card className="p-6 mb-6 bg-green-50 border-green-200">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-green-800 mb-2">
                                🎉 {flash.winner} Wins! 🎉
                            </h2>
                            <p className="text-green-700 mb-4">
                                Congratulations! {flash.winner} has reached 500 points and won the game!
                            </p>
                            <Button onClick={playAgain} size="lg">
                                Play Again
                            </Button>
                        </div>
                    </Card>
                )}

                {flash?.success && (
                    <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                        <p className="text-blue-800">{flash.success}</p>
                    </Card>
                )}

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Players</h2>

                    <div className="space-y-3">
                        {game.players.map((player) => (
                            <div
                                key={player.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div>
                                    <h3 className="font-medium">{player.name}</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{player.points}</p>
                                        <p className="text-sm text-muted-foreground">points</p>
                                    </div>

                                    {addingPointsFor === player.id ? (
                                        <Form
                                            action={`/games/${game.id}/players/${player.id}/add-points`}
                                            method="post"
                                            className="flex items-center gap-2"
                                            onSuccess={() => setAddingPointsFor(null)}
                                        >
                                            {({ processing }) => (
                                                <>
                                                    <input
                                                        type="number"
                                                        name="points"
                                                        min="1"
                                                        max="1000"
                                                        placeholder="Points"
                                                        className="w-20 px-2 py-1 border rounded text-center"
                                                        required
                                                        autoFocus
                                                    />
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={processing}
                                                    >
                                                        {processing ? 'Adding...' : 'Add'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAddingPointsFor(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAddingPointsFor(player.id)}
                                            disabled={game.status === 'completed'}
                                        >
                                            Add Points
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Form, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Player {
    id: number;
    name: string;
    points: number;
    is_leader: boolean;
}

interface HandHistory {
    id: number;
    game_id: number;
    player_id: number;
    points_received: number;
    created_at: string;
    player: Player;
}

interface Game {
    id: number;
    status: string;
    players: Player[];
    winner?: Player;
    created_at: string;
    hand_histories: HandHistory[];
}

interface Props {
    game: Game;
}

export default function ShowGame({ game }: Props) {
    const [pointInputs, setPointInputs] = useState<{ [playerId: number]: string }>({});
    const [showInputs, setShowInputs] = useState<{ [playerId: number]: boolean }>({});
    const [showHandHistory, setShowHandHistory] = useState(false);
    const page = usePage();
    const flash = page.props.flash as any;

    const playAgain = () => {
        router.post(`/games/${game.id}/play-again`);
    };

    const handlePointsChange = (playerId: number, value: string) => {
        setPointInputs(prev => ({ ...prev, [playerId]: value }));
    };

    const handleShowInput = (playerId: number) => {
        setShowInputs(prev => ({ ...prev, [playerId]: true }));
    };

    const handleHideInput = (playerId: number) => {
        setShowInputs(prev => ({ ...prev, [playerId]: false }));
        setPointInputs(prev => ({ ...prev, [playerId]: '' }));
    };

    const handleAddPoints = (playerId: number) => {
        const points = parseInt(pointInputs[playerId] || '0');
        if (isNaN(points) || points === 0) return;

        router.post(`/games/${game.id}/players/${playerId}/add-points`, {
            points: points
        }, {
            onSuccess: () => {
                setPointInputs(prev => ({ ...prev, [playerId]: '' }));
                setShowInputs(prev => ({ ...prev, [playerId]: false }));
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`UNO Game #${game.id}`} />

            <div className="min-h-screen bg-gray-800 p-4">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <Button
                        onClick={() => router.visit('/games')}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                        <ArrowLeftIcon className="mr-1 h-5 w-5" />
                        BACK
                    </Button>

                    <div className="text-center">
                        <h1 className="font-mono text-6xl font-black tracking-wider text-white">UNO</h1>
                    </div>

                    <Badge variant="default" className="border-gray-600 bg-gray-700 text-gray-300">
                        ●
                    </Badge>
                </div>

                <div className="mx-auto text-xl max-w-sm mb-4 text-white font-mono">
                    {game.leader?.name} fører med {game.points_to_leader} point
                </div>

                <div className="mx-auto max-w-sm space-y-4">
                    {/* Winner Celebration */}
                    {game.status === 'completed' && game.winner && (
                        <div className="rounded-xl bg-yellow-500 p-6 text-center shadow-xl">
                            <div className="mb-3 font-mono text-8xl font-black text-white">🏆</div>
                            <h2 className="mb-2 text-2xl font-black text-white">WINNER!</h2>
                            <p className="text-xl font-bold text-yellow-100">{game.winner.name}</p>
                            <p className="text-yellow-200">{game.winner.points} POINTS</p>
                            <Button
                                onClick={playAgain}
                                className="mt-4 rounded-lg bg-white px-6 py-3 text-lg font-bold text-yellow-600 hover:bg-gray-100"
                            >
                                PLAY AGAIN
                            </Button>
                        </div>
                    )}

                    {/* Flash Messages */}
                    {flash?.winner && game.status !== 'completed' && (
                        <div className="rounded-xl bg-yellow-500 p-6 text-center shadow-xl">
                            <div className="mb-3 font-mono text-8xl font-black text-white">🎉</div>
                            <h2 className="mb-2 text-2xl font-black text-white">WINNER!</h2>
                            <p className="text-xl font-bold text-yellow-100">{flash.winner}</p>
                            <p className="mb-4 text-yellow-200">Reached 500 points!</p>
                            <Button onClick={playAgain} className="rounded-lg bg-white px-6 py-3 text-lg font-bold text-yellow-600 hover:bg-gray-100">
                                PLAY AGAIN
                            </Button>
                        </div>
                    )}

                    {flash?.success && (
                        <div className="rounded-xl bg-blue-500 p-4 text-center">
                            <p className="font-bold text-white">{flash.success}</p>
                        </div>
                    )}

                    {/* Players */}
                    <div className="space-y-3">
                        {game.players.map((player, index) => {
                            const cardColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                            const cardColor = cardColors[index % cardColors.length];
                            const isLeader = player.is_leader;

                            return (
                                <div
                                    key={player.id}
                                    className={`${cardColor} rounded-xl p-4 text-white shadow-lg ${
                                        isLeader ? 'scale-105 ring-4 ring-yellow-300' : ''
                                    } transition-all duration-200`}
                                >
                                    {/* Default layout: Name, Points, Plus button */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isLeader && <div className="text-2xl">👑</div>}
                                            <span className="font-mono text-xl font-bold">{player.name}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-white px-3 py-1 font-mono text-2xl font-black text-black">
                                                {player.points}
                                            </div>

                                            {game.status === 'active' && !showInputs[player.id] && (
                                                <Button
                                                    onClick={() => handleShowInput(player.id)}
                                                    className="rounded-lg bg-black p-3 font-bold text-white hover:bg-gray-800"
                                                >
                                                    <PlusIcon className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Input layout: Shows when plus button is clicked */}
                                    {game.status === 'active' && showInputs[player.id] && (
                                        <div className="mt-3 flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="POINTS"
                                                value={pointInputs[player.id] || ''}
                                                onChange={(e) => handlePointsChange(player.id, e.target.value)}
                                                className="flex-1 rounded-lg border-0 bg-white py-3 text-lg font-bold text-black placeholder-gray-500"
                                                autoFocus
                                            />
                                            <Button
                                                onClick={() => handleAddPoints(player.id)}
                                                disabled={!pointInputs[player.id] || parseInt(pointInputs[player.id]) === 0}
                                                className="rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
                                            >
                                                <CheckIcon className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                onClick={() => handleHideInput(player.id)}
                                                className="rounded-lg bg-gray-600 px-4 py-3 font-bold text-white hover:bg-gray-700"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Hand History Toggle Button */}
                    {game.hand_histories && game.hand_histories.length > 0 && (
                        <div className="pt-4">
                            <Button
                                onClick={() => setShowHandHistory(!showHandHistory)}
                                variant="ghost"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-3 font-bold text-white hover:bg-gray-600"
                            >
                                <ClockIcon className="h-5 w-5" />
                                {showHandHistory ? 'HIDE HAND HISTORY' : 'SHOW HAND HISTORY'}
                            </Button>
                        </div>
                    )}

                    {/* Hand History Display */}
                    {showHandHistory && game.hand_histories && game.hand_histories.length > 0 && (
                        <div className="pt-4">
                            <Card className="border-gray-600 bg-gray-700">
                                <div className="p-4">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                        <ClockIcon className="h-5 w-5" />
                                        Hand History
                                    </h3>
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                        {game.hand_histories.map((hand, index) => (
                                            <div key={hand.id} className="flex items-center justify-between rounded-lg bg-gray-800 p-3">
                                                <div className="text-white">
                                                    <span className="font-bold">{hand.player.name}</span>
                                                </div>
                                                <div className="rounded bg-yellow-500 px-2 py-1 text-lg font-bold text-black">
                                                    +{hand.points_received}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {game.status === 'completed' && (
                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={playAgain}
                                className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-white hover:bg-green-600"
                            >
                                PLAY AGAIN
                            </Button>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            onClick={() => router.visit('/games')}
                            className="w-full rounded-xl bg-gray-600 py-3 font-bold text-white hover:bg-gray-700"
                        >
                            BACK TO GAMES
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

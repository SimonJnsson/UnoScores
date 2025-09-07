import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useOffline } from '@/hooks/use-offline';
import OfflineGame from '@/pages/Game/Offline';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { currentOfflineGame, isOnline, isOffline, storageStats } = useOffline();
    const [showOfflineGame, setShowOfflineGame] = useState(false);

    // If showing offline game, render it directly
    if (showOfflineGame && currentOfflineGame) {
        return <OfflineGame onBackToCreate={() => setShowOfflineGame(false)} />;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Network Status Banner */}
                {isOffline && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <strong>Offline Mode:</strong> You can still play! Games will sync when you're back online.
                            </div>
                            <Badge variant="secondary">Offline</Badge>
                        </div>
                    </div>
                )}

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Continue Current Game Card */}
                    {currentOfflineGame && (
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-center bg-green-50 dark:bg-green-950">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">
                                    Continue Game
                                </h3>
                                <p className="text-green-700 dark:text-green-300 mb-2 text-sm">
                                    {currentOfflineGame.players.length} players
                                </p>
                                <p className="text-green-600 dark:text-green-400 mb-4 text-xs">
                                    Started {new Date(currentOfflineGame.started_at).toLocaleDateString()}
                                </p>
                                <Button 
                                    onClick={() => setShowOfflineGame(true)}
                                    variant="default"
                                >
                                    Continue Game
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Start New Game Card */}
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">Start UNO Game</h3>
                            <p className="text-muted-foreground mb-4 text-sm">Create a new game and add players</p>
                            <Link href="/games/create">
                                <Button>Start New Game</Button>
                            </Link>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20 -z-10" />
                    </div>

                    {/* Stats Card */}
                    {(storageStats.totalGames > 0 || isOffline) && (
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-center">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Local Games</h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>{storageStats.totalGames} games saved</p>
                                    {storageStats.unsyncedGames > 0 && (
                                        <p className="text-yellow-600 dark:text-yellow-400">
                                            {storageStats.unsyncedGames} pending sync
                                        </p>
                                    )}
                                    {storageStats.unsyncedActions > 0 && (
                                        <p className="text-blue-600 dark:text-blue-400">
                                            {storageStats.unsyncedActions} actions queued
                                        </p>
                                    )}
                                </div>
                            </div>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20 -z-10" />
                        </div>
                    )}

                    {/* Placeholder if no stats */}
                    {storageStats.totalGames === 0 && isOnline && (
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    )}
                </div>
                
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}

import { useState, useEffect } from 'react';
import { offlineStorage, type OfflineGame } from '@/lib/offline-storage';
import { syncManager } from '@/lib/sync-manager';

export function useOffline() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [currentOfflineGame, setCurrentOfflineGame] = useState<OfflineGame | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<any>(null);

    useEffect(() => {
        function handleOnline() {
            setIsOnline(true);
        }

        function handleOffline() {
            setIsOnline(false);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load current offline game if exists
        const currentGame = offlineStorage.getCurrentGame();
        setCurrentOfflineGame(currentGame);

        // Subscribe to sync events
        const unsubscribeSync = syncManager.onSyncComplete((result) => {
            setLastSyncResult(result);
            setIsSyncing(false);
            // Refresh current game in case it was synced
            refreshCurrentGame();
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unsubscribeSync();
        };
    }, []);

    const refreshCurrentGame = () => {
        const currentGame = offlineStorage.getCurrentGame();
        setCurrentOfflineGame(currentGame);
    };

    const createOfflineGame = (playerNames: string[]) => {
        const game = offlineStorage.createOfflineGame(playerNames);
        setCurrentOfflineGame(game);
        return game;
    };

    const addPointsOffline = (playerId: string, points: number) => {
        if (!currentOfflineGame) return false;
        
        const success = offlineStorage.addPointsToPlayer(currentOfflineGame.id, playerId, points);
        if (success) {
            refreshCurrentGame();
        }
        return success;
    };

    const endOfflineGame = (winnerId?: string) => {
        if (!currentOfflineGame) return false;
        
        const success = offlineStorage.endGame(currentOfflineGame.id, winnerId);
        if (success) {
            refreshCurrentGame();
        }
        return success;
    };

    const startNewOfflineGame = () => {
        const newGame = offlineStorage.createNewGameFromCurrent();
        if (newGame) {
            setCurrentOfflineGame(newGame);
        }
        return newGame;
    };

    const clearCurrentOfflineGame = () => {
        offlineStorage.clearCurrentGame();
        setCurrentOfflineGame(null);
    };

    const triggerSync = async () => {
        if (isSyncing || !isOnline) return null;
        
        setIsSyncing(true);
        try {
            return await syncManager.syncWhenOnline();
        } catch (error) {
            setIsSyncing(false);
            throw error;
        }
    };

    return {
        isOnline,
        isOffline: !isOnline,
        currentOfflineGame,
        createOfflineGame,
        addPointsOffline,
        endOfflineGame,
        startNewOfflineGame,
        clearCurrentOfflineGame,
        refreshCurrentGame,
        storageStats: offlineStorage.getStorageStats(),
        isSyncing,
        lastSyncResult,
        triggerSync,
    };
}
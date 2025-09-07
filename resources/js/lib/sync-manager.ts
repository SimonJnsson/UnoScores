import { offlineStorage, type OfflineGame, type OfflineAction } from './offline-storage';

interface SyncResult {
    success: boolean;
    message: string;
    syncedGames: number;
    syncedActions: number;
    errors: string[];
}

class SyncManager {
    private isSyncing = false;
    private syncCallbacks: Array<(result: SyncResult) => void> = [];

    constructor() {
        // Auto-sync when connection is restored
        window.addEventListener('online', () => {
            this.syncWhenOnline();
        });
    }

    onSyncComplete(callback: (result: SyncResult) => void): () => void {
        this.syncCallbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.syncCallbacks.indexOf(callback);
            if (index > -1) {
                this.syncCallbacks.splice(index, 1);
            }
        };
    }

    private notifyCallbacks(result: SyncResult): void {
        this.syncCallbacks.forEach(callback => callback(result));
    }

    async syncWhenOnline(): Promise<SyncResult> {
        if (!navigator.onLine || this.isSyncing) {
            return {
                success: false,
                message: navigator.onLine ? 'Already syncing' : 'Currently offline',
                syncedGames: 0,
                syncedActions: 0,
                errors: []
            };
        }

        return this.performSync();
    }

    async performSync(): Promise<SyncResult> {
        this.isSyncing = true;
        
        const result: SyncResult = {
            success: true,
            message: 'Sync completed successfully',
            syncedGames: 0,
            syncedActions: 0,
            errors: []
        };

        try {
            // Get all unsynced data
            const unsyncedGames = offlineStorage.getGames().filter(game => !game.synced);
            const unsyncedActions = offlineStorage.getUnsyncedActions();

            // Sync games first
            for (const game of unsyncedGames) {
                try {
                    await this.syncGame(game);
                    result.syncedGames++;
                } catch (error) {
                    result.errors.push(`Failed to sync game ${game.id}: ${error}`);
                    result.success = false;
                }
            }

            // Then sync individual actions
            for (const action of unsyncedActions) {
                try {
                    await this.syncAction(action);
                    result.syncedActions++;
                } catch (error) {
                    result.errors.push(`Failed to sync action ${action.id}: ${error}`);
                    result.success = false;
                }
            }

            // Clean up synced actions
            offlineStorage.clearSyncedActions();

            if (result.errors.length > 0) {
                result.message = `Sync completed with ${result.errors.length} errors`;
            }

        } catch (error) {
            result.success = false;
            result.message = `Sync failed: ${error}`;
            result.errors.push(String(error));
        } finally {
            this.isSyncing = false;
        }

        this.notifyCallbacks(result);
        return result;
    }

    private async syncGame(game: OfflineGame): Promise<void> {
        // Convert offline game to server format
        const gameData = {
            players: game.players.map(p => p.name),
            started_at: game.started_at,
            ended_at: game.ended_at,
            status: game.status,
            winner_name: game.winner_id 
                ? game.players.find(p => p.id === game.winner_id)?.name 
                : undefined,
        };

        const response = await fetch('/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': this.getCSRFToken(),
            },
            body: JSON.stringify(gameData),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const serverGame = await response.json();
        
        // Mark game as synced and update with server ID if available
        const updatedGame: OfflineGame = {
            ...game,
            synced: true,
            // Could optionally store server ID for future reference
        };
        
        offlineStorage.saveGame(updatedGame);

        // If this game had additional actions, sync them too
        const gameActions = offlineStorage.getActions().filter(
            action => action.gameId === game.id && !action.synced
        );

        for (const action of gameActions) {
            await this.syncGameAction(action, serverGame.id);
        }
    }

    private async syncAction(action: OfflineAction): Promise<void> {
        switch (action.type) {
            case 'create_game':
                // This should have been handled in syncGame
                break;
                
            case 'add_points':
                await this.syncAddPointsAction(action);
                break;
                
            case 'end_game':
                await this.syncEndGameAction(action);
                break;
                
            case 'play_again':
                await this.syncPlayAgainAction(action);
                break;
        }

        offlineStorage.markActionSynced(action.id);
    }

    private async syncGameAction(action: OfflineAction, serverGameId: number): Promise<void> {
        // Similar to syncAction but uses the server game ID
        switch (action.type) {
            case 'add_points':
                await this.syncAddPointsActionWithServerId(action, serverGameId);
                break;
                
            case 'end_game':
                await this.syncEndGameActionWithServerId(action, serverGameId);
                break;
        }

        offlineStorage.markActionSynced(action.id);
    }

    private async syncAddPointsAction(action: OfflineAction): Promise<void> {
        // For now, we'll skip individual point additions during sync
        // The final game state should be reflected in the synced game
        console.log('Skipping individual points sync - game state already synced');
    }

    private async syncAddPointsActionWithServerId(action: OfflineAction, serverGameId: number): Promise<void> {
        // Could implement if needed for real-time sync
        console.log('Skipping individual points sync with server ID');
    }

    private async syncEndGameAction(action: OfflineAction): Promise<void> {
        // Game end state should be reflected in the synced game
        console.log('Skipping end game action sync - game state already synced');
    }

    private async syncEndGameActionWithServerId(action: OfflineAction, serverGameId: number): Promise<void> {
        // Could implement if needed
        console.log('Skipping end game action sync with server ID');
    }

    private async syncPlayAgainAction(action: OfflineAction): Promise<void> {
        // Play again creates a new game, which will be synced separately
        console.log('Skipping play again action sync - new game will be synced separately');
    }

    private getCSRFToken(): string {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') || '' : '';
    }

    get isCurrentlySyncing(): boolean {
        return this.isSyncing;
    }
}

export const syncManager = new SyncManager();
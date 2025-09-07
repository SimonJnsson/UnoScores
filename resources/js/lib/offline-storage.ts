export interface OfflineGame {
    id: string;
    players: Array<{
        id: string;
        name: string;
        points: number;
    }>;
    status: 'active' | 'completed';
    winner_id?: string;
    started_at: string;
    ended_at?: string;
    created_at: string;
    updated_at: string;
    synced: boolean;
}

export interface OfflineAction {
    id: string;
    type: 'create_game' | 'add_points' | 'end_game' | 'play_again';
    gameId: string;
    data: any;
    timestamp: string;
    synced: boolean;
}

const STORAGE_KEYS = {
    GAMES: 'uno_offline_games',
    ACTIONS: 'uno_offline_actions',
    CURRENT_GAME: 'uno_current_game',
} as const;

class OfflineStorage {
    private generateId(): string {
        return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Game Management
    saveGame(game: OfflineGame): void {
        const games = this.getGames();
        const existingIndex = games.findIndex(g => g.id === game.id);

        if (existingIndex >= 0) {
            games[existingIndex] = { ...game, updated_at: new Date().toISOString() };
        } else {
            games.push(game);
        }

        localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
    }

    getGames(): OfflineGame[] {
        const stored = localStorage.getItem(STORAGE_KEYS.GAMES);
        return stored ? JSON.parse(stored) : [];
    }

    getGame(id: string): OfflineGame | null {
        const games = this.getGames();
        return games.find(g => g.id === id) || null;
    }

    deleteGame(id: string): void {
        const games = this.getGames().filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));

        // Also clear current game if it's the one being deleted
        if (this.getCurrentGameId() === id) {
            this.clearCurrentGame();
        }
    }

    // Current Game Management
    setCurrentGame(gameId: string): void {
        localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, gameId);
    }

    getCurrentGameId(): string | null {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    }

    getCurrentGame(): OfflineGame | null {
        const gameId = this.getCurrentGameId();
        return gameId ? this.getGame(gameId) : null;
    }

    clearCurrentGame(): void {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    }

    // Action Queue Management
    queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): void {
        const actions = this.getActions();
        const newAction: OfflineAction = {
            ...action,
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            synced: false,
        };

        actions.push(newAction);
        localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    }

    getActions(): OfflineAction[] {
        const stored = localStorage.getItem(STORAGE_KEYS.ACTIONS);
        return stored ? JSON.parse(stored) : [];
    }

    getUnsyncedActions(): OfflineAction[] {
        return this.getActions().filter(action => !action.synced);
    }

    markActionSynced(actionId: string): void {
        const actions = this.getActions();
        const action = actions.find(a => a.id === actionId);
        if (action) {
            action.synced = true;
            localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
        }
    }

    clearSyncedActions(): void {
        const actions = this.getActions().filter(action => !action.synced);
        localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    }

    // Game Operations
    createOfflineGame(playerNames: string[]): OfflineGame {
        const now = new Date().toISOString();
        const gameId = this.generateId();

        const game: OfflineGame = {
            id: gameId,
            players: playerNames.map(name => ({
                id: this.generateId(),
                name: name.trim(),
                points: 0,
            })),
            status: 'active',
            started_at: now,
            created_at: now,
            updated_at: now,
            synced: false,
        };

        this.saveGame(game);
        this.setCurrentGame(gameId);

        this.queueAction({
            type: 'create_game',
            gameId,
            data: { playerNames },
        });

        return game;
    }

    addPointsToPlayer(gameId: string, playerId: string, points: number): boolean {
        const game = this.getGame(gameId);
        if (!game) return false;

        const player = game.players.find(p => p.id === playerId);
        if (!player) return false;

        player.points += points;
        game.updated_at = new Date().toISOString();
        game.synced = false;

        this.saveGame(game);

        this.queueAction({
            type: 'add_points',
            gameId,
            data: { playerId, points },
        });

        return true;
    }

    endGame(gameId: string, winnerId?: string): boolean {
        const game = this.getGame(gameId);
        if (!game) return false;

        game.status = 'completed';
        game.winner_id = winnerId;
        game.ended_at = new Date().toISOString();
        game.updated_at = new Date().toISOString();
        game.synced = false;

        this.saveGame(game);

        this.queueAction({
            type: 'end_game',
            gameId,
            data: { winnerId },
        });

        return true;
    }

    createNewGameFromCurrent(): OfflineGame | null {
        const currentGame = this.getCurrentGame();
        if (!currentGame) return null;

        const playerNames = currentGame.players.map(p => p.name);
        return this.createOfflineGame(playerNames);
    }

    // Utility Methods
    isOnline(): boolean {
        return navigator.onLine;
    }

    getStorageStats() {
        return {
            totalGames: this.getGames().length,
            unsyncedGames: this.getGames().filter(g => !g.synced).length,
            unsyncedActions: this.getUnsyncedActions().length,
        };
    }

    clearAllData(): void {
        localStorage.removeItem(STORAGE_KEYS.GAMES);
        localStorage.removeItem(STORAGE_KEYS.ACTIONS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    }
}

export const offlineStorage = new OfflineStorage();

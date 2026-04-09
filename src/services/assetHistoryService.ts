// src/services/assetHistoryService.ts
import { db } from '../lib/db';
import type { SyncState } from './assetService';

export type HistoryAction = 'CREATED' | 'TRANSFERRED' | 'STATUS_CHANGED' | 'UPDATED';

// NEW: Interface to track the exact from/to values
export interface AssetHistoryChange {
    field: string;
    from: string | number | null;
    to: string | number | null;
}

export interface AssetHistory {
    id: string;
    assetId: string;
    action: HistoryAction;
    description: string;
    changes?: AssetHistoryChange[];
    date: string;

    syncState: string; // 'synced' | 'pending_create' | 'pending_update' | 'pending_delete'
}

export const assetHistoryService = {
    async getByAssetId(assetId: string): Promise<AssetHistory[]> {
        return await db.assetHistory
            .where('assetId')
            .equals(assetId)
            .reverse()
            .sortBy('date');
    }
};
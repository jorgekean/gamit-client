// src/services/assetHistoryService.ts
import { db } from './db';

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
    timestamp: string;
}

export const assetHistoryService = {
    async getByAssetId(assetId: string): Promise<AssetHistory[]> {
        return await db.assetHistory
            .where('assetId')
            .equals(assetId)
            .reverse()
            .sortBy('timestamp');
    }
};
// src/services/assetHistoryService.ts
import { api } from '../lib/api';

export type HistoryAction = 'CREATED' | 'TRANSFERRED' | 'STATUS_CHANGED' | 'UPDATED';

// Updated to track the exact from/to values AND the database UUIDs
export interface AssetHistoryChange {
    field: string;
    from: string | number | null;
    to: string | number | null;
    fromId?: string | null; // ✨ Captures the actual Employee/Dept UUID
    toId?: string | null;   // ✨ Captures the actual Employee/Dept UUID
}

export interface AssetHistory {
    id: string;
    assetId: string;
    action: HistoryAction;
    description: string;
    changes?: AssetHistoryChange[];
    date: string;
}

export const assetHistoryService = {
    async getByAssetId(assetId: string): Promise<AssetHistory[]> {
        const response = await api.get(`/asset-history/asset/${assetId}`);
        const fetchedHistory = response.data?.data || response.data || [];

        return [...fetchedHistory].sort((a: AssetHistory, b: AssetHistory) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }
};
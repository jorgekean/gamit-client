// src/services/assetHistoryService.ts
import { db } from '../lib/db';
import { api } from '../lib/api'; // ✨ Import your Axios instance

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
    syncState?: string; // 'synced' | 'pending_create' | 'pending_update' | 'pending_delete'
}

export const assetHistoryService = {
    async getByAssetId(assetId: string): Promise<AssetHistory[]> {

        // 1. Try fetching from the live API first
        if (navigator.onLine) {
            try {
                // Adjust the URL if your Fastify route is just `/asset-history/:assetId`
                const response = await api.get(`/asset-history/asset/${assetId}`);

                // Handle both wrapped { data: [...] } and raw array responses
                const fetchedHistory = response.data?.data || response.data;

                // 2. Cache Strategy: Save the fresh history to Dexie
                // Because history is immutable (we don't delete old logs), 
                // bulkPut safely overwrites existing IDs and adds new ones.
                const itemsToCache = fetchedHistory.map((h: AssetHistory) => ({
                    ...h,
                    syncState: 'synced'
                }));

                await db.assetHistory.bulkPut(itemsToCache);

                // Ensure it sorts newest-first before returning
                return fetchedHistory.sort((a: AssetHistory, b: AssetHistory) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );

            } catch (error) {
                console.warn('API fetch failed, falling back to local Dexie cache for history:', error);
            }
        }

        // --- 3. OFFLINE FALLBACK ---
        // If offline or the API fails, pull from the local IndexedDB
        return await db.assetHistory
            .where('assetId')
            .equals(assetId)
            .reverse() // Sorts newest first based on how it was inserted
            .sortBy('date');
    }
};
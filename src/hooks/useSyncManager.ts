import { useEffect } from 'react';
import { db } from '../lib/db';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function useSyncManager() {
    useEffect(() => {
        const syncPendingActions = async () => {
            // 1. Find all records that need syncing
            const pendingRecords = await db.assets.where('syncState').notEqual('synced').toArray();

            if (pendingRecords.length === 0) return;

            toast.info(`Syncing ${pendingRecords.length} offline changes...`);

            for (const record of pendingRecords) {
                try {
                    // Strip local-only fields before sending to API
                    const { id, syncState, ...payload } = record;

                    if (syncState === 'pending_create') {
                        const res = await api.post('/assets', payload);
                        await db.assets.delete(id); // Delete temp record
                        await db.assets.put({ ...res.data.data, syncState: 'synced' }); // Save real record
                    }
                    else if (syncState === 'pending_update') {
                        const res = await api.put(`/assets/${id}`, payload);
                        await db.assets.put({ ...res.data.data, syncState: 'synced' });
                    }
                    else if (syncState === 'pending_delete') {
                        await api.delete(`/assets/${id}`);
                        await db.assets.delete(id);
                    }
                } catch (error) {
                    console.error(`Failed to sync record ${record.id}`, error);
                    // Leave it in Dexie as pending to try again later
                }
            }

            toast.success('Offline changes synced successfully!');
            // You might want to trigger a global event here to tell your tables to refresh
            window.dispatchEvent(new Event('gamit-sync-complete'));
        };

        // Listen for the browser coming back online
        window.addEventListener('online', syncPendingActions);

        // Also try to sync once when the app first loads, just in case
        if (navigator.onLine) {
            syncPendingActions();
        }

        return () => window.removeEventListener('online', syncPendingActions);
    }, []);
}
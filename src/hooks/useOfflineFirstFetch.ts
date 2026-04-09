import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { api } from '../lib/api'; // Your Axios instance

export function useOfflineFirstFetch<T>(endpoint: string) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        // 1. Network listeners
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const syncData = async () => {
            try {
                // Step A: Immediately pull from Dexie for a 0-second loading screen
                const cached = await db.apiCache.get(endpoint);
                if (cached) {
                    setData(cached.data as T);
                    setIsLoading(false); // Stop the spinner immediately
                }

                // Step B: If we are online, silently fetch the freshest data from Fastify
                if (navigator.onLine) {
                    const response = await api.get(endpoint);
                    const freshData = response.data.data;

                    // Step C: Update React state...
                    setData(freshData);

                    // Step D: ...and overwrite the old Dexie cache with the new data
                    await db.apiCache.put({
                        endpoint: endpoint,
                        data: freshData,
                        updatedAt: Date.now() // Track when we last synced
                    });
                }
            } catch (error) {
                console.error(`Failed to sync data for ${endpoint}`, error);
            } finally {
                setIsLoading(false);
            }
        };

        syncData();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [endpoint]);

    return { data, isLoading, isOffline };
}
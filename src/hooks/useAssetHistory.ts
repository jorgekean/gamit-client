// src/hooks/useAssetHistory.ts
import { useState, useCallback } from 'react';
import { assetHistoryService, type AssetHistory } from '../services/assetHistoryService';

export function useAssetHistory() {
    const [history, setHistory] = useState<AssetHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = useCallback(async (assetId: string) => {
        setIsLoading(true);
        try {
            const data = await assetHistoryService.getByAssetId(assetId);
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { history, isLoading, fetchHistory };
}
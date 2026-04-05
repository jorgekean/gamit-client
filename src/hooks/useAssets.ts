// src/hooks/useAssets.ts
import { useState, useEffect, useCallback } from 'react';
import { assetService, type Asset } from '../services/assetService';

export function useAssets() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssets = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await assetService.getAll();
            setAssets(data);
        } catch (error) {
            console.error("Failed to fetch assets", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    return {
        assets,
        isLoading,
        refresh: fetchAssets,
        create: assetService.create,
        update: assetService.update,
        delete: assetService.softDelete,
        getById: assetService.getById
    };
}
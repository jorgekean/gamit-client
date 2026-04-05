// src/hooks/useAssets.ts
import { useState, useCallback, useEffect } from 'react';
import { assetService, type Asset, type AssetFilters } from '../services/assetService';

// src/hooks/useAssets.ts

export function useAssets() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Start as true

    const refresh = useCallback(async (filters?: AssetFilters) => {
        setIsLoading(true);
        try {
            const data = await assetService.getAll(filters);
            setAssets(data);
        } catch (error) {
            console.error("Failed to fetch assets", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add this Effect to ensure that components using this hook 
    // (like the Details Drawer) actually get data on mount.
    useEffect(() => {
        refresh();
    }, [refresh]);

    return { assets, isLoading, refresh, create: assetService.create, update: assetService.update, delete: assetService.softDelete, getById: assetService.getById };
}
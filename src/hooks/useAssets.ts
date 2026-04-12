// src/hooks/useAssets.ts
import { useState, useCallback, useEffect } from 'react';
import { assetService, type Asset, type AssetFilters } from '../services/assetService';
import { toast } from 'sonner';

export function useAssets(initialParams: AssetFilters = { page: 1, limit: 50 }) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [queryParams, setQueryParams] = useState<AssetFilters>(initialParams);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, meta: newMeta } = await assetService.getAll(queryParams);
            setAssets(data);
            if (newMeta) setMeta(newMeta);
        } catch (error) {
            console.error("Failed to fetch assets", error);
            toast.error("Failed to load assets from database.");
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]);

    // ✨ THE MAGIC FIX: Global Event Listener
    // This ensures that if the Drawer creates an asset, the List behind it updates automatically!
    useEffect(() => {
        refresh(); // Fetch on mount

        const handleSync = () => refresh();
        window.addEventListener('gamit-assets-updated', handleSync);

        return () => window.removeEventListener('gamit-assets-updated', handleSync);
    }, [refresh]);

    const createAsset = async (data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'syncState'>) => {
        const newAsset = await assetService.create(data);
        // Broadcast to the rest of the app that data has changed
        window.dispatchEvent(new Event('gamit-assets-updated'));
        return newAsset;
    };

    const updateAsset = async (id: string, data: Partial<Asset>) => {
        const updatedAsset = await assetService.update(id, data);
        window.dispatchEvent(new Event('gamit-assets-updated'));
        return updatedAsset;
    };

    const deleteAsset = async (id: string) => {
        await assetService.softDelete(id);
        window.dispatchEvent(new Event('gamit-assets-updated'));
    };

    return {
        assets,
        meta,
        isLoading,
        queryParams,
        setQueryParams,
        refresh,
        create: createAsset,
        update: updateAsset,
        delete: deleteAsset,
        getById: assetService.getById
    };
}
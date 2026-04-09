// src/hooks/useAssets.ts
import { useState, useCallback, useEffect } from 'react';
import { assetService, type Asset, type AssetFilters } from '../services/assetService';
import { toast } from 'sonner';

export function useAssets(initialParams: AssetFilters = { page: 1, limit: 50 }) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [queryParams, setQueryParams] = useState<AssetFilters>(initialParams);

    // 1. Updated Refresh to handle { data, meta }
    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, meta: newMeta } = await assetService.getAll(queryParams);
            setAssets(data);
            if (newMeta) setMeta(newMeta);
        } catch (error) {
            console.error("Failed to fetch assets", error);
            toast.error("Failed to load assets.");
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]); // Re-run if queryParams (like search or page) change

    useEffect(() => {
        refresh();
    }, [refresh]);

    // 2. Wrapped Create Method
    const createAsset = async (data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'syncState'>) => {
        try {
            const newAsset = await assetService.create(data);

            // Check if it was saved locally or to the server
            if (newAsset.syncState === 'pending_create') {
                toast.warning('Offline Mode: Asset saved locally. Will sync when online.');
            } else {
                toast.success('Asset created successfully!');
            }

            refresh(); // Refresh list to show the new asset
            return newAsset;
        } catch (error: any) {
            toast.error(error.message || 'Failed to create asset');
            throw error;
        }
    };

    // 3. Wrapped Update Method
    const updateAsset = async (id: string, data: Partial<Asset>) => {
        try {
            const updatedAsset = await assetService.update(id, data);

            if (updatedAsset.syncState === 'pending_update') {
                toast.warning('Offline Mode: Update saved locally.');
            } else {
                toast.success('Asset updated successfully!');
            }

            refresh();
            return updatedAsset;
        } catch (error: any) {
            toast.error(error.message || 'Failed to update asset');
            throw error;
        }
    };

    // 4. Wrapped Delete Method
    const deleteAsset = async (id: string) => {
        try {
            await assetService.softDelete(id);
            toast.success('Asset archived successfully');

            // Optimistic UI Update: Instantly remove it from the screen without waiting for refresh
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (error: any) {
            toast.error('Failed to remove asset');
            throw error;
        }
    };

    return {
        assets,
        meta,
        isLoading,
        queryParams,
        setQueryParams, // Export this so your UI search bar can update filters easily
        refresh,
        create: createAsset,
        update: updateAsset,
        delete: deleteAsset,
        getById: assetService.getById
    };
}
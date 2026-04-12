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
            toast.error("Failed to load assets.");
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const createAsset = async (data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
        try {
            const newAsset = await assetService.create(data);

            toast.success('Asset created successfully!');

            refresh();
            return newAsset;
        } catch (error: any) {
            toast.error(error.message || 'Failed to create asset');
            throw error;
        }
    };

    const updateAsset = async (id: string, data: Partial<Asset>) => {
        try {
            const updatedAsset = await assetService.update(id, data);

            toast.success('Asset updated successfully!');

            refresh();
            return updatedAsset;
        } catch (error: any) {
            toast.error(error.message || 'Failed to update asset');
            throw error;
        }
    };

    const deleteAsset = async (id: string) => {
        try {
            await assetService.softDelete(id);
            toast.success('Asset archived successfully');

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
        setQueryParams,
        refresh,
        create: createAsset,
        update: updateAsset,
        delete: deleteAsset,
        getById: assetService.getById
    };
}
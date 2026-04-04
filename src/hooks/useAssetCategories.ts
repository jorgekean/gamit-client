// src/hooks/useAssetCategories.ts
import { useState, useEffect, useCallback } from 'react';
import { assetCategoryService, type AssetCategory } from '../services/assetCategoryService';

export function useAssetCategories() {
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await assetCategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        isLoading,
        refresh: fetchCategories,
        create: assetCategoryService.create,
        update: assetCategoryService.update,
        delete: assetCategoryService.softDelete,
        getById: assetCategoryService.getById
    };
}
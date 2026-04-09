// src/services/assetCategoryService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';

export interface AssetCategory {
    id: string;
    code: string;           // e.g., "IT-EQP"
    name: string;           // e.g., "IT Equipment"
    usefulLifeYears: number; // e.g., 5 (for depreciation)
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export const assetCategoryService = {
    async getAll(): Promise<AssetCategory[]> {
        return await db.assetCategories
            .filter(cat => cat.deleted_at === null)
            .sortBy('name');
    },

    async getById(id: string): Promise<AssetCategory | undefined> {
        const cat = await db.assetCategories.get(id);
        if (cat && cat.deleted_at) return undefined;
        return cat;
    },

    async create(data: Omit<AssetCategory, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<AssetCategory> {
        const newCat: AssetCategory = {
            ...data,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };
        await db.assetCategories.add(newCat);
        return newCat;
    },

    async update(id: string, data: Partial<Omit<AssetCategory, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<AssetCategory> {
        const updatedData = {
            ...data,
            updated_at: new Date().toISOString(),
        };
        await db.assetCategories.update(id, updatedData);
        const updatedRecord = await db.assetCategories.get(id);
        if (!updatedRecord) throw new Error('Category not found after update');
        return updatedRecord;
    },

    async softDelete(id: string): Promise<void> {
        await db.assetCategories.update(id, {
            deleted_at: new Date().toISOString()
        });
    }
};
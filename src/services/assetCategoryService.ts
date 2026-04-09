// src/services/assetCategoryService.ts
import { api } from '../lib/api';

export interface AssetCategory {
    id: string;
    code: string;
    name: string;
    usefulLifeYears: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

function extractRows(payload: any): AssetCategory[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function extractOne(payload: any): AssetCategory | undefined {
    if (!payload) return undefined;
    if (payload.data && !Array.isArray(payload.data)) return payload.data as AssetCategory;
    if (payload.id && payload.code) return payload as AssetCategory;
    return undefined;
}

export const assetCategoryService = {
    async getAll(): Promise<AssetCategory[]> {
        const response = await api.get('/asset-categories', {
            params: {
                page: 1,
                limit: 1000,
            },
        });
        return extractRows(response.data);
    },

    async getById(id: string): Promise<AssetCategory | undefined> {
        const response = await api.get(`/asset-categories/${id}`);
        return extractOne(response.data);
    },

    async create(data: Omit<AssetCategory, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<AssetCategory> {
        const response = await api.post('/asset-categories', data);
        const created = extractOne(response.data);
        if (!created) throw new Error('Failed to parse created category from server response');
        return created;
    },

    async update(id: string, data: Partial<Omit<AssetCategory, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<AssetCategory> {
        const response = await api.put(`/asset-categories/${id}`, data);
        const updated = extractOne(response.data);
        if (!updated) throw new Error('Failed to parse updated category from server response');
        return updated;
    },

    async softDelete(id: string): Promise<void> {
        await api.delete(`/asset-categories/${id}`);
    }
};
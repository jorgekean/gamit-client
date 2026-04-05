// src/services/assetService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';

export type AssetStatus = 'Serviceable' | 'Unserviceable' | 'For Repair';

export interface Asset {
    id: string;
    propertyNo: string;
    name: string;
    categoryId: string;

    // Financials
    cost: number;
    dateAcquired: string;

    // Specs
    brand: string;
    model: string;
    serialNo: string;
    status: AssetStatus;

    // Assignment (Nullable if sitting in storage)
    departmentId: string | null;
    employeeId: string | null;

    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export const assetService = {
    async getAll(): Promise<Asset[]> {
        return await db.assets
            .filter(asset => asset.deleted_at === null)
            .reverse() // Newest first
            .sortBy('created_at');
    },

    async getById(id: string): Promise<Asset | undefined> {
        const asset = await db.assets.get(id);
        if (asset && asset.deleted_at) return undefined;
        return asset;
    },

    async create(data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Asset> {
        const newAsset: Asset = {
            ...data,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };
        await db.assets.add(newAsset);
        return newAsset;
    },

    async update(id: string, data: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Asset> {
        const updatedData = { ...data, updated_at: new Date().toISOString() };
        await db.assets.update(id, updatedData);
        const updatedRecord = await db.assets.get(id);
        if (!updatedRecord) throw new Error('Asset not found');
        return updatedRecord;
    },

    async softDelete(id: string): Promise<void> {
        await db.assets.update(id, { deleted_at: new Date().toISOString() });
    }
};
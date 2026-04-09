// src/services/db.ts
import Dexie, { type Table } from 'dexie';
import type { Department } from '../services/departmentService';
import type { Employee } from '../services/employeeService';
import type { AssetCategory } from '../services/assetCategoryService';
import type { Asset } from '../services/assetService';
import type { AssetHistory } from '../services/assetHistoryService';

// ✨ 1. Define the shape of our API Cache records
export interface CacheRecord {
    endpoint: string; // The primary key (e.g., '/api/dashboard/stats')
    data: any;        // The actual JSON response from Fastify
    updatedAt: number;// Timestamp to track data freshness
}

export class GamitDatabase extends Dexie {
    departments!: Table<Department>;
    employees!: Table<Employee>;
    assetCategories!: Table<AssetCategory>;
    assets!: Table<Asset>;
    assetHistory!: Table<AssetHistory>;
    apiCache!: Table<CacheRecord, string>; // ✨ 2. Add the new API Cache table

    constructor() {
        super('GamitDB');

        // ✨ 3. Bump version to 6 to safely apply the new table
        this.version(6).stores({
            departments: 'id, &code, name, deleted_at',
            employees: 'id, &employeeNo, firstName, lastName, departmentId, deleted_at',
            assetCategories: 'id, &code, name, deleted_at',
            assets: 'id, &propertyNo, categoryId, departmentId, employeeId, status, deleted_at',
            assetHistory: 'id, assetId, action, timestamp',
            apiCache: 'endpoint' // ✨ 4. Index only by endpoint for lightning-fast lookups
        });
    }
}

export const db = new GamitDatabase();
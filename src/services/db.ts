// src/services/db.ts
import Dexie, { type Table } from 'dexie';
import type { Department } from './departmentService';
import type { Employee } from './employeeService';
import type { AssetCategory } from './assetCategoryService';
import type { Asset } from './assetService';
import type { AssetHistory } from './assetHistoryService'; // <-- We will create this

export class GamitDatabase extends Dexie {
    departments!: Table<Department>;
    employees!: Table<Employee>;
    assetCategories!: Table<AssetCategory>;
    assets!: Table<Asset>;
    assetHistory!: Table<AssetHistory>; // <-- Add the history table

    constructor() {
        super('GamitDB');

        // Bump version to 5
        this.version(5).stores({
            departments: 'id, &code, name, deleted_at',
            employees: 'id, &employeeNo, firstName, lastName, departmentId, deleted_at',
            assetCategories: 'id, &code, name, deleted_at',
            assets: 'id, &propertyNo, categoryId, departmentId, employeeId, status, deleted_at',
            assetHistory: 'id, assetId, action, timestamp' // <-- Index assetId for fast timeline lookups
        });
    }
}

export const db = new GamitDatabase();
// src/services/db.ts
import Dexie, { type Table } from 'dexie';
import type { Department } from './departmentService';
import type { Employee } from './employeeService';
import type { AssetCategory } from './assetCategoryService';
import type { Asset } from './assetService'; // <-- We will create this next

export class GamitDatabase extends Dexie {
    departments!: Table<Department>;
    employees!: Table<Employee>;
    assetCategories!: Table<AssetCategory>;
    assets!: Table<Asset>; // <-- Add the assets table

    constructor() {
        super('GamitDB');

        // Bump version to 4
        this.version(4).stores({
            departments: 'id, &code, name, deleted_at',
            employees: 'id, &employeeNo, firstName, lastName, departmentId, deleted_at',
            assetCategories: 'id, &code, name, deleted_at',
            // Index the foreign keys for fast filtering later
            assets: 'id, &propertyNo, categoryId, departmentId, employeeId, status, deleted_at'
        });
    }
}

export const db = new GamitDatabase();
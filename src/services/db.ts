// src/services/db.ts
import Dexie, { type Table } from 'dexie';
import type { Department } from './departmentService';
import type { Employee } from './employeeService';
import type { AssetCategory } from './assetCategoryService'; // <-- We will create this next

export class GamitDatabase extends Dexie {
    departments!: Table<Department>;
    employees!: Table<Employee>;
    assetCategories!: Table<AssetCategory>; // <-- Add table

    constructor() {
        super('GamitDB');

        // Bump version to 3 and add the new table schema
        this.version(3).stores({
            departments: 'id, &code, name, deleted_at',
            employees: 'id, &employeeNo, firstName, lastName, departmentId, deleted_at',
            assetCategories: 'id, &code, name, deleted_at' // <-- New schema
        });
    }
}

export const db = new GamitDatabase();
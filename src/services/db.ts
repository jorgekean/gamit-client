// src/services/db.ts
import Dexie, { type Table } from 'dexie';
import type { Department } from './departmentService';
import type { Employee } from './employeeService';

export class GamitDatabase extends Dexie {
    departments!: Table<Department>;
    employees!: Table<Employee>;

    constructor() {
        super('GamitDB');

        // Version 2: Added the employees table
        this.version(2).stores({
            departments: 'id, &code, name, deleted_at',
            // We index departmentId so we can quickly find all employees in a specific department later
            employees: 'id, &employeeNo, firstName, lastName, departmentId, deleted_at'
        });
    }
}

export const db = new GamitDatabase();
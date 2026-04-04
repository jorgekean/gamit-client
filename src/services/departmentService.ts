// src/services/departmentService.ts
import Dexie, { type Table } from 'dexie';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

// 1. Our standard TypeScript interface
export interface Department {
    id: string;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}


// 4. The Service Object (The API remains exactly the same!)
export const departmentService = {
    async getAll(): Promise<Department[]> {
        // Dexie makes filtering out soft-deletes and sorting incredibly easy
        return await db.departments
            .filter(dept => dept.deleted_at === null)
            .sortBy('name');
    },

    async getById(id: string): Promise<Department | undefined> {
        const dept = await db.departments.get(id);
        if (dept && dept.deleted_at) return undefined;
        return dept;
    },

    async create(data: Omit<Department, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Department> {
        const newDept: Department = {
            ...data,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };

        await db.departments.add(newDept);
        return newDept;
    },

    async update(id: string, data: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Department> {
        // Dexie's update method only touches the fields you pass it
        const updatedData = {
            ...data,
            updated_at: new Date().toISOString(),
        };

        await db.departments.update(id, updatedData);

        // Fetch and return the fresh record
        const updatedRecord = await db.departments.get(id);
        if (!updatedRecord) throw new Error('Department not found after update');
        return updatedRecord;
    },

    async softDelete(id: string): Promise<void> {
        // A soft delete is just an update to the deleted_at timestamp
        await db.departments.update(id, {
            deleted_at: new Date().toISOString()
        });
    }
};
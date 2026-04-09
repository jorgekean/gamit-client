// src/services/employeeService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';

export interface Employee {
    id: string;
    employeeNo: string; // e.g., EMP-2024-001
    firstName: string;
    lastName: string;
    position: string;   // e.g., "Administrative Officer"
    departmentId: string; // The foreign key linking to Departments
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export const employeeService = {
    async getAll(): Promise<Employee[]> {
        return await db.employees
            .filter(emp => emp.deleted_at === null)
            .sortBy('lastName'); // Sort alphabetically by last name
    },

    async getById(id: string): Promise<Employee | undefined> {
        const emp = await db.employees.get(id);
        if (emp && emp.deleted_at) return undefined;
        return emp;
    },

    async create(data: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Employee> {
        const newEmp: Employee = {
            ...data,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };
        await db.employees.add(newEmp);
        return newEmp;
    },

    async update(id: string, data: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Employee> {
        const updatedData = {
            ...data,
            updated_at: new Date().toISOString(),
        };
        await db.employees.update(id, updatedData);
        const updatedRecord = await db.employees.get(id);
        if (!updatedRecord) throw new Error('Employee not found after update');
        return updatedRecord;
    },

    async softDelete(id: string): Promise<void> {
        await db.employees.update(id, {
            deleted_at: new Date().toISOString()
        });
    }
};
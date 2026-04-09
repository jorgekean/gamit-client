// src/services/employeeService.ts
import { api } from '../lib/api';

export interface Employee {
    id: string;
    employeeNo: string;
    firstName: string;
    lastName: string;
    position: string;
    departmentId: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

function extractRows(payload: any): Employee[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function extractOne(payload: any): Employee | undefined {
    if (!payload) return undefined;
    if (payload.data && !Array.isArray(payload.data)) return payload.data as Employee;
    if (payload.id && payload.employeeNo) return payload as Employee;
    return undefined;
}

export const employeeService = {
    async getAll(): Promise<Employee[]> {
        const response = await api.get('/employees', {
            params: { page: 1, limit: 1000 },
        });
        return extractRows(response.data);
    },

    async getById(id: string): Promise<Employee | undefined> {
        const response = await api.get(`/employees/${id}`);
        return extractOne(response.data);
    },

    async create(data: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Employee> {
        const response = await api.post('/employees', data);
        const created = extractOne(response.data);
        if (!created) throw new Error('Failed to parse created employee from server response');
        return created;
    },

    async update(id: string, data: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Employee> {
        const response = await api.put(`/employees/${id}`, data);
        const updated = extractOne(response.data);
        if (!updated) throw new Error('Failed to parse updated employee from server response');
        return updated;
    },

    async softDelete(id: string): Promise<void> {
        await api.delete(`/employees/${id}`);
    }
};
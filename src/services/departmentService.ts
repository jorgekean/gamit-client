// src/services/departmentService.ts
import { api } from '../lib/api';

export interface Department {
    id: string;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

function extractRows(payload: any): Department[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function extractOne(payload: any): Department | undefined {
    if (!payload) return undefined;
    if (payload.data && !Array.isArray(payload.data)) return payload.data as Department;
    if (payload.id && payload.code) return payload as Department;
    return undefined;
}

export const departmentService = {
    async getAll(): Promise<Department[]> {
        const response = await api.get('/departments', {
            params: { page: 1, limit: 1000 },
        });
        return extractRows(response.data);
    },

    async getById(id: string): Promise<Department | undefined> {
        const response = await api.get(`/departments/${id}`);
        return extractOne(response.data);
    },

    async create(data: Omit<Department, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Department> {
        const response = await api.post('/departments', data);
        const created = extractOne(response.data);
        if (!created) throw new Error('Failed to parse created department from server response');
        return created;
    },

    async update(id: string, data: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Department> {
        const response = await api.put(`/departments/${id}`, data);
        const updated = extractOne(response.data);
        if (!updated) throw new Error('Failed to parse updated department from server response');
        return updated;
    },

    async softDelete(id: string): Promise<void> {
        await api.delete(`/departments/${id}`);
    }
};
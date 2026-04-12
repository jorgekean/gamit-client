// src/services/assetService.ts
import { v4 as uuidv4 } from 'uuid';
import { api } from '../lib/api';
import type { HistoryAction } from './assetHistoryService';

export type AssetStatus = 'Serviceable' | 'Unserviceable' | 'For Repair';

export interface Asset {
    id: string;
    propertyNo: string;
    name: string;
    categoryId: string;
    cost: number;
    dateAcquired: string;
    brand: string;
    model: string;
    serialNo: string;
    status: AssetStatus;
    departmentId: string | null;
    employeeId: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AssetFilters {
    search?: string;
    departmentId?: string | null;
    employeeId?: string | null;
    status?: string | null;
    categoryId?: string | null;
    page?: number;
    limit?: number;
}

function extractRows(payload: any): Asset[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function extractOne(payload: any): Asset | undefined {
    if (!payload) return undefined;
    if (payload.data && !Array.isArray(payload.data)) return payload.data as Asset;
    if (payload.id && payload.propertyNo) return payload as Asset;
    return undefined;
}

export const assetService = {
    async getAll(filters?: AssetFilters) {
        const response = await api.get('/assets', {
            params: {
                page: filters?.page,
                limit: filters?.limit,
                search: filters?.search,
                status: filters?.status,
                departmentId: filters?.departmentId,
                categoryId: filters?.categoryId,
                employeeId: filters?.employeeId,
            },
        });

        return {
            data: extractRows(response.data),
            meta: response.data?.meta,
        };
    },

    async getById(id: string): Promise<Asset | undefined> {
        const response = await api.get(`/assets/${id}`);
        return extractOne(response.data);
    },

    async create(data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Asset> {
        const assetResponse = await api.post('/assets', data);
        const createdAsset = extractOne(assetResponse.data);

        if (!createdAsset) {
            throw new Error('Failed to parse created asset from server response');
        }

        const historyRecord = {
            id: uuidv4(),
            assetId: createdAsset.id,
            action: 'CREATED' as HistoryAction,
            description: 'Asset officially registered into the Gamit system.',
            date: new Date().toISOString(),
        };

        await api.post('/asset-history', historyRecord);

        return createdAsset;
    },

    async update(id: string, data: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Asset> {
        const oldAsset = await this.getById(id);
        if (!oldAsset) throw new Error('Asset not found');

        const normalizeForeignKey = (value: unknown): string | null | undefined => {
            if (value === undefined) return undefined;
            if (value === null || value === '') return null;
            if (typeof value === 'string') return value;
            if (typeof value === 'object') {
                const maybeId = (value as { id?: unknown }).id;
                if (typeof maybeId === 'string') return maybeId;
            }
            return undefined;
        };

        // --- Name Resolvers ---
        const resolveDepartmentName = async (value: unknown): Promise<string> => {
            const id = normalizeForeignKey(value);
            if (!id) return 'Unassigned';

            try {
                const res = await api.get(`/departments/${id}`);
                const dept = res.data?.data || res.data;
                if (dept?.name) return dept.name;
            } catch {
                return 'Unknown';
            }

            return 'Unknown';
        };

        const resolveEmployeeName = async (value: unknown): Promise<string> => {
            const id = normalizeForeignKey(value);
            if (!id) return 'Unassigned';

            try {
                const res = await api.get(`/employees/${id}`);
                const emp = res.data?.data || res.data;
                if (emp?.firstName) return `${emp.firstName} ${emp.lastName}`;
            } catch {
                return 'Unknown';
            }

            return 'Unknown';
        };

        const resolveCategoryName = async (value: unknown): Promise<string> => {
            const id = normalizeForeignKey(value);
            if (!id) return 'Unknown';

            try {
                const res = await api.get(`/asset-categories/${id}`);
                const cat = res.data?.data || res.data;
                if (cat?.name) return cat.name;
            } catch {
                return 'Unknown';
            }

            return 'Unknown';
        };

        const normalizedData: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>> = {
            ...data,
            categoryId: normalizeForeignKey((data as any).categoryId) ?? undefined,
            departmentId: normalizeForeignKey((data as any).departmentId),
            employeeId: normalizeForeignKey((data as any).employeeId),
        };

        const allowedFields: Array<keyof Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>> = [
            'propertyNo', 'name', 'categoryId', 'cost', 'dateAcquired',
            'brand', 'model', 'serialNo', 'status', 'departmentId', 'employeeId',
        ];

        const cleanData: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>> = {};
        for (const field of allowedFields) {
            const value = normalizedData[field];
            if (value !== undefined) cleanData[field] = value as any;
        }

        const updatedData = { ...cleanData, updated_at: new Date().toISOString() };

        const changes: { field: string; from: any; to: any; fromId?: string | null; toId?: string | null }[] = [];
        let action: 'TRANSFERRED' | 'STATUS_CHANGED' | 'UPDATED' = 'UPDATED';

        const fieldLabels: Record<string, string> = {
            propertyNo: 'Property No.', name: 'Asset Name', cost: 'Acquisition Cost',
            dateAcquired: 'Date Acquired', brand: 'Brand', model: 'Model',
            serialNo: 'Serial No.', status: 'Condition', departmentId: 'Department',
            employeeId: 'Accountable Officer', categoryId: 'Category'
        };

        const ignoredFields = ['id', 'created_at', 'updated_at', 'deleted_at'];

        for (const key of Object.keys(cleanData) as Array<keyof typeof cleanData>) {
            if (ignoredFields.includes(key)) continue;

            const oldVal = oldAsset[key];
            const newVal = cleanData[key];
            const isForeignKeyField = key === 'departmentId' || key === 'employeeId' || key === 'categoryId';

            // These contain the actual database UUIDs
            const comparableOldVal = isForeignKeyField ? normalizeForeignKey(oldVal) : oldVal;
            const comparableNewVal = isForeignKeyField ? normalizeForeignKey(newVal) : newVal;

            if (comparableOldVal !== comparableNewVal) {
                let fromVal: any = comparableOldVal || 'N/A';
                let toVal: any = comparableNewVal || 'N/A';
                let fromId: string | null | undefined;
                let toId: string | null | undefined;

                if (key === 'departmentId') {
                    fromVal = await resolveDepartmentName(oldVal);
                    toVal = await resolveDepartmentName(newVal);
                    action = 'TRANSFERRED';
                }
                else if (key === 'employeeId') {
                    fromVal = await resolveEmployeeName(oldVal);
                    toVal = await resolveEmployeeName(newVal);
                    fromId = comparableOldVal as string | null;
                    toId = comparableNewVal as string | null;
                    action = 'TRANSFERRED';
                }
                else if (key === 'categoryId') {
                    fromVal = await resolveCategoryName(oldVal);
                    toVal = await resolveCategoryName(newVal);
                }
                else if (key === 'cost') {
                    fromVal = `₱${comparableOldVal}`;
                    toVal = `₱${comparableNewVal}`;
                }
                else if (key === 'status') {
                    action = 'STATUS_CHANGED';
                }

                changes.push({
                    field: fieldLabels[key] || key,
                    from: fromVal,
                    to: toVal,
                    ...(fromId !== undefined && { fromId }),
                    ...(toId !== undefined && { toId })
                });
            }
        }

        let historyRecord = null;

        if (changes.length > 0) {
            let description = 'Asset details were modified.';
            if (action === 'TRANSFERRED') description = 'Accountability or location was reassigned.';
            if (action === 'STATUS_CHANGED') description = 'Physical condition was updated.';

            historyRecord = {
                id: uuidv4(),
                assetId: id,
                action,
                description,
                changes,
                date: new Date().toISOString(),
            };
        }

        const response = await api.put(`/assets/${id}`, updatedData);

        if (historyRecord) {
            await api.post('/asset-history', historyRecord);
        }

        return extractOne(response.data) ?? { ...oldAsset, ...updatedData };
    },

    async softDelete(id: string): Promise<void> {
        await api.delete(`/assets/${id}`);
    }
};
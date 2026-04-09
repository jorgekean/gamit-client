// src/services/assetService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import { api } from '../lib/api'; // ✨ Import your Axios instance
import type { HistoryAction } from './assetHistoryService';

export type AssetStatus = 'Serviceable' | 'Unserviceable' | 'For Repair';
export type SyncState = 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';

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
    syncState?: SyncState; // ✨ Added SyncState
}

export interface AssetFilters {
    search?: string;
    departmentId?: string | null;
    employeeId?: string | null;
    status?: string | null;
    categoryId?: string | null;
    page?: number; // Added for server-side pagination
    limit?: number;
}

export const assetService = {
    // --- READ ---
    async getAll(filters?: AssetFilters) {
        if (navigator.onLine) {
            try {
                // 1. Fetch from Server
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
                const { data, meta } = response.data;

                // 2. Cache Strategy (Only cache page 1, max 50 items)
                if (!filters?.page || filters.page === 1) {
                    // Clear out old 'synced' items to prevent DB bloat
                    await db.assets.where('syncState').equals('synced').delete();

                    // Save the fresh items
                    const itemsToCache = data.map((a: Asset) => ({ ...a, syncState: 'synced' }));
                    await db.assets.bulkPut(itemsToCache);
                }
                return { data, meta };
            } catch (error) {
                console.warn('API fetch failed, falling back to local Dexie cache');
            }
        }

        // --- OFFLINE FALLBACK ---
        let results = await db.assets.toCollection().reverse().sortBy('created_at');

        results = results.filter(asset => {
            // Hide soft-deleted AND pending_delete items from the UI
            const isNotDeleted = asset.deleted_at === null && asset.syncState !== 'pending_delete';

            if (filters) {
                const { search, departmentId, employeeId, status, categoryId } = filters;
                const matchesSearch = !search ||
                    asset.name.toLowerCase().includes(search.toLowerCase()) ||
                    asset.propertyNo.toLowerCase().includes(search.toLowerCase());
                const matchesDept = !departmentId || asset.departmentId === departmentId;
                const matchesEmp = !employeeId || asset.employeeId === employeeId;
                const matchesStatus = !status || asset.status === status;
                const matchesCat = !categoryId || asset.categoryId === categoryId;

                return isNotDeleted && matchesSearch && matchesDept && matchesEmp && matchesStatus && matchesCat;
            }
            return isNotDeleted;
        });

        return { data: results, meta: { total: results.length, page: 1, totalPages: 1 } };
    },

    async getById(id: string): Promise<Asset | undefined> {
        // Try to get the freshest data if online
        if (navigator.onLine) {
            try {
                const res = await api.get(`/assets/${id}`);
                return res.data.data;
            } catch (error) {
                // Ignore and fall back to Dexie
            }
        }
        const asset = await db.assets.get(id);
        if (asset && (asset.deleted_at || asset.syncState === 'pending_delete')) return undefined;
        return asset;
    },

    // --- CREATE ---
    async create(data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'syncState'>): Promise<Asset> {
        const newAsset: Asset = {
            ...data,
            id: uuidv4(), // ✨ Client-side UUID generation!
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            syncState: 'pending_create'
        };

        const historyRecord = {
            id: uuidv4(),
            assetId: newAsset.id,
            action: 'CREATED' as HistoryAction,
            description: 'Asset officially registered into the Gamit system.',
            date: new Date().toISOString(),
            syncState: 'pending_create' // Tag history for syncing too
        };

        // 1. Save locally immediately (Optimistic UI)
        await db.assets.add(newAsset);
        await db.assetHistory.add(historyRecord);

        // 2. Try to sync to server
        if (navigator.onLine) {
            try {
                await api.post('/assets', newAsset);
                await api.post('/history', historyRecord); // Assumes you have a generic history endpoint

                // Success! Mark as synced.
                await db.assets.update(newAsset.id, { syncState: 'synced' });
                await db.assetHistory.update(historyRecord.id, { syncState: 'synced' });
                newAsset.syncState = 'synced';
            } catch (error) {
                console.warn('Failed to sync create. Queued in Dexie.');
            }
        }

        return newAsset;
    },

    // --- UPDATE (With Diff Engine) ---
    async update(id: string, data: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'syncState'>>): Promise<Asset> {
        const oldAsset = await db.assets.get(id);
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

        const resolveDepartmentName = async (value: unknown): Promise<string> => {
            if (value === null || value === '') return 'Unassigned';
            if (typeof value === 'object' && value !== null) {
                const objName = (value as { name?: unknown }).name;
                if (typeof objName === 'string' && objName.trim()) return objName;
            }

            const id = normalizeForeignKey(value);
            if (!id) return 'Unassigned';

            if (navigator.onLine) {
                try {
                    const res = await api.get(`/departments/${id}`);
                    const dept = res.data?.data ?? res.data;
                    if (dept?.name) return dept.name;
                } catch {
                    // Fall back to local cache below
                }
            }

            const local = await db.departments.get(id);
            return local?.name || 'Unknown';
        };

        const resolveEmployeeName = async (value: unknown): Promise<string> => {
            if (value === null || value === '') return 'Unassigned';
            if (typeof value === 'object' && value !== null) {
                const firstName = (value as { firstName?: unknown }).firstName;
                const lastName = (value as { lastName?: unknown }).lastName;
                if (typeof firstName === 'string' && typeof lastName === 'string') {
                    const full = `${firstName} ${lastName}`.trim();
                    if (full) return full;
                }
                const objName = (value as { name?: unknown }).name;
                if (typeof objName === 'string' && objName.trim()) return objName;
            }

            const id = normalizeForeignKey(value);
            if (!id) return 'Unassigned';

            if (navigator.onLine) {
                try {
                    const res = await api.get(`/employees/${id}`);
                    const emp = res.data?.data ?? res.data;
                    if (emp?.firstName && emp?.lastName) return `${emp.firstName} ${emp.lastName}`;
                } catch {
                    // Fall back to local cache below
                }
            }

            const local = await db.employees.get(id);
            return local ? `${local.firstName} ${local.lastName}` : 'Unknown';
        };

        const resolveCategoryName = async (value: unknown): Promise<string> => {
            if (value === null || value === '') return 'Unknown';
            if (typeof value === 'object' && value !== null) {
                const objName = (value as { name?: unknown }).name;
                if (typeof objName === 'string' && objName.trim()) return objName;
            }

            const id = normalizeForeignKey(value);
            if (!id) return 'Unknown';

            if (navigator.onLine) {
                try {
                    const res = await api.get(`/asset-categories/${id}`);
                    const category = res.data?.data ?? res.data;
                    if (category?.name) return category.name;
                } catch {
                    // Fall back to local cache below
                }
            }

            const local = await db.assetCategories.get(id);
            return local?.name || 'Unknown';
        };

        const normalizedData: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'syncState'>> = {
            ...data,
            categoryId: normalizeForeignKey((data as any).categoryId) ?? undefined,
            departmentId: normalizeForeignKey((data as any).departmentId),
            employeeId: normalizeForeignKey((data as any).employeeId),
        };

        const allowedFields: Array<keyof Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'syncState'>> = [
            'propertyNo',
            'name',
            'categoryId',
            'cost',
            'dateAcquired',
            'brand',
            'model',
            'serialNo',
            'status',
            'departmentId',
            'employeeId',
        ];

        const cleanData: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'syncState'>> = {};
        for (const field of allowedFields) {
            const value = normalizedData[field];
            if (value !== undefined) {
                cleanData[field] = value as any;
            }
        }

        const updatedData = { ...cleanData, updated_at: new Date().toISOString() };

        // Determine if it was already pending creation
        const newSyncState = oldAsset.syncState === 'pending_create' ? 'pending_create' : 'pending_update';

        // 1. Update Asset locally
        await db.assets.update(id, { ...updatedData, syncState: newSyncState });

        // --- THE DYNAMIC DIFF ENGINE ---
        const changes: { field: string; from: any; to: any }[] = [];
        let action: 'TRANSFERRED' | 'STATUS_CHANGED' | 'UPDATED' = 'UPDATED';

        const fieldLabels: Record<string, string> = {
            propertyNo: 'Property No.', name: 'Asset Name', cost: 'Acquisition Cost',
            dateAcquired: 'Date Acquired', brand: 'Brand', model: 'Model',
            serialNo: 'Serial No.', status: 'Condition', departmentId: 'Department',
            employeeId: 'Accountable Officer', categoryId: 'Category'
        };

        const ignoredFields = ['id', 'created_at', 'updated_at', 'deleted_at', 'syncState'];

        for (const key of Object.keys(cleanData) as Array<keyof typeof cleanData>) {
            if (ignoredFields.includes(key)) continue;

            const oldVal = oldAsset[key];
            const newVal = cleanData[key];
            const isForeignKeyField = key === 'departmentId' || key === 'employeeId' || key === 'categoryId';
            const comparableOldVal = isForeignKeyField ? normalizeForeignKey(oldVal) : oldVal;
            const comparableNewVal = isForeignKeyField ? normalizeForeignKey(newVal) : newVal;

            if (comparableOldVal !== comparableNewVal) {
                let fromVal: any = comparableOldVal || 'N/A';
                let toVal: any = comparableNewVal || 'N/A';

                if (key === 'departmentId') {
                    fromVal = await resolveDepartmentName(oldVal);
                    toVal = await resolveDepartmentName(newVal);
                    action = 'TRANSFERRED';
                }
                else if (key === 'employeeId') {
                    fromVal = await resolveEmployeeName(oldVal);
                    toVal = await resolveEmployeeName(newVal);
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

                changes.push({ field: fieldLabels[key] || key, from: fromVal, to: toVal });
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
                changes, // Assuming your backend supports JSON arrays for changes
                date: new Date().toISOString(),
                syncState: 'pending_create' // History records are always "creates"
            };

            // Save history locally
            await db.assetHistory.add(historyRecord);
        }

        // 2. Try to sync to server
        if (navigator.onLine && oldAsset.syncState !== 'pending_create') {
            try {
                await api.put(`/assets/${id}`, updatedData);
                if (historyRecord) {
                    await api.post('/asset-history', historyRecord);
                }
                await db.assets.update(id, { syncState: 'synced' });
                if (historyRecord) await db.assetHistory.update(historyRecord.id, { syncState: 'synced' });
            } catch (error) {
                console.warn('Failed to sync update. Queued in Dexie.');
            }
        }

        const updatedRecord = await db.assets.get(id);
        return updatedRecord!;
    },

    // --- DELETE ---
    async softDelete(id: string): Promise<void> {
        const existing = await db.assets.get(id);
        if (!existing) return;

        // 1. Delete locally
        if (existing.syncState === 'pending_create') {
            // It never existed on the server, so erase it completely locally
            await db.assets.delete(id);
            return;
        } else {
            await db.assets.update(id, {
                deleted_at: new Date().toISOString(),
                syncState: 'pending_delete'
            });
        }

        // 2. Sync to server
        if (navigator.onLine) {
            try {
                await api.delete(`/assets/${id}`);
                await db.assets.delete(id); // Erase from local cache to keep it clean
            } catch (error) {
                console.warn('Failed to sync delete. Queued in Dexie.');
            }
        }
    }
};
// src/services/assetService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';

export type AssetStatus = 'Serviceable' | 'Unserviceable' | 'For Repair';

export interface Asset {
    id: string;
    propertyNo: string;
    name: string;
    categoryId: string;

    // Financials
    cost: number;
    dateAcquired: string;

    // Specs
    brand: string;
    model: string;
    serialNo: string;
    status: AssetStatus;

    // Assignment (Nullable if sitting in storage)
    departmentId: string | null;
    employeeId: string | null;

    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AssetFilters {
    searchTerm?: string;
    deptId?: string | null;
    employeeId?: string | null;
    status?: string | null;
    categoryId?: string | null;
}

export const assetService = {
    async getAll(filters?: AssetFilters): Promise<Asset[]> {
        const collection = db.assets.toCollection();
        let results = await collection.reverse().sortBy('created_at');

        // Filter the results
        results = results.filter(asset => {
            // CRITICAL: Only show records that have NOT been soft-deleted
            const isNotDeleted = asset.deleted_at === null;

            if (filters) {
                const { searchTerm, deptId, employeeId, status, categoryId } = filters;

                const matchesSearch = !searchTerm ||
                    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asset.propertyNo.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesDept = !deptId || asset.departmentId === deptId;
                const matchesEmp = !employeeId || asset.employeeId === employeeId;
                const matchesStatus = !status || asset.status === status;
                const matchesCat = !categoryId || asset.categoryId === categoryId;

                return isNotDeleted && matchesSearch && matchesDept && matchesEmp && matchesStatus && matchesCat;
            }

            // If no filters are provided, we still must check the deleted status
            return isNotDeleted;
        });

        return results;
    },

    async getById(id: string): Promise<Asset | undefined> {
        const asset = await db.assets.get(id);
        if (asset && asset.deleted_at) return undefined;
        return asset;
    },

    async create(data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Asset> {
        const newAsset: Asset = {
            ...data,
            id: uuidv4(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        };
        await db.assets.add(newAsset);

        // LOG: Creation Event
        await db.assetHistory.add({
            id: uuidv4(),
            assetId: newAsset.id,
            action: 'CREATED',
            description: 'Asset officially registered into the Gamit system.',
            timestamp: new Date().toISOString()
        });

        return newAsset;
    },

    async update(id: string, data: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Asset> {
        const oldAsset = await db.assets.get(id);
        if (!oldAsset) throw new Error('Asset not found');

        const updatedData = { ...data, updated_at: new Date().toISOString() };
        await db.assets.update(id, updatedData);

        // --- THE DYNAMIC DIFF ENGINE ---
        const changes: { field: string; from: any; to: any }[] = [];
        let action: 'TRANSFERRED' | 'STATUS_CHANGED' | 'UPDATED' = 'UPDATED';

        // 1. The Label Dictionary
        // Maps database keys to human-readable names. 
        // If you add a new field to your DB later and forget to add it here, 
        // the system will just use the raw key (e.g., "warrantyDate"), but it WILL still track it!
        const fieldLabels: Record<string, string> = {
            propertyNo: 'Property No.', name: 'Asset Name', cost: 'Acquisition Cost',
            dateAcquired: 'Date Acquired', brand: 'Brand', model: 'Model',
            serialNo: 'Serial No.', status: 'Condition', departmentId: 'Department',
            employeeId: 'Accountable Officer', categoryId: 'Category'
        };

        // Fields we NEVER want to log in the audit trail
        const ignoredFields = ['id', 'created_at', 'updated_at', 'deleted_at'];

        // 2. The Dynamic Loop
        // Iterate only over the keys that were actually passed in the update payload
        for (const key of Object.keys(data) as Array<keyof typeof data>) {
            if (ignoredFields.includes(key)) continue;

            const oldVal = oldAsset[key];
            const newVal = data[key];

            // If the value actually changed...
            if (oldVal !== newVal) {
                let fromVal: any = oldVal || 'N/A';
                let toVal: any = newVal || 'N/A';

                // --- Handle Special Cases (Foreign Keys & Formatting) ---

                if (key === 'departmentId') {
                    fromVal = oldVal ? (await db.departments.get(oldVal as string))?.name || 'Unknown' : 'Unassigned';
                    toVal = newVal ? (await db.departments.get(newVal as string))?.name || 'Unknown' : 'Unassigned';
                    action = 'TRANSFERRED';
                }
                else if (key === 'employeeId') {
                    const getEmp = async (empId: any) => {
                        if (!empId) return 'Unassigned';
                        const e = await db.employees.get(empId as string);
                        return e ? `${e.firstName} ${e.lastName}` : 'Unknown';
                    };
                    fromVal = await getEmp(oldVal);
                    toVal = await getEmp(newVal);
                    action = 'TRANSFERRED';
                }
                else if (key === 'categoryId') {
                    fromVal = oldVal ? (await db.assetCategories.get(oldVal as string))?.name || 'Unknown' : 'Unknown';
                    toVal = newVal ? (await db.assetCategories.get(newVal as string))?.name || 'Unknown' : 'Unknown';
                }
                else if (key === 'cost') {
                    fromVal = `₱${oldVal}`;
                    toVal = `₱${newVal}`;
                }
                else if (key === 'status') {
                    action = 'STATUS_CHANGED';
                }

                // Push the formatted difference to our ledger
                changes.push({
                    field: fieldLabels[key] || key, // Fallback to raw key if not in dictionary
                    from: fromVal,
                    to: toVal
                });
            }
        }

        // 3. Write to the Ledger (Only if something actually changed)
        if (changes.length > 0) {
            // Determine description based on the highest priority action
            let description = 'Asset details were modified.';
            if (action === 'TRANSFERRED') description = 'Accountability or location was reassigned.';
            if (action === 'STATUS_CHANGED') description = 'Physical condition was updated.';

            await db.assetHistory.add({
                id: uuidv4(),
                assetId: id,
                action,
                description,
                changes,
                timestamp: new Date().toISOString()
            });
        }

        const updatedRecord = await db.assets.get(id);
        return updatedRecord!;
    },

    async softDelete(id: string): Promise<void> {
        await db.assets.update(id, { deleted_at: new Date().toISOString() });
    }
};
import { useState, useCallback, useEffect } from 'react';
import { maintenanceApi, type MaintenanceRecord, type MaintenanceFilters } from '../services/maintenanceApi';
import { toast } from 'sonner';

export function useMaintenance(initialParams: MaintenanceFilters = { page: 1, limit: 50 }) {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [queryParams, setQueryParams] = useState<MaintenanceFilters>(initialParams);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, meta: newMeta } = await maintenanceApi.getAll(queryParams);
            setRecords(data);
            if (newMeta) setMeta(newMeta);
        } catch (error) {
            console.error("Failed to fetch maintenance records", error);
            toast.error("Failed to load maintenance tasks.");
        } finally {
            setIsLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        refresh(); // Fetch on mount

        const handleSync = () => refresh();
        window.addEventListener('gamit-maintenance-updated', handleSync);

        return () => window.removeEventListener('gamit-maintenance-updated', handleSync);
    }, [refresh]);

    return {
        records,
        meta,
        isLoading,
        queryParams,
        setQueryParams,
        refresh
    };
}

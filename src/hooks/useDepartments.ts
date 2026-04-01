// src/hooks/useDepartments.ts
import { useState, useEffect, useCallback } from 'react';
import { departmentService, type Department } from '../services/departmentService';

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDepartments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await departmentService.getAll();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return {
        departments,
        isLoading,
        refresh: fetchDepartments,
        // We expose the service methods here so the UI doesn't call them directly
        create: departmentService.create,
        update: departmentService.update,
        delete: departmentService.softDelete,
        getById: departmentService.getById
    };
}
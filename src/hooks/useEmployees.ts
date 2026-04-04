// src/hooks/useEmployees.ts
import { useState, useEffect, useCallback } from 'react';
import { employeeService, type Employee } from '../services/employeeService';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEmployees = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await employeeService.getAll();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return {
        employees,
        isLoading,
        refresh: fetchEmployees,
        create: employeeService.create,
        update: employeeService.update,
        delete: employeeService.softDelete,
        getById: employeeService.getById
    };
}
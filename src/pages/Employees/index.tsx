// src/pages/Employees/Employees.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';

import { useEmployees } from '../../hooks/useEmployees';
import { useDepartments } from '../../hooks/useDepartments'; // We need this for the dropdown!
import { useConfirm } from '../../contexts/ConfirmContext';
import { Drawer } from '../../components/ui/Drawer';
import { DataTable } from '../../components/ui/DataTable';
import type { Employee } from '../../services/employeeService';

export function Employees() {
    const { employees, isLoading: loadingEmps, refresh, create, update, delete: softDelete, getById } = useEmployees();
    const { departments, isLoading: loadingDepts } = useDepartments(); // Fetch departments for our UI

    const confirm = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();

    const action = searchParams.get('action');
    const targetId = searchParams.get('id');

    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const [formData, setFormData] = useState({
        employeeNo: '',
        firstName: '',
        lastName: '',
        position: '',
        departmentId: '',
    });

    // Derived state for search & pagination
    const filteredData = useMemo(() => {
        if (!searchTerm) return employees;
        const lower = searchTerm.toLowerCase();
        return employees.filter(e =>
            e.firstName.toLowerCase().includes(lower) ||
            e.lastName.toLowerCase().includes(lower) ||
            e.employeeNo.toLowerCase().includes(lower) ||
            e.position.toLowerCase().includes(lower)
        );
    }, [employees, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [searchTerm]);

    useEffect(() => {
        if (action === 'edit' && targetId) {
            getById(targetId).then(emp => {
                if (emp) setFormData({
                    employeeNo: emp.employeeNo,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    position: emp.position,
                    departmentId: emp.departmentId,
                });
            });
        } else {
            setFormData({ employeeNo: '', firstName: '', lastName: '', position: '', departmentId: '' });
        }
    }, [action, targetId, getById]);

    const closeDrawer = () => setSearchParams({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving employee...');

        try {
            if (action === 'new') {
                await create(formData);
                toast.success(`Employee ${formData.firstName} added!`, { id: toastId });
            } else if (action === 'edit' && targetId) {
                await update(targetId, formData);
                toast.success(`Employee updated!`, { id: toastId });
            }
            await refresh();
            closeDrawer();
        } catch (error) {
            toast.error('Failed to save employee.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: 'Remove Employee',
            description: `Are you sure you want to remove ${name}? Their historical records will be preserved.`,
            confirmText: 'Remove',
            intent: 'danger',
        });

        if (isConfirmed) {
            try {
                await softDelete(id);
                await refresh();
                toast.success('Employee removed.');
            } catch (error) {
                toast.error('Failed to remove employee.');
            }
        }
    };

    // Helper to get Department Name from ID
    const getDepartmentName = (deptId: string) => {
        const dept = departments.find(d => d.id === deptId);
        return dept ? dept.name : <span className="text-red-500 text-xs font-semibold">Unknown/Deleted</span>;
    };

    const columns = useMemo<ColumnDef<Employee>[]>(
        () => [
            {
                accessorKey: 'employeeNo',
                header: 'ID Number',
                cell: ({ row }) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{row.original.employeeNo}</span>,
            },
            {
                id: 'name',
                header: 'Full Name',
                cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.firstName} {row.original.lastName}</span>,
            },
            {
                accessorKey: 'position',
                header: 'Position',
                cell: ({ row }) => <span className="text-gray-700 dark:text-gray-300">{row.original.position}</span>,
            },
            {
                accessorKey: 'departmentId',
                header: 'Department',
                cell: ({ row }) => <span className="text-gray-600 dark:text-gray-400">{getDepartmentName(row.original.departmentId)}</span>,
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setSearchParams({ action: 'edit', id: row.original.id })}
                            className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                            title="Edit Employee"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id, `${row.original.firstName} ${row.original.lastName}`)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Remove Employee"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [setSearchParams, departments]
    );

    const isLoading = loadingEmps || loadingDepts;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Manage personnel and their assigned departments.</p>
                </div>
                <button
                    onClick={() => setSearchParams({ action: 'new' })}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Employee
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-surface)] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            {employees.length === 0 && !isLoading && !searchTerm ? (
                <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                    <Users className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No employees found.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Employee" to register personnel.</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    pageCount={Math.ceil(filteredData.length / pagination.pageSize)}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                />
            )}

            {/* Drawer */}
            <Drawer
                isOpen={!!action}
                onClose={closeDrawer}
                title={action === 'new' ? 'Add New Employee' : 'Edit Employee'}
            >
                <form onSubmit={handleSave} className="space-y-5">

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Employee ID</label>
                        <input
                            type="text"
                            required
                            value={formData.employeeNo}
                            onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value.toUpperCase() })}
                            placeholder="e.g. EMP-2024-001"
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all uppercase"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Position / Title</label>
                        <input
                            type="text"
                            required
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="e.g. IT Specialist II"
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Department</label>
                        <select
                            required
                            value={formData.departmentId}
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        >
                            <option value="" disabled>Select a department...</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.code} - {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-all"
                        >
                            {isSaving ? 'Saving...' : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </Drawer>

        </div>
    );
}
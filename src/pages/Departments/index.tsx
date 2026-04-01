import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Building2, Search } from 'lucide-react'; // <-- Added Search icon
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';

import { useDepartments } from '../../hooks/useDepartments';
import { useConfirm } from '../../contexts/ConfirmContext';
import { Drawer } from '../../components/ui/Drawer';
import { DataTable } from '../../components/ui/DataTable';
import type { Department } from '../../services/departmentService';

export function Departments() {
    const { departments, isLoading, refresh, create, update, delete: softDelete, getById } = useDepartments();
    const confirm = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();

    // URL State
    const action = searchParams.get('action');
    const targetId = searchParams.get('id');

    // Form & UI State
    const [formData, setFormData] = useState({ code: '', name: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // <-- Search State

    // Pagination State
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // --- DATA PIPELINE (Simulating a Backend) ---

    // 1. Filter the data based on the search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return departments;
        const lower = searchTerm.toLowerCase();
        return departments.filter(d =>
            d.name.toLowerCase().includes(lower) ||
            d.code.toLowerCase().includes(lower)
        );
    }, [departments, searchTerm]);

    // 2. Slice the data for the current page
    const paginatedData = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    // Reset to page 1 when the user types in the search box
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [searchTerm]);

    // --------------------------------------------

    // Populate form if editing
    useEffect(() => {
        if (action === 'edit' && targetId) {
            getById(targetId).then(dept => {
                if (dept) setFormData({ code: dept.code, name: dept.name });
            });
        } else {
            setFormData({ code: '', name: '' });
        }
    }, [action, targetId, getById]);

    // Actions
    const closeDrawer = () => setSearchParams({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving department...');

        try {
            if (action === 'new') {
                await create(formData);
                toast.success(`Department ${formData.code} created!`, { id: toastId });
            } else if (action === 'edit' && targetId) {
                await update(targetId, formData);
                toast.success(`Department updated!`, { id: toastId });
            }
            await refresh();
            closeDrawer();
        } catch (error) {
            toast.error('Failed to save department.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: 'Delete Department',
            description: `Are you sure you want to delete ${name}? This action cannot be undone.`,
            confirmText: 'Delete',
            intent: 'danger',
        });

        if (isConfirmed) {
            try {
                await softDelete(id);
                await refresh();
                toast.success('Department moved to trash.');
            } catch (error) {
                toast.error('Failed to delete department.');
            }
        }
    };

    // Define Columns
    const columns = useMemo<ColumnDef<Department>[]>(
        () => [
            {
                accessorKey: 'code',
                header: 'Code',
                cell: ({ row }) => <span className="font-mono font-medium text-gray-900 dark:text-gray-300">{row.original.code}</span>,
            },
            {
                accessorKey: 'name',
                header: 'Department Name',
                cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.name}</span>,
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setSearchParams({ action: 'edit', id: row.original.id })}
                            className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                            title="Edit Department"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id, row.original.name)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete Department"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [setSearchParams]
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Manage City Hall offices and structural units.</p>
                </div>
                <button
                    onClick={() => setSearchParams({ action: 'new' })}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Department
                </button>
            </div>

            {/* Controls Bar: Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-surface)] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                    />
                </div>
            </div>

            {/* Reusable Data Table */}
            {departments.length === 0 && !isLoading && !searchTerm ? (
                <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                    <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No departments found.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Department" to get started.</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={paginatedData} // <-- Pass the sliced/filtered data
                    pageCount={Math.ceil(filteredData.length / pagination.pageSize)} // <-- Calculate pages based on filtered results
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                />
            )}

            {/* Drawer */}
            <Drawer
                isOpen={!!action}
                onClose={closeDrawer}
                title={action === 'new' ? 'Add New Department' : 'Edit Department'}
            >
                <form onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Department Code</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g. MO, GSO, CEO"
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all uppercase"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Department Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Mayor's Office"
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
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
                            {isSaving ? 'Saving...' : 'Save Department'}
                        </button>
                    </div>
                </form>
            </Drawer>

        </div>
    );
}
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Building2, Search } from 'lucide-react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';

import { useConfirm } from '../../contexts/ConfirmContext';
import { Drawer } from '../../components/ui/Drawer';
import { DataTable } from '../../components/ui/DataTable';
import { api } from '../../lib/api';
import type { Department } from '../../services/departmentService';

export function Departments() {
    const confirm = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();

    const action = searchParams.get('action');
    const targetId = searchParams.get('id');

    const [formData, setFormData] = useState({ code: '', name: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageCount, setPageCount] = useState(1);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const fetchDepartments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/departments', {
                params: {
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    searchTerm: searchTerm || undefined,
                },
            });
            const payload = response.data;
            const rows: Department[] = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
            const meta = payload?.meta ?? {};
            setDepartments(rows);
            const total = typeof meta.total === 'number' ? meta.total : rows.length;
            setTotalRecords(total);
            setPageCount(typeof meta.totalPages === 'number' ? Math.max(1, meta.totalPages) : Math.max(1, Math.ceil(total / pagination.pageSize)));
        } catch (error) {
            setDepartments([]);
            setTotalRecords(0);
            setPageCount(1);
            toast.error('Failed to load departments from server.');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, searchTerm]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [searchTerm]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        if (action === 'edit' && targetId) {
            api.get(`/departments/${targetId}`)
                .then(res => {
                    const dept: Department | undefined = res.data?.data ?? (res.data?.id ? res.data : undefined);
                    if (dept) setFormData({ code: dept.code, name: dept.name });
                })
                .catch(() => {
                    toast.error('Failed to load department details.');
                    closeDrawer();
                });
        } else {
            setFormData({ code: '', name: '' });
        }
    }, [action, targetId]);

    const closeDrawer = () => setSearchParams({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving department...');

        try {
            const payload = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
            };
            if (action === 'new') {
                await api.post('/departments', payload);
                toast.success(`Department ${formData.code} created!`, { id: toastId });
            } else if (action === 'edit' && targetId) {
                await api.put(`/departments/${targetId}`, payload);
                toast.success(`Department updated!`, { id: toastId });
            }
            await fetchDepartments();
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
                await api.delete(`/departments/${id}`);
                await fetchDepartments();
                toast.success('Department deleted.');
            } catch (error) {
                toast.error('Failed to delete department.');
            }
        }
    };

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
                    <div className="flex items-center justify-end gap-2 transition-opacity hover-reveal">
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
                    data={departments}
                    pageCount={pageCount}
                    totalRecords={totalRecords}
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
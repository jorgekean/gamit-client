// src/pages/AssetCategories/AssetCategories.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Tags, Search } from 'lucide-react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';

import { useConfirm } from '../../contexts/ConfirmContext';
import { Drawer } from '../../components/ui/Drawer';
import { DataTable } from '../../components/ui/DataTable';
import { api } from '../../lib/api';
import type { AssetCategory } from '../../services/assetCategoryService';

export function AssetCategories() {
    const confirm = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();

    const action = searchParams.get('action');
    const targetId = searchParams.get('id');

    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageCount, setPageCount] = useState(1);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        usefulLifeYears: 5, // Default to 5 years
    });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/asset-categories', {
                params: {
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    searchTerm: searchTerm || undefined,
                },
            });

            const payload = response.data;
            const rows: AssetCategory[] = payload?.data ?? [];
            const meta = payload?.meta ?? {};

            setCategories(rows);
            const total = typeof meta.total === 'number' ? meta.total : rows.length;
            setTotalRecords(total);
            setPageCount(typeof meta.totalPages === 'number' ? Math.max(1, meta.totalPages) : Math.max(1, Math.ceil(total / pagination.pageSize)));
        } catch (error) {
            setCategories([]);
            setTotalRecords(0);
            setPageCount(1);
            toast.error('Failed to load categories from server.');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, searchTerm]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [searchTerm]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (action === 'edit' && targetId) {
            api.get(`/asset-categories/${targetId}`)
                .then(res => {
                    const cat: AssetCategory | undefined = res.data?.data;
                    if (cat) {
                        setFormData({
                            code: cat.code,
                            name: cat.name,
                            usefulLifeYears: cat.usefulLifeYears,
                        });
                    }
                })
                .catch(() => {
                    toast.error('Failed to load category details.');
                    closeDrawer();
                });
        } else {
            setFormData({ code: '', name: '', usefulLifeYears: 5 });
        }
    }, [action, targetId]);

    const closeDrawer = () => setSearchParams({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving category...');

        try {
            const payload = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                usefulLifeYears: formData.usefulLifeYears,
            };

            if (action === 'new') {
                await api.post('/asset-categories', payload);
                toast.success(`Category ${formData.code} added!`, { id: toastId });
            } else if (action === 'edit' && targetId) {
                await api.put(`/asset-categories/${targetId}`, payload);
                toast.success(`Category updated!`, { id: toastId });
            }
            await fetchCategories();
            closeDrawer();
        } catch (error) {
            toast.error('Failed to save category.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: 'Delete Category',
            description: `Are you sure you want to delete the ${name} category?`,
            confirmText: 'Delete',
            intent: 'danger',
        });

        if (isConfirmed) {
            try {
                await api.delete(`/asset-categories/${id}`);
                await fetchCategories();
                toast.success('Category removed.');
            } catch (error) {
                toast.error('Failed to delete category.');
            }
        }
    };

    const columns = useMemo<ColumnDef<AssetCategory>[]>(
        () => [
            {
                accessorKey: 'code',
                header: 'Code',
                cell: ({ row }) => <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-300">{row.original.code}</span>,
            },
            {
                accessorKey: 'name',
                header: 'Category Name',
                cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.name}</span>,
            },
            {
                accessorKey: 'usefulLifeYears',
                header: 'Useful Life',
                cell: ({ row }) => <span className="text-gray-600 dark:text-gray-400">{row.original.usefulLifeYears} Years</span>,
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2 transition-opacity hover-reveal">
                        <button
                            onClick={() => setSearchParams({ action: 'edit', id: row.original.id })}
                            className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                            title="Edit Category"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id, row.original.name)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete Category"
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Categories</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Manage COA property classifications and depreciation rules.</p>
                </div>
                <button
                    onClick={() => setSearchParams({ action: 'new' })}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
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
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            {categories.length === 0 && !isLoading && !searchTerm ? (
                <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                    <Tags className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No categories found.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Category" to set up your classifications.</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={categories}
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
                title={action === 'new' ? 'Add Asset Category' : 'Edit Asset Category'}
            >
                <form onSubmit={handleSave} className="space-y-5">

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Category Code</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g. IT-EQP"
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all uppercase"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Category Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. IT Equipment and Software"
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Estimated Useful Life (Years)</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            required
                            value={formData.usefulLifeYears}
                            onChange={(e) => setFormData({ ...formData, usefulLifeYears: parseInt(e.target.value) || 0 })}
                            className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used by COA guidelines to calculate annual depreciation.</p>
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
                            {isSaving ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </Drawer>

        </div>
    );
}
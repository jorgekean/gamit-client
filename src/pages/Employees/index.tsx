// src/pages/employees/Employees.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Package, Users } from 'lucide-react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';

// Hooks (Updated paths)
import { useEmployees } from '../../hooks/useEmployees';
import { useDepartments } from '../../hooks/useDepartments';
import { useAssets } from '../../hooks/useAssets';
import { useConfirm } from '../../contexts/ConfirmContext';

// Components & Services (Updated paths)
import { Drawer } from '../../components/ui/Drawer';
import { DataTable } from '../../components/ui/DataTable';
import type { Employee } from '../../services/employeeService';

export function Employees() {
    const { employees, isLoading: loadingEmployees, refresh, create, update, delete: softDelete, getById } = useEmployees();
    const { departments } = useDepartments();
    const { assets } = useAssets();
    const confirm = useConfirm();

    const [searchParams, setSearchParams] = useSearchParams();
    const action = searchParams.get('action');
    const targetId = searchParams.get('id');
    const viewAssetsId = searchParams.get('assets');

    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const initialFormState = { employeeNo: '', firstName: '', lastName: '', departmentId: '', position: '' };
    const [formData, setFormData] = useState(initialFormState);

    // --- Derived State & Helpers ---
    const filteredData = useMemo(() => {
        if (!searchTerm) return employees;
        const lower = searchTerm.toLowerCase();
        return employees.filter(e =>
            e.firstName.toLowerCase().includes(lower) ||
            e.lastName.toLowerCase().includes(lower) ||
            e.employeeNo.toLowerCase().includes(lower)
        );
    }, [employees, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const getDeptName = (id?: string | null) => departments.find(d => d.id === id)?.name || 'Unassigned';

    // --- Effects ---
    useEffect(() => setPagination(prev => ({ ...prev, pageIndex: 0 })), [searchTerm]);

    useEffect(() => {
        if (action === 'edit' && targetId) {
            getById(targetId).then(emp => {
                if (emp) setFormData({ ...emp, departmentId: emp.departmentId || '' });
            });
        } else {
            setFormData(initialFormState);
        }
    }, [action, targetId, getById]);

    // --- Actions ---
    const closeDrawer = () => setSearchParams({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving employee...');

        const payload = {
            ...formData,
            departmentId: formData.departmentId,
        };

        try {
            if (action === 'new') {
                await create(payload);
                toast.success(`Employee ${formData.firstName} registered!`, { id: toastId });
            } else if (action === 'edit' && targetId) {
                await update(targetId, payload);
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
            title: 'Delete Employee',
            description: `Are you sure you want to delete ${name}? They will be marked as inactive.`,
            confirmText: 'Delete',
            intent: 'danger',
        });

        if (isConfirmed) {
            try {
                await softDelete(id);
                await refresh();
                toast.success('Employee deleted successfully.');
            } catch (error) {
                toast.error('Failed to delete employee.');
            }
        }
    };

    // --- Table Columns ---
    const columns = useMemo<ColumnDef<Employee>[]>(
        () => [
            {
                accessorKey: 'employeeNo',
                header: 'ID No.',
                cell: ({ row }) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{row.original.employeeNo}</span>,
            },
            {
                id: 'name',
                header: 'Employee Name',
                cell: ({ row }) => (
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {row.original.firstName} {row.original.lastName}
                    </span>
                ),
            },
            {
                accessorKey: 'departmentId',
                header: 'Department',
                cell: ({ row }) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {getDeptName(row.original.departmentId)}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">

                        {/* VIEW ASSIGNED ASSETS BUTTON */}
                        <button
                            onClick={() => setSearchParams({ assets: row.original.id })}
                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                            title="View Accountability Clearance"
                        >
                            <Package className="w-4 h-4" />
                        </button>

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
                            title="Delete Employee"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [setSearchParams, departments]
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Manage municipal personnel and their departmental assignments.</p>
                </div>
                <button onClick={() => setSearchParams({ action: 'new' })} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
                    <Plus className="w-4 h-4" /> Register Employee
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or ID number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            {employees.length === 0 && !loadingEmployees && !searchTerm ? (
                <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                    <Users className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No employees found.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Register Employee" to add staff.</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    pageCount={Math.ceil(filteredData.length / pagination.pageSize)}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={loadingEmployees}
                />
            )}

            {/* DRAWER 1: Create / Edit Employee Form */}
            <Drawer isOpen={!!action} onClose={closeDrawer} title={action === 'new' ? 'Register Employee' : 'Edit Employee'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Employee ID No. <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.employeeNo} onChange={e => setFormData({ ...formData, employeeNo: e.target.value.toUpperCase() })} placeholder="e.g. EMP-2024-01" className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 uppercase" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">First Name <span className="text-red-500">*</span></label>
                            <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name <span className="text-red-500">*</span></label>
                            <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Department</label>
                        <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                            <option value="">-- Unassigned --</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
                        </select>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                        <button type="button" onClick={closeDrawer} className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-all">
                            {isSaving ? 'Saving...' : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </Drawer>

            {/* DRAWER 2: Employee Accountability Clearance (Assigned Assets) */}
            <Drawer
                isOpen={!!viewAssetsId}
                onClose={() => setSearchParams({})}
                title="Accountability Ledger"
            >
                {viewAssetsId && (
                    <div className="pb-6 animate-in fade-in duration-300">
                        {/* Employee Header */}
                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                                {employees.find(e => e.id === viewAssetsId)?.firstName} {employees.find(e => e.id === viewAssetsId)?.lastName}
                            </p>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1 uppercase tracking-wider font-semibold">
                                Assigned Properties
                            </p>
                        </div>

                        {/* Asset List */}
                        <div className="space-y-3">
                            {assets.filter(a => a.employeeId === viewAssetsId).length === 0 ? (
                                <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">No assets assigned.</p>
                                    <p className="text-xs text-gray-400 mt-1">This employee is cleared of property accountability.</p>
                                </div>
                            ) : (
                                assets.filter(a => a.employeeId === viewAssetsId).map(asset => (
                                    <div key={asset.id} className="p-4 bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm flex items-start justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{asset.name}</p>
                                            <p className="text-xs font-mono text-gray-500 mt-1">{asset.propertyNo}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            {asset.status === 'Serviceable' ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Serviceable</span>
                                            ) : asset.status === 'Unserviceable' ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">Unserviceable</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">For Repair</span>
                                            )}
                                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-300">
                                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(asset.cost)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

        </div>
    );
}
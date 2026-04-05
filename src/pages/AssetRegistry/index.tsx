// src/pages/AssetRegistry/AssetRegistry.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Plus, Edit2, Trash2, Package, Search,
    ChevronRight, ChevronLeft, QrCode, X, Eye, History
} from 'lucide-react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';

// Hooks
import { useAssets } from '../../hooks/useAssets';
import { useAssetCategories } from '../../hooks/useAssetCategories';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { useConfirm } from '../../contexts/ConfirmContext';

// Components
import { Drawer } from '../../components/ui/Drawer';
import { DataTable } from '../../components/ui/DataTable';
import { AssetQRCode } from '../../components/ui/AssetQRCode';
import { AssetAuditTrail } from '../../components/ui/AuditTrail';
import type { Asset, AssetStatus } from '../../services/assetService';

const STEPS = ['Identity', 'Financials', 'Specs', 'Assignment'];

export function AssetRegistry() {
    const { assets, isLoading: loadingAssets, refresh, create, update, delete: softDelete, getById } = useAssets();
    const { categories } = useAssetCategories();
    const { departments } = useDepartments();
    const { employees } = useEmployees();
    const confirm = useConfirm();

    const [searchParams, setSearchParams] = useSearchParams();
    const action = searchParams.get('action');
    const targetId = searchParams.get('id');
    const viewId = searchParams.get('view');
    const qrId = searchParams.get('qr');
    const historyId = searchParams.get('history');

    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    const initialFormState = {
        propertyNo: '', name: '', categoryId: '',
        cost: 0, dateAcquired: new Date().toISOString().split('T')[0],
        brand: '', model: '', serialNo: '', status: 'Serviceable' as AssetStatus,
        departmentId: '', employeeId: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const filteredData = useMemo(() => {
        if (!searchTerm) return assets;
        const lower = searchTerm.toLowerCase();
        return assets.filter(a =>
            a.name.toLowerCase().includes(lower) ||
            a.propertyNo.toLowerCase().includes(lower)
        );
    }, [assets, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const availableEmployees = useMemo(() => {
        if (!formData.departmentId) return [];
        return employees.filter(emp => emp.departmentId === formData.departmentId);
    }, [formData.departmentId, employees]);

    const viewedAsset = useMemo(() => assets.find(a => a.id === viewId), [assets, viewId]);

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
    const getDeptName = (id?: string | null) => departments.find(d => d.id === id)?.name || 'Unassigned';
    const getEmpName = (id?: string | null) => {
        const e = employees.find(emp => emp.id === id);
        return e ? `${e.firstName} ${e.lastName}` : 'Unassigned';
    };

    useEffect(() => setPagination(prev => ({ ...prev, pageIndex: 0 })), [searchTerm]);

    useEffect(() => {
        if (action === 'edit' && targetId) {
            getById(targetId).then(asset => {
                if (asset) {
                    setFormData({
                        ...asset,
                        departmentId: asset.departmentId || '',
                        employeeId: asset.employeeId || ''
                    });
                    setStep(0);
                }
            });
        } else {
            setFormData(initialFormState);
            setStep(0);
        }
    }, [action, targetId, getById]);

    const closeDrawer = () => setSearchParams({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving asset...');

        const payload = {
            ...formData,
            departmentId: formData.departmentId === '' ? null : formData.departmentId,
            employeeId: formData.employeeId === '' ? null : formData.employeeId,
        };

        try {
            if (action === 'new') {
                await create(payload);
                toast.success(`Asset ${formData.propertyNo} registered!`, { id: toastId });
            } else if (action === 'edit' && targetId) {
                await update(targetId, payload);
                toast.success(`Asset updated!`, { id: toastId });
            }
            await refresh();
            closeDrawer();
        } catch (error) {
            toast.error('Failed to save asset.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: 'Delete Asset',
            description: `Are you sure you want to delete ${name}? This will remove it from the master registry.`,
            confirmText: 'Delete',
            intent: 'danger',
        });

        if (isConfirmed) {
            try {
                await softDelete(id);
                await refresh();
                toast.success('Asset removed from registry.');
            } catch (error) {
                toast.error('Failed to delete asset.');
            }
        }
    };

    const columns = useMemo<ColumnDef<Asset>[]>(
        () => [
            {
                accessorKey: 'propertyNo',
                header: 'Property No.',
                cell: ({ row }) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{row.original.propertyNo}</span>,
            },
            {
                accessorKey: 'name',
                header: 'Asset Details',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">{row.original.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">{getCategoryName(row.original.categoryId)}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.original.status;
                    if (status === 'Serviceable') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Serviceable</span>;
                    if (status === 'Unserviceable') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Unserviceable</span>;
                    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">For Repair</span>;
                },
            },
            {
                accessorKey: 'cost',
                header: () => <div className="text-right">Acquisition Cost</div>,
                cell: ({ row }) => (
                    <div className="text-right font-medium text-gray-900 dark:text-gray-300">
                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(row.original.cost)}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSearchParams({ history: row.original.id })} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors" title="View Audit Trail">
                            <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSearchParams({ view: row.original.id })} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSearchParams({ qr: row.original.id })} className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors" title="Generate QR Tag">
                            <QrCode className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSearchParams({ action: 'edit', id: row.original.id })} className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors" title="Edit Asset">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(row.original.id, row.original.name)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors" title="Delete Asset">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [setSearchParams, categories]
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Registry</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Master database of all municipal properties and equipment.</p>
                </div>
                <button onClick={() => setSearchParams({ action: 'new' })} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
                    <Plus className="w-4 h-4" /> Register Asset
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or property number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            {assets.length === 0 && !loadingAssets && !searchTerm ? (
                <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                    <Package className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Registry is empty.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Register Asset" to add your first property.</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    pageCount={Math.ceil(filteredData.length / pagination.pageSize)}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={loadingAssets}
                />
            )}

            {/* DRAWER 1: Multi-Step Registration Form */}
            <Drawer isOpen={!!action} onClose={closeDrawer} title={action === 'new' ? 'Register New Asset' : 'Edit Asset'}>
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {STEPS.map((stepName, i) => (
                            <React.Fragment key={stepName}>
                                <div className="flex flex-col items-center w-full relative z-10">
                                    <button
                                        type="button"
                                        onClick={() => setStep(i)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 hover:scale-110 ${i === step
                                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
                                            : i < step
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                    <span className={`text-[10px] mt-2 font-medium hidden sm:block ${i === step ? 'text-primary-600 dark:text-primary-400' : i < step ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400'}`}>
                                        {stepName}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${i < step ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {step === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Property Number <span className="text-red-500">*</span></label>
                                <input type="text" required value={formData.propertyNo} onChange={e => setFormData({ ...formData, propertyNo: e.target.value.toUpperCase() })} placeholder="e.g. IT-2024-001" className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 uppercase" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Asset Category <span className="text-red-500">*</span></label>
                                <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                                    <option value="" disabled>Select COA Classification</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Asset Name / Description <span className="text-red-500">*</span></label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. MacBook Pro 16-inch" className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Acquisition Cost (₱) <span className="text-red-500">*</span></label>
                                <input type="number" required min="0" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Date Acquired <span className="text-red-500">*</span></label>
                                <input type="date" required value={formData.dateAcquired} onChange={e => setFormData({ ...formData, dateAcquired: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Brand <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                                    <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Model <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                                    <input type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Serial/Engine Number <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                                <input type="text" value={formData.serialNo} onChange={e => setFormData({ ...formData, serialNo: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Physical Status <span className="text-red-500">*</span></label>
                                <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as AssetStatus })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                                    <option value="Serviceable">Serviceable (Good Condition)</option>
                                    <option value="Unserviceable">Unserviceable (Broken)</option>
                                    <option value="For Repair">For Repair</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 mb-4">
                                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Initial Issuance</p>
                                <p className="text-xs text-blue-600/70 mt-1">Leave blank if the asset is currently unassigned (in storage).</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned Department</label>
                                <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value, employeeId: '' })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                                    <option value="">-- Unassigned --</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned Employee (End User)</label>
                                <select value={formData.employeeId} disabled={!formData.departmentId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50">
                                    <option value="">-- Unassigned --</option>
                                    {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-3">
                        {step === 0 ? (
                            <button type="button" onClick={closeDrawer} className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Cancel
                            </button>
                        ) : (
                            <button type="button" onClick={() => setStep(step - 1)} className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </button>
                        )}

                        <div className="flex gap-3">
                            {step < STEPS.length - 1 && (
                                <button type="button" onClick={() => setStep(step + 1)} className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            )}
                            {(step === STEPS.length - 1 || action === 'edit') && (
                                <button type="submit" disabled={isSaving} className="inline-flex items-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-all">
                                    {isSaving ? 'Saving...' : action === 'edit' ? 'Save Changes' : 'Complete Registration'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </Drawer>

            {/* DRAWER 2: Read-Only Details View */}
            <Drawer isOpen={!!viewId} onClose={() => setSearchParams({})} title="Asset Details">
                {viewedAsset && (
                    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
                        <div className="flex items-start justify-between bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div>
                                <p className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase mb-1">Property Number</p>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white font-mono">{viewedAsset.propertyNo}</h2>
                            </div>
                            <div>
                                {viewedAsset.status === 'Serviceable' && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Serviceable</span>}
                                {viewedAsset.status === 'Unserviceable' && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Unserviceable</span>}
                                {viewedAsset.status === 'For Repair' && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">For Repair</span>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{viewedAsset.name}</h3>
                            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">{getCategoryName(viewedAsset.categoryId)}</p>
                        </div>

                        <hr className="border-gray-100 dark:border-white/10" />

                        <div>
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Current Assignment</h4>
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">Department</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{getDeptName(viewedAsset.departmentId)}</p>
                                </div>
                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30">
                                    <p className="text-xs text-gray-500 mb-1">Accountable Officer (End User)</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{getEmpName(viewedAsset.employeeId)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Specifications</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">Brand</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewedAsset.brand || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">Model</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewedAsset.model || 'N/A'}</p>
                                </div>
                                <div className="col-span-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">Serial / Engine Number</p>
                                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{viewedAsset.serialNo || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Financials</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50 dark:bg-emerald-500/5 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                                    <p className="text-xs text-emerald-600/70 mb-1">Acquisition Cost</p>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(viewedAsset.cost)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">Date Acquired</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewedAsset.dateAcquired}</p>
                                </div>
                            </div>
                        </div>

                        {/* Plug-and-Play Audit Trail */}
                        <AssetAuditTrail assetId={viewedAsset.id} />

                        <div className="pt-6 mt-2 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                            <button onClick={() => setSearchParams({ qr: viewedAsset.id })} className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                <QrCode className="w-4 h-4" /> Tag
                            </button>
                            <button onClick={() => setSearchParams({ action: 'edit', id: viewedAsset.id })} className="flex-[2] px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                                <Edit2 className="w-4 h-4" /> Edit Asset
                            </button>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* DRAWER 3: Standalone Audit Trail */}
            <Drawer isOpen={!!historyId} onClose={() => setSearchParams({})} title="Asset History Log">
                {historyId && (
                    <div className="pb-6 animate-in fade-in duration-300">
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {assets.find(a => a.id === historyId)?.name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                                {assets.find(a => a.id === historyId)?.propertyNo}
                            </p>
                        </div>
                        <AssetAuditTrail assetId={historyId} />
                    </div>
                )}
            </Drawer>

            {/* MODAL: QR Code Generator */}
            {qrId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSearchParams({})} />
                    <div className="relative w-full max-w-sm bg-[var(--bg-surface)] rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <button onClick={() => setSearchParams({})} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">Asset Tag Generated</h2>
                        {assets.find(a => a.id === qrId) && (
                            <AssetQRCode
                                propertyNo={assets.find(a => a.id === qrId)!.propertyNo}
                                name={assets.find(a => a.id === qrId)!.name}
                                assetId={assets.find(a => a.id === qrId)!.id}
                            />
                        )}
                        <div className="mt-6 flex gap-3">
                            <button onClick={() => window.print()} className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-colors">
                                Print Tag
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
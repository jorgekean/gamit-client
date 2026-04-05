// src/pages/AssetRegistry/index.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Plus, Search, QrCode, X, Eye, History, Filter, Package
} from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';

// Data Orchestration Hooks
import { useAssets } from '../../hooks/useAssets';
import { useAssetCategories } from '../../hooks/useAssetCategories';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { useConfirm } from '../../contexts/ConfirmContext';

// Core UI Components
import { Drawer } from '../../components/ui/Drawer';
import { DataTable } from '../../components/ui/DataTable';
import { AssetQRCode } from '../../components/ui/AssetQRCode';
import { AssetAuditTrail } from '../../components/ui/AuditTrail';

// Feature-Specific Sub-components (Located in the same folder)
import { AssetFilterDrawer } from './AssetFilterDrawer';
import { AssetDetailsDrawer } from './AssetDetailsDrawer';
import { AssetFormDrawer } from './AssetFormDrawer';
import { columns } from './columns';

/**
 * AssetRegistry Component
 * Acts as the central hub for asset management, supporting advanced filtering,
 * server-side (service-layer) searching, and lifecycle management via URL params.
 */
export function AssetRegistry() {
    // --- 1. Data & Context Hooks ---
    const { assets, isLoading: loadingAssets, refresh, delete: softDelete } = useAssets();
    const { categories } = useAssetCategories();
    const { departments } = useDepartments();
    const { employees } = useEmployees();
    const confirm = useConfirm();

    // --- 2. URL State Management ---
    // Using searchParams as a single source of truth for UI state (Drawers & Filters)
    const [searchParams, setSearchParams] = useSearchParams();

    // Drawer & Modal IDs
    const qrId = searchParams.get('qr');
    const historyId = searchParams.get('history');

    // Filter Parameters extracted from URL
    const deptFilter = searchParams.get('dept');
    const empFilter = searchParams.get('emp');
    const statusFilter = searchParams.get('status');
    const catFilter = searchParams.get('cat');
    const showFilters = searchParams.get('filters') === 'true';

    // --- 3. Local UI State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    /**
     * Effect: Data Synchronization
     * Triggers a service-layer fetch whenever search criteria or filters change.
     * This ensures the UI remains in sync with the filtered dataset.
     */
    useEffect(() => {
        refresh({
            searchTerm,
            deptId: deptFilter,
            employeeId: empFilter,
            status: statusFilter,
            categoryId: catFilter
        });
    }, [refresh, searchTerm, deptFilter, empFilter, statusFilter, catFilter]);

    /**
     * Effect: Pagination Reset
     * Ensures users return to page 1 whenever they perform a new search.
     */
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [searchTerm, deptFilter, empFilter]);

    // --- 4. Action Handlers ---

    /**
     * Handles the soft-deletion of an asset with a confirmation prompt.
     */
    const handleDelete = useCallback(async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: 'Delete Asset',
            description: `Are you sure you want to delete ${name}? This action can be audited in the history log.`,
            confirmText: 'Delete',
            intent: 'danger',
        });

        if (isConfirmed) {
            try {
                await softDelete(id);
                await refresh(); // Refresh list to reflect deletion
                toast.success('Asset removed from registry.');
            } catch (error) {
                toast.error('Failed to delete asset.');
            }
        }
    }, [confirm, softDelete, refresh]);

    /**
     * Clears all active filters by removing them from the URL.
     */
    const clearFilters = () => {
        const newParams = new URLSearchParams(searchParams);
        ['dept', 'emp', 'status', 'cat'].forEach(param => newParams.delete(param));
        setSearchParams(newParams);
    };

    /**
     * Helper functions to resolve display names for the Filter Banner
     */
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
    const getDeptName = (id?: string | null) => departments.find(d => d.id === id)?.name || 'Unassigned';
    const getEmpName = (id?: string | null) => {
        const e = employees.find(emp => emp.id === id);
        return e ? `${e.firstName} ${e.lastName}` : 'Unassigned';
    };

    /**
     * Memoized Column Definitions
     * We pass setSearchParams and handleDelete into the column factory 
     * to allow action buttons within the table cells to function.
     */
    const tableColumns = useMemo(
        () => columns(setSearchParams, handleDelete, categories),
        [setSearchParams, handleDelete, categories]
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Page Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Registry</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Master database and lifecycle tracker for all municipal properties.</p>
                </div>
                <button
                    onClick={() => setSearchParams({ action: 'new' })}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" /> Register Asset
                </button>
            </div>

            {/* Active Filters Summary Banner */}
            {(deptFilter || empFilter || statusFilter || catFilter) && (
                <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl animate-in slide-in-from-top-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-indigo-700 dark:text-indigo-400">
                        <Filter className="w-3.5 h-3.5 mr-1" />
                        <span className="font-semibold mr-1 text-xs uppercase tracking-wider">Active Filters:</span>
                        {deptFilter && <span className="bg-white/60 dark:bg-gray-900/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">Dept: {getDeptName(deptFilter)}</span>}
                        {empFilter && <span className="bg-white/60 dark:bg-gray-900/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">Emp: {getEmpName(empFilter)}</span>}
                        {statusFilter && <span className="bg-white/60 dark:bg-gray-900/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">Status: {statusFilter}</span>}
                        {catFilter && <span className="bg-white/60 dark:bg-gray-900/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">Category: {getCategoryName(catFilter)}</span>}
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ml-4 whitespace-nowrap"
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* Search Bar & Advanced Filter Trigger */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or property number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.set('filters', 'true');
                        setSearchParams(p);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                >
                    <Filter className="w-4 h-4" /> Advanced Filters
                </button>
            </div>

            {/* Main Assets Data Table */}
            {assets.length === 0 && !loadingAssets ? (
                <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                    <Package className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No assets found matching the criteria.</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search term.</p>
                </div>
            ) : (
                <DataTable
                    columns={tableColumns}
                    data={assets}
                    pageCount={1} // Future-proofing: Replace with API-calculated page count
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={loadingAssets}
                />
            )}

            {/* --- FEATURE-SPECIFIC DRAWERS (Extracted Components) --- */}

            {/* Registration/Edit Wizard */}
            <AssetFormDrawer />

            {/* Read-only Asset Details Passport */}
            <AssetDetailsDrawer />

            {/* Advanced Filter Selection Panel */}
            <AssetFilterDrawer
                isOpen={showFilters}
                onClose={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete('filters');
                    setSearchParams(p);
                }}
            />

            {/* Standalone Asset Lifecycle History Drawer */}
            <Drawer isOpen={!!historyId} onClose={() => setSearchParams({})} title="Asset History Log">
                {historyId && (
                    <div className="pb-6 animate-in fade-in duration-300">
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {assets.find(a => a.id === historyId)?.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 italic">Audit record of all transfers and status changes.</p>
                        </div>
                        <AssetAuditTrail assetId={historyId} />
                    </div>
                )}
            </Drawer>

            {/* QR Code Tag Preview Modal */}
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
                    </div>
                </div>
            )}

        </div>
    );
}
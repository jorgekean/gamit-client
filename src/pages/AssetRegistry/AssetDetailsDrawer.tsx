// src/pages/AssetRegistry/AssetDetailsDrawer.tsx
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QrCode, Edit2, Loader2 } from 'lucide-react';

// Core UI Components
import { Drawer } from '../../components/ui/Drawer';
import { AssetAuditTrail } from '../../components/ui/AuditTrail';

// Data Orchestration Hooks
import { useAssets } from '../../hooks/useAssets';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { useAssetCategories } from '../../hooks/useAssetCategories';

/**
 * AssetDetailsDrawer Component
 * Displays a comprehensive, read-only "Passport" view of an asset.
 * Uses URL 'view' parameter to determine which asset to load.
 */
export function AssetDetailsDrawer() {
    // --- 1. State & Data Hooks ---
    const [searchParams, setSearchParams] = useSearchParams();
    const viewId = searchParams.get('view');

    // We pull data directly from hooks to ensure this component is self-sufficient
    const { assets, isLoading: loadingAssets } = useAssets();
    const { departments } = useDepartments();
    const { employees } = useEmployees();
    const { categories } = useAssetCategories();

    // --- 2. Derived Data ---
    // Memoize the target asset lookup for performance
    const viewedAsset = useMemo(() =>
        assets.find(a => a.id === viewId),
        [assets, viewId]
    );

    // Helper functions for descriptive display names
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
    const getDeptName = (id?: string | null) => departments.find(d => d.id === id)?.name || 'Unassigned';
    const getEmpName = (id?: string | null) => {
        const e = employees.find(emp => emp.id === id);
        return e ? `${e.firstName} ${e.lastName}` : 'Unassigned';
    };

    // --- 3. Render Logic ---

    // If no ID is in URL, keep drawer hidden/empty
    if (!viewId) return null;

    return (
        <Drawer
            isOpen={!!viewId}
            onClose={() => setSearchParams({})}
            title="Asset Details"
        >
            {!viewedAsset ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                    {loadingAssets ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                        <p className="text-sm italic">Asset not found or may have been deleted.</p>
                    )}
                </div>
            ) : (
                <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-right-4 duration-300">

                    {/* Header Card: Identity & Status */}
                    <div className="flex items-start justify-between bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div>
                            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Property Number</p>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white font-mono">{viewedAsset.propertyNo}</h2>
                        </div>
                        <div className="pt-1">
                            {viewedAsset.status === 'Serviceable' && (
                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                    Serviceable
                                </span>
                            )}
                            {viewedAsset.status === 'Unserviceable' && (
                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                                    Unserviceable
                                </span>
                            )}
                            {viewedAsset.status === 'For Repair' && (
                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                    For Repair
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Asset Title & Category */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{viewedAsset.name}</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">
                            {getCategoryName(viewedAsset.categoryId)}
                        </p>
                    </div>

                    <hr className="border-gray-100 dark:border-white/10" />

                    {/* Accountability & Assignment Section */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Current Assignment</h4>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Department</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{getDeptName(viewedAsset.departmentId)}</p>
                            </div>
                            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Accountable Officer</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{getEmpName(viewedAsset.employeeId)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Specifications</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Brand</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewedAsset.brand || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Model</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewedAsset.model || 'N/A'}</p>
                            </div>
                            <div className="col-span-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Serial / Engine Number</p>
                                <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{viewedAsset.serialNo || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Acquisition Data */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Financial Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-50 dark:bg-emerald-500/5 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                                <p className="text-[10px] text-emerald-600/70 uppercase font-bold mb-1">Acquisition Cost</p>
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(viewedAsset.cost)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Date Acquired</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{viewedAsset.dateAcquired}</p>
                            </div>
                        </div>
                    </div>

                    {/* Audit Trail Component */}
                    <AssetAuditTrail assetId={viewedAsset.id} />

                    {/* Action Footer */}
                    <div className="pt-6 mt-2 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                        <button
                            onClick={() => setSearchParams({ qr: viewedAsset.id })}
                            className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <QrCode className="w-4 h-4" /> Tag
                        </button>
                        <button
                            onClick={() => setSearchParams({ action: 'edit', id: viewedAsset.id })}
                            className="flex-[2] px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" /> Edit Asset
                        </button>
                    </div>
                </div>
            )}
        </Drawer>
    );
}
// src/pages/AssetRegistry/AssetDetails.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Edit2, Trash2, Clock, CalendarDays,
    Building2, UserCheck, Tag, Target, FileText, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

// Data Orchestration Hooks
import { useAssets } from '../../hooks/useAssets';
import { useAssetCategories } from '../../hooks/useAssetCategories';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { useConfirm } from '../../contexts/ConfirmContext';

// Components
import { AssetAuditTrail } from '../../components/ui/AuditTrail';
import { AssetFormDrawer } from './AssetFormDrawer'; // Reuse the existing drawer for editing

/**
 * StatusBadge Component
 * A micro-component to render the Serviceable/Unserviceable status with visual weight.
 */
function StatusBadge({ status }: { status?: string }) {
    if (!status) return null;
    const base = "px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap";
    const colors =
        status === 'Serviceable' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
            status === 'Unserviceable' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'; // For Repair

    return (
        <span className={`${base} ${colors}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Serviceable' ? 'bg-emerald-500' : status === 'Unserviceable' ? 'bg-red-500' : 'bg-amber-500'}`} />
            {status}
        </span>
    );
}

/**
 * AssetDetails Page
 * Comprehensive "Passport" view for a single asset, showcasing technical specs,
 * current assignment, financial data, and full lifecycle history.
 */
export function AssetDetails() {
    const { id } = useParams<{ id: string }>(); // Extract dynamic :id from URL
    const navigate = useNavigate();
    const confirm = useConfirm();

    // --- 1. Data Context Hooks ---
    const { getById, delete: softDelete } = useAssets();
    const { categories } = useAssetCategories();
    const { departments } = useDepartments();
    const { employees } = useEmployees();

    // --- 2. Local State ---
    const [asset, setAsset] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentAction = searchParams.get('action');

    /**
 * Sync logic: Refresh the full-page data whenever the 
 * Edit Drawer closes (action becomes null).
 */
    useEffect(() => {
        if (!currentAction && asset) {
            fetchAsset();
        }
    }, [currentAction]);

    // --- 3. Data Fetching ---
    const fetchAsset = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getById(id);
            if (data) {
                setAsset(data);
            } else {
                toast.error('Asset not found.');
                navigate('/assets'); // Redirect if ID is invalid
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAsset();
    }, [id]);

    // --- 4. Display Name Resolution ---
    const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Unknown Category';
    const getDeptName = (deptId?: string | null) => departments.find(d => d.id === deptId)?.name || 'Unassigned';
    const getEmpName = (empId?: string | null) => {
        const e = employees.find(emp => emp.id === empId);
        return e ? `${e.firstName} ${e.lastName}` : 'Unassigned';
    };

    // --- 5. Action Handlers ---
    const handleDelete = async () => {
        if (!asset) return;
        const isConfirmed = await confirm({
            title: 'Archive Property',
            description: `Are you sure you want to delete ${asset.name}? This will mark it as deleted but retain its history for audit compliance.`,
            confirmText: 'Delete Asset',
            intent: 'danger',
        });

        if (isConfirmed) {
            try {
                await softDelete(asset.id);
                toast.success('Asset archived successfully.');
                navigate('/assets'); // Return to master list after deletion
            } catch (error) {
                toast.error('Failed to delete asset.');
            }
        }
    };

    // --- 6. Loading/Error States ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 text-center">
                <Clock className="w-12 h-12 text-gray-300 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading Asset Passport...</p>
            </div>
        );
    }

    if (!asset) return null; // Should be handled by redirect

    // Philippine Peso Formatter
    const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* 1. MODERN HEADER & ACTION BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-gray-100 dark:border-white/5 pb-8">
                <div>
                    <Link to="/assets" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-3">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Registry List
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-gray-950 dark:text-white leading-tight">
                            {asset.name}
                        </h1>
                        <StatusBadge status={asset.status} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2 font-medium">
                        <Tag className="w-4 h-4 text-primary-500" />
                        {getCategoryName(asset.categoryId)}
                    </p>
                </div>

                {/* Action Buttons (Visible on Mobile) */}
                <div className="flex items-center gap-3 sm:self-end">
                    <button
                        onClick={() => setSearchParams({ action: 'edit', id: asset.id })} // Trigger via URL
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Asset
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Archive Asset
                    </button>
                </div>
            </div>

            {/* 2. RESPONSIVE DASHBOARD LAYOUT (2 Columns) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                {/* MAIN COLUMN (2/3 Width) */}
                <div className="xl:col-span-2 space-y-8">

                    {/* A. Identity Card */}
                    <div className="bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                        <p className="text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-2">Unique Identity</p>
                        <h2 className="text-4xl font-black text-gray-950 dark:text-white font-mono tracking-tighter leading-none">
                            {asset.propertyNo}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400">Accountable Officer (End User)</p>
                                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary-500" />
                                    {getEmpName(asset.employeeId)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400">Assigned Department</p>
                                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary-500" />
                                    {getDeptName(asset.departmentId)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* B. Specifications Matrix */}
                    <div className="bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-xl font-extrabold text-gray-950 dark:text-white mb-6 flex items-center gap-2.5">
                            <FileText className="w-5 h-5 text-gray-400" />
                            Technical Specifications
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                { label: 'Brand', value: asset.brand },
                                { label: 'Model', value: asset.model },
                                { label: 'Serial / Engine Number', value: asset.serialNo, isMono: true },
                                { label: 'Specific Use Case', value: 'General Office Use' }, // Placeholder for now
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-1.5">
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{item.label}</p>
                                    <p className={`font-semibold text-gray-900 dark:text-white ${item.isMono ? 'font-mono text-xs' : 'text-sm'}`}>
                                        {item.value || <span className="text-gray-400 font-normal italic">N/A</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* SIDEBAR COLUMN (1/3 Width) */}
                <div className="space-y-8">

                    {/* C. Financial Summary (Modern Card Design) */}
                    <div className="bg-[var(--bg-surface)] p-6 md:p-7 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-x-12 -translate-y-12" />
                        <div className="flex items-center gap-3.5 mb-5 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
                                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Financial Baseline</h4>
                                <p className="text-xs text-gray-500">Acquisition data for COA compliance.</p>
                            </div>
                        </div>

                        <div className="space-y-5 relative z-10">
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                <p className="text-[11px] font-bold text-emerald-600/70 uppercase">Acquisition Cost</p>
                                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                    {peso.format(asset.cost)}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2.5">
                                    <CalendarDays className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Date Acquired</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{asset.dateAcquired}</p>
                                    </div>
                                </div>
                                {/* Future: We can calculate depreciation here */}
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Useful Life</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">5 Years (Est.)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* D. Additional Context / Placeholder */}
                    <div className="bg-white dark:bg-gray-900 p-6 md:p-7 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-center flex flex-col items-center">
                        <Building2 className="w-10 h-10 text-gray-300 mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Location Tracking</p>
                        <p className="text-xs text-gray-400 mt-1">Room 201, Municipal Hall</p>
                        <button className="text-xs font-bold text-primary-600 mt-4 flex items-center gap-1.5">
                            Update Location <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>

                </div>
            </div>

            {/* 3. FULL-WIDTH HISTORY TIMELINE (Audit Trail) */}
            <div className="bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-extrabold text-gray-950 dark:text-white mb-8 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Property Lifecycle & Accountability History
                </h3>

                {/* Pass ID to existing Audit Trail component. Now has infinite width to breathe. */}
                <div className="animate-in fade-in delay-150">
                    <AssetAuditTrail assetId={asset.id} />
                </div>
            </div>

            {/* --- FEATURE COMPONENTS --- */}

            <AssetFormDrawer />

        </div>
    );
}
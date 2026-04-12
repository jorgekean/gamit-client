// src/pages/AssetRegistry/AssetFormPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Copy, Layers, FileText, Settings, Key, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useAssets } from '../../hooks/useAssets';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { useAssetCategories } from '../../hooks/useAssetCategories';
import type { AssetStatus } from '../../services/assetService';

interface BatchItem {
    id: string;
    propertyNo: string;
    serialNo: string;
}

export function AssetFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { create, update, getById } = useAssets();
    const { departments } = useDepartments();
    const { employees } = useEmployees();
    const { categories } = useAssetCategories();

    const [isSaving, setIsSaving] = useState(false);
    const [isBatchMode, setIsBatchMode] = useState(false);

    const initialFormState = {
        name: '', categoryId: '', cost: 0,
        dateAcquired: new Date().toISOString().split('T')[0],
        brand: '', model: '', status: 'Serviceable' as AssetStatus,
        departmentId: '', employeeId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [singlePropertyNo, setSinglePropertyNo] = useState('');
    const [singleSerialNo, setSingleSerialNo] = useState('');

    const [batchItems, setBatchItems] = useState<BatchItem[]>([
        { id: crypto.randomUUID(), propertyNo: '', serialNo: '' }
    ]);

    // Smooth scroll helper for the right-side scrolling container
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        if (isEditMode && id) {
            getById(id).then(asset => {
                if (asset) {
                    const resolveId = (val: unknown) => (val && typeof val === 'object' && 'id' in val ? (val as any).id : val) || '';
                    setFormData({
                        name: asset.name ?? '',
                        categoryId: resolveId((asset as any).categoryId),
                        cost: asset.cost ?? 0,
                        dateAcquired: asset.dateAcquired ?? new Date().toISOString().split('T')[0],
                        brand: asset.brand ?? '',
                        model: asset.model ?? '',
                        status: asset.status,
                        departmentId: resolveId((asset as any).departmentId),
                        employeeId: resolveId((asset as any).employeeId)
                    });
                    setSinglePropertyNo(asset.propertyNo ?? '');
                    setSingleSerialNo(asset.serialNo ?? '');
                }
            });
        }
    }, [id, isEditMode, getById]);

    const availableEmployees = useMemo(() => {
        if (!formData.departmentId) return [];
        return employees.filter(emp => emp.departmentId === formData.departmentId);
    }, [formData.departmentId, employees]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); // Native HTML5 required fields are validated BEFORE this runs!

        setIsSaving(true);
        const toastId = toast.loading(isBatchMode ? `Registering ${batchItems.length} assets...` : 'Saving asset...');

        const basePayload = {
            name: formData.name,
            categoryId: formData.categoryId,
            cost: formData.cost,
            dateAcquired: formData.dateAcquired,
            brand: formData.brand,
            model: formData.model,
            status: formData.status,
            departmentId: formData.departmentId === '' ? null : formData.departmentId,
            employeeId: formData.employeeId === '' ? null : formData.employeeId,
        };

        try {
            if (isEditMode) {
                await update(id!, { ...basePayload, propertyNo: singlePropertyNo, serialNo: singleSerialNo });
                toast.success('Asset updated successfully!', { id: toastId });
                navigate(`/assets/${id}`);
            }
            else if (isBatchMode) {
                const promises = batchItems.map(item =>
                    create({ ...basePayload, propertyNo: item.propertyNo, serialNo: item.serialNo })
                );
                await Promise.all(promises);
                toast.success(`${batchItems.length} assets registered successfully!`, { id: toastId });
                navigate('/assets');
            }
            else {
                await create({ ...basePayload, propertyNo: singlePropertyNo, serialNo: singleSerialNo });
                toast.success('Asset registered successfully!', { id: toastId });
                navigate('/assets');
            }
        } catch (error) {
            toast.error('Failed to save data. Please check inputs.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Elegant Brand-Aligned Design Tokens ---
    const inputClass = "block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200";
    const labelClass = "block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
    const sectionClass = "scroll-mt-8 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800";
    const sectionHeaderClass = "text-lg font-bold text-gray-900 dark:text-white mb-1";
    const sectionSubClass = "text-sm text-gray-500 dark:text-gray-400 mb-6";

    // 1. h-screen layout enforces the strict scrolling zones
    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">

            {/* TOP FIXED HEADER */}
            <header className="shrink-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {isEditMode ? 'Edit Asset Record' : 'Register Asset'}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {!isEditMode && (
                        <div className="hidden sm:flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border border-gray-200/60 dark:border-gray-800">
                            <button type="button" onClick={() => setIsBatchMode(false)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${!isBatchMode ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                                Single Entry
                            </button>
                            <button type="button" onClick={() => setIsBatchMode(true)} className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${isBatchMode ? 'bg-white dark:bg-gray-800 shadow-sm text-orange-600 dark:text-orange-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                                <Layers className="w-4 h-4" /> Batch Entry
                            </button>
                        </div>
                    )}

                    {/* ✨ CRITICAL FIX: The button maps to the form ID to trigger HTML5 Validation */}
                    <button
                        type="submit"
                        form="asset-form"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl disabled:opacity-50 transition-all shadow-sm shadow-orange-600/20"
                    >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Record'}</span>
                    </button>
                </div>
            </header>

            {/* 2. BODY CONTENT (Sidebar + Scrolling Form) */}
            <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">

                {/* LEFT: Fixed Sidebar Navigation */}
                <aside className="hidden lg:block w-64 shrink-0 overflow-y-auto py-8 pr-8 border-r border-transparent">
                    <nav className="space-y-1">
                        <button type="button" onClick={() => scrollToSection('financials')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors text-left">
                            <FileText className="w-4 h-4" /> General & Financials
                        </button>
                        <button type="button" onClick={() => scrollToSection('specs')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors text-left">
                            <Settings className="w-4 h-4" /> Specifications
                        </button>
                        <button type="button" onClick={() => scrollToSection('identifiers')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors text-left">
                            <Key className="w-4 h-4" /> Unique Identifiers
                        </button>
                        <button type="button" onClick={() => scrollToSection('assignment')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors text-left">
                            <Users className="w-4 h-4" /> Assignment
                        </button>
                    </nav>
                </aside>

                {/* RIGHT: Main Scrolling Form Canvas */}
                <main className="flex-1 overflow-y-auto py-8 pb-32 px-4 sm:px-8">

                    {/* The form encapsulating all inputs to enable standard HTML validation */}
                    <form id="asset-form" onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-700">

                        {/* Section 1 */}
                        <div id="financials" className={sectionClass}>
                            <h2 className={sectionHeaderClass}>General & Financials</h2>
                            <p className={sectionSubClass}>Basic classification and procurement details for COA compliance.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>General Description <span className="text-red-500">*</span></label>
                                    <input required type="text" placeholder="e.g., Office Chair, Dell Laptop" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Asset Category <span className="text-red-500">*</span></label>
                                    <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className={inputClass}>
                                        <option value="" disabled>Select Category...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Date Acquired <span className="text-red-500">*</span></label>
                                    <input required type="date" value={formData.dateAcquired} onChange={e => setFormData({ ...formData, dateAcquired: e.target.value })} className={inputClass} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Acquisition Cost (₱) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-medium">₱</span>
                                        </div>
                                        <input required type="number" min="0" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} className={`${inputClass} pl-10 font-mono`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div id="specs" className={sectionClass}>
                            <h2 className={sectionHeaderClass}>Technical Specifications</h2>
                            <p className={sectionSubClass}>Brand, model, and current physical condition.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClass}>Brand</label>
                                    <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Model</label>
                                    <input type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Physical Condition <span className="text-red-500">*</span></label>
                                    <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as AssetStatus })} className={inputClass}>
                                        <option value="Serviceable">Serviceable</option>
                                        <option value="Unserviceable">Unserviceable</option>
                                        <option value="For Repair">For Repair</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Dynamic Identifiers */}
                        <div id="identifiers" className={`${sectionClass} ${isBatchMode ? 'ring-1 ring-orange-500/20 shadow-md shadow-orange-500/5' : ''}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                <h2 className={sectionHeaderClass}>
                                    {isBatchMode ? 'Unique Identifiers (Batch Entry)' : 'Unique Identifiers'}
                                </h2>
                                {isBatchMode && (
                                    <button type="button" onClick={() => setBatchItems([...batchItems, { id: crypto.randomUUID(), propertyNo: '', serialNo: '' }])} className="flex items-center gap-1.5 text-[13px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors">
                                        <Plus className="w-4 h-4" /> Add Row
                                    </button>
                                )}
                            </div>
                            <p className={sectionSubClass}>
                                {isBatchMode ? 'Enter the unique tracking numbers for each distinct item in this batch.' : 'The specific tracking numbers for this single asset.'}
                            </p>

                            {!isBatchMode ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Property Number <span className="text-red-500">*</span></label>
                                        <input required type="text" value={singlePropertyNo} onChange={e => setSinglePropertyNo(e.target.value.toUpperCase())} className={`${inputClass} uppercase font-mono tracking-wide`} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Serial / Engine Number</label>
                                        <input type="text" value={singleSerialNo} onChange={e => setSingleSerialNo(e.target.value.toUpperCase())} className={`${inputClass} uppercase font-mono tracking-wide`} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Batch Table Header */}
                                    <div className="hidden md:grid grid-cols-[30px_1fr_1fr_80px] gap-4 px-2 pb-2 text-[12px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                        <div>#</div>
                                        <div>Property Number <span className="text-red-400">*</span></div>
                                        <div>Serial Number</div>
                                        <div className="text-right">Actions</div>
                                    </div>

                                    {/* Batch Rows */}
                                    {batchItems.map((item, index) => (
                                        <div key={item.id} className="group flex flex-col md:flex-row items-start md:items-center gap-3 p-4 md:p-2 bg-gray-50/50 dark:bg-gray-800/20 md:bg-transparent rounded-xl md:rounded-none border border-gray-200 dark:border-gray-800 md:border-transparent md:border-b md:border-gray-100 md:dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

                                            <div className="hidden md:flex w-[30px] justify-center text-xs font-semibold text-gray-400">
                                                {index + 1}
                                            </div>

                                            <div className="w-full md:flex-1">
                                                <label className="md:hidden text-[11px] font-bold text-gray-400 uppercase mb-1 block">Property No. <span className="text-red-500">*</span></label>
                                                <input required type="text" placeholder="e.g., LGU-2026-001" value={item.propertyNo}
                                                    onChange={e => {
                                                        const newItems = [...batchItems];
                                                        newItems[index].propertyNo = e.target.value.toUpperCase();
                                                        setBatchItems(newItems);
                                                    }}
                                                    className={`${inputClass} !py-2 uppercase font-mono text-xs`}
                                                />
                                            </div>

                                            <div className="w-full md:flex-1">
                                                <label className="md:hidden text-[11px] font-bold text-gray-400 uppercase mb-1 block">Serial No.</label>
                                                <input type="text" placeholder="e.g., SN-99812A" value={item.serialNo}
                                                    onChange={e => {
                                                        const newItems = [...batchItems];
                                                        newItems[index].serialNo = e.target.value.toUpperCase();
                                                        setBatchItems(newItems);
                                                    }}
                                                    className={`${inputClass} !py-2 uppercase font-mono text-xs`}
                                                />
                                            </div>

                                            <div className="flex gap-1 w-full md:w-[80px] justify-end mt-2 md:mt-0">
                                                <button type="button" title="Duplicate Row"
                                                    onClick={() => {
                                                        // 1. Make a copy of the current array
                                                        const newItems = [...batchItems];
                                                        // 2. Insert the duplicated data directly AFTER the current row
                                                        newItems.splice(index + 1, 0, {
                                                            id: crypto.randomUUID(),
                                                            propertyNo: item.propertyNo,
                                                            serialNo: item.serialNo
                                                        });
                                                        // 3. Update state
                                                        setBatchItems(newItems);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button type="button" title="Remove Row"
                                                    disabled={batchItems.length === 1}
                                                    onClick={() => setBatchItems(batchItems.filter(b => b.id !== item.id))}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 4 */}
                        <div id="assignment" className={sectionClass}>
                            <h2 className={sectionHeaderClass}>Assignment & Location</h2>
                            <p className={sectionSubClass}>Where this asset lives and who is accountable for it.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Department / Office</label>
                                    <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value, employeeId: '' })} className={inputClass}>
                                        <option value="">-- Unassigned --</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Accountable Officer (End User)</label>
                                    <select disabled={!formData.departmentId} value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className={`${inputClass} disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900/50`}>
                                        <option value="">-- Unassigned --</option>
                                        {availableEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                                    </select>
                                    {!formData.departmentId && <p className="text-[12px] text-gray-400 mt-1.5 flex items-center gap-1">Select a department first to see employees.</p>}
                                </div>
                            </div>
                        </div>

                    </form>
                </main>
            </div>
        </div>
    );
}
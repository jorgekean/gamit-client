// src/pages/AssetRegistry/components/AssetFormDrawer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer } from '../../components/ui/Drawer';
import { useAssets } from '../../hooks/useAssets';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { useAssetCategories } from '../../hooks/useAssetCategories';
import type { AssetStatus } from '../../services/assetService';

const STEPS = ['Identity', 'Financials', 'Specs', 'Assignment'];

export function AssetFormDrawer() {
    const [searchParams, setSearchParams] = useSearchParams();
    const action = searchParams.get('action');
    const targetId = searchParams.get('id');
    const isOpen = action === 'new' || action === 'edit';

    const { create, update, getById, refresh } = useAssets();
    const { departments } = useDepartments();
    const { employees } = useEmployees();
    const { categories } = useAssetCategories();

    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const initialFormState = {
        propertyNo: '', name: '', categoryId: '',
        cost: 0, dateAcquired: new Date().toISOString().split('T')[0],
        brand: '', model: '', serialNo: '', status: 'Serviceable' as AssetStatus,
        departmentId: '', employeeId: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (action === 'edit' && targetId) {
            getById(targetId).then(asset => {
                if (asset) {
                    const resolveId = (value: unknown) => {
                        if (!value) return '';
                        if (typeof value === 'string') return value;
                        if (typeof value === 'object' && value !== null && typeof (value as any).id === 'string') {
                            return (value as any).id;
                        }
                        return '';
                    };

                    setFormData({
                        propertyNo: asset.propertyNo ?? '',
                        name: asset.name ?? '',
                        categoryId: resolveId((asset as any).categoryId),
                        cost: asset.cost ?? 0,
                        dateAcquired: asset.dateAcquired ?? new Date().toISOString().split('T')[0],
                        brand: asset.brand ?? '',
                        model: asset.model ?? '',
                        serialNo: asset.serialNo ?? '',
                        status: asset.status,
                        departmentId: resolveId((asset as any).departmentId),
                        employeeId: resolveId((asset as any).employeeId),
                    });
                }
                setStep(0);
            });
        } else if (action === 'new') {
            setFormData(initialFormState);
            setStep(0);
        }
    }, [action, targetId, getById]);

    const availableEmployees = useMemo(() => {
        if (!formData.departmentId) return [];
        return employees.filter(emp => emp.departmentId === formData.departmentId);
    }, [formData.departmentId, employees]);

    const closeDrawer = () => setSearchParams({});

    const handleNext = () => {
        // Step 0: Identity Validation
        if (step === 0) {
            if (!formData.propertyNo.trim() || !formData.categoryId || !formData.name.trim()) {
                toast.error('Please fill in all required Identity fields.');
                return;
            }
        }
        // Step 1: Financials Validation
        if (step === 1) {
            if (formData.cost === undefined || formData.cost === null || formData.cost < 0 || !formData.dateAcquired) {
                toast.error('Please provide valid Acquisition Cost and Date.');
                return;
            }
        }
        // Step 2: Specs Validation
        if (step === 2) {
            if (!formData.status) {
                toast.error('Please select a Physical Status.');
                return;
            }
        }

        setStep(step + 1);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving asset...');

        const payload = {
            propertyNo: formData.propertyNo,
            name: formData.name,
            categoryId: formData.categoryId,
            cost: formData.cost,
            dateAcquired: formData.dateAcquired,
            brand: formData.brand,
            model: formData.model,
            serialNo: formData.serialNo,
            status: formData.status,
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

            // Notice we removed await refresh() here! 
            // The window.dispatchEvent in the hook automatically refreshes the table underneath.
            closeDrawer();

        } catch (error) {
            toast.error('Failed to save asset.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} onClose={closeDrawer} title={action === 'new' ? 'Register New Asset' : 'Edit Asset'}>
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {STEPS.map((stepName, i) => (
                        <React.Fragment key={stepName}>
                            <div className="flex flex-col items-center w-full relative z-10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Allow free movement in Edit mode, or allow going backwards. 
                                        // Prevent skipping forward in New mode.
                                        if (action === 'edit' || i <= step) {
                                            setStep(i);
                                        } else {
                                            toast.error('Please complete the current step first.');
                                        }
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${i === step
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
                                        : i < step ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                                <span className={`text-[10px] mt-2 font-medium hidden sm:block ${i === step ? 'text-primary-600 dark:text-primary-400' : i < step ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400'}`}>{stepName}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${i < step ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'}`} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {step === 0 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Property Number <span className="text-red-500">*</span></label>
                            <input type="text" required value={formData.propertyNo} onChange={e => setFormData({ ...formData, propertyNo: e.target.value.toUpperCase() })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 uppercase" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Asset Category <span className="text-red-500">*</span></label>
                            <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                                <option value="" disabled>Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description <span className="text-red-500">*</span></label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Acquisition Cost (₱)</label>
                            <input type="number" required min="0" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Date Acquired</label>
                            <input type="date" required value={formData.dateAcquired} onChange={e => setFormData({ ...formData, dateAcquired: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Brand</label>
                                <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Model</label>
                                <input type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Serial/Engine No.</label>
                            <input type="text" value={formData.serialNo} onChange={e => setFormData({ ...formData, serialNo: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                            <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as AssetStatus })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm">
                                <option value="Serviceable">Serviceable</option>
                                <option value="Unserviceable">Unserviceable</option>
                                <option value="For Repair">For Repair</option>
                            </select>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Department</label>
                            <select value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value, employeeId: '' })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm">
                                <option value="">-- Unassigned --</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Accountable Officer</label>
                            <select value={formData.employeeId} disabled={!formData.departmentId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm disabled:opacity-50">
                                <option value="">-- Unassigned --</option>
                                {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-3">
                    {step === 0 ? (
                        <button type="button" onClick={closeDrawer} className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    ) : (
                        <button type="button" onClick={() => setStep(step - 1)} className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><ChevronLeft className="w-4 h-4 mr-1" /> Back</button>
                    )}

                    <div className="flex gap-3">
                        {step < STEPS.length - 1 && <button type="button" onClick={handleNext} className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Next <ChevronRight className="w-4 h-4 ml-1" /></button>}
                        {(step === STEPS.length - 1 || action === 'edit') && <button type="submit" disabled={isSaving} className="inline-flex items-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-all">{isSaving ? 'Saving...' : action === 'edit' ? 'Save Changes' : 'Complete Registration'}</button>}
                    </div>
                </div>
            </form>
        </Drawer>
    );
}
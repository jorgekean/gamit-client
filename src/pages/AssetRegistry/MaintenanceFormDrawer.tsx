import React, { useState, useEffect } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { maintenanceApi, type CreateMaintenanceInput } from '../../services/maintenanceApi';
import { toast } from 'sonner';
import { Save, Clock, Package } from 'lucide-react';
import { assetService, type Asset } from '../../services/assetService';

interface MaintenanceFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    assetId: string;
    onSuccess: () => void;
}

export function MaintenanceFormDrawer({ isOpen, onClose, assetId, onSuccess }: MaintenanceFormDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateMaintenanceInput>({
        assetId,
        type: 'Routine',
        status: 'Scheduled',
        description: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        cost: 0,
        performedBy: ''
    });
    const [asset, setAsset] = useState<Asset | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                assetId,
                type: 'Routine',
                status: 'Scheduled',
                description: '',
                scheduledDate: new Date().toISOString().split('T')[0],
                cost: 0,
                performedBy: ''
            });
            if (assetId) {
                assetService.getById(assetId).then(data => {
                    if (data) setAsset(data);
                }).catch(console.error);
            }
        }
    }, [isOpen, assetId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.description) {
            toast.error('Description is required');
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                ...formData,
                scheduledDate: new Date(formData.scheduledDate).toISOString(),
                cost: formData.cost ? Number(formData.cost) : undefined
            };
            
            await maintenanceApi.create(submitData);
            toast.success('Maintenance scheduled successfully');
            window.dispatchEvent(new Event('gamit-maintenance-updated')); // Trigger list refresh
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create maintenance record:', error);
            toast.error('Failed to save maintenance record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Schedule Maintenance">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {asset && (
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-500/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-500/30 text-primary-600 dark:text-primary-400 rounded-lg shrink-0">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary-900 dark:text-primary-100">{asset.name}</h3>
                            <p className="text-sm text-primary-700 dark:text-primary-300 font-mono mt-0.5">{asset.propertyNo}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Maintenance Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                            required
                        >
                            <option value="Routine">Routine Maintenance</option>
                            <option value="Repair">Repair</option>
                            <option value="Inspection">Inspection</option>
                            <option value="Calibration">Calibration</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Initial Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Scheduled Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Description / Issue <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm min-h-[100px]"
                            placeholder="Describe the maintenance to be performed..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Estimated Cost
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₱</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Assigned To
                            </label>
                            <input
                                type="text"
                                value={formData.performedBy}
                                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                                placeholder="Technician / Vendor"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm shadow-primary-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>
            </form>
        </Drawer>
    );
}

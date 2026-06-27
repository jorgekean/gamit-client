import React, { useEffect, useState } from 'react';
import { Clock, Plus, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { maintenanceApi, type MaintenanceRecord } from '../../services/maintenanceApi';
import { MaintenanceFormDrawer } from './MaintenanceFormDrawer';

export function AssetMaintenance({ assetId }: { assetId: string }) {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        loadMaintenance();
    }, [assetId]);

    const loadMaintenance = async () => {
        try {
            setLoading(true);
            const response = await maintenanceApi.getAll({ assetId });
            setRecords(response.data);
        } catch (error) {
            console.error('Failed to load maintenance records:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8 text-center text-sm text-gray-500">
                Loading maintenance history...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary-500" />
                    Maintenance Records
                </h4>
                <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Schedule Task
                </button>
            </div>

            {records.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">No Maintenance Scheduled</p>
                    <p className="text-xs text-gray-500 mt-1">This asset has no recorded maintenance history.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {records.map(record => (
                        <div key={record.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{record.type}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                        record.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        record.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {record.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{record.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-gray-900 dark:text-gray-300">
                                    {format(new Date(record.scheduledDate), 'MMM d, yyyy')}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Scheduled</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MaintenanceFormDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                assetId={assetId}
                onSuccess={loadMaintenance}
            />
        </div>
    );
}

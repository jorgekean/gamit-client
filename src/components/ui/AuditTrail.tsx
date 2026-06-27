// src/components/ui/AssetAuditTrail.tsx
import { useEffect, useState } from 'react';
import { Clock, ChevronRight, Loader2, Printer, Wrench } from 'lucide-react'; // ✨ Added Printer and Wrench icon
import { useNavigate } from 'react-router-dom'; // ✨ Added useNavigate
import { useAssetHistory } from '../../hooks/useAssetHistory';
import { maintenanceApi, type MaintenanceRecord } from '../../services/maintenanceApi';

interface AssetAuditTrailProps {
    assetId: string;
}

export function AssetAuditTrail({ assetId }: AssetAuditTrailProps) {
    const { history, isLoading: isHistoryLoading, fetchHistory } = useAssetHistory();
    const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
    const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (assetId) {
            fetchHistory(assetId);
            setIsMaintenanceLoading(true);
            maintenanceApi.getAll({ assetId }).then(response => {
                setMaintenance(response.data);
            }).catch(console.error).finally(() => setIsMaintenanceLoading(false));
        }
    }, [assetId, fetchHistory]);

    const isLoading = isHistoryLoading || isMaintenanceLoading;

    const timelineItems = [
        ...history.map(h => ({ type: 'history' as const, date: h.date, id: h.id, data: h })),
        ...maintenance.map(m => ({ type: 'maintenance' as const, date: m.createdAt, id: m.id, data: m }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="pt-4">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Asset Audit Trail
            </h4>
            <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-6 mt-2 ml-2">
                {timelineItems.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No history or maintenance recorded yet.</p>
                ) : (
                    timelineItems.map((item) => {
                        if (item.type === 'maintenance') {
                            const record = item.data as MaintenanceRecord;
                            return (
                                <div key={`maint-${item.id}`} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[var(--bg-surface)] bg-purple-500" />
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                <Wrench className="w-3.5 h-3.5 text-purple-500" /> Maintenance Task: {record.type}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-mono uppercase">
                                                {new Date(record.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 mb-2">{record.description}</p>
                                        <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-2.5 space-y-1.5 border border-purple-100 dark:border-purple-500/20 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-700 dark:text-purple-400 font-semibold">Status: {record.status}</span>
                                                <span className="text-purple-600 dark:text-purple-400/80">Scheduled: {new Date(record.scheduledDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        const log = item.data as any;
                        const isTransfer = log.action === 'TRANSFERRED';

                        return (
                            <div key={`hist-${log.id}`} className="relative">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[var(--bg-surface)] ${log.action === 'CREATED' ? 'bg-primary-500' :
                                        isTransfer ? 'bg-blue-500' :
                                            log.action === 'UPDATED' ? 'bg-gray-400' : 'bg-amber-500'
                                    }`} />

                                <div>
                                    {/* Header & Date */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {log.action === 'CREATED' ? 'Asset Registered' :
                                                isTransfer ? 'Reassigned / Transferred' :
                                                    log.action === 'UPDATED' ? 'Asset Details Updated' : 'Condition Updated'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-mono uppercase">
                                            {new Date(log.date).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{log.description}</p>

                                    {/* Diff Box */}
                                    {log.changes && log.changes.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-2.5 space-y-1.5 border border-gray-100 dark:border-white/5">
                                            {log.changes.map((change: any, idx: number) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">
                                                        {change.field}:
                                                    </span>
                                                    <div className="flex items-center flex-wrap gap-1.5">
                                                        <span className="line-through text-red-500/70 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">
                                                            {String(change.from)}
                                                        </span>
                                                        <ChevronRight className="w-3 h-3 text-gray-400" />
                                                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                                                            {String(change.to)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ✨ NEW: Dynamic PTR Print Button */}
                                    {isTransfer && (
                                        <div className="mt-3">
                                            <button
                                                onClick={() => navigate(`/reports/ptr?historyId=${log.id}`)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md transition-colors border border-blue-100 dark:border-blue-500/20"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                Print Transfer Report (PTR)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
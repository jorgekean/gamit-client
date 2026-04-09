// src/components/ui/AssetAuditTrail.tsx
import { useEffect } from 'react';
import { Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useAssetHistory } from '../../hooks/useAssetHistory';

interface AssetAuditTrailProps {
    assetId: string;
}

export function AssetAuditTrail({ assetId }: AssetAuditTrailProps) {
    const { history, isLoading, fetchHistory } = useAssetHistory();

    useEffect(() => {
        if (assetId) {
            fetchHistory(assetId);
        }
    }, [assetId, fetchHistory]);

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
                {history.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No history recorded yet.</p>
                ) : (
                    history.map((log) => (
                        <div key={log.id} className="relative">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[var(--bg-surface)] ${log.action === 'CREATED' ? 'bg-primary-500' :
                                log.action === 'TRANSFERRED' ? 'bg-blue-500' :
                                    log.action === 'UPDATED' ? 'bg-gray-400' : 'bg-amber-500'
                                }`} />

                            <div>
                                {/* Header & Date */}
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {log.action === 'CREATED' ? 'Asset Registered' :
                                            log.action === 'TRANSFERRED' ? 'Reassigned / Transferred' :
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
                                        {log.changes.map((change, idx) => (
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
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
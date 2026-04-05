import React, { useMemo } from 'react';
import { Package, TrendingUp, AlertTriangle, UserMinus } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

import { useAssets } from '../hooks/useAssets';
import { useDepartments } from '../hooks/useDepartments';
import { useAssetCategories } from '../hooks/useAssetCategories';

// Tailwind Colors for Charts
const COLORS = {
    serviceable: '#10b981', // emerald-500
    repair: '#f59e0b',      // amber-500
    unserviceable: '#ef4444', // red-500
    primary: '#0ea5e9'      // sky-500
};

export function Dashboard() {
    const { assets, isLoading: loadingAssets } = useAssets();
    const { departments, isLoading: loadingDepts } = useDepartments();
    const { categories, isLoading: loadingCats } = useAssetCategories();

    // --- DATA CRUNCHING (Derived State) ---

    // 1. Top-Level KPIs
    const totalValue = useMemo(() => assets.reduce((sum, a) => sum + (a.cost || 0), 0), [assets]);
    const unassignedCount = useMemo(() => assets.filter(a => !a.departmentId || !a.employeeId).length, [assets]);
    const actionRequiredCount = useMemo(() => assets.filter(a => a.status !== 'Serviceable').length, [assets]);

    // 2. Status Donut Chart Data
    const statusData = useMemo(() => {
        const counts = { Serviceable: 0, 'For Repair': 0, Unserviceable: 0 };
        assets.forEach(a => {
            if (counts[a.status] !== undefined) counts[a.status]++;
        });
        return [
            { name: 'Serviceable', value: counts['Serviceable'], color: COLORS.serviceable },
            { name: 'For Repair', value: counts['For Repair'], color: COLORS.repair },
            { name: 'Unserviceable', value: counts['Unserviceable'], color: COLORS.unserviceable },
        ].filter(d => d.value > 0); // Only show statuses that have items
    }, [assets]);

    // 3. Department Allocation Bar Chart Data (Top 5)
    const deptAllocationData = useMemo(() => {
        if (!departments.length) return [];

        const allocation = departments.map(dept => {
            const count = assets.filter(a => a.departmentId === dept.id).length;
            return { name: dept.code, count };
        });

        // Sort by count descending and take top 5
        return allocation
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [assets, departments]);

    const isLoading = loadingAssets || loadingDepts || loadingCats;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">Real-time overview of municipal properties and equipment.</p>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--text-muted)]">Total Assets</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{assets.length}</h3>
                    </div>
                </div>

                <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--text-muted)]">Total Portfolio Value</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(totalValue)}
                        </h3>
                    </div>
                </div>

                <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--text-muted)]">Action Required</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{actionRequiredCount}</h3>
                        <p className="text-xs text-gray-500 mt-1">Items broken or for repair</p>
                    </div>
                </div>

                <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-600 dark:text-gray-400">
                        <UserMinus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--text-muted)]">Unassigned Assets</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{unassignedCount}</h3>
                        <p className="text-xs text-gray-500 mt-1">Sitting in GSO inventory</p>
                    </div>
                </div>

            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Asset Status Donut Chart */}
                <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm col-span-1 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Asset Condition</h3>
                    <div className="flex-1 min-h-[250px]">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-500">No data available</div>
                        )}
                    </div>
                    {/* Custom Legend */}
                    <div className="flex justify-center gap-4 mt-4">
                        {statusData.map(entry => (
                            <div key={entry.name} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Departments Bar Chart */}
                <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Allocation by Department (Top 5)</h3>
                    <div className="flex-1 min-h-[250px]">
                        {deptAllocationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptAllocationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-500">No data available</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
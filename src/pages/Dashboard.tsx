// src/pages/Dashboard.tsx
import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export function Dashboard() {
    return (
        <div className="h-full border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 min-h-[400px]">
            <LayoutDashboard className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">Dashboard Metric Cards Will Go Here</p>
        </div>
    );
}
// src/pages/AssetRegistry/columns.tsx
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Printer, MoreVertical, Laptop, Car, Armchair, Package } from 'lucide-react';

// Define our TypeScript shape
export type Asset = {
    id: string;
    propertyNo: string;
    name: string;
    category: string;
    cost: number;
    status: 'Serviceable' | 'Unserviceable' | 'For Repair';
    assignee: string;
};

// UI Helpers (Moved from the main file)
const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'IT Equipment': return <Laptop className="w-4 h-4 text-blue-500" />;
        case 'Motor Vehicles': return <Car className="w-4 h-4 text-primary-500" />;
        case 'Office Furniture': return <Armchair className="w-4 h-4 text-amber-500" />;
        default: return <Package className="w-4 h-4 text-gray-500" />;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Serviceable':
            return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">Serviceable</span>;
        case 'Unserviceable':
            return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-800/30">Unserviceable</span>;
        case 'For Repair':
            return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">For Repair</span>;
        default: return null;
    }
};

export const columns: ColumnDef<Asset>[] = [
    {
        accessorKey: 'name',
        header: 'Property Details',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">{row.original.name}</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">{row.original.propertyNo}</span>
            </div>
        ),
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                {getCategoryIcon(row.getValue('category'))}
                <span>{row.getValue('category')}</span>
            </div>
        ),
    },
    {
        accessorKey: 'assignee',
        header: 'Current Assignee',
        cell: ({ row }) => {
            const assignee: string = row.getValue('assignee');
            return (
                <span className={`inline-flex items-center ${assignee === 'Unassigned' ? 'text-gray-400 italic' : 'text-gray-700 dark:text-gray-300'}`}>
                    {assignee}
                </span>
            );
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
        accessorKey: 'cost',
        header: () => <div className="text-right">Acquisition Cost</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('cost'));
            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div className="text-right font-medium text-gray-900 dark:text-gray-300">{formatted}</div>;
        },
    },
    {
        id: 'actions',
        cell: () => {
            return (
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title="Print PAR/ICS">
                        <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            );
        },
    },
];
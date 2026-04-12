// src/pages/AssetRegistry/columns.tsx
import { type ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, Eye, History, QrCode } from 'lucide-react';
import { type Asset } from '../../services/assetService';
import { Link } from 'react-router-dom';

// We export a FUNCTION here, not just a const array
export const columns = (
    setSearchParams: (params: any) => void,
    handleDelete: (id: string, name: string) => void,
    categories: any[]
): ColumnDef<Asset>[] => [
        {
            accessorKey: 'propertyNo',
            header: 'Property No.',
            cell: ({ row }) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{row.original.propertyNo}</span>,
        },
        {
            accessorKey: 'name',
            header: 'Asset Details',
            cell: ({ row }) => {
                const category = categories.find(c => c.id === row.original.categoryId);

                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">{row.original.name}</span>
                        <span className="text-xs text-gray-500">{category?.name || 'Unknown'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const styles =
                    status === 'Serviceable' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        status === 'Unserviceable' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-amber-100 text-amber-700 border-amber-200';

                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: 'cost',
            header: () => <div className="text-right">Acquisition Cost</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium text-gray-900 dark:text-gray-300">
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(row.original.cost)}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2 transition-opacity hover-reveal">
                    <button
                        onClick={() => setSearchParams({ history: row.original.id })}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                    >
                        <History className="w-4 h-4" />
                    </button>
                    <Link to={`/assets/${row.original.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => setSearchParams({ qr: row.original.id })}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                        title="QR Code"
                    >
                        <QrCode className="w-4 h-4" />
                    </button>
                    <Link
                        to={`/assets/${row.original.id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.original.id, row.original.name)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];
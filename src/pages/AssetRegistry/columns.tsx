// src/pages/AssetRegistry/columns.tsx
import React, { useState, useRef, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, Eye, History, QrCode, MoreVertical, Wrench } from 'lucide-react';
import { type Asset } from '../../services/assetService';
import { Link } from 'react-router-dom';

const ActionsCell = ({ row, setSearchParams, handleDelete }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center justify-end gap-1">
            <Link to={`/assets/${row.original.id}/edit`} className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
            </Link>
            <Link to={`/assets/${row.original.id}`} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors" title="View Details">
                <Eye className="w-4 h-4" />
            </Link>
            
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors" title="More Actions">
                    <MoreVertical className="w-4 h-4" />
                </button>
                
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                        <button onClick={() => { setSearchParams({ maintenance: row.original.id }); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Add Maintenance
                        </button>
                        <button onClick={() => { setSearchParams({ history: row.original.id }); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <History className="w-4 h-4" /> View History
                        </button>
                        <button onClick={() => { setSearchParams({ qr: row.original.id }); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <QrCode className="w-4 h-4" /> View QR Code
                        </button>
                        <button onClick={() => { handleDelete(row.original.id, row.original.name); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete Asset
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

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
            cell: ({ row }) => <ActionsCell row={row} setSearchParams={setSearchParams} handleDelete={handleDelete} />,
        },
    ];
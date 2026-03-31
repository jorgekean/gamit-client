// src/pages/AssetRegistry.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { type PaginationState } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/DataTable';
import { columns, type Asset } from '../AssetRegistry/columns'; // Adjust path based on your folder structure

// Simulated API Data
const MOCK_DB: Asset[] = [
    { id: '1', propertyNo: 'IT-2024-001', name: 'MacBook Pro 16" M3', category: 'IT Equipment', cost: 145000, status: 'Serviceable', assignee: 'Jorge Dela Cruz' },
    { id: '2', propertyNo: 'VH-2023-045', name: 'Toyota Hilux 4x4', category: 'Motor Vehicles', cost: 1850000, status: 'Serviceable', assignee: 'Engr. Manuel' },
    { id: '3', propertyNo: 'OF-2021-112', name: 'Executive Office Desk', category: 'Office Furniture', cost: 25000, status: 'Unserviceable', assignee: 'Unassigned' },
    { id: '4', propertyNo: 'IT-2023-088', name: 'Epson L3210 Printer', category: 'IT Equipment', cost: 8500, status: 'For Repair', assignee: 'HR Department' },
    // ... Imagine 50,000 more records here
];

export function AssetRegistry() {
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Data State
    const [data, setData] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageCount, setPageCount] = useState(0);

    // 2. Pagination State (Owned by the page, passed to the table)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // 3. The Server Fetch Simulation
    useEffect(() => {
        setIsLoading(true);

        // Imagine this is: axios.get(`/api/assets?page=${pagination.pageIndex}&limit=${pagination.pageSize}`)
        const fetchData = async () => {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 800));

            // Send the slice of data to the table
            setData(MOCK_DB);
            setPageCount(15); // Simulated total pages from backend (e.g., Math.ceil(totalRows / pageSize))
            setIsLoading(false);
        };

        fetchData();
    }, [pagination.pageIndex, pagination.pageSize]); // Refetch anytime these change!

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Asset Registry</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Manage and track all municipal properties and equipment.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-primary-500/30 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    Add New Asset
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by property number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-gray-400 shadow-sm"
                    />
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl shadow-sm transition-all">
                    <Filter className="w-4 h-4 text-gray-500" />
                    Filters
                </button>
            </div>

            {/* The TanStack DataTable! */}
            <DataTable
                columns={columns}
                data={data}
                pageCount={pageCount}
                pagination={pagination}
                setPagination={setPagination}
                isLoading={isLoading}
            />

        </div>
    );
}
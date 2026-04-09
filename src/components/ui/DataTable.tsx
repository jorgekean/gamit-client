// src/components/ui/DataTable.tsx
import React from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    type PaginationState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    totalRecords?: number;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    isLoading?: boolean;
    maxHeight?: string; // ✨ Added an optional height prop
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    totalRecords = 0,
    pagination,
    setPagination,
    isLoading,
    maxHeight = "max-h-[calc(100vh-320px)]", // ✨ Default height calculation to keep pagination on screen
}: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const { pageIndex, pageSize } = table.getState().pagination;
    const startRecord = totalRecords === 0 ? 0 : (pageIndex * pageSize) + 1;
    const endRecord = Math.min((pageIndex + 1) * pageSize, totalRecords);

    return (
        <div className="space-y-4">
            {/* CONTAINER */}
            <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm relative overflow-hidden">

                {/* LOADING SPINNER (Bumped to z-30 to cover the sticky header) */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-30 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* ✨ THE SCROLLABLE WRAPPER */}
                <div className={`overflow-auto ${maxHeight} relative`}>
                    <table className="w-full text-left text-sm whitespace-nowrap">

                        {/* ✨ THE STICKY HEADER */}
                        {/* We use a solid background and an inset shadow for the bottom border so it doesn't vanish on scroll */}
                        <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-slate-900 text-[var(--text-muted)] font-medium shadow-[inset_0_-1px_0_0_#e5e7eb] dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.1)]">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="px-6 py-4">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        {/* ROW DIVIDERS */}
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="h-24 text-center text-[var(--text-muted)]">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls (Remain exactly the same) */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
                <div className="text-sm text-[var(--text-muted)]">
                    Showing <span className="font-medium text-gray-900 dark:text-white">{startRecord}</span> to <span className="font-medium text-gray-900 dark:text-white">{endRecord}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalRecords}</span> records
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-sm text-[var(--text-muted)] hidden sm:block">
                        Page <span className="font-medium text-gray-900 dark:text-white">{pageIndex + 1}</span> of <span className="font-medium text-gray-900 dark:text-white">{table.getPageCount() || 1}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
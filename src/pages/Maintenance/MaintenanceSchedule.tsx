import { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { type MaintenanceRecord } from '../../services/maintenanceApi';
import { format } from 'date-fns';
import { DataTable } from '../../components/ui/DataTable';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { useMaintenance } from '../../hooks/useMaintenance';

export function MaintenanceSchedule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const { records, meta, isLoading, setQueryParams } = useMaintenance({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  useEffect(() => {
    const delay = setTimeout(() => {
      setQueryParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchTerm || undefined,
      });
    }, 300);
    return () => clearTimeout(delay);
  }, [pagination.pageIndex, pagination.pageSize, searchTerm, setQueryParams]);

  const columns: ColumnDef<MaintenanceRecord>[] = [
    {
      header: 'Asset No.',
      accessorKey: 'asset.propertyNo',
      cell: ({ row }) => <span className="font-bold text-gray-900 dark:text-white font-mono text-xs">{row.original.asset?.propertyNo}</span>,
    },
    {
      header: 'Asset Name',
      accessorKey: 'asset.name',
      cell: ({ row }) => <span className="font-medium text-sm text-gray-900 dark:text-white">{row.original.asset?.name}</span>,
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
          {row.original.type}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
              status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                  'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
            }`}>
            {status}
          </span>
        )
      },
    },
    {
      header: 'Scheduled',
      accessorKey: 'scheduledDate',
      cell: ({ row }) => <span className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(row.original.scheduledDate), 'MMM d, yyyy')}</span>,
    },
    {
      header: 'Completed',
      accessorKey: 'completedDate',
      cell: ({ row }) => <span className="text-sm text-gray-500 dark:text-gray-400">{row.original.completedDate ? format(new Date(row.original.completedDate), 'MMM d, yyyy') : '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Schedule</h1>
          <p className="text-muted-foreground">Manage and track asset maintenance activities.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">All Maintenance Tasks</h2>
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets or tasks..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-0">
          <DataTable
            columns={columns}
            data={records}
            pageCount={meta.totalPages}
            totalRecords={meta.total}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

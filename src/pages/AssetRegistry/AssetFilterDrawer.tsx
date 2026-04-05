// src/pages/AssetRegistry/components/AssetFilterDrawer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Drawer } from '../../components/ui/Drawer';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { useAssetCategories } from '../../hooks/useAssetCategories';

interface AssetFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AssetFilterDrawer({ isOpen, onClose }: AssetFilterDrawerProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { departments } = useDepartments();
    const { employees } = useEmployees();
    const { categories } = useAssetCategories();

    const deptFilter = searchParams.get('dept') || '';
    const empFilter = searchParams.get('emp') || '';
    const statusFilter = searchParams.get('status') || '';
    const catFilter = searchParams.get('cat') || '';

    const [filterForm, setFilterForm] = useState({ dept: '', emp: '', status: '', cat: '' });

    // Sync form with URL when opened
    useEffect(() => {
        if (isOpen) setFilterForm({ dept: deptFilter, emp: empFilter, status: statusFilter, cat: catFilter });
    }, [isOpen, deptFilter, empFilter, statusFilter, catFilter]);

    const availableEmployees = useMemo(() => {
        if (!filterForm.dept) return employees;
        return employees.filter(emp => emp.departmentId === filterForm.dept);
    }, [filterForm.dept, employees]);

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);

        if (filterForm.dept) newParams.set('dept', filterForm.dept); else newParams.delete('dept');
        if (filterForm.emp) newParams.set('emp', filterForm.emp); else newParams.delete('emp');
        if (filterForm.status) newParams.set('status', filterForm.status); else newParams.delete('status');
        if (filterForm.cat) newParams.set('cat', filterForm.cat); else newParams.delete('cat');

        newParams.delete('filters'); // close drawer parameter
        setSearchParams(newParams);
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Advanced Filters">
            <form onSubmit={applyFilters} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Department</label>
                    <select value={filterForm.dept} onChange={e => setFilterForm({ ...filterForm, dept: e.target.value, emp: '' })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Accountable Officer</label>
                    <select value={filterForm.emp} onChange={e => setFilterForm({ ...filterForm, emp: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                        <option value="">All Employees</option>
                        {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Physical Condition</label>
                    <select value={filterForm.status} onChange={e => setFilterForm({ ...filterForm, status: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                        <option value="">All Statuses</option>
                        <option value="Serviceable">Serviceable</option>
                        <option value="For Repair">For Repair</option>
                        <option value="Unserviceable">Unserviceable</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Asset Category</label>
                    <select value={filterForm.cat} onChange={e => setFilterForm({ ...filterForm, cat: e.target.value })} className="block w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                    <button type="button" onClick={() => setFilterForm({ dept: '', emp: '', status: '', cat: '' })} className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Reset
                    </button>
                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
                        Apply Filters
                    </button>
                </div>
            </form>
        </Drawer>
    );
}
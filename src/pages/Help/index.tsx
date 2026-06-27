import React, { useState } from 'react';
import { BookOpen, Package, Users, Wrench, FileText, ChevronDown, ChevronRight } from 'lucide-react';

const guideSections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: BookOpen,
        content: (
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Welcome to GAMIT (General Asset Management and Inventory Tracker). This system is designed to help you track organizational properties, manage employee accountabilities, and schedule maintenance efficiently.</p>
                <p><strong>Dashboard:</strong> When you first log in, you will see the Dashboard. It provides a bird's-eye view of total assets, their current conditions, and recent activity across the organization.</p>
            </div>
        )
    },
    {
        id: 'asset-registry',
        title: 'Managing Assets',
        icon: Package,
        content: (
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>The <strong>Asset Registry</strong> is the core of the application where all properties are stored.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Registering an Asset:</strong> Click "Register Asset" to add a new item. You must provide a Property Number, Name, Category, and Cost.</li>
                    <li><strong>Assigning Assets:</strong> To issue an asset to an employee, edit the asset and assign it to a specific Department and Employee. This builds their accountability ledger.</li>
                    <li><strong>Generating QR Codes:</strong> Every asset has a built-in QR Code feature. Click the "QR" icon on any asset row to view and print the QR tag for physical labeling.</li>
                    <li><strong>Audit Trail:</strong> Click the "History" icon to view a detailed timeline of when an asset was registered, updated, or transferred.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'master-data',
        title: 'Master Data (Employees & Departments)',
        icon: Users,
        content: (
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Before assigning assets, you must configure your Master Data.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Departments:</strong> Add company offices (e.g., Executive Office, Operations) to group assets effectively.</li>
                    <li><strong>Employees:</strong> Register personnel and assign them to departments. You can view an employee's <strong>Accountability Ledger</strong> by clicking the package icon next to their name.</li>
                    <li><strong>Asset Categories:</strong> Define COA property classifications and their useful life for depreciation calculations.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'maintenance',
        title: 'Maintenance Schedule',
        icon: Wrench,
        content: (
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Tracking the health of physical assets is critical. Use the Maintenance module to schedule repairs or routine checks.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Scheduling:</strong> From the Asset Registry, click the "Wrench" icon on an asset to schedule maintenance.</li>
                    <li><strong>Tracking:</strong> Navigate to the Maintenance Schedule page to see all pending and completed tasks. You can search or filter to find specific tasks.</li>
                    <li><strong>Status Updates:</strong> Once a task is done, you can mark it as "Completed" or "Cancelled". Completed tasks will log the completion date automatically.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'reports',
        title: 'Generating Reports',
        icon: FileText,
        content: (
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>GAMIT automatically generates standard COA (Commission on Audit) forms based on your asset data.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>PTR (Property Transfer Report):</strong> Generated automatically when an asset is reassigned from one employee to another. You can print this directly from the Asset's Audit Trail.</li>
                    <li><strong>PAR (Property Acknowledgment Receipt):</strong> Generate this from the Documents page for high-value properties assigned to employees.</li>
                    <li><strong>ICS (Inventory Custodian Slip):</strong> Used for low-value, semi-expendable items.</li>
                </ul>
            </div>
        )
    }
];

export function HelpGuide() {
    const [openSection, setOpenSection] = useState<string>('getting-started');

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & User Guide</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Learn how to effectively use the GAMIT system.</p>
                </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-white/5">
                    {guideSections.map((section) => {
                        const Icon = section.icon;
                        const isOpen = openSection === section.id;

                        return (
                            <div key={section.id} className="group">
                                <button
                                    onClick={() => setOpenSection(isOpen ? '' : section.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${isOpen ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className={`text-lg font-semibold ${isOpen ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                            {section.title}
                                        </h3>
                                    </div>
                                    {isOpen ? (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                    )}
                                </button>
                                
                                {isOpen && (
                                    <div className="px-6 pb-6 pt-2 ml-[3.25rem] animate-in slide-in-from-top-2 duration-200">
                                        {section.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="p-3 bg-white dark:bg-indigo-900/50 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                    <Wrench className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Need Technical Support?</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">If you encounter an issue or bug that isn't covered in this manual, please contact your IT administrator.</p>
                </div>
            </div>
        </div>
    );
}

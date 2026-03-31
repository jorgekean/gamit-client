// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, FileText, Settings, X, Sparkles } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Asset Registry', path: '/assets', icon: Package },
    { name: 'Directory', path: '/directory', icon: Users },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <aside className={`
      fixed inset-y-4 left-4 z-50 w-64 bg-[var(--bg-surface)] rounded-2xl shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}
      md:relative md:translate-x-0 md:inset-y-0 md:left-0
    `}>
            <div className="flex items-center justify-between h-20 px-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md shadow-primary-500/20">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Gamit</span>
                </div>
                <button
                    className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        /* React Router's NavLink automatically gives us an 'isActive' boolean! */
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={onClose} // Close sidebar on mobile when a link is clicked
                            className={({ isActive }) => `
                group flex items-center px-3 py-2.5 rounded-xl font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                                }
              `}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                                    {link.name}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/20 ring-1 ring-gray-200/50 dark:ring-gray-700/50 text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary-500" />
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Gamit is up to date</p>
                <p className="text-[10px] text-gray-400 mt-1">Version 1.0.0</p>
            </div>
        </aside>
    );
}
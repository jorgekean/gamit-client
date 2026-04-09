import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function UserProfileDropdown() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get the first initial for the avatar circle (fallback to 'U' if undefined)
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="relative group">
            {/* 1. The Avatar Circle */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-primary-500/30 transition-all">
                {initial}
            </div>

            {/* 2. The Hover Card (Hidden by default, visible on group-hover) */}
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

                {/* User Details Section */}
                <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                        {user?.email}
                    </p>

                    {/* Role Badge */}
                    <div className="mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'GSO' ? 'GSO Officer' : 'Standard User'}
                        </span>
                    </div>
                </div>

                {/* Action Section */}
                <div className="p-2">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                        Sign out
                    </button>
                </div>

            </div>
        </div>
    );
}
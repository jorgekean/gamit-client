import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { IdCard, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export function Register() {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Basic Frontend Validation
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            // 2. Call the new Fastify endpoint
            await api.post('/auth/register', {
                employeeId: employeeId.trim(), // Remove accidental spaces
                password
            });

            toast.success('Registration successful! You can now log in.');
            navigate('/login'); // Send them to login page after success

        } catch (error: any) {
            // Display the specific error thrown by our AuthService (e.g., "Employee ID not found")
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">

                {/* Header Area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activate Account</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Link your official LGU Employee ID to access the registry.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Employee ID Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Official Employee No.
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IdCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())} // Auto-uppercase
                                className="pl-10 w-full p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
                                placeholder="e.g. EMP-2026-001"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
                                placeholder="Minimum 8 characters"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 w-full p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
                                placeholder="Re-type password"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 text-white p-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-70"
                    >
                        {isLoading ? 'Verifying with HR Database...' : 'Activate Account'}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an active account?{' '}
                    <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                        Sign in here
                    </Link>
                </div>

            </div>
        </div>
    );
}
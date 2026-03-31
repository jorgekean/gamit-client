// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In the future, this is where you call your Fastify API.
        // For now, we just redirect to the dashboard.
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative overflow-hidden font-sans text-[var(--text-base)]">

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 dark:opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 dark:opacity-20 animate-blob animation-delay-2000"></div>

            {/* Login Card (Floating & Glassmorphic) */}
            <div className="w-full max-w-md bg-[var(--bg-surface)]/90 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-gray-800 p-8 relative z-10">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-5">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                        Gamit
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm font-medium">
                        Property and Asset Management System
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email / Username Input */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Email or Employee ID
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-[var(--bg-surface)] transition-all placeholder-gray-400"
                                placeholder="jorge@calaca.gov.ph"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="block w-full pl-11 pr-12 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-[var(--bg-surface)] transition-all placeholder-gray-400"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Options Row */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer dark:bg-gray-900 dark:border-gray-700"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-muted)] cursor-pointer select-none">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] dark:focus:ring-offset-gray-900"
                    >
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* Security Badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Secured LGU Portal</span>
                </div>

            </div>
        </div>
    );
}
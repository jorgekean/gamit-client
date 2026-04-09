// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Match this to the User object your backend returns
interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // On initial load, check if we have session data saved in localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('gamit_token');
        const storedUser = localStorage.getItem('gamit_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData: User, jwtToken: string) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('gamit_user', JSON.stringify(userData));
        localStorage.setItem('gamit_token', jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('gamit_user');
        localStorage.removeItem('gamit_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook for components to easily access auth state
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // 1. Not logged in? Kick them to the login screen.
    // We save the 'from' location so we can redirect them back after they log in.
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Role-Based Access Control (RBAC) Check
    // If the route requires specific roles (e.g., 'ADMIN') and the user doesn't have it, deny access.
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. User is authorized, render the requested page
    return <Outlet />;
}
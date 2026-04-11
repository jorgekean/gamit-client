import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { AuthProvider } from './contexts/AuthContext'; // ✨ 1. Import AuthProvider

// Components
import { ProtectedRoute } from './components/ProtectedRoute'; // ✨ 2. Import the Guard

// Layout & Pages
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Auth/Login';
import { Dashboard } from './pages/Dashboard';
import { AssetRegistry } from './pages/AssetRegistry';
import { Departments } from './pages/Departments';
import { Employees } from './pages/Employees';
import { AssetCategories } from './pages/AssetCategories';
import { AssetDetails } from './pages/AssetRegistry/AssetDetails';
import { useSyncManager } from './hooks/useSyncManager';
import { PTRReport } from './pages/Reports/PTRReport';
import { PARReport } from './pages/Reports/PARReport';
import { ICSReport } from './pages/Reports/ICSReport';
import { IIRUPReport } from './pages/Reports/IIRUPReport';
import { RPCPPEReport } from './pages/Reports/RPCPPEReport';
import { Register } from './pages/Auth/Register';

function App() {
  useSyncManager(); // Custom hook to handle online/offline sync logic


  return (
    <ThemeProvider defaultTheme="system">
      {/* ✨ 3. Wrap everything that needs authentication state in AuthProvider */}
      <AuthProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Toaster position="top-center" richColors theme="system" />

            <Routes>
              {/* 🔓 PUBLIC ROUTE */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />


              {/* 🔒 PROTECTED ROUTES (Requires Login) */}
              <Route element={<ProtectedRoute />}>
                {/* Everything inside AppLayout is now guarded! */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="assets" element={<AssetRegistry />} />
                  <Route path="assets/:id" element={<AssetDetails />} /> {/* Fixed leading slash for v6 relative routing */}
                  <Route path="departments" element={<Departments />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="assetcategories" element={<AssetCategories />} />
                  <Route path="reports/ptr" element={<PTRReport />} />
                  <Route path="reports/par" element={<PARReport />} />
                  <Route path="reports/ics" element={<ICSReport />} />
                  <Route path="reports/iirup" element={<IIRUPReport />} />
                  <Route path="reports/rpcppe" element={<RPCPPEReport />} />

                </Route>
              </Route>
            </Routes>

          </BrowserRouter>
        </ConfirmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
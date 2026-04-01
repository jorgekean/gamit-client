import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfirmProvider } from './contexts/ConfirmContext'; // 1. Import it

// Layout & Pages (keep your existing imports)
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AssetRegistry } from './pages/AssetRegistry';
import { Departments } from './pages/Departments';

const EmployeesPlaceholder = () => (<></>);

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      {/* 2. Wrap the app with ConfirmProvider */}
      <ConfirmProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors theme="system" />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="assets" element={<AssetRegistry />} />
              <Route path="departments" element={<Departments />} />
              <Route path="employees" element={<EmployeesPlaceholder />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </ThemeProvider>
  );
}

export default App;
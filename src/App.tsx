// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { AssetRegistry } from './pages/AssetRegistry'; // <-- 1. Import it here

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<AssetRegistry />} /> {/* <-- 2. Add route here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
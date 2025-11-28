
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Parties } from './pages/Parties';
import { Items } from './pages/Items';
import { TransactionForm } from './components/TransactionForm';
import { InvoiceView } from './pages/InvoiceView';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AdminLayout } from './components/Layout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="parties" element={<Parties />} />
          <Route path="items" element={<Items />} />
          <Route path="sales/create" element={<TransactionForm type="SALES" />} />
          <Route path="purchase/create" element={<TransactionForm type="PURCHASE" />} />
          <Route path="invoice/:id" element={<InvoiceView />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="stock" element={<Reports />} /> {/* Reusing Reports for Stock View shortcut */}
          <Route path="ledger" element={<Reports />} /> {/* Reusing Reports for Ledger View shortcut */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

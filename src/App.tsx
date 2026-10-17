import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Projects } from './pages/Projects/Projects';
import { ProjectDetail } from './pages/Projects/ProjectDetail';
import { Deliverables } from './pages/Deliverables/Deliverables';
import { Approvals } from './pages/Approvals/Approvals';
import { Clients } from './pages/Clients/Clients';
import { Invoices } from './pages/Invoices/Invoices';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="deliverables" element={<Deliverables />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="clients" element={<Clients />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Modal, Input, Select, Button } from '../ui';
import { studioService } from '../../services';
import './AppShell.css';

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'deliverable' | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // New Project Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectClient, setProjectClient] = useState('Maison Éthérée');
  const [projectCategory, setProjectCategory] = useState<'Brand Identity' | 'Editorial & Book' | 'Digital Experience' | 'Spatial & Exhibition' | 'Packaging & Print'>('Packaging & Print');
  const [projectBudget, setProjectBudget] = useState('45000');
  const [projectLead, setProjectLead] = useState('Mathilde Vane');
  const [projectTargetDate, setProjectTargetDate] = useState('2026-12-15');
  const [projectError, setProjectError] = useState('');

  // New Deliverable Form State
  const [delivTitle, setDelivTitle] = useState('');
  const [delivFormat, setDelivFormat] = useState('Print-Ready PDF / CAD Spec');
  const [delivVersion, setDelivVersion] = useState('v1.0');
  const [delivDueDate, setDelivDueDate] = useState('2026-11-01');
  const [delivError, setDelivError] = useState('');

  // Breadcrumb path computation
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'STUDIO // RUNWAY & OVERVIEW';
    if (path.startsWith('/projects')) return 'STUDIO // WORKS & COMMISSIONS';
    if (path.startsWith('/deliverables')) return 'PRODUCTION // DELIVERABLES & SPECS';
    if (path.startsWith('/approvals')) return 'GOVERNANCE // CLIENT SIGN-OFFS';
    if (path.startsWith('/clients')) return 'RELATIONS // CLIENT ROSTER';
    if (path.startsWith('/invoices')) return 'TREASURY // INVOICES & LEDGER';
    return 'STUDIO OS';
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setProjectError('Project title and commission scope is required.');
      return;
    }

    await studioService.createProject({
      clientId: 'cli-1',
      clientName: projectClient,
      title: projectTitle.trim(),
      category: projectCategory,
      status: 'in_progress',
      leadDesigner: projectLead.trim() || 'Mathilde Vane',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: projectTargetDate,
      budgetTotal: parseFloat(projectBudget) || 30000,
      summary: `Commissioned work for ${projectClient}. Formulated under Studio OS design standards.`
    });

    setModalType(null);
    setProjectTitle('');
    setProjectError('');
    // refresh current view
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivTitle.trim()) {
      setDelivError('Deliverable specification title is required.');
      return;
    }

    await studioService.createDeliverable({
      projectId: 'prj-101',
      projectTitle: 'N° 07 L’Ombre d’Or Botanical Flacon',
      clientName: 'Maison Éthérée',
      title: delivTitle.trim(),
      format: delivFormat,
      currentVersion: delivVersion.trim() || 'v1.0',
      status: 'draft',
      dueDate: delivDueDate,
      assignedTo: 'Mathilde Vane',
      specNotes: 'Initial production specification drafted in Studio OS.'
    });

    setModalType(null);
    setDelivTitle('');
    setDelivError('');
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(3);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(2);

  const loadCounts = async () => {
    try {
      const [apps, invs] = await Promise.all([
        studioService.getApprovals(),
        studioService.getInvoices()
      ]);
      setPendingApprovalsCount(apps.filter(a => a.status === 'pending').length);
      setUnpaidInvoicesCount(invs.filter(i => i.status === 'issued' || i.status === 'overdue').length);
    } catch {
      // fallback
    }
  };

  React.useEffect(() => {
    loadCounts();
    const handleUpdate = () => loadCounts();
    const handleOpenProjectModal = () => setModalType('project');
    const handleOpenDelivModal = () => setModalType('deliverable');

    window.addEventListener('studio:data-updated', handleUpdate);
    window.addEventListener('studio:open-new-project-modal', handleOpenProjectModal);
    window.addEventListener('studio:open-new-deliverable-modal', handleOpenDelivModal);

    return () => {
      window.removeEventListener('studio:data-updated', handleUpdate);
      window.removeEventListener('studio:open-new-project-modal', handleOpenProjectModal);
      window.removeEventListener('studio:open-new-deliverable-modal', handleOpenDelivModal);
    };
  }, []);

  return (
    <div className="studio-app-shell">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        pendingApprovalsCount={pendingApprovalsCount}
        unpaidInvoicesCount={unpaidInvoicesCount}
      />

      <div className="studio-app-shell__main">
        <TopBar 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenQuickAction={(type) => {
            if (type === 'invoice') {
              navigate('/invoices');
            } else {
              setModalType(type);
            }
          }}
          breadcrumb={getBreadcrumb()}
        />

        <main className="studio-app-shell__content">
          <Outlet />
        </main>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={modalType === 'project'}
        onClose={() => setModalType(null)}
        title="Commission New Project"
        subtitle="Establish an architectural, editorial, or brand commission with designated lead designer."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateProject}>Create Commission</Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="studio-form-grid">
          {projectError && (
            <div className="studio-modal-alert">
              <strong>Validation Notice:</strong> {projectError}
            </div>
          )}
          <Input 
            label="Project Title & Scope" 
            placeholder="e.g. 2027 Tokyo Biennial Visual Identity & Ephemera"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <div className="studio-form-row">
            <Select 
              label="Client"
              value={projectClient}
              onChange={(e) => setProjectClient(e.target.value)}
              options={[
                { value: 'Maison Éthérée', label: 'Maison Éthérée (Paris)' },
                { value: 'Kallio Form', label: 'Kallio Form (Helsinki)' },
                { value: 'ArchiMono Publishing', label: 'ArchiMono Publishing (Zürich)' },
                { value: 'Kurogane Acoustics', label: 'Kurogane Acoustics (Kyoto)' },
                { value: 'Neue Galerie Basel', label: 'Neue Galerie Basel (Basel)' }
              ]}
            />
            <Select 
              label="Discipline"
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value as any)}
              options={[
                { value: 'Packaging & Print', label: 'Packaging & Print' },
                { value: 'Brand Identity', label: 'Brand Identity' },
                { value: 'Editorial & Book', label: 'Editorial & Book' },
                { value: 'Digital Experience', label: 'Digital Experience' },
                { value: 'Spatial & Exhibition', label: 'Spatial & Exhibition' }
              ]}
            />
          </div>

          <div className="studio-form-row">
            <Input 
              label="Target Completion Date" 
              type="date"
              value={projectTargetDate}
              onChange={(e) => setProjectTargetDate(e.target.value)}
            />
            <Input 
              label="Total Budget (EUR / USD)" 
              type="number"
              placeholder="45000"
              value={projectBudget}
              onChange={(e) => setProjectBudget(e.target.value)}
            />
          </div>

          <Input 
            label="Lead Art Director / Designer" 
            value={projectLead}
            onChange={(e) => setProjectLead(e.target.value)}
          />
        </form>
      </Modal>

      {/* New Deliverable Modal */}
      <Modal
        isOpen={modalType === 'deliverable'}
        onClose={() => setModalType(null)}
        title="Record Production Deliverable"
        subtitle="Catalog a distinct artifact, die-line, publication proof, or digital component."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="vermilion" onClick={handleCreateDeliverable}>Record Deliverable</Button>
          </>
        }
      >
        <form onSubmit={handleCreateDeliverable} className="studio-form-grid">
          {delivError && (
            <div className="studio-modal-alert">
              <strong>Validation Notice:</strong> {delivError}
            </div>
          )}
          <Input 
            label="Deliverable Name" 
            placeholder="e.g. Linen Hardcover Deboss Die & Foil Placement Spec"
            value={delivTitle}
            onChange={(e) => setDelivTitle(e.target.value)}
            required
          />

          <div className="studio-form-row">
            <Input 
              label="Physical / Digital Spec Format" 
              placeholder="e.g. Print-Ready PDF/X-4 (FOGRA51)"
              value={delivFormat}
              onChange={(e) => setDelivFormat(e.target.value)}
            />
            <Input 
              label="Initial Version" 
              placeholder="v1.0"
              value={delivVersion}
              onChange={(e) => setDelivVersion(e.target.value)}
            />
          </div>

          <Input 
            label="Target Review Date" 
            type="date"
            value={delivDueDate}
            onChange={(e) => setDelivDueDate(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

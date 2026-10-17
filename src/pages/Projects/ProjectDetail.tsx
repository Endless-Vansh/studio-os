import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Layers, 
  CheckSquare, 
  Receipt, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { studioService } from '../../services';
import { 
  Project, 
  Deliverable, 
  ProductionTask, 
  Invoice, 
  Revision 
} from '../../types';
import { Badge, Button, Tabs, Drawer, AlertBanner, ProgressBar, EmptyState } from '../../components/ui';
import './ProjectDetail.css';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<string>('deliverables');

  // Revision drawer state
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadProjectData = async () => {
    if (!id) return;
    const p = await studioService.getProjectById(id);
    if (p) {
      setProject(p);
      const [d, t, invs] = await Promise.all([
        studioService.getDeliverables(p.id),
        studioService.getTasks(p.id),
        studioService.getInvoices()
      ]);
      setDeliverables(d);
      setTasks(t);
      setInvoices(invs.filter((i) => i.projectId === p.id));
    }
  };

  useEffect(() => {
    loadProjectData();
    const handleUpdate = () => loadProjectData();
    window.addEventListener('studio:data-updated', handleUpdate);
    return () => window.removeEventListener('studio:data-updated', handleUpdate);
  }, [id]);

  const handleOpenRevisions = async (deliv: Deliverable) => {
    setSelectedDeliverable(deliv);
    const revs = await studioService.getRevisions(deliv.id);
    setRevisions(revs);
    setIsDrawerOpen(true);
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!project) {
    return (
      <div className="studio-project-detail__loading">
        <Link to="/projects" className="studio-back-link">
          <ArrowLeft size={14} /> Back to Works
        </Link>
        <div className="studio-loading-state" style={{ padding: '3rem 0' }}>
          <div className="studio-spinner" />
          <span>LOADING COMMISSION DOSSIER // ARCHIVE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-project-detail studio-animate-fade-in">
      {/* Back Link */}
      <div className="studio-project-detail__breadcrumb">
        <Link to="/projects" className="studio-back-link">
          <ArrowLeft size={14} /> Works Directory
        </Link>
        <span className="studio-breadcrumb-divider">/</span>
        <span className="mono">{project.code}</span>
      </div>

      {/* Hero Header */}
      <section className="studio-project-detail__header">
        <div className="studio-project-detail__top-meta">
          <span className="mono studio-project-detail__client">{project.clientName}</span>
          <div className="studio-project-detail__tags">
            <Badge variant="vermilion" size="sm">
              {project.category}
            </Badge>
            <select
              className="studio-badge-select mono"
              value={project.status}
              aria-label="Update Project Status"
              onChange={async (e) => {
                const updated = await studioService.updateProjectStatus(project.id, e.target.value as any);
                setProject(updated);
              }}
            >
              <option value="in_progress">IN PROGRESS</option>
              <option value="in_review">IN REVIEW</option>
              <option value="completed">COMPLETED</option>
              <option value="on_hold">ON HOLD</option>
            </select>
          </div>
        </div>

        <div className="studio-project-detail__hero-grid">
          <div className="studio-project-detail__hero-text">
            <h1 className="studio-project-detail__title">{project.title}</h1>
            <p className="studio-project-detail__summary">{project.summary}</p>
          </div>

          {project.imageUrl && (
            <div className="studio-project-detail__specimen-plate studio-card-interactive">
              <div className="studio-specimen-plate__frame">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="studio-specimen-plate__img" 
                  loading="lazy"
                />
                <div className="studio-specimen-plate__overlay">
                  <span className="studio-specimen-plate__corner studio-specimen-plate__corner--tl">
                    ⌖ SPECIMEN PROOF // {project.code}
                  </span>
                  <span className="studio-specimen-plate__corner studio-specimen-plate__corner--tr">
                    100% SCALE // 300 DPI
                  </span>
                  {project.imageStamp && (
                    <span className="studio-specimen-plate__stamp">
                      {project.imageStamp}
                    </span>
                  )}
                  <span className="studio-specimen-plate__corner studio-specimen-plate__corner--br">
                    ISO 12647-2 ARCHIVAL
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spec Strip */}
        <div className="studio-project-detail__spec-strip">
          <div className="studio-spec-cell">
            <span className="studio-spec-label">LEAD ART DIRECTOR</span>
            <span className="studio-spec-value">{project.leadDesigner}</span>
          </div>
          <div className="studio-spec-cell">
            <span className="studio-spec-label">START — TARGET</span>
            <span className="studio-spec-value mono">{project.startDate} → {project.targetDate}</span>
          </div>
          <div className="studio-spec-cell">
            <span className="studio-spec-label">BUDGET ALLOCATED</span>
            <span className="studio-spec-value mono">{formatCurrency(project.budgetTotal)}</span>
          </div>
          <div className="studio-spec-cell">
            <span className="studio-spec-label">BUDGET SPENT</span>
            <span className="studio-spec-value mono">{formatCurrency(project.budgetSpent)}</span>
          </div>
          <div className="studio-spec-cell">
            <span className="studio-spec-label">STAGE COMPLETION</span>
            <span className="studio-spec-value mono">{project.progressPercent}%</span>
          </div>
        </div>

        <div className="studio-project-detail__progress-wrap" style={{ marginTop: '1rem' }}>
          <ProgressBar percent={project.progressPercent} variant="ink" delay={250} height={4} />
        </div>
      </section>

      {/* Tabs */}
      <div className="studio-project-detail__tabs-wrap">
        <Tabs
          tabs={[
            { id: 'deliverables', label: 'Deliverables & Revisions', count: deliverables.length },
            { id: 'tasks', label: 'Production Tasks', count: tasks.length },
            { id: 'financials', label: 'Financial Ledger', count: invoices.length },
            { id: 'specs', label: 'Fabrication & Scope' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab 1: Deliverables */}
      {activeTab === 'deliverables' && (
        <section className="studio-tab-content">
          <div className="studio-deliverables-list">
            {deliverables.length === 0 ? (
              <EmptyState
                icon={<Layers size={22} />}
                eyebrow="// COMMISSION SPECIFICATIONS"
                title="No Deliverables Logged"
                description="No technical specifications, die-cuts or deliverables have been registered for this project yet."
              />
            ) : (
              deliverables.map((deliv) => (
                <div key={deliv.id} className="studio-deliv-card">
                  <div className="studio-deliv-card__header">
                    <div className="studio-deliv-card__meta">
                      <span className="mono studio-deliv-card__code">{deliv.code}</span>
                      <span className="mono studio-deliv-card__version">{deliv.currentVersion}</span>
                      <Badge 
                        variant={
                          deliv.status === 'approved' ? 'approved' :
                          deliv.status === 'client_review' ? 'review' :
                          deliv.status === 'changes_requested' ? 'overdue' : 'draft'
                        }
                        size="sm"
                      >
                        {deliv.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenRevisions(deliv)}
                      iconRight={<ChevronRight size={13} />}
                    >
                      Inspect Revisions ({deliv.revisionsCount})
                    </Button>
                  </div>

                  <h3 className="studio-deliv-card__title">{deliv.title}</h3>
                  <div className="studio-deliv-card__format mono">Format: {deliv.format}</div>
                  <p className="studio-deliv-card__notes">{deliv.specNotes}</p>

                  <div className="studio-deliv-card__footer">
                    <span className="mono">Assigned: {deliv.assignedTo}</span>
                    <span className="mono">Due: {deliv.dueDate}</span>
                    <span className="mono">Last Updated: {deliv.lastUpdated}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Tab 2: Tasks */}
      {activeTab === 'tasks' && (
        <section className="studio-tab-content">
          {tasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={22} />}
              eyebrow="// PRODUCTION DISPATCH"
              title="No Tasks Scheduled"
              description="No atelier tasks or milestone sprints have been logged for this commission."
            />
          ) : (
            <div className="studio-tasks-table-wrap">
              <table className="studio-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>STATUS</th>
                    <th>PRODUCTION TASK</th>
                    <th>PHASE</th>
                    <th>PRIORITY</th>
                    <th>ASSIGNEE</th>
                    <th>DEADLINE</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <select
                          className="studio-table-select mono"
                          value={task.status}
                          aria-label="Update Task Status"
                          onChange={async (e) => {
                            const updated = await studioService.updateTaskStatus(task.id, e.target.value as any);
                            setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
                          }}
                        >
                          <option value="todo">TODO</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="review">REVIEW</option>
                          <option value="done">DONE</option>
                        </select>
                      </td>
                      <td>
                        <strong>{task.title}</strong>
                      </td>
                      <td className="mono">{task.phase}</td>
                      <td>
                        <Badge 
                          variant={task.priority === 'urgent' ? 'overdue' : 'draft'}
                          size="sm"
                        >
                          {task.priority}
                        </Badge>
                      </td>
                      <td>{task.assignee}</td>
                      <td className="mono">{task.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Financials */}
      {activeTab === 'financials' && (
        <section className="studio-tab-content">
          <div className="studio-financials-summary">
            <div className="studio-fin-stat">
              <span className="studio-fin-stat__label">TOTAL ALLOCATED BUDGET</span>
              <span className="studio-fin-stat__val mono">{formatCurrency(project.budgetTotal)}</span>
            </div>
            <div className="studio-fin-stat">
              <span className="studio-fin-stat__label">INVOICED TO DATE</span>
              <span className="studio-fin-stat__val mono">{formatCurrency(project.budgetSpent)}</span>
            </div>
            <div className="studio-fin-stat">
              <span className="studio-fin-stat__label">REMAINING CONTRACT POOL</span>
              <span className="studio-fin-stat__val mono">
                {formatCurrency(project.budgetTotal - project.budgetSpent)}
              </span>
            </div>
          </div>

          <div className="studio-section-header" style={{ marginTop: '2rem' }}>
            <h3 className="studio-section-title">Invoices Issued Under Commission</h3>
          </div>

          {invoices.length === 0 ? (
            <EmptyState
              icon={<Receipt size={22} />}
              eyebrow="// TREASURY SETTLEMENTS"
              title="No Invoices Dispatched"
              description="No fee billings or expense statements have been issued for this commission yet."
            />
          ) : (
            <div className="studio-table-container">
              <table className="studio-table">
                <thead>
                  <tr>
                    <th>INVOICE NUMBER</th>
                    <th>ISSUE DATE</th>
                    <th>DUE DATE</th>
                    <th>STATUS</th>
                    <th>TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="mono"><strong>{inv.invoiceNumber}</strong></td>
                      <td className="mono">{inv.issueDate}</td>
                      <td className="mono">{inv.dueDate}</td>
                      <td>
                        <Badge variant={inv.status === 'paid' ? 'paid' : 'review'} size="sm">
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="mono font-semibold">{formatCurrency(inv.total, inv.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 4: Scope & Specs */}
      {activeTab === 'specs' && (
        <section className="studio-tab-content studio-specs-document">
          <article className="studio-editorial-doc">
            <h3>Commission Specification & Material Dossier</h3>
            <p>
              This commission is executed under Atelier Du Monde's physical production standards.
              All paper stocks must carry FSC and EU Ecolabel certifications. 
              Metallic foils are specified exclusively with Kurz Luxor 428 and stamped with 
              hardened brass CNC dies at 145°C.
            </p>

            <div className="studio-spec-matrix">
              <div className="studio-spec-row">
                <span className="studio-spec-key">PRIMARY CLIENT:</span>
                <span className="studio-spec-val">{project.clientName}</span>
              </div>
              <div className="studio-spec-row">
                <span className="studio-spec-key">DISCIPLINE:</span>
                <span className="studio-spec-val">{project.category}</span>
              </div>
              <div className="studio-spec-row">
                <span className="studio-spec-key">PRINT RUN / EDITIONS:</span>
                <span className="studio-spec-val">Limited Atelier Edition (1,200 Numbered Exemplars)</span>
              </div>
              <div className="studio-spec-row">
                <span className="studio-spec-key">PRIMARY TYPOGRAPHY:</span>
                <span className="studio-spec-val">Newsreader Display, JetBrains Mono, Custom Glyphs</span>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Revision Inspection Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedDeliverable ? selectedDeliverable.title : 'Deliverable Specs'}
        subtitle={selectedDeliverable ? `${selectedDeliverable.code} // Version Timeline` : ''}
        width="lg"
      >
        {selectedDeliverable && (
          <div className="studio-drawer-content">
            <div className="studio-drawer-meta-banner">
              <div className="studio-spec-cell">
                <span className="studio-spec-label">FORMAT</span>
                <span className="studio-spec-value mono">{selectedDeliverable.format}</span>
              </div>
              <div className="studio-spec-cell">
                <span className="studio-spec-label">CURRENT</span>
                <span className="studio-spec-value mono">{selectedDeliverable.currentVersion}</span>
              </div>
              <div className="studio-spec-cell">
                <span className="studio-spec-label">STATUS</span>
                <span className="studio-spec-value">
                  <Badge variant={selectedDeliverable.status === 'approved' ? 'approved' : 'review'} size="sm">
                    {selectedDeliverable.status}
                  </Badge>
                </span>
              </div>
            </div>

            <h4 className="studio-drawer-subhead">Revision History & Changelog</h4>

            <div className="studio-revisions-timeline">
              {revisions.length === 0 ? (
                <p className="studio-empty-state">No revisions recorded for this specification.</p>
              ) : (
                revisions.map((rev) => (
                  <div key={rev.id} className="studio-revision-entry">
                    <div className="studio-revision-entry__header">
                      <span className="mono studio-revision-entry__ver">{rev.versionNumber}</span>
                      <span className="mono studio-revision-entry__date">{rev.createdAt}</span>
                    </div>

                    <div className="studio-revision-entry__author">
                      By <strong>{rev.createdBy}</strong> ({rev.authorRole})
                    </div>

                    <p className="studio-revision-entry__changelog">{rev.changelog}</p>

                    <div className="studio-revision-entry__tech">
                      <span className="mono">File: {rev.fileFormat}</span>
                      <span className="mono">Size: {rev.fileSize}</span>
                    </div>

                    {rev.feedback && (
                      <div className="studio-revision-entry__feedback">
                        <div className="studio-feedback-header">
                          <CheckCircle2 size={13} className="studio-feedback-icon" />
                          <span>Client Feedback from {rev.feedback.reviewerName} ({rev.feedback.reviewerTitle})</span>
                        </div>
                        <p className="studio-feedback-text">"{rev.feedback.comments}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

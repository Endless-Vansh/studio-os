import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Receipt, 
  Target, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { studioService } from '../../services';
import { 
  Project, 
  Approval, 
  Invoice, 
  ProductionTask, 
  AgencyMetrics 
} from '../../types';
import { Badge, Button, StatPill, AlertBanner, ProgressBar } from '../../components/ui';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AgencyMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, p, a, i, t] = await Promise.all([
        studioService.getMetrics(),
        studioService.getProjects(),
        studioService.getApprovals(),
        studioService.getInvoices(),
        studioService.getTasks()
      ]);
      setMetrics(m);
      setProjects(p);
      setApprovals(a);
      setInvoices(i);
      setTasks(t);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('studio:data-updated', handleUpdate);
    return () => window.removeEventListener('studio:data-updated', handleUpdate);
  }, []);

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUrgentApproval = () => {
    return approvals.find((a) => a.urgency === 'critical' || a.urgency === 'urgent');
  };

  const urgentApproval = getUrgentApproval();
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  if (isLoading && !metrics) {
    return (
      <div className="studio-dashboard">
        <div className="studio-loading-state" style={{ minHeight: '60vh' }}>
          <div className="studio-spinner" />
          <span>INITIALIZING STUDIO OS // PRODUCTION RUNWAY</span>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-dashboard studio-animate-fade-in">
      {/* Studio Header */}
      <section className="studio-dashboard__header">
        <div className="studio-dashboard__title-group">
          <div className="studio-dashboard__eyebrow">
            <span>DISPATCH 2026.4</span>
            <span className="studio-dashboard__eyebrow-divider">/</span>
            <span className="studio-dashboard__eyebrow-highlight">AUTUMN RUNWAY</span>
          </div>
          <h1 className="studio-dashboard__headline">Studio Production Runway</h1>
          <p className="studio-dashboard__subheading">
            Live status of active commissions, physical proofs, client sign-offs and billing ledger.
          </p>
        </div>

        <div className="studio-dashboard__header-actions">
          <Link to="/projects">
            <Button variant="outline" size="sm" iconRight={<ArrowUpRight size={13} />}>
              All Works
            </Button>
          </Link>
          <Link to="/approvals">
            <Button variant="vermilion" size="sm" iconLeft={<span className="studio-dashboard__action-dot" />}>
              Review Sign-Offs ({pendingApprovalsCount})
            </Button>
          </Link>
        </div>
      </section>

      {/* Critical Banner if any */}
      {urgentApproval && (
        <div className="studio-stagger-1">
          <AlertBanner
            variant="vermilion"
            icon={<AlertCircle size={16} />}
            title={`Critical Sign-Off Required: ${urgentApproval.deliverableTitle}`}
            action={
              <Link to="/approvals">
                <Button variant="vermilion" size="sm">
                  Open Review
                </Button>
              </Link>
            }
          >
            {urgentApproval.notes || 'Press or fabrication scheduled. Client sign-off required immediately.'}
          </AlertBanner>
        </div>
      )}

      {/* Metrics Row (Animated Count-Up & Animated Progress Fill) */}
      {metrics && (
        <section className="studio-dashboard__metrics-grid studio-stagger-2">
          <StatPill 
            label="Studio Runway Utilization"
            animatedNumber={{ value: metrics.studioCapacityPercent, suffix: '%', duration: 850 }}
            badge={{ text: 'Optimal', variant: 'sage' }}
            progressPercent={metrics.studioCapacityPercent}
            progressVariant="sage"
            progressDelay={240}
            subtext="4 Active Atelier Commissions"
            icon={<Sliders size={15} />}
          />
          <StatPill 
            label="Outstanding Receivables"
            animatedNumber={{ value: metrics.unpaidInvoicesSum, prefix: '€', duration: 1000 }}
            accent="vermilion"
            hasBullet={true}
            subtext="2 Invoices Pending Settlement"
            icon={<Receipt size={15} />}
          />
          <StatPill 
            label="Client Sign-Offs Pending"
            animatedNumber={{ value: metrics.pendingClientApprovals, duration: 650 }}
            badge={{ text: '1 Press Urgent', variant: 'vermilion' }}
            hasBullet={true}
            subtext="1 Critical Press Proof"
            icon={<CheckCircle2 size={15} />}
          />
          <StatPill 
            label="Annual Billing Target"
            animatedNumber={{ value: metrics.annualRunRate, prefix: '€', duration: 1150 }}
            accent="ink"
            progressPercent={84}
            progressVariant="ink"
            progressDelay={320}
            subtext="Projected Run Rate FY26 · 84% to threshold"
            icon={<Target size={15} />}
          />
        </section>
      )}

      {/* Main Split Grid */}
      <div className="studio-dashboard__grid studio-stagger-3">
        {/* Left Column: Active Commissions */}
        <div className="studio-dashboard__main-col">
          <div className="studio-section-header">
            <div>
              <span className="studio-section-label">CURRENT PRODUCTION COMMISSIONS</span>
              <h2 className="studio-section-title">Active Projects & Volumes</h2>
            </div>
            <Link to="/projects" className="studio-section-link">
              Inspect all ({projects.length}) →
            </Link>
          </div>

          <div className="studio-projects-list">
            {projects.slice(0, 4).map((project, index) => (
              <article 
                key={project.id} 
                className={`studio-project-card studio-card-interactive studio-animate-fade-in studio-stagger-${Math.min(index + 1, 6)}`}
              >
                <div className="studio-project-card__visual">
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="studio-project-card__img"
                      loading="lazy" 
                    />
                  ) : (
                    <div className="studio-project-card__placeholder">
                      <span className="mono">{project.code}</span>
                    </div>
                  )}
                  <div className="studio-project-card__corner studio-project-card__corner--tl">⌖ 1:1</div>
                  <div className="studio-project-card__corner studio-project-card__corner--tr">300 DPI</div>
                  {project.imageStamp && (
                    <span className="studio-project-card__stamp-tag">
                      {project.imageStamp}
                    </span>
                  )}
                </div>

                <div className="studio-project-card__body">
                  <div className="studio-project-card__top">
                    <div className="studio-project-card__meta">
                      <span className="studio-project-card__code">{project.code}</span>
                      <span className="studio-project-card__meta-sep">·</span>
                      <span className="studio-project-card__client">{project.clientName}</span>
                      <Badge variant={project.category === 'Packaging & Print' ? 'vermilion' : 'sage'} size="sm">
                        {project.category}
                      </Badge>
                    </div>
                    <Badge 
                      variant={project.status === 'in_review' ? 'review' : project.status === 'completed' ? 'approved' : 'draft'}
                      size="sm"
                      dot
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="studio-project-card__title">
                    <Link to={`/projects/${project.id}`}>{project.title}</Link>
                  </h3>

                  <p className="studio-project-card__summary">{project.summary}</p>

                  <div className="studio-project-card__progress-wrap">
                    <div className="studio-project-card__progress-labels">
                      <span className="studio-project-card__lead">Lead: {project.leadDesigner}</span>
                      <span className="studio-project-card__pct mono">{project.progressPercent}% Complete</span>
                    </div>
                    <ProgressBar 
                      percent={project.progressPercent} 
                      variant="ink" 
                      delay={350 + index * 100} 
                      height={4} 
                    />
                  </div>

                  <div className="studio-project-card__footer">
                    <div className="studio-project-card__meta-item">
                      <span className="studio-project-card__label">DELIVERABLES</span>
                      <span className="studio-project-card__val">{project.deliverablesCount} Specifications</span>
                    </div>
                    <div className="studio-project-card__meta-item">
                      <span className="studio-project-card__label">TARGET DATE</span>
                      <span className="studio-project-card__val mono">{project.targetDate}</span>
                    </div>
                    <div className="studio-project-card__meta-item">
                      <span className="studio-project-card__label">BUDGET ALLOCATED</span>
                      <span className="studio-project-card__val mono">{formatCurrency(project.budgetTotal)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right Column: Governance, Atelier Milestones, Treasury */}
        <div className="studio-dashboard__side-col">
          {/* Sign-Off Queue */}
          <div className="studio-card studio-card--compact studio-card-interactive studio-animate-fade-in studio-stagger-2">
            <div className="studio-card__header">
              <div className="studio-card__header-left">
                <span className="studio-section-label">GOVERNANCE</span>
                <h3 className="studio-card__title">Client Sign-Offs</h3>
              </div>
              <span className="studio-card__badge-count">
                {pendingApprovalsCount} Pending
              </span>
            </div>

            <div className="studio-approvals-mini">
              {approvals.slice(0, 3).map((app) => (
                <div key={app.id} className="studio-approval-item">
                  <div className="studio-approval-item__header">
                    <span className="mono studio-approval-item__code">{app.approvalCode}</span>
                    <Badge 
                      variant={app.urgency === 'critical' ? 'overdue' : app.urgency === 'urgent' ? 'review' : 'draft'}
                      size="sm"
                    >
                      {app.urgency}
                    </Badge>
                  </div>
                  <div className="studio-approval-item__title">{app.deliverableTitle}</div>
                  <div className="studio-approval-item__meta">
                    <span>{app.clientName}</span>
                    <span>·</span>
                    <span className="mono">{app.version}</span>
                  </div>
                  <div className="studio-approval-item__recipient">
                    Recipient: <strong className="mono">{app.signoffRecipient}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="studio-card__footer">
              <Link to="/approvals" className="studio-card__action-link">
                View all pending approvals ({approvals.length}) →
              </Link>
            </div>
          </div>

          {/* Production Tasks & Milestones */}
          <div className="studio-card studio-card--compact studio-card-interactive studio-animate-fade-in studio-stagger-3">
            <div className="studio-card__header">
              <div className="studio-card__header-left">
                <span className="studio-section-label">ATELIER SCHEDULE</span>
                <h3 className="studio-card__title">Production Milestones</h3>
              </div>
              <Calendar size={14} className="studio-card__header-icon" />
            </div>

            <div className="studio-tasks-mini">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="studio-task-row">
                  <div className="studio-task-row__status">
                    <div className={`studio-task-row__dot studio-task-row__dot--${task.status}`} />
                  </div>
                  <div className="studio-task-row__info">
                    <div className="studio-task-row__title">{task.title}</div>
                    <div className="studio-task-row__sub">
                      <span>{task.phase}</span>
                      <span>·</span>
                      <span>{task.assignee}</span>
                    </div>
                  </div>
                  <div className="studio-task-row__due mono">{task.dueDate.substring(5)}</div>
                </div>
              ))}
            </div>

            {/* Archival ISO Callout Stamp */}
            <div className="studio-card__iso-stamp">
              <ShieldCheck size={14} className="studio-card__iso-icon" />
              <span>All proofs stamped in accordance with ISO 12647-2 standards</span>
            </div>
          </div>

          {/* Treasury / Recent Invoices */}
          <div className="studio-card studio-card--compact studio-card-interactive studio-animate-fade-in studio-stagger-4">
            <div className="studio-card__header">
              <div className="studio-card__header-left">
                <span className="studio-section-label">TREASURY PULSE</span>
                <h3 className="studio-card__title">Recent Invoices</h3>
              </div>
              <Receipt size={14} className="studio-card__header-icon" />
            </div>

            <div className="studio-invoices-mini">
              {invoices.slice(0, 3).map((inv) => (
                <div key={inv.id} className="studio-invoice-item">
                  <div className="studio-invoice-item__left">
                    <span className="mono studio-invoice-item__num">{inv.invoiceNumber}</span>
                    <span className="studio-invoice-item__client">{inv.clientName}</span>
                  </div>
                  <div className="studio-invoice-item__right">
                    <span className="mono studio-invoice-item__amount">
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                    <Badge 
                      variant={inv.status === 'paid' ? 'paid' : inv.status === 'overdue' ? 'overdue' : 'review'}
                      size="sm"
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="studio-card__footer">
              <Link to="/invoices" className="studio-card__action-link">
                Open studio ledger →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Colophon Footer */}
      <footer className="studio-dashboard__colophon studio-stagger-5">
        <div className="studio-dashboard__colophon-left">
          ATELIER DU MONDE EDITIONS · EST. 1984 · PARIS — ZÜRICH — TOKYO
        </div>
        <div className="studio-dashboard__colophon-center">
          <span className="studio-dashboard__colophon-dot" />
          <span>All Press Engines Synchronized</span>
        </div>
        <div className="studio-dashboard__colophon-right mono">
          Studio OS Build 2.6.4
        </div>
      </footer>
    </div>
  );
};

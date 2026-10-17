import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, FileCheck } from 'lucide-react';
import { studioService } from '../../services';
import { Approval, ApprovalStatus } from '../../types';
import { Badge, Button, Tabs, Modal, EmptyState } from '../../components/ui';
import './Approvals.css';

export const Approvals: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('pending');
  
  // Decision modal state
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [decisionAction, setDecisionAction] = useState<ApprovalStatus>('approved');
  const [signerName, setSignerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const loadApprovals = async () => {
    try {
      const data = await studioService.getApprovals();
      setApprovals(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
    const handleUpdate = () => loadApprovals();
    window.addEventListener('studio:data-updated', handleUpdate);
    return () => window.removeEventListener('studio:data-updated', handleUpdate);
  }, []);

  const handleOpenDecision = (app: Approval, action: ApprovalStatus) => {
    setSelectedApproval(app);
    setDecisionAction(action);
    setSignerName(app.signoffRecipient);
    setDecisionNotes('');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSubmitDecision = async () => {
    if (!selectedApproval) return;

    if (!signerName.trim()) {
      setValidationError('Sign-off officer or reviewer name is required for audit verification.');
      return;
    }

    if (decisionAction === 'changes_requested' && !decisionNotes.trim()) {
      setValidationError('Please specify the required alterations for the design team.');
      return;
    }

    await studioService.submitApprovalDecision(
      selectedApproval.id, 
      decisionAction, 
      decisionNotes ? `[${signerName.trim()}]: ${decisionNotes.trim()}` : `[${signerName.trim()}]: Formally authorized.`
    );
    setIsModalOpen(false);
    setValidationError('');
    await loadApprovals();
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const filteredApprovals = approvals.filter((a) => {
    if (activeTab === 'all') return true;
    return a.status === activeTab;
  });

  return (
    <div className="studio-approvals-page studio-animate-fade-in">
      {/* Header */}
      <section className="studio-page-header">
        <div>
          <span className="studio-section-label">GOVERNANCE & CLIENT PORTAL</span>
          <h1 className="studio-page-title">Client Sign-Offs & Approvals</h1>
          <p className="studio-page-desc">
            Formal milestone authorizations for tooling molds, publication pre-press, and brand guidelines.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="studio-controls-bar">
        <Tabs
          tabs={[
            { id: 'pending', label: 'Pending Authorizations', count: approvals.filter(a => a.status === 'pending').length },
            { id: 'approved', label: 'Approved & Signed', count: approvals.filter(a => a.status === 'approved').length },
            { id: 'changes_requested', label: 'Changes Requested', count: approvals.filter(a => a.status === 'changes_requested').length },
            { id: 'all', label: 'Complete Ledger', count: approvals.length }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Approvals Grid / States */}
      {isLoading ? (
        <div className="studio-loading-state">
          <div className="studio-spinner" />
          <span>LOADING SIGN-OFF PORTAL // GOVERNANCE</span>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <EmptyState
          icon={<FileCheck size={22} />}
          eyebrow="// GOVERNANCE LEDGER EMPTY"
          title="No Authorizations in Queue"
          description={
            activeTab === 'pending'
              ? 'All client milestones and pre-press authorizations have been signed off. No pending decisions remain.'
              : 'No milestone sign-off records currently match this filter criteria.'
          }
          action={
            activeTab !== 'all'
              ? {
                  label: 'View Complete Ledger',
                  variant: 'secondary',
                  onClick: () => setActiveTab('all')
                }
              : undefined
          }
        />
      ) : (
        <div className="studio-approvals-grid">
          {filteredApprovals.map((app) => (
            <div key={app.id} className="studio-approval-card">
              <div className="studio-approval-card__top">
                <div className="studio-approval-card__ref">
                  <span className="mono studio-approval-card__code">{app.approvalCode}</span>
                  <Badge 
                    variant={app.urgency === 'critical' ? 'overdue' : app.urgency === 'urgent' ? 'review' : 'draft'}
                    size="sm"
                  >
                    {app.urgency}
                  </Badge>
                </div>

                <Badge 
                  variant={
                    app.status === 'approved' ? 'approved' :
                    app.status === 'pending' ? 'review' :
                    app.status === 'changes_requested' ? 'overdue' : 'draft'
                  }
                  size="sm"
                  dot
                >
                  {app.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="studio-approval-card__content">
                <div className="studio-approval-card__commission mono">{app.clientName} // {app.projectTitle}</div>
                <h3 className="studio-approval-card__title">{app.deliverableTitle}</h3>
                <div className="studio-approval-card__ver mono">Iteration Version: {app.version}</div>
                
                {app.notes && (
                  <p className="studio-approval-card__notes">{app.notes}</p>
                )}
              </div>

              <div className="studio-approval-card__meta">
                <div className="studio-approval-card__meta-row">
                  <span className="studio-spec-label">AUTHORIZATION OFFICER</span>
                  <span className="studio-approval-card__signee mono">{app.signoffRecipient} ({app.recipientEmail})</span>
                </div>
                <div className="studio-approval-card__meta-row">
                  <span className="studio-spec-label">REQUESTED DISPATCH</span>
                  <span className="studio-approval-card__date mono">{app.requestedAt}</span>
                </div>
              </div>

              {app.status === 'pending' ? (
                <div className="studio-approval-card__actions">
                  <Button 
                    variant="danger" 
                    size="sm"
                    iconLeft={<XCircle size={14} />}
                    onClick={() => handleOpenDecision(app, 'changes_requested')}
                  >
                    Request Alteration
                  </Button>
                  <Button 
                    variant="vermilion" 
                    size="sm"
                    iconLeft={<CheckCircle2 size={14} />}
                    onClick={() => handleOpenDecision(app, 'approved')}
                  >
                    Grant Authorization
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div className="studio-approval-card__signed-banner">
                    <CheckCircle2 size={14} className="studio-signed-icon" />
                    <span className="mono">
                      {app.status === 'approved' ? 'Milestone Authorized' : 'Changes Requested'} on {app.decidedAt || 'Recorded date'}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDecision(app, app.status === 'approved' ? 'changes_requested' : 'approved')}
                  >
                    Adjust
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={decisionAction === 'approved' ? 'Execute Client Sign-Off' : 'Request Milestone Alterations'}
        subtitle={selectedApproval ? `${selectedApproval.deliverableTitle} (${selectedApproval.version})` : ''}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant={decisionAction === 'approved' ? 'vermilion' : 'danger'}
              onClick={handleSubmitDecision}
            >
              {decisionAction === 'approved' ? 'Confirm Formal Sign-Off' : 'Submit Change Request'}
            </Button>
          </>
        }
      >
        <div className="studio-form-grid">
          {validationError && (
            <div className="studio-modal-alert">
              <strong>Validation Notice:</strong> {validationError}
            </div>
          )}

          <div className="studio-modal-alert">
            {decisionAction === 'approved' ? (
              <p>
                Authorizing this milestone permits physical release to press, casting, or production.
                This action is logged with digital timestamp in the STUDIO OS ledger.
              </p>
            ) : (
              <p>
                Requesting alterations will place this deliverable in revision review and notify the lead designer.
              </p>
            )}
          </div>

          <div className="studio-input-group">
            <label className="studio-input__label">Sign-Off Officer / Reviewer Name</label>
            <input 
              type="text" 
              className="studio-input"
              value={signerName}
              onChange={(e) => {
                setSignerName(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. Céleste Moreau"
            />
          </div>

          <div className="studio-input-group">
            <label className="studio-input__label">
              {decisionAction === 'approved' ? 'Executive Sign-Off Remarks (Optional)' : 'Required Alteration Details (Required)'}
            </label>
            <textarea 
              className="studio-input"
              rows={4}
              style={{ height: 'auto', padding: '10px' }}
              placeholder={
                decisionAction === 'approved'
                  ? 'e.g. Approved without reservations. Ready for Munich pre-press run.'
                  : 'Detail baseline grid issues, ink density concerns, or material revisions...'
              }
              value={decisionNotes}
              onChange={(e) => {
                setDecisionNotes(e.target.value);
                if (validationError) setValidationError('');
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

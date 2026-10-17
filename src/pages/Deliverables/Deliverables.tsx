import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Plus, Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import { studioService } from '../../services';
import { Deliverable, Revision, Project } from '../../types';
import { Badge, Button, Tabs, Input, Drawer, Modal, Select, EmptyState } from '../../components/ui';
import './Deliverables.css';

export const Deliverables: React.FC = () => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQ);
  
  // Drawer state
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Deliverable modal state
  const [isNewDelivModalOpen, setIsNewDelivModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('prj-101');
  const [newFormat, setNewFormat] = useState('Print-Ready PDF / CAD Spec');
  const [newVersion, setNewVersion] = useState('v1.0');
  const [newDueDate, setNewDueDate] = useState('2026-11-20');
  const [newAssignedTo, setNewAssignedTo] = useState('Mathilde Vane');
  const [newSpecNotes, setNewSpecNotes] = useState('');
  const [formError, setFormError] = useState('');

  // New Revision modal state
  const [isNewRevModalOpen, setIsNewRevModalOpen] = useState(false);
  const [revVersion, setRevVersion] = useState('');
  const [revChangelog, setRevChangelog] = useState('');
  const [revAuthor, setRevAuthor] = useState('Mathilde Vane');
  const [revError, setRevError] = useState('');

  const loadData = async () => {
    try {
      const [delivs, projs] = await Promise.all([
        studioService.getDeliverables(),
        studioService.getProjects()
      ]);
      setDeliverables(delivs);
      setProjects(projs);
      if (projs.length > 0 && !newProjectId) {
        setNewProjectId(projs[0].id);
      }
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

  const handleOpenRevisions = async (deliv: Deliverable) => {
    setSelectedDeliverable(deliv);
    const revs = await studioService.getRevisions(deliv.id);
    setRevisions(revs);
    setIsDrawerOpen(true);
  };

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Specification title is required.');
      return;
    }

    const selectedProj = projects.find(p => p.id === newProjectId) || projects[0];

    await studioService.createDeliverable({
      projectId: selectedProj.id,
      projectTitle: selectedProj.title,
      clientName: selectedProj.clientName,
      title: newTitle.trim(),
      format: newFormat,
      currentVersion: newVersion.trim() || 'v1.0',
      status: 'draft',
      dueDate: newDueDate,
      assignedTo: newAssignedTo,
      specNotes: newSpecNotes.trim() || 'Initial specification drafted in Studio OS.'
    });

    setIsNewDelivModalOpen(false);
    setNewTitle('');
    setNewSpecNotes('');
    setFormError('');
    await loadData();
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliverable) return;
    if (!revVersion.trim() || !revChangelog.trim()) {
      setRevError('Version identifier and changelog are required.');
      return;
    }

    await studioService.addRevision(selectedDeliverable.id, {
      versionNumber: revVersion.trim(),
      createdBy: revAuthor.trim() || 'Mathilde Vane',
      authorRole: 'Lead Designer',
      changelog: revChangelog.trim(),
      fileSize: '24.5 MB',
      fileFormat: selectedDeliverable.format,
      status: 'submitted'
    });

    const updatedRevs = await studioService.getRevisions(selectedDeliverable.id);
    setRevisions(updatedRevs);
    await loadData();
    setIsNewRevModalOpen(false);
    setRevVersion('');
    setRevChangelog('');
    setRevError('');
  };

  const filteredDeliverables = deliverables.filter((d) => {
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'client_review' ? d.status === 'client_review' :
      activeTab === 'approved' ? d.status === 'approved' :
      activeTab === 'changes_requested' ? d.status === 'changes_requested' : true;

    const matchesSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="studio-deliv-page studio-animate-fade-in">
      {/* Header */}
      <section className="studio-page-header">
        <div>
          <span className="studio-section-label">PRODUCTION REPERTOIRE</span>
          <h1 className="studio-page-title">Deliverables & Specifications</h1>
          <p className="studio-page-desc">
            Granular technical specs, die-cuts, print separations, and design token revisions.
          </p>
        </div>

        <div className="studio-page-header__actions">
          <Button 
            variant="vermilion" 
            iconLeft={<Plus size={14} />}
            onClick={() => {
              setFormError('');
              setIsNewDelivModalOpen(true);
            }}
          >
            Record Deliverable
          </Button>
        </div>
      </section>

      {/* Controls */}
      <div className="studio-controls-bar">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Specifications', count: deliverables.length },
            { id: 'client_review', label: 'In Review', count: deliverables.filter(d => d.status === 'client_review').length },
            { id: 'approved', label: 'Approved', count: deliverables.filter(d => d.status === 'approved').length },
            { id: 'changes_requested', label: 'Revisions Requested', count: deliverables.filter(d => d.status === 'changes_requested').length }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="studio-projects__search">
          <Input 
            placeholder="Search specs, code or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconLeft={<Search size={14} />}
          />
        </div>
      </div>

      {/* Deliverables Table / States */}
      {isLoading ? (
        <div className="studio-loading-state">
          <div className="studio-spinner" />
          <span>LOADING SPECIFICATIONS // LEDGER</span>
        </div>
      ) : filteredDeliverables.length === 0 ? (
        <EmptyState
          icon={<Layers size={22} />}
          eyebrow="// NO SPECIFICATIONS FOUND"
          title="No Matching Deliverables"
          description={
            searchQuery || activeTab !== 'all'
              ? 'No specification records match the selected tab filter or query parameters. Try resetting your search.'
              : 'No technical deliverables have been recorded in the atelier repository yet.'
          }
          action={
            searchQuery || activeTab !== 'all'
              ? {
                  label: 'Clear Filters',
                  variant: 'secondary',
                  onClick: () => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }
                }
              : {
                  label: 'Record Deliverable',
                  variant: 'vermilion',
                  onClick: () => setIsNewDelivModalOpen(true)
                }
          }
        />
      ) : (
        <div className="studio-table-container">
          <table className="studio-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>SPEC CODE</th>
                <th>DELIVERABLE & FORMAT</th>
                <th>COMMISSION & CLIENT</th>
                <th>VERSION</th>
                <th>STATUS</th>
                <th>TARGET DUE</th>
                <th>ASSIGNED</th>
                <th style={{ width: '130px', textAlign: 'right' }}>REVISIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliverables.map((d) => (
                <tr key={d.id} className="studio-table__row--clickable" onClick={() => handleOpenRevisions(d)}>
                  <td className="mono font-semibold">{d.code}</td>
                  <td>
                    <div className="studio-td-deliv">
                      <span className="studio-td-deliv__title">{d.title}</span>
                      <span className="studio-td-deliv__format mono">{d.format}</span>
                    </div>
                  </td>
                  <td>
                    <div className="studio-td-project">
                      <span className="studio-td-project__title">{d.projectTitle}</span>
                      <span className="studio-td-project__client mono">{d.clientName}</span>
                    </div>
                  </td>
                  <td className="mono font-semibold">{d.currentVersion}</td>
                  <td>
                    <Badge 
                      variant={
                        d.status === 'approved' ? 'approved' :
                        d.status === 'client_review' ? 'review' :
                        d.status === 'changes_requested' ? 'overdue' : 'draft'
                      }
                      size="sm"
                    >
                      {d.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="mono">{d.dueDate}</td>
                  <td>{d.assignedTo}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRevisions(d);
                      }}
                      iconRight={<ChevronRight size={13} />}
                    >
                      {d.revisionsCount} revs
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Revisions History Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedDeliverable ? selectedDeliverable.title : 'Specification Details'}
        subtitle={selectedDeliverable ? `${selectedDeliverable.code} // Technical Dossier` : ''}
        width="lg"
        footer={
          selectedDeliverable && (
            <Button 
              variant="vermilion" 
              iconLeft={<Plus size={14} />}
              onClick={() => {
                const nextRev = (parseFloat(selectedDeliverable.currentVersion.replace('v', '') || '1.0') + 0.1).toFixed(1);
                setRevVersion(`v${nextRev}`);
                setRevError('');
                setIsNewRevModalOpen(true);
              }}
            >
              Submit New Revision
            </Button>
          )
        }
      >
        {selectedDeliverable && (
          <div className="studio-drawer-content">
            <div className="studio-drawer-meta-banner">
              <div className="studio-spec-cell">
                <span className="studio-spec-label">COMMISSION</span>
                <span className="studio-spec-value">{selectedDeliverable.projectTitle}</span>
              </div>
              <div className="studio-spec-cell">
                <span className="studio-spec-label">CLIENT</span>
                <span className="studio-spec-value">{selectedDeliverable.clientName}</span>
              </div>
              <div className="studio-spec-cell">
                <span className="studio-spec-label">STATUS</span>
                <select
                  className="studio-table-select mono"
                  value={selectedDeliverable.status}
                  aria-label="Update Deliverable Status"
                  onChange={async (e) => {
                    const updated = await studioService.updateDeliverableStatus(selectedDeliverable.id, e.target.value as any);
                    setSelectedDeliverable(updated);
                    await loadData();
                  }}
                >
                  <option value="draft">DRAFT</option>
                  <option value="internal_review">INTERNAL REVIEW</option>
                  <option value="client_review">CLIENT REVIEW</option>
                  <option value="approved">APPROVED</option>
                  <option value="changes_requested">CHANGES REQUESTED</option>
                </select>
              </div>
            </div>

            <div className="studio-spec-cell">
              <span className="studio-spec-label">SPECIFICATION NOTES</span>
              <p className="studio-deliv-notes-box">{selectedDeliverable.specNotes}</p>
            </div>

            <h4 className="studio-drawer-subhead">Sequential Revisions & Changelogs</h4>

            <div className="studio-revisions-timeline">
              {revisions.map((rev) => (
                <div key={rev.id} className="studio-revision-entry">
                  <div className="studio-revision-entry__header">
                    <span className="mono studio-revision-entry__ver">{rev.versionNumber}</span>
                    <span className="mono studio-revision-entry__date">{rev.createdAt}</span>
                  </div>

                  <div className="studio-revision-entry__author">
                    Authored by <strong>{rev.createdBy}</strong> ({rev.authorRole})
                  </div>

                  <p className="studio-revision-entry__changelog">{rev.changelog}</p>

                  <div className="studio-revision-entry__tech">
                    <span className="mono">Format: {rev.fileFormat}</span>
                    <span className="mono">Payload: {rev.fileSize}</span>
                  </div>

                  {rev.feedback && (
                    <div className="studio-revision-entry__feedback">
                      <div className="studio-feedback-header">
                        <CheckCircle2 size={13} className="studio-feedback-icon" />
                        <span>Sign-off feedback from {rev.feedback.reviewerName} ({rev.feedback.reviewerTitle})</span>
                      </div>
                      <p className="studio-feedback-text">"{rev.feedback.comments}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* New Deliverable Modal */}
      <Modal
        isOpen={isNewDelivModalOpen}
        onClose={() => setIsNewDelivModalOpen(false)}
        title="Record Production Specification"
        subtitle="Establish technical parameters, target format, and milestone deadline for review."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewDelivModalOpen(false)}>Cancel</Button>
            <Button variant="vermilion" onClick={handleCreateDeliverable}>Record Specification</Button>
          </>
        }
      >
        <form onSubmit={handleCreateDeliverable} className="studio-form-grid">
          {formError && (
            <div className="studio-modal-alert">
              <strong>Validation Error:</strong> {formError}
            </div>
          )}

          <Input 
            label="Deliverable Title"
            placeholder="e.g. Master Packaging Diene Cutting Matrix"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              if (formError) setFormError('');
            }}
            required
          />

          <Select 
            label="Associated Commission"
            options={projects.map(p => ({
              value: p.id,
              label: `${p.code} — ${p.title} (${p.clientName})`
            }))}
            value={newProjectId}
            onChange={(e) => setNewProjectId(e.target.value)}
          />

          <div className="studio-form-row">
            <Select 
              label="Deliverable Format"
              options={[
                { value: 'Print-Ready PDF / CAD Spec', label: 'Print-Ready PDF / CAD Spec' },
                { value: 'Figma Tokens & Design System', label: 'Figma Tokens & Design System' },
                { value: 'Vector Identity Suite (.AI, .SVG)', label: 'Vector Identity Suite (.AI, .SVG)' },
                { value: '3D Spatial CAD & Elevation Drawings', label: '3D Spatial CAD & Elevation' },
                { value: 'Interactive Web Prototype (React/WebGL)', label: 'Interactive Web Prototype' }
              ]}
              value={newFormat}
              onChange={(e) => setNewFormat(e.target.value)}
            />

            <Input 
              label="Initial Version"
              placeholder="v1.0"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
            />
          </div>

          <div className="studio-form-row">
            <Input 
              label="Target Due Date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />

            <Input 
              label="Assigned Lead"
              value={newAssignedTo}
              onChange={(e) => setNewAssignedTo(e.target.value)}
            />
          </div>

          <div className="studio-input-group">
            <label className="studio-input__label">Technical Notes & Substrate Rules</label>
            <textarea 
              className="studio-input"
              rows={3}
              style={{ height: 'auto', padding: '10px' }}
              placeholder="e.g. 350gsm Colorplan Imperial Blue, blind emboss die 0.8mm depth, Pantone 871C metallic."
              value={newSpecNotes}
              onChange={(e) => setNewSpecNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* New Revision Modal */}
      <Modal
        isOpen={isNewRevModalOpen}
        onClose={() => setIsNewRevModalOpen(false)}
        title="Submit New Revision Pass"
        subtitle={`Register an updated iteration for ${selectedDeliverable?.code || ''}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewRevModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateRevision}>Log Revision</Button>
          </>
        }
      >
        <form onSubmit={handleCreateRevision} className="studio-form-grid">
          {revError && (
            <div className="studio-modal-alert">
              <strong>Validation Error:</strong> {revError}
            </div>
          )}

          <div className="studio-form-row">
            <Input 
              label="Version Identifier" 
              placeholder="e.g. v2.5"
              value={revVersion}
              onChange={(e) => {
                setRevVersion(e.target.value);
                if (revError) setRevError('');
              }}
              required
            />

            <Input 
              label="Designer / Author" 
              value={revAuthor}
              onChange={(e) => setRevAuthor(e.target.value)}
              required
            />
          </div>

          <div className="studio-input-group">
            <label className="studio-input__label">Technical Changelog & Modifiers</label>
            <textarea 
              className="studio-input"
              rows={4}
              style={{ height: 'auto', padding: '10px' }}
              placeholder="Detail baseline modifications, PMS spot ink calibration, die radius adjustments..."
              value={revChangelog}
              onChange={(e) => {
                setRevChangelog(e.target.value);
                if (revError) setRevError('');
              }}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

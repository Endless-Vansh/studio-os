import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Search, CheckCircle2, ChevronRight } from 'lucide-react';
import { studioService } from '../../services';
import { Invoice, Project, Client } from '../../types';
import { Badge, Button, Tabs, Input, Drawer, Modal, Select, EmptyState } from '../../components/ui';
import './Invoices.css';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New invoice modal
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [invProjectId, setInvProjectId] = useState('prj-101');
  const [invDueDate, setInvDueDate] = useState('2026-11-30');
  const [invItemDesc, setInvItemDesc] = useState('Phase Milestone Deliverables & Creative Direction');
  const [invItemAmount, setInvItemAmount] = useState('12500');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      const [invs, projs, cls] = await Promise.all([
        studioService.getInvoices(),
        studioService.getProjects(),
        studioService.getClients()
      ]);
      setInvoices(invs);
      setProjects(projs);
      setClients(cls);
      if (projs.length > 0 && !invProjectId) {
        setInvProjectId(projs[0].id);
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

  const handleOpenSlip = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDrawerOpen(true);
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;
    const updated = await studioService.updateInvoiceStatus(selectedInvoice.id, 'paid');
    setSelectedInvoice(updated);
    await loadData();
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(invItemAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid invoice gross or net amount greater than 0.');
      return;
    }

    if (!invItemDesc.trim()) {
      setFormError('Line item description is required.');
      return;
    }

    const selectedProj = projects.find(p => p.id === invProjectId) || projects[0];
    const taxRate = 0.20;
    const taxAmount = amount * taxRate;

    await studioService.createInvoice({
      clientId: selectedProj.clientId,
      clientName: selectedProj.clientName,
      projectId: selectedProj.id,
      projectTitle: selectedProj.title,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDueDate,
      status: 'issued',
      currency: 'EUR',
      items: [
        {
          id: `item-${Date.now()}`,
          description: invItemDesc.trim(),
          quantity: 1,
          rate: amount,
          amount
        }
      ],
      subtotal: amount,
      taxRate,
      taxAmount,
      total: amount + taxAmount,
      notes: 'SEPA Direct Transfer to Atelier Du Monde Master Treasury.'
    });

    setIsNewInvoiceOpen(false);
    setInvItemDesc('Phase Milestone Deliverables & Creative Direction');
    setInvItemAmount('12500');
    setFormError('');
    await loadData();
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'issued' ? inv.status === 'issued' :
      activeTab === 'paid' ? inv.status === 'paid' :
      activeTab === 'overdue' ? inv.status === 'overdue' : true;

    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const totalOutstanding = invoices
    .filter(i => i.status === 'issued' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="studio-invoices-page studio-animate-fade-in">
      {/* Header */}
      <section className="studio-page-header">
        <div>
          <span className="studio-section-label">TREASURY & LEDGER</span>
          <h1 className="studio-page-title">Invoices & Settlements</h1>
          <p className="studio-page-desc">
            Production milestone billings, retainer installments, and SEPA wire statements.
          </p>
        </div>

        <div className="studio-page-header__actions">
          <Button 
            variant="primary" 
            iconLeft={<Plus size={14} />}
            onClick={() => {
              setFormError('');
              setIsNewInvoiceOpen(true);
            }}
          >
            Draft Invoice
          </Button>
        </div>
      </section>

      {/* Outstanding Summary Strip */}
      <div className="studio-invoice-summary-strip">
        <div className="studio-spec-cell">
          <span className="studio-spec-label">TOTAL RECEIVABLES PENDING</span>
          <span className="studio-spec-value mono studio-inv-highlight">{formatCurrency(totalOutstanding)}</span>
        </div>
        <div className="studio-spec-cell">
          <span className="studio-spec-label">SETTLED FY26</span>
          <span className="studio-spec-value mono">
            {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0))}
          </span>
        </div>
        <div className="studio-spec-cell">
          <span className="studio-spec-label">PRIMARY CURRENCY</span>
          <span className="studio-spec-value mono">EUR (€) / USD ($)</span>
        </div>
      </div>

      {/* Controls */}
      <div className="studio-controls-bar">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Invoices', count: invoices.length },
            { id: 'issued', label: 'Issued / Pending', count: invoices.filter(i => i.status === 'issued').length },
            { id: 'paid', label: 'Settled & Paid', count: invoices.filter(i => i.status === 'paid').length },
            { id: 'overdue', label: 'Overdue Reminders', count: invoices.filter(i => i.status === 'overdue').length }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="studio-projects__search">
          <Input 
            placeholder="Search invoice number, patron or commission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconLeft={<Search size={14} />}
          />
        </div>
      </div>

      {/* Table / States */}
      {isLoading ? (
        <div className="studio-loading-state">
          <div className="studio-spinner" />
          <span>LOADING TREASURY & INVOICE LEDGER</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={<Receipt size={22} />}
          eyebrow="// TREASURY LEDGER EMPTY"
          title="No Invoices Recorded"
          description={
            searchQuery || activeTab !== 'all'
              ? 'No billing records match your search or selected filter status. Try clearing your filters.'
              : 'No client statements or milestone invoices have been generated yet.'
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
                  label: 'Draft Invoice',
                  variant: 'primary',
                  onClick: () => setIsNewInvoiceOpen(true)
                }
          }
        />
      ) : (
        <div className="studio-table-container">
          <table className="studio-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>INVOICE REF</th>
                <th>CLIENT / PATRON</th>
                <th>COMMISSION TITLE</th>
                <th>ISSUE DATE</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>GROSS TOTAL</th>
                <th style={{ width: '90px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="studio-table__row--clickable" onClick={() => handleOpenSlip(inv)}>
                  <td className="mono font-semibold">{inv.invoiceNumber}</td>
                  <td>
                    <strong>{inv.clientName}</strong>
                  </td>
                  <td>{inv.projectTitle}</td>
                  <td className="mono">{inv.issueDate}</td>
                  <td className="mono">{inv.dueDate}</td>
                  <td>
                    <Badge 
                      variant={
                        inv.status === 'paid' ? 'paid' :
                        inv.status === 'overdue' ? 'overdue' : 'review'
                      }
                      size="sm"
                      dot
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="mono font-semibold" style={{ textAlign: 'right' }}>
                    {formatCurrency(inv.total, inv.currency)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSlip(inv);
                      }}
                      iconRight={<ChevronRight size={13} />}
                    >
                      Slip
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Slip Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedInvoice ? selectedInvoice.invoiceNumber : 'Invoice Statement'}
        subtitle="ATELIER DU MONDE // TREASURY MEMORANDUM"
        width="lg"
        footer={
          selectedInvoice && (
            <div className="studio-inv-drawer-footer">
              {selectedInvoice.status !== 'paid' && (
                <Button 
                  variant="vermilion" 
                  iconLeft={<CheckCircle2 size={14} />}
                  onClick={handleMarkPaid}
                >
                  Record Settlement / Mark Paid
                </Button>
              )}
              {selectedInvoice.status === 'paid' && (
                <Badge variant="paid" size="md">
                  Paid in Full on {selectedInvoice.paidDate || 'Recorded'}
                </Badge>
              )}
            </div>
          )
        }
      >
        {selectedInvoice && (
          <div className="studio-invoice-slip">
            <div className="studio-slip-header">
              <div className="studio-slip-brand">
                <span className="mono studio-slip-eyebrow">ISSUED BY</span>
                <h4 className="studio-slip-issuer">ATELIER DU MONDE SARL</h4>
                <div className="mono studio-slip-issuer-meta">
                  14 Rue de Turenne, 75004 Paris<br />
                  SIRET: 849 201 392 00014 // TVA: FR 92 849201392
                </div>
              </div>

              <div className="studio-slip-meta mono">
                <div><strong>MEMO:</strong> {selectedInvoice.invoiceNumber}</div>
                <div><strong>DATE:</strong> {selectedInvoice.issueDate}</div>
                <div><strong>TERMS:</strong> {selectedInvoice.dueDate}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <strong>STATE:</strong>
                  <select
                    className="studio-badge-select mono"
                    value={selectedInvoice.status}
                    aria-label="Update Invoice Status"
                    onChange={async (e) => {
                      const updated = await studioService.updateInvoiceStatus(selectedInvoice.id, e.target.value as any);
                      setSelectedInvoice(updated);
                      await loadData();
                    }}
                  >
                    <option value="draft">DRAFT</option>
                    <option value="issued">ISSUED</option>
                    <option value="paid">PAID</option>
                    <option value="overdue">OVERDUE</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="studio-divider" />

            <div className="studio-slip-billed-to">
              <span className="mono studio-slip-eyebrow">BILLED TO</span>
              <h4 className="studio-slip-client">{selectedInvoice.clientName}</h4>
              <div className="mono studio-slip-client-meta">
                Commission: {selectedInvoice.projectTitle}
              </div>
            </div>

            {/* Line items table */}
            <div className="studio-slip-table-wrap">
              <table className="studio-table">
                <thead>
                  <tr>
                    <th>DESCRIPTION</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>QTY</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>RATE</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td className="mono" style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td className="mono" style={{ textAlign: 'right' }}>
                        {formatCurrency(item.rate, selectedInvoice.currency)}
                      </td>
                      <td className="mono" style={{ textAlign: 'right' }}>
                        {formatCurrency(item.amount, selectedInvoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Totals */}
            <div className="studio-slip-totals">
              <div className="studio-slip-totals-row">
                <span className="mono">SUBTOTAL</span>
                <span className="mono">{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
              </div>
              <div className="studio-slip-totals-row">
                <span className="mono">VAT / TAX ({(selectedInvoice.taxRate * 100).toFixed(0)}%)</span>
                <span className="mono">{formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}</span>
              </div>
              <div className="studio-slip-totals-row studio-slip-totals-row--grand">
                <span>TOTAL DUE</span>
                <span className="mono">{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</span>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="studio-slip-notes">
                <span className="mono studio-slip-eyebrow">PAYMENT DIRECTIVES</span>
                <p className="mono">{selectedInvoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* New Invoice Modal */}
      <Modal
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
        title="Draft Milestone Invoice"
        subtitle="Generate an itemized invoice statement for client commission."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewInvoiceOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateInvoice}>Issue Invoice</Button>
          </>
        }
      >
        <form onSubmit={handleCreateInvoice} className="studio-form-grid">
          {formError && (
            <div className="studio-modal-alert">
              <strong>Validation Notice:</strong> {formError}
            </div>
          )}

          <Select 
            label="Associated Commission"
            options={projects.map(p => ({
              value: p.id,
              label: `${p.code} — ${p.title} (${p.clientName})`
            }))}
            value={invProjectId}
            onChange={(e) => setInvProjectId(e.target.value)}
          />

          <div className="studio-form-row">
            <Input 
              label="Payment Due Date"
              type="date"
              value={invDueDate}
              onChange={(e) => setInvDueDate(e.target.value)}
              required
            />

            <Input 
              label="Net Fee Amount (€)"
              type="number"
              placeholder="12500"
              value={invItemAmount}
              onChange={(e) => {
                setInvItemAmount(e.target.value);
                if (formError) setFormError('');
              }}
              required
            />
          </div>

          <div className="studio-input-group">
            <label className="studio-input__label">Primary Milestone Scope / Description</label>
            <textarea 
              className="studio-input"
              rows={3}
              style={{ height: 'auto', padding: '10px' }}
              placeholder="e.g. Phase 2: Complete Identity System, Typography License & Production Guides"
              value={invItemDesc}
              onChange={(e) => {
                setInvItemDesc(e.target.value);
                if (formError) setFormError('');
              }}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

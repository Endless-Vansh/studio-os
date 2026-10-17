import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, MapPin, Mail, Phone, Briefcase } from 'lucide-react';
import { studioService } from '../../services';
import { Client, ClientRetainerType } from '../../types';
import { Badge, Button, Input, Select, Modal, EmptyState } from '../../components/ui';
import './Clients.css';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Client Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [engagementType, setEngagementType] = useState<ClientRetainerType>('Monthly Retainer');
  const [formError, setFormError] = useState('');

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editError, setEditError] = useState('');

  const loadClients = async () => {
    try {
      const data = await studioService.getClients();
      setClients(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    const handleUpdate = () => loadClients();
    window.addEventListener('studio:data-updated', handleUpdate);
    return () => window.removeEventListener('studio:data-updated', handleUpdate);
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setFormError('Client or entity name is required.');
      return;
    }

    await studioService.createClient({
      code: clientName.trim().substring(0, 3).toUpperCase(),
      name: clientName.trim(),
      industry: industry.trim() || 'Creative Production',
      contactPerson: contactPerson.trim() || 'Principal Officer',
      email: email.trim() || 'contact@client.com',
      phone: phone.trim() || '+33 1 42 68 00 00',
      location: location.trim() || 'Paris, France',
      status: 'active',
      engagementType
    });

    await loadClients();
    setIsModalOpen(false);
    setClientName('');
    setIndustry('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setLocation('');
    setFormError('');
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!editingClient.name.trim()) {
      setEditError('Client name cannot be empty.');
      return;
    }

    await studioService.updateClient(editingClient.id, {
      name: editingClient.name.trim(),
      industry: editingClient.industry,
      contactPerson: editingClient.contactPerson,
      email: editingClient.email,
      phone: editingClient.phone,
      location: editingClient.location,
      engagementType: editingClient.engagementType,
      status: editingClient.status
    });

    setEditingClient(null);
    setEditError('');
    await loadClients();
    window.dispatchEvent(new CustomEvent('studio:data-updated'));
  };

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="studio-clients-page studio-animate-fade-in">
      {/* Header */}
      <section className="studio-page-header">
        <div>
          <span className="studio-section-label">PATRONAGE & COMMISSIONS</span>
          <h1 className="studio-page-title">Client Roster</h1>
          <p className="studio-page-desc">
            International publishing houses, luxury botanical perfumeries, and contemporary art foundations.
          </p>
        </div>

        <div className="studio-page-header__actions">
          <Button 
            variant="primary" 
            iconLeft={<Plus size={14} />}
            onClick={() => {
              setFormError('');
              setIsModalOpen(true);
            }}
          >
            Onboard Client
          </Button>
        </div>
      </section>

      {/* Search & Stats */}
      <div className="studio-controls-bar">
        <div className="studio-clients__search" style={{ width: '320px' }}>
          <Input 
            placeholder="Search patrons by name, locale, code or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconLeft={<Search size={14} />}
          />
        </div>
        <div className="mono studio-clients__count">
          {filteredClients.length} Registered Patrons
        </div>
      </div>

      {/* Clients Grid / States */}
      {isLoading ? (
        <div className="studio-loading-state">
          <div className="studio-spinner" />
          <span>LOADING CLIENT ROSTER // PATRONS</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          eyebrow="// PATRON DIRECTORY EMPTY"
          title="No Patrons Found"
          description={
            searchQuery
              ? `No patron dossier corresponds to "${searchQuery}". Check the query or reset search.`
              : 'No client accounts currently registered in Studio OS.'
          }
          action={
            searchQuery
              ? {
                  label: 'Clear Search',
                  variant: 'secondary',
                  onClick: () => setSearchQuery('')
                }
              : {
                  label: 'Onboard Client',
                  variant: 'primary',
                  onClick: () => setIsModalOpen(true)
                }
          }
        />
      ) : (
        <div className="studio-clients-grid">
          {filteredClients.map((client) => (
            <div key={client.id} className="studio-client-card studio-card-interactive">
              <div className="studio-client-card__top">
                <span className="mono studio-client-card__code">{client.code}</span>
                <div className="studio-client-card__tags">
                  <Badge variant={client.engagementType === 'Monthly Retainer' ? 'sage' : 'draft'} size="sm">
                    {client.engagementType}
                  </Badge>
                  <select
                    className="studio-badge-select mono"
                    value={client.status}
                    aria-label="Update Client Status"
                    onChange={async (e) => {
                      await studioService.updateClientStatus(client.id, e.target.value as any);
                      await loadClients();
                    }}
                  >
                    <option value="active">ACTIVE</option>
                    <option value="on_hold">ON HOLD</option>
                    <option value="archived">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="studio-client-card__body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                  <h2 className="studio-client-card__name">{client.name}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditError('');
                      setEditingClient({ ...client });
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <div className="studio-client-card__industry">{client.industry}</div>
              </div>

              <div className="studio-client-card__details">
                <div className="studio-client-row">
                  <MapPin size={13} className="studio-client-icon" />
                  <span>{client.location}</span>
                </div>
                <div className="studio-client-row">
                  <Users size={13} className="studio-client-icon" />
                  <span>{client.contactPerson}</span>
                </div>
                <div className="studio-client-row">
                  <Mail size={13} className="studio-client-icon" />
                  <span className="mono">{client.email}</span>
                </div>
              </div>

              <div className="studio-client-card__footer">
                <div className="studio-client-metric">
                  <span className="studio-spec-label">ACTIVE WORKS</span>
                  <span className="mono studio-client-val">{client.activeProjectsCount} Commissions</span>
                </div>
                <div className="studio-client-metric">
                  <span className="studio-spec-label">LIFETIME BILLED</span>
                  <span className="mono studio-client-val">{formatCurrency(client.totalBilled)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard New Patron / Client"
        subtitle="Establish an institutional or commercial patron relationship in Studio OS."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateClient}>Register Patron</Button>
          </>
        }
      >
        <form onSubmit={handleCreateClient} className="studio-form-grid">
          {formError && (
            <div className="studio-modal-alert">
              <strong>Validation Notice:</strong> {formError}
            </div>
          )}

          <Input 
            label="Client / Entity Name" 
            placeholder="e.g. Fondation d’Art Contemporain"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              if (formError) setFormError('');
            }}
            required
          />

          <Input 
            label="Industry / Field" 
            placeholder="e.g. Cultural Foundation & Architectural Archive"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <div className="studio-form-row">
            <Input 
              label="Primary Liaison / Officer" 
              placeholder="e.g. Hélène Blanc"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
            <Input 
              label="Location (City, Country)" 
              placeholder="e.g. Geneva, Switzerland"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="studio-form-row">
            <Input 
              label="Official Email" 
              type="email"
              placeholder="liaison@fondation-art.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              label="Phone Number" 
              placeholder="+41 22 550 1200"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Select 
            label="Engagement Structure"
            value={engagementType}
            onChange={(e) => setEngagementType(e.target.value as ClientRetainerType)}
            options={[
              { value: 'Monthly Retainer', label: 'Monthly Retainer' },
              { value: 'Fixed Scope', label: 'Fixed Scope Commission' },
              { value: 'Time & Materials', label: 'Time & Materials' }
            ]}
          />
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        title="Edit Patron Dossier"
        subtitle={editingClient ? `Updating records for ${editingClient.code}` : ''}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingClient(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateClient}>Save Changes</Button>
          </>
        }
      >
        {editingClient && (
          <form onSubmit={handleUpdateClient} className="studio-form-grid">
            {editError && (
              <div className="studio-modal-alert">
                <strong>Validation Notice:</strong> {editError}
              </div>
            )}

            <Input 
              label="Client / Entity Name" 
              value={editingClient.name}
              onChange={(e) => {
                setEditingClient({ ...editingClient, name: e.target.value });
                if (editError) setEditError('');
              }}
              required
            />

            <Input 
              label="Industry / Field" 
              value={editingClient.industry}
              onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
            />

            <div className="studio-form-row">
              <Input 
                label="Primary Liaison / Officer" 
                value={editingClient.contactPerson}
                onChange={(e) => setEditingClient({ ...editingClient, contactPerson: e.target.value })}
              />
              <Input 
                label="Location (City, Country)" 
                value={editingClient.location}
                onChange={(e) => setEditingClient({ ...editingClient, location: e.target.value })}
              />
            </div>

            <div className="studio-form-row">
              <Input 
                label="Official Email" 
                type="email"
                value={editingClient.email}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
              />
              <Input 
                label="Phone Number" 
                value={editingClient.phone}
                onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
              />
            </div>

            <Select 
              label="Engagement Structure"
              value={editingClient.engagementType}
              onChange={(e) => setEditingClient({ ...editingClient, engagementType: e.target.value as ClientRetainerType })}
              options={[
                { value: 'Monthly Retainer', label: 'Monthly Retainer' },
                { value: 'Fixed Scope', label: 'Fixed Scope Commission' },
                { value: 'Time & Materials', label: 'Time & Materials' }
              ]}
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

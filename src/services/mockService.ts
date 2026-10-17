import { IStudioService } from './apiInterface';
import {
  Client,
  Project,
  Deliverable,
  Revision,
  Approval,
  ApprovalStatus,
  Invoice,
  InvoiceStatus,
  ProductionTask,
  AgencyMetrics
} from '../types';
import {
  mockClients,
  mockProjects,
  mockDeliverables,
  mockRevisions,
  mockApprovals,
  mockInvoices,
  mockTasks,
  mockMetrics
} from '../mockData/mockData';

const STORAGE_KEY = 'studio_os_session_v3';

interface StudioState {
  clients: Client[];
  projects: Project[];
  deliverables: Deliverable[];
  revisions: Record<string, Revision[]>;
  approvals: Approval[];
  invoices: Invoice[];
  tasks: ProductionTask[];
  metrics: AgencyMetrics;
}

class MockStudioService implements IStudioService {
  private clients: Client[];
  private projects: Project[];
  private deliverables: Deliverable[];
  private revisions: Record<string, Revision[]>;
  private approvals: Approval[];
  private invoices: Invoice[];
  private tasks: ProductionTask[];
  private metrics: AgencyMetrics;

  constructor() {
    const saved = this.loadState();
    if (saved) {
      this.clients = saved.clients;
      this.projects = saved.projects;
      this.deliverables = saved.deliverables;
      this.revisions = saved.revisions;
      this.approvals = saved.approvals;
      this.invoices = saved.invoices;
      this.tasks = saved.tasks;
      this.metrics = saved.metrics;
    } else {
      this.clients = [...mockClients];
      this.projects = [...mockProjects];
      this.deliverables = [...mockDeliverables];
      this.revisions = { ...mockRevisions };
      this.approvals = [...mockApprovals];
      this.invoices = [...mockInvoices];
      this.tasks = [...mockTasks];
      this.metrics = { ...mockMetrics };
    }
  }

  private loadState(): StudioState | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // fallback to memory
    }
    return null;
  }

  private persist() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const state: StudioState = {
          clients: this.clients,
          projects: this.projects,
          deliverables: this.deliverables,
          revisions: this.revisions,
          approvals: this.approvals,
          invoices: this.invoices,
          tasks: this.tasks,
          metrics: this.metrics
        };
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        window.dispatchEvent(new CustomEvent('studio:data-updated'));
      }
    } catch {
      // ignore storage quota issues
    }
  }

  private delay<T>(data: T, ms = 40): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms));
  }

  async getMetrics(): Promise<AgencyMetrics> {
    const unpaid = this.invoices
      .filter((inv) => inv.status === 'issued' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    const pendingApprovals = this.approvals.filter((a) => a.status === 'pending').length;
    const activeProjects = this.projects.filter((p) => p.status === 'in_progress' || p.status === 'in_review').length;
    const inReviewDeliverables = this.deliverables.filter(
      (d) => d.status === 'client_review' || d.status === 'internal_review'
    ).length;

    return this.delay({
      ...this.metrics,
      unpaidInvoicesSum: unpaid,
      pendingClientApprovals: pendingApprovals,
      activeProjects,
      deliverablesInReview: inReviewDeliverables
    });
  }

  async getClients(): Promise<Client[]> {
    return this.delay([...this.clients]);
  }

  async getClientById(id: string): Promise<Client | undefined> {
    return this.delay(this.clients.find((c) => c.id === id));
  }

  async createClient(clientData: Omit<Client, 'id' | 'totalBilled' | 'activeProjectsCount' | 'joinedDate'>): Promise<Client> {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      totalBilled: 0,
      activeProjectsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    this.clients.unshift(newClient);
    this.persist();
    return this.delay(newClient);
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const client = this.clients.find((c) => c.id === id);
    if (!client) throw new Error(`Client ${id} not found`);
    Object.assign(client, updates);
    this.persist();
    return this.delay({ ...client });
  }

  async updateClientStatus(id: string, status: Client['status']): Promise<Client> {
    return this.updateClient(id, { status });
  }

  async getProjects(statusFilter?: string): Promise<Project[]> {
    if (!statusFilter || statusFilter === 'all') {
      return this.delay([...this.projects]);
    }
    return this.delay(this.projects.filter((p) => p.status === statusFilter));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.delay(this.projects.find((p) => p.id === id));
  }

  async createProject(projectData: Omit<Project, 'id' | 'code' | 'budgetSpent' | 'progressPercent' | 'deliverablesCount' | 'pendingApprovalsCount'>): Promise<Project> {
    const codeNum = this.projects.length + 101;
    const newProject: Project = {
      ...projectData,
      id: `prj-${Date.now()}`,
      code: `PRJ-${codeNum}`,
      budgetSpent: 0,
      progressPercent: 0,
      deliverablesCount: 0,
      pendingApprovalsCount: 0
    };
    this.projects.unshift(newProject);
    this.persist();
    return this.delay(newProject);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) throw new Error(`Project ${id} not found`);
    Object.assign(project, updates);
    this.persist();
    return this.delay({ ...project });
  }

  async updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
    return this.updateProject(id, { status });
  }

  async getDeliverables(projectId?: string): Promise<Deliverable[]> {
    if (projectId) {
      return this.delay(this.deliverables.filter((d) => d.projectId === projectId));
    }
    return this.delay([...this.deliverables]);
  }

  async getDeliverableById(id: string): Promise<Deliverable | undefined> {
    return this.delay(this.deliverables.find((d) => d.id === id));
  }

  async updateDeliverableStatus(id: string, status: Deliverable['status']): Promise<Deliverable> {
    const item = this.deliverables.find((d) => d.id === id);
    if (!item) throw new Error(`Deliverable ${id} not found`);
    item.status = status;
    item.lastUpdated = new Date().toISOString().split('T')[0];
    this.persist();
    return this.delay({ ...item });
  }

  async createDeliverable(data: Omit<Deliverable, 'id' | 'code' | 'revisionsCount' | 'lastUpdated'>): Promise<Deliverable> {
    const codeNum = this.deliverables.length + 201;
    const newDel: Deliverable = {
      ...data,
      id: `dlv-${Date.now()}`,
      code: `DLV-${codeNum}`,
      revisionsCount: 1,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    this.deliverables.unshift(newDel);

    // Create initial revision record
    this.revisions[newDel.id] = [
      {
        id: `rev-${newDel.id}-1`,
        deliverableId: newDel.id,
        versionNumber: newDel.currentVersion,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        createdBy: newDel.assignedTo,
        authorRole: 'Designer',
        changelog: 'Initial version draft initialized in STUDIO OS.',
        fileSize: '—',
        fileFormat: newDel.format,
        status: 'draft'
      }
    ];

    // increment project deliverables count
    const proj = this.projects.find((p) => p.id === newDel.projectId);
    if (proj) {
      proj.deliverablesCount = (proj.deliverablesCount || 0) + 1;
    }

    this.persist();
    return this.delay(newDel);
  }

  async getRevisions(deliverableId: string): Promise<Revision[]> {
    return this.delay(this.revisions[deliverableId] || []);
  }

  async addRevision(deliverableId: string, revisionData: Omit<Revision, 'id' | 'deliverableId' | 'createdAt'>): Promise<Revision> {
    const list = this.revisions[deliverableId] || [];
    const newRev: Revision = {
      ...revisionData,
      id: `rev-${Date.now()}`,
      deliverableId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    list.unshift(newRev);
    this.revisions[deliverableId] = list;

    // update current deliverable version
    const d = this.deliverables.find((item) => item.id === deliverableId);
    if (d) {
      d.currentVersion = revisionData.versionNumber;
      d.revisionsCount = list.length;
      d.lastUpdated = new Date().toISOString().split('T')[0];
    }

    this.persist();
    return this.delay(newRev);
  }

  async getApprovals(): Promise<Approval[]> {
    return this.delay([...this.approvals]);
  }

  async getApprovalById(id: string): Promise<Approval | undefined> {
    return this.delay(this.approvals.find((a) => a.id === id));
  }

  async submitApprovalDecision(id: string, status: ApprovalStatus, notes?: string): Promise<Approval> {
    const app = this.approvals.find((a) => a.id === id);
    if (!app) throw new Error(`Approval ${id} not found`);
    app.status = status;
    app.decidedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    if (notes) {
      app.notes = notes;
    }

    // sync deliverable status
    const del = this.deliverables.find((d) => d.id === app.deliverableId);
    if (del) {
      if (status === 'approved') {
        del.status = 'approved';
      } else if (status === 'changes_requested') {
        del.status = 'changes_requested';
      }
    }

    this.persist();
    return this.delay({ ...app });
  }

  async getInvoices(statusFilter?: InvoiceStatus): Promise<Invoice[]> {
    if (statusFilter) {
      return this.delay(this.invoices.filter((inv) => inv.status === statusFilter));
    }
    return this.delay([...this.invoices]);
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    return this.delay(this.invoices.find((inv) => inv.id === id));
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) throw new Error(`Invoice ${id} not found`);
    inv.status = status;
    if (status === 'paid') {
      inv.paidDate = new Date().toISOString().split('T')[0];
    }
    this.persist();
    return this.delay({ ...inv });
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    const year = new Date().getFullYear();
    const count = this.invoices.length + 42;
    const invoiceNumber = `INV-${year}-0${count}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber
    };
    this.invoices.unshift(newInvoice);
    this.persist();
    return this.delay(newInvoice);
  }

  async getTasks(projectId?: string): Promise<ProductionTask[]> {
    if (projectId) {
      return this.delay(this.tasks.filter((t) => t.projectId === projectId));
    }
    return this.delay([...this.tasks]);
  }

  async updateTaskStatus(id: string, status: ProductionTask['status']): Promise<ProductionTask> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task ${id} not found`);
    task.status = status;
    this.persist();
    return this.delay({ ...task });
  }
}

// Export singleton service instance
export const studioService: IStudioService = new MockStudioService();

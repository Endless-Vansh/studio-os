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

export interface IStudioService {
  // Agency Metrics
  getMetrics(): Promise<AgencyMetrics>;

  // Clients
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | undefined>;
  createClient(client: Omit<Client, 'id' | 'totalBilled' | 'activeProjectsCount' | 'joinedDate'>): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client>;
  updateClientStatus(id: string, status: Client['status']): Promise<Client>;

  // Projects
  getProjects(statusFilter?: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: Omit<Project, 'id' | 'code' | 'budgetSpent' | 'progressPercent' | 'deliverablesCount' | 'pendingApprovalsCount'>): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  updateProjectStatus(id: string, status: Project['status']): Promise<Project>;

  // Deliverables
  getDeliverables(projectId?: string): Promise<Deliverable[]>;
  getDeliverableById(id: string): Promise<Deliverable | undefined>;
  updateDeliverableStatus(id: string, status: Deliverable['status']): Promise<Deliverable>;
  createDeliverable(deliverable: Omit<Deliverable, 'id' | 'code' | 'revisionsCount' | 'lastUpdated'>): Promise<Deliverable>;

  // Revisions
  getRevisions(deliverableId: string): Promise<Revision[]>;
  addRevision(deliverableId: string, revision: Omit<Revision, 'id' | 'deliverableId' | 'createdAt'>): Promise<Revision>;

  // Approvals
  getApprovals(): Promise<Approval[]>;
  getApprovalById(id: string): Promise<Approval | undefined>;
  submitApprovalDecision(id: string, status: ApprovalStatus, notes?: string): Promise<Approval>;

  // Invoices & Payments
  getInvoices(statusFilter?: InvoiceStatus): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice>;

  // Production Tasks
  getTasks(projectId?: string): Promise<ProductionTask[]>;
  updateTaskStatus(id: string, status: ProductionTask['status']): Promise<ProductionTask>;
}

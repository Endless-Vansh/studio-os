// STUDIO OS — Core Domain Models

export type ProjectCategory = 
  | 'Brand Identity' 
  | 'Editorial & Book' 
  | 'Digital Experience' 
  | 'Spatial & Exhibition' 
  | 'Art Direction' 
  | 'Packaging & Print';

export type ProjectStatus = 
  | 'in_progress' 
  | 'in_review' 
  | 'completed' 
  | 'on_hold';

export type DeliverableStatus = 
  | 'draft' 
  | 'internal_review' 
  | 'client_review' 
  | 'approved' 
  | 'changes_requested';

export type ApprovalStatus = 
  | 'pending' 
  | 'approved' 
  | 'changes_requested' 
  | 'rejected';

export type InvoiceStatus = 
  | 'draft' 
  | 'issued' 
  | 'paid' 
  | 'overdue';

export type ClientRetainerType = 
  | 'Monthly Retainer' 
  | 'Fixed Scope' 
  | 'Time & Materials';

export interface Client {
  id: string;
  code: string; // e.g. "KLL"
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'on_hold' | 'archived';
  engagementType: ClientRetainerType;
  totalBilled: number;
  activeProjectsCount: number;
  joinedDate: string;
}

export interface Project {
  id: string;
  code: string; // e.g. "PRJ-082"
  clientId: string;
  clientName: string;
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  leadDesigner: string;
  startDate: string;
  targetDate: string;
  budgetTotal: number;
  budgetSpent: number;
  progressPercent: number;
  summary: string;
  deliverablesCount: number;
  pendingApprovalsCount: number;
  imageUrl?: string;
  imageStamp?: string;
}

export interface Deliverable {
  id: string;
  code: string; // e.g. "DLV-204"
  projectId: string;
  projectTitle: string;
  clientName: string;
  title: string;
  format: string; // e.g. "Figma Design Token Spec", "Foil-Stamped Clothbound Hardcover"
  currentVersion: string; // e.g. "v2.1"
  status: DeliverableStatus;
  dueDate: string;
  assignedTo: string;
  revisionsCount: number;
  lastUpdated: string;
  specNotes: string;
}

export interface Revision {
  id: string;
  deliverableId: string;
  versionNumber: string;
  createdAt: string;
  createdBy: string;
  authorRole: string;
  changelog: string;
  fileSize?: string;
  fileFormat?: string;
  previewUrl?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  feedback?: {
    reviewerName: string;
    reviewerTitle: string;
    submittedAt: string;
    comments: string;
    action: 'approved' | 'changes_requested';
  };
}

export interface Approval {
  id: string;
  approvalCode: string; // e.g. "APR-91"
  projectId: string;
  projectTitle: string;
  deliverableId: string;
  deliverableTitle: string;
  clientName: string;
  version: string;
  requestedBy: string;
  signoffRecipient: string;
  recipientEmail: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  notes?: string;
  urgency: 'routine' | 'urgent' | 'critical';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-038"
  clientId: string;
  clientName: string;
  projectId: string;
  projectTitle: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: 'USD' | 'EUR' | 'GBP';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.20 for 20%
  taxAmount: number;
  total: number;
  notes?: string;
  paidDate?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionRef: string;
  paidAt: string;
}

export interface ProductionTask {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  phase: 'Discovery' | 'Art Direction' | 'Production' | 'Pre-Press / QA' | 'Handover';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
}

export interface AgencyMetrics {
  annualRunRate: number;
  unpaidInvoicesSum: number;
  activeProjects: number;
  pendingClientApprovals: number;
  deliverablesInReview: number;
  studioCapacityPercent: number;
}

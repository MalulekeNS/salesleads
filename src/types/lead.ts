export type LeadStatus = 'New' | 'Engaged' | 'Proposal Sent' | 'Closed-Won' | 'Closed-Lost';

export type SortField = 'name' | 'email' | 'status' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: LeadStatus;
  company?: string;
  phone?: string;
  notes?: string;
  display_id?: string;
  lead_number?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInput {
  name: string;
  email: string;
  status?: LeadStatus;
  company?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateLeadInput {
  name?: string;
  email?: string;
  status?: LeadStatus;
  company?: string;
  phone?: string;
  notes?: string;
}

export interface LeadFilters {
  status?: LeadStatus | 'all';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortField?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Engaged',
  'Proposal Sent',
  'Closed-Won',
  'Closed-Lost'
];

export const DEFAULT_PAGE_SIZE = 10;
import {
  Company,
  CompanyFilters,
  CompanyStatus,
  ContactPerson,
  LeadStats,
  SectorType,
  SECTORS,
  TimelineActivity,
} from './types';
import { INITIAL_COMPANIES } from './mock/companies';
import { calculateProfileCompleteness } from '@/lib/completeness';

/**
 * CompanyRepository defines the abstraction contract for all lead data operations.
 * UI components must strictly consume this interface rather than directly reading raw files
 * or making ad-hoc fetch calls. When ready, the mock implementation can be swapped
 * for a remote API or backend service without altering any UI components.
 */
export interface CompanyRepository {
  getCompanies(filters?: CompanyFilters): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | null>;
  updateCompanyStatus(
    companyId: string,
    newStatus: CompanyStatus,
    author?: string,
    notes?: string
  ): Promise<Company>;
  updateCompany(companyId: string, updates: Partial<Company>): Promise<Company>;
  addNote(companyId: string, note: string, author?: string): Promise<Company>;
  saveContact(
    companyId: string,
    contact: Omit<ContactPerson, 'id'> & { id?: string }
  ): Promise<Company>;
  deleteContact(companyId: string, contactId: string): Promise<Company>;
  recordActivity(
    companyId: string,
    event: Omit<TimelineActivity, 'id' | 'timestamp'>
  ): Promise<Company>;
  getStats(sector?: SectorType | 'All'): Promise<LeadStats>;
  addCompany(
    company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'notes'> & {
      contacts?: ContactPerson[];
    }
  ): Promise<Company>;
  deleteCompany(companyId: string): Promise<void>;
  bulkUpdateStatus(
    companyIds: string[],
    newStatus: CompanyStatus,
    author?: string
  ): Promise<Company[]>;
  bulkChangeSector(
    companyIds: string[],
    newSector: SectorType
  ): Promise<Company[]>;
  bulkDeleteCompanies(companyIds: string[]): Promise<void>;
  resetToDefault(): Promise<void>;
  scrapeGoogleMaps(params: {
    query: string;
    city?: string;
    country?: string;
    limit?: number;
    sector?: string;
  }): Promise<{ status: string; count: number; leads: ScrapedLead[] }>;
  uploadScraperFile(file: File): Promise<{ status: string; count: number; leads: ScrapedLead[] }>;
  importScrapedLeads(
    leads: ScrapedLead[],
    status?: CompanyStatus
  ): Promise<{ status: string; importedCount: number; companies: Company[] }>;
}

const SIMULATED_LATENCY_MS = 200;

function delay(ms: number = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockCompanyRepository implements CompanyRepository {
  private companies: Company[];

  constructor(initialData: Company[] = INITIAL_COMPANIES) {
    // Deep clone initial dataset
    this.companies = JSON.parse(JSON.stringify(initialData));
  }

  async resetToDefault(): Promise<void> {
    await delay();
    this.companies = JSON.parse(JSON.stringify(INITIAL_COMPANIES));
  }

  async getCompanies(filters?: CompanyFilters): Promise<Company[]> {
    await delay();
    let result = [...this.companies];

    // Pipeline status filter
    if (filters?.status) {
      result = result.filter((c) => c.status === filters.status);
    }

    // Sector filter
    if (filters?.sector && filters.sector !== 'All') {
      result = result.filter((c) => c.sector === filters.sector);
    }

    // Country filter
    if (filters?.country && filters.country !== 'All') {
      result = result.filter((c) => c.country === filters.country);
    }

    // Lead temperature filter
    if (filters?.temperature && filters.temperature !== 'All') {
      result = result.filter((c) => c.temperature === filters.temperature);
    }

    // City filter
    if (filters?.city && filters.city !== 'All') {
      result = result.filter((c) => c.city.toLowerCase() === filters.city!.toLowerCase());
    }

    // Company type filter
    if (filters?.companyType && filters.companyType !== 'All') {
      result = result.filter((c) => c.companyType === filters.companyType);
    }

    // Follow-up only filter
    if (filters?.followUpOnly) {
      result = result.filter((c) => c.followUpFlag);
    }

    // Incomplete profiles filter (profile completeness < 100%)
    if (filters?.incompleteOnly) {
      result = result.filter((c) => {
        const { isComplete } = calculateProfileCompleteness(c);
        return !isComplete;
      });
    }

    // Top-level KPI shortcut tiles filter
    if (filters?.kpiFilter && filters.kpiFilter !== 'all') {
      if (filters.kpiFilter === 'followup') {
        result = result.filter((c) => c.followUpFlag);
      } else if (filters.kpiFilter === 'hot') {
        result = result.filter((c) => c.temperature === 'hot');
      } else if (filters.kpiFilter === 'missing_contact') {
        result = result.filter((c) => !c.contacts || c.contacts.length === 0);
      }
    }

    // Free text search across company name, city, description, and contact names
    if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const matchCompany =
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.companyType.toLowerCase().includes(q);

        const matchContact = c.contacts?.some(
          (ct) =>
            ct.name.toLowerCase().includes(q) ||
            ct.role.toLowerCase().includes(q) ||
            ct.email.toLowerCase().includes(q)
        );

        return matchCompany || matchContact;
      });
    }

    // Sorting
    if (filters?.sortBy) {
      const orderMultiplier = filters.sortOrder === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name) * orderMultiplier;
        }
        if (filters.sortBy === 'city') {
          return a.city.localeCompare(b.city) * orderMultiplier;
        }
        if (filters.sortBy === 'temperature') {
          const tempWeight = { hot: 3, warm: 2, cold: 1 };
          return ((tempWeight[a.temperature] || 0) - (tempWeight[b.temperature] || 0)) * orderMultiplier;
        }
        if (filters.sortBy === 'status') {
          return a.status.localeCompare(b.status) * orderMultiplier;
        }
        if (filters.sortBy === 'completeness') {
          const scoreA = calculateProfileCompleteness(a).score;
          const scoreB = calculateProfileCompleteness(b).score;
          return (scoreA - scoreB) * orderMultiplier;
        }
        if (filters.sortBy === 'updatedAt') {
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * orderMultiplier;
        }
        return 0;
      });
    }

    return result;
  }

  async getCompanyById(id: string): Promise<Company | null> {
    await delay();
    const found = this.companies.find((c) => c.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async updateCompanyStatus(
    companyId: string,
    newStatus: CompanyStatus,
    author = 'Sales Representative',
    notes?: string
  ): Promise<Company> {
    await delay();
    const company = this.companies.find((c) => c.id === companyId);
    if (!company) throw new Error(`Company with id ${companyId} not found`);

    const prevStatus = company.status;
    if (prevStatus === newStatus) return company;

    company.status = newStatus;
    company.updatedAt = new Date().toISOString();

    const activity: TimelineActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'status_change',
      description: `Pipeline status moved from "${prevStatus}" to "${newStatus}"${notes ? `: ${notes}` : ''}`,
      author,
      metadata: {
        fromStatus: prevStatus,
        toStatus: newStatus,
      },
    };

    company.timeline = [activity, ...(company.timeline || [])];
    return JSON.parse(JSON.stringify(company));
  }

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company> {
    await delay();
    const companyIndex = this.companies.findIndex((c) => c.id === companyId);
    if (companyIndex < 0) throw new Error(`Company with id ${companyId} not found`);

    const current = this.companies[companyIndex];
    const updated: Company = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If follow-up was updated, record in timeline
    if (
      updates.followUpFlag !== undefined &&
      updates.followUpFlag !== current.followUpFlag
    ) {
      const act: TimelineActivity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'followup_updated',
        description: updates.followUpFlag
          ? `Follow-up scheduled for ${updates.followUpDate || 'upcoming date'}: ${updates.followUpNote || 'Touchpoint required'}`
          : 'Follow-up task marked as complete.',
        author: 'Sales Representative',
      };
      updated.timeline = [act, ...(updated.timeline || [])];
    }

    this.companies[companyIndex] = updated;
    return JSON.parse(JSON.stringify(updated));
  }

  async addNote(companyId: string, note: string, author = 'Sales Representative'): Promise<Company> {
    await delay();
    const company = this.companies.find((c) => c.id === companyId);
    if (!company) throw new Error(`Company with id ${companyId} not found`);

    company.notes = [note, ...(company.notes || [])];
    company.updatedAt = new Date().toISOString();

    const activity: TimelineActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'note_added',
      description: `Note added: "${note.length > 80 ? note.slice(0, 80) + '...' : note}"`,
      author,
    };

    company.timeline = [activity, ...(company.timeline || [])];
    return JSON.parse(JSON.stringify(company));
  }

  async saveContact(
    companyId: string,
    contactInput: Omit<ContactPerson, 'id'> & { id?: string }
  ): Promise<Company> {
    await delay();
    const company = this.companies.find((c) => c.id === companyId);
    if (!company) throw new Error(`Company with id ${companyId} not found`);

    company.contacts = company.contacts || [];

    const isEdit = Boolean(contactInput.id && company.contacts.some((c) => c.id === contactInput.id));

    if (!isEdit && company.contacts.length >= 5) {
      throw new Error('Maximum 5 contacts');
    }

    const contactId = contactInput.id || `ct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const contact: ContactPerson = {
      id: contactId,
      name: contactInput.name,
      role: contactInput.role,
      phone: contactInput.phone,
      email: contactInput.email,
      linkedIn: contactInput.linkedIn,
    };

    if (isEdit) {
      company.contacts = company.contacts.map((c) => (c.id === contactId ? contact : c));
    } else {
      company.contacts.push(contact);
    }

    company.updatedAt = new Date().toISOString();

    const activity: TimelineActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: isEdit ? 'contact_updated' : 'contact_added',
      description: `${isEdit ? 'Updated' : 'Added'} key contact ${contact.name} (${contact.role})`,
      author: 'Sales Representative',
    };

    company.timeline = [activity, ...(company.timeline || [])];
    return JSON.parse(JSON.stringify(company));
  }

  async deleteContact(companyId: string, contactId: string): Promise<Company> {
    await delay();
    const company = this.companies.find((c) => c.id === companyId);
    if (!company) throw new Error(`Company with id ${companyId} not found`);

    const deleted = company.contacts?.find((c) => c.id === contactId);
    company.contacts = (company.contacts || []).filter((c) => c.id !== contactId);
    company.updatedAt = new Date().toISOString();

    if (deleted) {
      const activity: TimelineActivity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'contact_deleted',
        description: `Removed contact ${deleted.name} (${deleted.role})`,
        author: 'Sales Representative',
      };
      company.timeline = [activity, ...(company.timeline || [])];
    }

    return JSON.parse(JSON.stringify(company));
  }

  async recordActivity(
    companyId: string,
    event: Omit<TimelineActivity, 'id' | 'timestamp'>
  ): Promise<Company> {
    await delay();
    const company = this.companies.find((c) => c.id === companyId);
    if (!company) throw new Error(`Company with id ${companyId} not found`);

    const activity: TimelineActivity = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    company.timeline = [activity, ...(company.timeline || [])];
    company.updatedAt = new Date().toISOString();
    return JSON.parse(JSON.stringify(company));
  }

  async getStats(sector?: SectorType | 'All'): Promise<LeadStats> {
    await delay();
    const list =
      sector && sector !== 'All'
        ? this.companies.filter((c) => c.sector === sector)
        : this.companies;

    // Sector counts across all companies regardless of filter
    const sectorCounts = SECTORS.reduce((acc, s) => {
      acc[s] = this.companies.filter((c) => c.sector === s).length;
      return acc;
    }, {} as Record<SectorType, number>);

    return {
      total: list.length,
      newCustomers: list.filter((c) => c.status === 'New Customers').length,
      oldCustomers: list.filter((c) => c.status === 'Old Customers').length,
      closedCustomers: list.filter((c) => c.status === 'Closed Customers').length,
      hotLeads: list.filter((c) => c.temperature === 'hot').length,
      followUpNeeded: list.filter((c) => c.followUpFlag).length,
      missingContacts: list.filter((c) => !c.contacts || c.contacts.length === 0).length,
      sectorCounts,
    };
  }

  async addCompany(
    companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'notes'> & {
      contacts?: ContactPerson[];
    }
  ): Promise<Company> {
    await delay();
    const newId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    if (companyData.contacts && companyData.contacts.length > 5) {
      throw new Error('Maximum 5 contacts');
    }

    const newCompany: Company = {
      ...companyData,
      id: newId,
      contacts: companyData.contacts || [],
      notes: [],
      timeline: [
        {
          id: `act_${Date.now()}`,
          timestamp: now,
          type: 'status_change',
          description: `Company created and placed in "${companyData.status}" pipeline.`,
          author: 'Sales Representative',
          metadata: { toStatus: companyData.status },
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.companies.unshift(newCompany);
    return JSON.parse(JSON.stringify(newCompany));
  }

  async deleteCompany(companyId: string): Promise<void> {
    await delay();
    this.companies = this.companies.filter((c) => c.id !== companyId);
  }

  async bulkUpdateStatus(
    companyIds: string[],
    newStatus: CompanyStatus,
    author = 'Sales Representative'
  ): Promise<Company[]> {
    await delay();
    const updated: Company[] = [];
    const now = new Date().toISOString();

    for (const id of companyIds) {
      const company = this.companies.find((c) => c.id === id);
      if (company && company.status !== newStatus) {
        const prevStatus = company.status;
        company.status = newStatus;
        company.updatedAt = now;
        company.timeline = [
          {
            id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: now,
            type: 'status_change',
            description: `Bulk status update: moved from "${prevStatus}" to "${newStatus}"`,
            author,
            metadata: { fromStatus: prevStatus, toStatus: newStatus },
          },
          ...(company.timeline || []),
        ];
        updated.push(JSON.parse(JSON.stringify(company)));
      }
    }

    return updated;
  }

  async bulkChangeSector(companyIds: string[], newSector: SectorType): Promise<Company[]> {
    await delay();
    const updated: Company[] = [];
    const now = new Date().toISOString();

    for (const id of companyIds) {
      const company = this.companies.find((c) => c.id === id);
      if (company && company.sector !== newSector) {
        const prevSector = company.sector;
        company.sector = newSector;
        company.updatedAt = now;
        company.timeline = [
          {
            id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: now,
            type: 'profile_updated',
            description: `Sector changed from "${prevSector}" to "${newSector}"`,
            author: 'Sales Representative',
          },
          ...(company.timeline || []),
        ];
        updated.push(JSON.parse(JSON.stringify(company)));
      }
    }

    return updated;
  }

  async bulkDeleteCompanies(companyIds: string[]): Promise<void> {
    await delay();
    const idSet = new Set(companyIds);
    this.companies = this.companies.filter((c) => !idSet.has(c.id));
  }

  async scrapeGoogleMaps(_params: {
    query: string;
    city?: string;
    country?: string;
    limit?: number;
    sector?: string;
  }): Promise<{ status: string; count: number; leads: ScrapedLead[] }> {
    await delay();
    return { status: 'success', count: 0, leads: [] };
  }

  async uploadScraperFile(_file: File): Promise<{ status: string; count: number; leads: ScrapedLead[] }> {
    await delay();
    return { status: 'success', count: 0, leads: [] };
  }

  async importScrapedLeads(
    leads: ScrapedLead[],
    _status: CompanyStatus = 'New Customers'
  ): Promise<{ status: string; importedCount: number; companies: Company[] }> {
    await delay();
    return { status: 'success', importedCount: leads.length, companies: [] };
  }
}

import { ApiCompanyRepository, ScrapedLead } from './apiRepository';

export { ApiCompanyRepository };
export type { ScrapedLead };
export const companyRepository: CompanyRepository = new ApiCompanyRepository();

import {
  Company,
  CompanyFilters,
  CompanyStatus,
  ContactPerson,
  LeadStats,
  SectorType,
  TimelineActivity,
} from './types';
import { CompanyRepository, MockCompanyRepository } from './repository';

const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as unknown as { __API_URL__?: string }).__API_URL__) {
    return (window as unknown as { __API_URL__: string }).__API_URL__;
  }
  return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002/api/';
};

export class ApiCompanyRepository implements CompanyRepository {
  private fallback: MockCompanyRepository;
  private baseUrl: string;

  constructor() {
    this.fallback = new MockCompanyRepository();
    this.baseUrl = getBaseApiUrl();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers as Record<string, string> || {}),
      },
    };

    const res = await fetch(url, mergedOptions);
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.detail || errorMessage;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    if (res.status === 204) {
      return {} as T;
    }
    return res.json();
  }

  async getCompanies(filters?: CompanyFilters): Promise<Company[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sector && filters.sector !== 'All') params.append('sector', filters.sector);
      if (filters?.country && filters.country !== 'All') params.append('country', filters.country);
      if (filters?.temperature && filters.temperature !== 'All') params.append('temperature', filters.temperature);
      if (filters?.city && filters.city !== 'All') params.append('city', filters.city);
      if (filters?.companyType && filters.companyType !== 'All') params.append('companyType', filters.companyType);
      if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters?.followUpOnly) params.append('followUpOnly', 'true');
      if (filters?.incompleteOnly) params.append('incompleteOnly', 'true');
      if (filters?.kpiFilter) params.append('kpiFilter', filters.kpiFilter);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await this.request<Company[]>(`companies/${queryStr}`);
    } catch {
      // Fallback to local memory mock if backend is unreachable
      return this.fallback.getCompanies(filters);
    }
  }

  async getCompanyById(id: string): Promise<Company | null> {
    try {
      return await this.request<Company>(`companies/${id}/`);
    } catch {
      return this.fallback.getCompanyById(id);
    }
  }

  async updateCompanyStatus(
    companyId: string,
    newStatus: CompanyStatus,
    author: string = 'System',
    notes: string = ''
  ): Promise<Company> {
    try {
      return await this.request<Company>(`companies/${companyId}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ newStatus, author, notes }),
      });
    } catch {
      return this.fallback.updateCompanyStatus(companyId, newStatus, author, notes);
    }
  }

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company> {
    try {
      return await this.request<Company>(`companies/${companyId}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch {
      return this.fallback.updateCompany(companyId, updates);
    }
  }

  async addNote(companyId: string, note: string, author: string = 'System'): Promise<Company> {
    try {
      return await this.request<Company>(`companies/${companyId}/add_note/`, {
        method: 'POST',
        body: JSON.stringify({ note, author }),
      });
    } catch {
      return this.fallback.addNote(companyId, note, author);
    }
  }

  async saveContact(
    companyId: string,
    contact: Omit<ContactPerson, 'id'> & { id?: string }
  ): Promise<Company> {
    try {
      return await this.request<Company>(`companies/${companyId}/save_contact/`, {
        method: 'POST',
        body: JSON.stringify(contact),
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes('Maximum 5 contacts')) {
        throw err;
      }
      return this.fallback.saveContact(companyId, contact);
    }
  }

  async deleteContact(companyId: string, contactId: string): Promise<Company> {
    try {
      return await this.request<Company>(`companies/${companyId}/delete_contact/`, {
        method: 'POST',
        body: JSON.stringify({ contactId }),
      });
    } catch {
      return this.fallback.deleteContact(companyId, contactId);
    }
  }

  async recordActivity(
    companyId: string,
    event: Omit<TimelineActivity, 'id' | 'timestamp'>
  ): Promise<Company> {
    try {
      return await this.request<Company>(`companies/${companyId}/record_activity/`, {
        method: 'POST',
        body: JSON.stringify(event),
      });
    } catch {
      return this.fallback.recordActivity(companyId, event);
    }
  }

  async getStats(sector?: SectorType | 'All'): Promise<LeadStats> {
    try {
      const query = sector && sector !== 'All' ? `?sector=${encodeURIComponent(sector)}` : '';
      return await this.request<LeadStats>(`companies/stats/${query}`);
    } catch {
      return this.fallback.getStats(sector);
    }
  }

  async addCompany(
    company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'notes'> & {
      contacts?: ContactPerson[];
    }
  ): Promise<Company> {
    try {
      return await this.request<Company>('companies/', {
        method: 'POST',
        body: JSON.stringify(company),
      });
    } catch {
      return this.fallback.addCompany(company);
    }
  }

  async deleteCompany(companyId: string): Promise<void> {
    try {
      await this.request<void>(`companies/${companyId}/`, {
        method: 'DELETE',
      });
    } catch {
      await this.fallback.deleteCompany(companyId);
    }
  }

  async bulkUpdateStatus(
    companyIds: string[],
    newStatus: CompanyStatus,
    author: string = 'System'
  ): Promise<Company[]> {
    try {
      return await this.request<Company[]>('companies/bulk_update_status/', {
        method: 'POST',
        body: JSON.stringify({ companyIds, newStatus, author }),
      });
    } catch {
      return this.fallback.bulkUpdateStatus(companyIds, newStatus, author);
    }
  }

  async bulkChangeSector(companyIds: string[], newSector: SectorType): Promise<Company[]> {
    try {
      return await this.request<Company[]>('companies/bulk_change_sector/', {
        method: 'POST',
        body: JSON.stringify({ companyIds, newSector }),
      });
    } catch {
      return this.fallback.bulkChangeSector(companyIds, newSector);
    }
  }

  async bulkDeleteCompanies(companyIds: string[]): Promise<void> {
    try {
      await this.request<void>('companies/bulk_delete/', {
        method: 'POST',
        body: JSON.stringify({ companyIds }),
      });
    } catch {
      await this.fallback.bulkDeleteCompanies(companyIds);
    }
  }

  async resetToDefault(): Promise<void> {
    try {
      await this.request<void>('companies/reset_to_default/', {
        method: 'POST',
      });
    } catch {
      await this.fallback.resetToDefault();
    }
  }

  async scrapeGoogleMaps(params: {
    query: string;
    city?: string;
    country?: string;
    limit?: number;
    sector?: string;
  }): Promise<{ status: string; count: number; leads: ScrapedLead[] }> {
    return await this.request<{ status: string; count: number; leads: ScrapedLead[] }>('scraper/scrape/', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async uploadScraperFile(file: File): Promise<{ status: string; count: number; leads: ScrapedLead[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.baseUrl}scraper/upload/`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`File upload failed: ${res.statusText}`);
    }
    return res.json();
  }

  async importScrapedLeads(
    leads: ScrapedLead[],
    status: CompanyStatus = 'New Customers'
  ): Promise<{ status: string; importedCount: number; companies: Company[] }> {
    return await this.request<{ status: string; importedCount: number; companies: Company[] }>('scraper/import/', {
      method: 'POST',
      body: JSON.stringify({ leads, status }),
    });
  }
}

export interface ScrapedLead {
  name: string;
  sector: SectorType | string;
  category?: string;
  companyType?: string;
  city: string;
  country: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  rating?: number;
  reviews_count?: number;
  description?: string;
  source?: string;
}

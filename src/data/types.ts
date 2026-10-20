export type CompanyStatus = 'New Customers' | 'Old Customers' | 'Closed Customers';

export const PIPELINE_STATUSES: readonly CompanyStatus[] = [
  'New Customers',
  'Old Customers',
  'Closed Customers',
] as const;

export type SectorType =
  | 'Real Estate'
  | 'Construction'
  | 'Fuel & Energy'
  | 'Safety'
  | 'Hotels & Hospitality'
  | 'Furniture & Interior'
  | 'Retail & Shopping'
  | 'Food & Beverage'
  | 'Healthcare'
  | 'Education'
  | 'Government'
  | 'Events & Exhibitions'
  | 'Advertising & Media'
  | 'Manufacturing'
  | 'Logistics & Transport'
  | 'Automotive'
  | 'IT & Technology'
  | 'Others';

export const SECTORS: readonly SectorType[] = [
  'Real Estate',
  'Construction',
  'Fuel & Energy',
  'Safety',
  'Hotels & Hospitality',
  'Furniture & Interior',
  'Retail & Shopping',
  'Food & Beverage',
  'Healthcare',
  'Education',
  'Government',
  'Events & Exhibitions',
  'Advertising & Media',
  'Manufacturing',
  'Logistics & Transport',
  'Automotive',
  'IT & Technology',
  'Others',
] as const;

export type LeadTemperature = 'hot' | 'warm' | 'cold';
export type CountryCode = 'KSA' | 'UAE' | string;

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  linkedIn?: string;
}

export type TimelineEventType =
  | 'status_change'
  | 'temperature_change'
  | 'note_added'
  | 'contact_added'
  | 'contact_updated'
  | 'contact_deleted'
  | 'profile_updated'
  | 'followup_updated';

export interface TimelineActivity {
  id: string;
  timestamp: string; // ISO 8601 string
  type: TimelineEventType;
  description: string;
  author: string;
  metadata?: {
    fromStatus?: CompanyStatus;
    toStatus?: CompanyStatus;
    [key: string]: unknown;
  };
}

export interface Company {
  id: string;
  name: string;
  sector: SectorType;
  companyType: string;
  status: CompanyStatus;
  temperature: LeadTemperature;
  country: CountryCode;
  city: string;
  address: string;
  phone: string;
  website: string;
  linkedIn?: string;
  instagram?: string;
  description: string;
  followUpFlag: boolean;
  followUpDate?: string;
  followUpNote?: string;
  followUpStatus?: 'pending' | 'completed';
  notes: string[];
  contacts: ContactPerson[]; // Up to 5 marketing/business contacts
  timeline: TimelineActivity[];
  createdAt: string;
  updatedAt: string;
}

export type KpiFilterType = 'all' | 'followup' | 'hot' | 'missing_contact';

export interface CompanyFilters {
  status?: CompanyStatus;
  sector?: SectorType | 'All';
  country?: CountryCode | 'All';
  temperature?: LeadTemperature | 'All';
  city?: string;
  companyType?: string;
  searchQuery?: string;
  followUpOnly?: boolean;
  incompleteOnly?: boolean;
  kpiFilter?: KpiFilterType;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'city' | 'temperature' | 'status' | 'updatedAt' | 'completeness';
  sortOrder?: 'asc' | 'desc';
}

export interface LeadStats {
  total: number;
  newCustomers: number;
  oldCustomers: number;
  closedCustomers: number;
  hotLeads: number;
  followUpNeeded: number;
  missingContacts: number;
  sectorCounts: Record<SectorType, number>;
}

import { Company } from '@/data/types';

export interface CompletenessItem {
  key: string;
  label: string;
  completed: boolean;
}

export interface ProfileCompletenessResult {
  score: number; // 0 to 100
  items: CompletenessItem[];
  isComplete: boolean;
}

/**
 * Calculates profile completeness score (0-100%) and checklist item states
 * based on the 6 key dimensions:
 * 1. Website
 * 2. Phone
 * 3. Address
 * 4. LinkedIn
 * 5. Instagram
 * 6. 5 Contacts (max allowed marketing contacts)
 */
export function calculateProfileCompleteness(company: Company): ProfileCompletenessResult {
  const hasWebsite = Boolean(company.website && company.website.trim().length > 0);
  const hasPhone = Boolean(company.phone && company.phone.trim().length > 0);
  const hasAddress = Boolean(company.address && company.address.trim().length > 0);
  const hasLinkedIn = Boolean(company.linkedIn && company.linkedIn.trim().length > 0);
  const hasInstagram = Boolean(company.instagram && company.instagram.trim().length > 0);
  const hasFullContacts = Boolean(company.contacts && company.contacts.length >= 5);

  const items: CompletenessItem[] = [
    { key: 'website', label: 'Company website', completed: hasWebsite },
    { key: 'phone', label: 'Primary phone number', completed: hasPhone },
    { key: 'address', label: 'Office address & city', completed: hasAddress },
    { key: 'linkedIn', label: 'Corporate LinkedIn profile', completed: hasLinkedIn },
    { key: 'instagram', label: 'Corporate Instagram profile', completed: hasInstagram },
    { key: 'contacts', label: `5 Key contacts (${company.contacts?.length || 0}/5)`, completed: hasFullContacts },
  ];

  // Weightings: basic info 15% each (5 * 15 = 75%), contacts up to 25% (5% per contact)
  let score = 0;
  if (hasWebsite) score += 15;
  if (hasPhone) score += 15;
  if (hasAddress) score += 15;
  if (hasLinkedIn) score += 15;
  if (hasInstagram) score += 15;
  
  const contactPoints = Math.min(company.contacts?.length || 0, 5) * 5;
  score += contactPoints;

  return {
    score,
    items,
    isComplete: score === 100,
  };
}

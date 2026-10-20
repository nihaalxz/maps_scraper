import { Company } from '@/data/types';
import { calculateProfileCompleteness } from './completeness';

export function exportCompaniesToCsv(companies: Company[], filename = 'arab_season_leads.csv'): void {
  const headers = [
    'ID',
    'Company Name',
    'Sector',
    'Type',
    'Pipeline Status',
    'Lead Temperature',
    'Country',
    'City',
    'Address',
    'Phone',
    'Website',
    'LinkedIn',
    'Instagram',
    'Follow-up Needed',
    'Follow-up Date',
    'Follow-up Note',
    'Contacts Count',
    'Primary Contact Name',
    'Primary Contact Role',
    'Primary Contact Phone',
    'Primary Contact Email',
    'Profile Completeness %',
    'Last Updated',
  ];

  const rows = companies.map((c) => {
    const primaryContact = c.contacts?.[0];
    const completeness = calculateProfileCompleteness(c).score;

    const escapeCell = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escapeCell(c.id),
      escapeCell(c.name),
      escapeCell(c.sector),
      escapeCell(c.companyType),
      escapeCell(c.status),
      escapeCell(c.temperature),
      escapeCell(c.country),
      escapeCell(c.city),
      escapeCell(c.address),
      escapeCell(c.phone),
      escapeCell(c.website),
      escapeCell(c.linkedIn || ''),
      escapeCell(c.instagram || ''),
      escapeCell(c.followUpFlag ? 'Yes' : 'No'),
      escapeCell(c.followUpDate || ''),
      escapeCell(c.followUpNote || ''),
      escapeCell(c.contacts?.length || 0),
      escapeCell(primaryContact?.name || ''),
      escapeCell(primaryContact?.role || ''),
      escapeCell(primaryContact?.phone || ''),
      escapeCell(primaryContact?.email || ''),
      escapeCell(`${completeness}%`),
      escapeCell(c.updatedAt),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyRepository } from '@/data/repository';
import {
  Company,
  CompanyFilters,
  CompanyStatus,
  ContactPerson,
  LeadStats,
  SectorType,
  TimelineActivity,
} from '@/data/types';
import { showToast } from '@/store/useToastStore';

export function useCompanies(filters?: CompanyFilters) {
  return useQuery<Company[], Error>({
    queryKey: ['companies', filters],
    queryFn: () => companyRepository.getCompanies(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCompany(id: string | null) {
  return useQuery<Company | null, Error>({
    queryKey: ['company', id],
    queryFn: () => (id ? companyRepository.getCompanyById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
}

export function useStats(sector?: SectorType | 'All') {
  return useQuery<LeadStats, Error>({
    queryKey: ['stats', sector],
    queryFn: () => companyRepository.getStats(sector),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      newStatus,
      author = 'Sales Representative',
      notes,
    }: {
      companyId: string;
      newStatus: CompanyStatus;
      author?: string;
      notes?: string;
    }) => companyRepository.updateCompanyStatus(companyId, newStatus, author, notes),
    onMutate: async ({ companyId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['companies'] });
      await queryClient.cancelQueries({ queryKey: ['company', companyId] });

      const previousCompany = queryClient.getQueryData<Company>(['company', companyId]);

      if (previousCompany) {
        queryClient.setQueryData<Company>(['company', companyId], {
          ...previousCompany,
          status: newStatus,
        });
      }

      return { previousCompany };
    },
    onError: (err, { companyId }, context) => {
      if (context?.previousCompany) {
        queryClient.setQueryData(['company', companyId], context.previousCompany);
      }
      showToast('Status update failed', err.message, 'error');
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast(`Status updated to "${updated.status}"`, updated.name, 'success');
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, updates }: { companyId: string; updates: Partial<Company> }) =>
      companyRepository.updateCompany(companyId, updates),
    onMutate: async ({ companyId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['company', companyId] });
      const previousCompany = queryClient.getQueryData<Company>(['company', companyId]);

      if (previousCompany) {
        queryClient.setQueryData<Company>(['company', companyId], {
          ...previousCompany,
          ...updates,
        });
      }

      return { previousCompany };
    },
    onError: (err, { companyId }, context) => {
      if (context?.previousCompany) {
        queryClient.setQueryData(['company', companyId], context.previousCompany);
      }
      showToast('Update failed', err.message, 'error');
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast('Company profile updated', updated.name, 'success');
    },
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      note,
      author = 'Sales Representative',
    }: {
      companyId: string;
      note: string;
      author?: string;
    }) => companyRepository.addNote(companyId, note, author),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', updated.id] });
      showToast('Note added', 'Recorded in company timeline', 'success');
    },
    onError: (err) => {
      showToast('Failed to add note', err.message, 'error');
    },
  });
}

export function useSaveContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      contact,
    }: {
      companyId: string;
      contact: Omit<ContactPerson, 'id'> & { id?: string };
    }) => companyRepository.saveContact(companyId, contact),
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      const isEdit = Boolean(variables.contact.id);
      showToast(
        isEdit ? 'Contact updated' : 'Key contact added',
        `${variables.contact.name} (${variables.contact.role})`,
        'success'
      );
    },
    onError: (err) => {
      showToast('Could not save contact', err.message, 'error');
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, contactId }: { companyId: string; contactId: string }) =>
      companyRepository.deleteContact(companyId, contactId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast('Contact removed', 'Updated marketing contact roster', 'info');
    },
    onError: (err) => {
      showToast('Failed to delete contact', err.message, 'error');
    },
  });
}

export function useRecordActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      activity,
    }: {
      companyId: string;
      activity: Omit<TimelineActivity, 'id' | 'timestamp'>;
    }) => companyRepository.recordActivity(companyId, activity),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['company', updated.id] });
    },
  });
}

export function useAddCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'notes'> & {
        contacts?: ContactPerson[];
      }
    ) => companyRepository.addCompany(companyData),
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast('Lead created successfully', `${newCompany.name} added to pipeline`, 'success');
    },
    onError: (err) => {
      showToast('Failed to create company', err.message, 'error');
    },
  });
}

export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyIds,
      newStatus,
      author = 'Sales Representative',
    }: {
      companyIds: string[];
      newStatus: CompanyStatus;
      author?: string;
    }) => companyRepository.bulkUpdateStatus(companyIds, newStatus, author),
    onSuccess: (_updatedList, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast(
        `Moved ${variables.companyIds.length} leads`,
        `Pipeline updated to ${variables.newStatus}`,
        'success'
      );
    },
    onError: (err) => {
      showToast('Bulk update failed', err.message, 'error');
    },
  });
}

export function useBulkChangeSector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyIds,
      newSector,
    }: {
      companyIds: string[];
      newSector: SectorType;
    }) => companyRepository.bulkChangeSector(companyIds, newSector),
    onSuccess: (_updatedList, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast(
        `Reassigned ${variables.companyIds.length} leads`,
        `Moved to sector ${variables.newSector}`,
        'success'
      );
    },
    onError: (err) => {
      showToast('Sector reassignment failed', err.message, 'error');
    },
  });
}

export function useBulkDeleteCompanies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyIds: string[]) => companyRepository.bulkDeleteCompanies(companyIds),
    onSuccess: (_, companyIds) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast('Leads deleted', `Removed ${companyIds.length} companies`, 'info');
    },
    onError: (err) => {
      showToast('Bulk delete failed', err.message, 'error');
    },
  });
}

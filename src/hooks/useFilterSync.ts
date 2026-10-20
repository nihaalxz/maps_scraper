import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CompanyFilters,
  CompanyStatus,
  CountryCode,
  KpiFilterType,
  LeadTemperature,
  SectorType,
} from '@/data/types';

export interface FilterState {
  status: CompanyStatus;
  sector: SectorType | 'All';
  country: CountryCode | 'All';
  temperature: LeadTemperature | 'All';
  city: string;
  companyType: string;
  searchQuery: string;
  kpiFilter: KpiFilterType;
  incompleteOnly: boolean;
  selectedCompanyId: string | null;
  page: number;
  pageSize: number;
  sortBy: 'name' | 'city' | 'temperature' | 'status' | 'updatedAt' | 'completeness';
  sortOrder: 'asc' | 'desc';
}

export function useFilterSync() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: FilterState = useMemo(() => {
    const statusParam = searchParams.get('status') as CompanyStatus;
    const status: CompanyStatus =
      statusParam === 'Old Customers' || statusParam === 'Closed Customers'
        ? statusParam
        : 'New Customers';

    const sector = (searchParams.get('sector') || 'All') as SectorType | 'All';
    const country = (searchParams.get('country') || 'All') as CountryCode | 'All';
    const temperature = (searchParams.get('temp') || 'All') as LeadTemperature | 'All';
    const city = searchParams.get('city') || 'All';
    const companyType = searchParams.get('type') || 'All';
    const searchQuery = searchParams.get('q') || '';
    const kpiFilter = (searchParams.get('kpi') || 'all') as KpiFilterType;
    const incompleteOnly = searchParams.get('incomplete') === 'true';
    const selectedCompanyId = searchParams.get('company') || null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortBy = (searchParams.get('sortBy') || 'updatedAt') as FilterState['sortBy'];
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as FilterState['sortOrder'];

    return {
      status,
      sector,
      country,
      temperature,
      city,
      companyType,
      searchQuery,
      kpiFilter,
      incompleteOnly,
      selectedCompanyId,
      page: isNaN(page) || page < 1 ? 1 : page,
      pageSize: isNaN(pageSize) || pageSize < 1 ? 10 : pageSize,
      sortBy,
      sortOrder,
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          if (updates.status !== undefined) {
            next.set('status', updates.status);
            next.set('page', '1');
          }

          if (updates.sector !== undefined) {
            if (updates.sector === 'All') next.delete('sector');
            else next.set('sector', updates.sector);
            next.set('page', '1');
          }

          if (updates.country !== undefined) {
            if (updates.country === 'All') next.delete('country');
            else next.set('country', updates.country);
            next.set('page', '1');
          }

          if (updates.temperature !== undefined) {
            if (updates.temperature === 'All') next.delete('temp');
            else next.set('temp', updates.temperature);
            next.set('page', '1');
          }

          if (updates.city !== undefined) {
            if (updates.city === 'All') next.delete('city');
            else next.set('city', updates.city);
            next.set('page', '1');
          }

          if (updates.companyType !== undefined) {
            if (updates.companyType === 'All') next.delete('type');
            else next.set('type', updates.companyType);
            next.set('page', '1');
          }

          if (updates.searchQuery !== undefined) {
            if (!updates.searchQuery.trim()) next.delete('q');
            else next.set('q', updates.searchQuery.trim());
            next.set('page', '1');
          }

          if (updates.kpiFilter !== undefined) {
            if (updates.kpiFilter === 'all') next.delete('kpi');
            else next.set('kpi', updates.kpiFilter);
            next.set('page', '1');
          }

          if (updates.incompleteOnly !== undefined) {
            if (!updates.incompleteOnly) next.delete('incomplete');
            else next.set('incomplete', 'true');
            next.set('page', '1');
          }

          if (updates.selectedCompanyId !== undefined) {
            if (!updates.selectedCompanyId) next.delete('company');
            else next.set('company', updates.selectedCompanyId);
          }

          if (updates.page !== undefined) {
            next.set('page', String(updates.page));
          }

          if (updates.pageSize !== undefined) {
            next.set('pageSize', String(updates.pageSize));
            next.set('page', '1');
          }

          if (updates.sortBy !== undefined) {
            next.set('sortBy', updates.sortBy);
          }

          if (updates.sortOrder !== undefined) {
            next.set('sortOrder', updates.sortOrder);
          }

          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const currentStatus = prev.get('status') || 'New Customers';
        next.set('status', currentStatus);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // Convert to CompanyFilters for repository
  const repositoryFilters: CompanyFilters = useMemo(
    () => ({
      status: filters.status,
      sector: filters.sector,
      country: filters.country,
      temperature: filters.temperature,
      city: filters.city,
      companyType: filters.companyType,
      searchQuery: filters.searchQuery,
      kpiFilter: filters.kpiFilter,
      incompleteOnly: filters.incompleteOnly,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [filters]
  );

  return {
    filters,
    repositoryFilters,
    updateFilters,
    resetFilters,
  };
}

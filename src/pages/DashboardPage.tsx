import React, { useState, useMemo, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { TitleBlock } from '@/components/layout/TitleBlock';
import { StatusTabs } from '@/components/companies/StatusTabs';
import { FilterBar } from '@/components/companies/FilterBar';
import { CompaniesTable } from '@/components/companies/CompaniesTable';
import { BulkBar } from '@/components/companies/BulkBar';
import { CompanyPanel } from '@/components/profile/CompanyPanel';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { AddLeadModal } from '@/components/companies/AddLeadModal';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useFilterSync } from '@/hooks/useFilterSync';
import {
  useCompanies,
  useStats,
  useUpdateCompany,
  useUpdateCompanyStatus,
  useSaveContact,
  useDeleteContact,
  useAddNote,
  useAddCompany,
  useBulkUpdateStatus,
  useBulkChangeSector,
  useBulkDeleteCompanies,
} from '@/hooks/useCompanies';
import { exportCompaniesToCsv } from '@/lib/exportCsv';
import { CompanyStatus, ContactPerson, SectorType } from '@/data/types';
import { showToast } from '@/store/useToastStore';

export const DashboardPage: React.FC = () => {
  const { filters, repositoryFilters, updateFilters, resetFilters } = useFilterSync();

  // Queries
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies(repositoryFilters);
  const { data: allCompanies = [] } = useCompanies({});
  const { data: stats } = useStats(filters.sector);

  // Mutations
  const updateCompanyMutation = useUpdateCompany();
  const updateCompanyStatusMutation = useUpdateCompanyStatus();
  const saveContactMutation = useSaveContact();
  const deleteContactMutation = useDeleteContact();
  const addNoteMutation = useAddNote();
  const addCompanyMutation = useAddCompany();
  const bulkUpdateStatusMutation = useBulkUpdateStatus();
  const bulkChangeSectorMutation = useBulkChangeSector();
  const bulkDeleteMutation = useBulkDeleteCompanies();

  // Local UI State
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Selected company object for the side panel
  const selectedCompany = useMemo(() => {
    if (!filters.selectedCompanyId) return null;
    return allCompanies.find((c) => c.id === filters.selectedCompanyId) || null;
  }, [allCompanies, filters.selectedCompanyId]);

  // Index for Previous / Next keyboard & button navigation
  const selectedIndex = useMemo(() => {
    if (!filters.selectedCompanyId) return -1;
    return companies.findIndex((c) => c.id === filters.selectedCompanyId);
  }, [companies, filters.selectedCompanyId]);

  const handlePrevCompany = useCallback(() => {
    if (selectedIndex > 0) {
      updateFilters({ selectedCompanyId: companies[selectedIndex - 1].id });
    }
  }, [selectedIndex, companies, updateFilters]);

  const handleNextCompany = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < companies.length - 1) {
      updateFilters({ selectedCompanyId: companies[selectedIndex + 1].id });
    }
  }, [selectedIndex, companies, updateFilters]);

  // Bulk Selection Handlers
  const handleToggleSelectRow = useCallback((id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedRowIds.length === companies.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(companies.map((c) => c.id));
    }
  }, [companies, selectedRowIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedRowIds([]);
  }, []);

  // Export CSV Handler
  const handleExportCsv = useCallback(() => {
    if (companies.length === 0) {
      showToast('Export empty', 'No leads match the current filters to export', 'info');
      return;
    }
    const sectorSuffix = filters.sector === 'All' ? 'all_sectors' : filters.sector.toLowerCase().replace(/\s+/g, '_');
    exportCompaniesToCsv(companies, `arab_season_leads_${sectorSuffix}.csv`);
    showToast('Export generated', `Downloaded ${companies.length} lead records`, 'success');
  }, [companies, filters.sector]);

  // Bulk Actions
  const handleBulkMoveStatus = useCallback(
    (newStatus: CompanyStatus) => {
      bulkUpdateStatusMutation.mutate({
        companyIds: selectedRowIds,
        newStatus,
      });
      setSelectedRowIds([]);
    },
    [bulkUpdateStatusMutation, selectedRowIds]
  );

  const handleBulkChangeSector = useCallback(
    (newSector: SectorType) => {
      bulkChangeSectorMutation.mutate({
        companyIds: selectedRowIds,
        newSector,
      });
      setSelectedRowIds([]);
    },
    [bulkChangeSectorMutation, selectedRowIds]
  );

  const handleBulkDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete ${selectedRowIds.length} companies?`)) {
      bulkDeleteMutation.mutate(selectedRowIds);
      setSelectedRowIds([]);
    }
  }, [bulkDeleteMutation, selectedRowIds]);

  const handleBulkExportSelected = useCallback(() => {
    const selectedList = companies.filter((c) => selectedRowIds.includes(c.id));
    if (selectedList.length === 0) return;
    exportCompaniesToCsv(selectedList, `arab_season_leads_selected_${selectedList.length}.csv`);
    showToast('Export generated', `Downloaded ${selectedList.length} selected records`, 'success');
  }, [companies, selectedRowIds]);

  // Sorting
  const handleSortChange = useCallback(
    (column: 'name' | 'city' | 'temperature' | 'status' | 'completeness') => {
      if (filters.sortBy === column) {
        updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
      } else {
        updateFilters({ sortBy: column, sortOrder: 'asc' });
      }
    },
    [filters.sortBy, filters.sortOrder, updateFilters]
  );

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
      filters.city !== 'All' ||
      filters.temperature !== 'All' ||
      filters.companyType !== 'All' ||
      filters.incompleteOnly ||
      filters.kpiFilter !== 'all' ||
      filters.country !== 'All'
  );

  return (
    <>
      {/* MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden gap-3 relative">
        {/* Top Row Controls: Global Search + Country Switcher + Manager Chip */}
        <TopBar
          country={filters.country}
          onSelectCountry={(c) => updateFilters({ country: c })}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Title Block: Sector Title, Count Subtitle, Export CSV, Add Lead */}
        <TitleBlock
          sector={filters.sector}
          totalCount={companies.length}
          country={filters.country}
          onExportCsv={handleExportCsv}
          onAddLead={() => setIsAddModalOpen(true)}
        />

        {/* Folder-Style Status Tabs */}
        <StatusTabs
          activeStatus={filters.status}
          onSelectStatus={(st) => updateFilters({ status: st })}
          stats={stats}
        />

        {/* White Rounded Table Card with Pill Controls */}
        <div className="bg-white rounded-[28px] border border-black/[0.06] flex-1 flex flex-col min-h-0 overflow-hidden relative shadow-sm">
          {/* Pill Filters Bar */}
          <FilterBar
            searchQuery={filters.searchQuery}
            onSearchChange={(q) => updateFilters({ searchQuery: q })}
            city={filters.city}
            onCityChange={(city) => updateFilters({ city })}
            temperature={filters.temperature}
            onTemperatureChange={(temp) => updateFilters({ temperature: temp })}
            companyType={filters.companyType}
            onCompanyTypeChange={(type) => updateFilters({ companyType: type })}
            incompleteOnly={filters.incompleteOnly}
            onToggleIncomplete={(inc) => updateFilters({ incompleteOnly: inc })}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Table */}
          <CompaniesTable
            companies={companies}
            selectedCompanyId={filters.selectedCompanyId}
            onSelectCompany={(id) => updateFilters({ selectedCompanyId: id })}
            selectedRowIds={selectedRowIds}
            onToggleSelectRow={handleToggleSelectRow}
            onToggleSelectAll={handleToggleSelectAll}
            page={filters.page}
            pageSize={filters.pageSize}
            onPageChange={(p) => updateFilters({ page: p })}
            onPageSizeChange={(ps) => updateFilters({ pageSize: ps })}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
            isLoading={isLoadingCompanies}
          />

          {/* Floating Bulk Bar */}
          <BulkBar
            selectedCount={selectedRowIds.length}
            onClearSelection={handleClearSelection}
            onBulkMoveStatus={handleBulkMoveStatus}
            onBulkChangeSector={handleBulkChangeSector}
            onBulkExport={handleBulkExportSelected}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      </main>

      {/* 3. RIGHT COMPANY PROFILE PANEL */}
      {selectedCompany && (
        <CompanyPanel
          company={selectedCompany}
          onClose={() => updateFilters({ selectedCompanyId: null })}
          onPrevCompany={handlePrevCompany}
          onNextCompany={handleNextCompany}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex >= 0 && selectedIndex < companies.length - 1}
          onUpdateCompany={(updates) => {
            if (updates.status && updates.status !== selectedCompany.status) {
              updateCompanyStatusMutation.mutate({
                companyId: selectedCompany.id,
                newStatus: updates.status,
              });
            } else {
              updateCompanyMutation.mutate({
                companyId: selectedCompany.id,
                updates,
              });
            }
          }}
          onSaveContact={(contact: Omit<ContactPerson, 'id'> & { id?: string }) =>
            saveContactMutation.mutate({
              companyId: selectedCompany.id,
              contact,
            })
          }
          onDeleteContact={(contactId) =>
            deleteContactMutation.mutate({
              companyId: selectedCompany.id,
              contactId,
            })
          }
          onAddNote={(note) =>
            addNoteMutation.mutate({
              companyId: selectedCompany.id,
              note,
            })
          }
        />
      )}

      {/* 4. Global Command Palette Modal (Ctrl+K or /) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        companies={allCompanies}
        onSelectCompany={(id) => {
          const target = allCompanies.find((c) => c.id === id);
          if (target) {
            updateFilters({
              selectedCompanyId: id,
              status: target.status,
            });
          } else {
            updateFilters({ selectedCompanyId: id });
          }
        }}
      />

      {/* 5. Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultSector={filters.sector}
        defaultStatus={filters.status}
        onSubmit={(leadData) => {
          const contactsList =
            leadData.primaryContactName && leadData.primaryContactRole
              ? [
                  {
                    id: `ct_${Date.now()}`,
                    name: leadData.primaryContactName,
                    role: leadData.primaryContactRole,
                    email: leadData.primaryContactEmail || '',
                    phone: leadData.phone || '',
                  },
                ]
              : [];

          addCompanyMutation.mutate({
            name: leadData.name,
            sector: leadData.sector,
            companyType: leadData.companyType,
            status: leadData.status,
            temperature: leadData.temperature,
            country: leadData.country,
            city: leadData.city,
            address: leadData.address,
            phone: leadData.phone,
            website: leadData.website,
            description: leadData.description,
            followUpFlag: leadData.followUpFlag,
            contacts: contactsList,
          });
        }}
      />

      {/* 6. Toast Notifications */}
      <ToastContainer />
    </>
  );
};

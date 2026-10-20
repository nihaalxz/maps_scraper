import React, { useMemo } from 'react';
import { Company, CompanyStatus, LeadTemperature } from '@/data/types';
import { calculateProfileCompleteness } from '@/lib/completeness';
import {
  Phone,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
} from 'lucide-react';

interface CompaniesTableProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
  selectedRowIds: string[];
  onToggleSelectRow: (companyId: string) => void;
  onToggleSelectAll: () => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: 'name' | 'city' | 'temperature' | 'status' | 'completeness') => void;
  isLoading?: boolean;
}

// Deterministic pastel avatar background color based on name
const PASTEL_COLORS = [
  'bg-[#FFE5D9] text-[#9A3412]',
  'bg-[#E8F0FE] text-[#1D4ED8]',
  'bg-[#E6F4EA] text-[#137333]',
  'bg-[#FEF7E0] text-[#B06000]',
  'bg-[#F3E8FD] text-[#6B21A8]',
  'bg-[#E0F2FE] text-[#0369A1]',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  selectedRowIds,
  onToggleSelectRow,
  onToggleSelectAll,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder: _sortOrder,
  onSortChange,
  isLoading = false,
}) => {
  // Client-side pagination slice
  const totalItems = companies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return companies.slice(start, start + pageSize);
  }, [companies, currentPage, pageSize]);

  const isAllSelected =
    paginatedCompanies.length > 0 &&
    paginatedCompanies.every((c) => selectedRowIds.includes(c.id));

  const renderTemperatureTag = (temp: LeadTemperature) => {
    switch (temp) {
      case 'hot':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0625D] text-white">
            Hot
          </span>
        );
      case 'warm':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#D6F25C] text-black">
            Warm
          </span>
        );
      case 'cold':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#7DD3EA] text-black">
            Cold
          </span>
        );
    }
  };

  const renderStatusPill = (status: CompanyStatus) => {
    switch (status) {
      case 'New Customers':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E6F7FC] text-[#0C6A8A]">
            New
          </span>
        );
      case 'Old Customers':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EAF5EA] text-[#2C6A2E]">
            Old
          </span>
        );
      case 'Closed Customers':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F0F0] text-[#555555]">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white select-none">
      {/* Scrollable Table View */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
        <table className="w-full text-start border-collapse text-[13px]">
          {/* Sticky Header with 11px uppercase-free muted labels */}
          <thead className="sticky top-0 bg-white border-b border-black/[0.06] z-10">
            <tr className="h-10 text-[11px] text-[#8A8A8A] font-normal">
              <th className="w-12 px-4 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all rows"
                  className="w-4 h-4 rounded border-black/20 text-[#0B0B0B] focus:ring-0 cursor-pointer accent-[#0B0B0B]"
                />
              </th>
              <th className="px-4 text-start font-normal">
                <button
                  type="button"
                  onClick={() => onSortChange('name')}
                  className="flex items-center gap-1 hover:text-[#0B0B0B] transition-colors"
                >
                  <span>Company</span>
                  <ArrowUpDown size={11} className={sortBy === 'name' ? 'text-black' : 'opacity-40'} />
                </button>
              </th>
              <th className="px-4 text-start font-normal">
                <button
                  type="button"
                  onClick={() => onSortChange('city')}
                  className="flex items-center gap-1 hover:text-[#0B0B0B] transition-colors"
                >
                  <span>City & country</span>
                  <ArrowUpDown size={11} className={sortBy === 'city' ? 'text-black' : 'opacity-40'} />
                </button>
              </th>
              <th className="px-4 text-start font-normal">Primary contact</th>
              <th className="px-4 text-start font-normal">Phone</th>
              <th className="px-4 text-start font-normal">
                <button
                  type="button"
                  onClick={() => onSortChange('completeness')}
                  className="flex items-center gap-1 hover:text-[#0B0B0B] transition-colors"
                >
                  <span>Profile completeness</span>
                  <ArrowUpDown size={11} className={sortBy === 'completeness' ? 'text-black' : 'opacity-40'} />
                </button>
              </th>
              <th className="px-4 text-start font-normal">
                <button
                  type="button"
                  onClick={() => onSortChange('temperature')}
                  className="flex items-center gap-1 hover:text-[#0B0B0B] transition-colors"
                >
                  <span>Temperature</span>
                  <ArrowUpDown size={11} className={sortBy === 'temperature' ? 'text-black' : 'opacity-40'} />
                </button>
              </th>
              <th className="px-4 text-start font-normal">
                <button
                  type="button"
                  onClick={() => onSortChange('status')}
                  className="flex items-center gap-1 hover:text-[#0B0B0B] transition-colors"
                >
                  <span>Status</span>
                  <ArrowUpDown size={11} className={sortBy === 'status' ? 'text-black' : 'opacity-40'} />
                </button>
              </th>
              <th className="w-12 px-4 text-center font-normal"></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-black/[0.04]">
            {isLoading ? (
              // Skeleton Loader
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="h-16 animate-pulse">
                  <td className="px-4 text-center">
                    <div className="w-4 h-4 rounded bg-slate-200 mx-auto" />
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="w-28 h-3.5 bg-slate-200 rounded" />
                        <div className="w-16 h-2.5 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4">
                    <div className="w-20 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="px-4">
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="px-4">
                    <div className="w-20 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="px-4">
                    <div className="w-28 h-2 bg-slate-200 rounded-full" />
                  </td>
                  <td className="px-4">
                    <div className="w-12 h-5 rounded-full bg-slate-200" />
                  </td>
                  <td className="px-4">
                    <div className="w-12 h-5 rounded-full bg-slate-200" />
                  </td>
                  <td className="px-4"></td>
                </tr>
              ))
            ) : paginatedCompanies.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#8A8A8A]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#8A8A8A]">
                      <Building size={22} strokeWidth={1.5} />
                    </div>
                    <p className="text-[14px] font-medium text-[#0B0B0B] mt-2">No leads found</p>
                    <p className="text-[12px] text-[#8A8A8A] max-w-xs">
                      No companies match your current filters. Try resetting your search or choosing another sector.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((company) => {
                const isSelected = selectedCompanyId === company.id;
                const isChecked = selectedRowIds.includes(company.id);
                const completeness = calculateProfileCompleteness(company).score;
                const primaryContact = company.contacts?.[0];
                const extraContactsCount = Math.max(0, (company.contacts?.length || 0) - 1);

                return (
                  <tr
                    key={company.id}
                    onClick={() => onSelectCompany(company.id)}
                    className={`h-16 transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F7FCE8]'
                        : isChecked
                        ? 'bg-[#FAFAFA]'
                        : 'hover:bg-[#F9F9F9]'
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td
                      className="px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelectRow(company.id)}
                        aria-label={`Select ${company.name}`}
                        className="w-4 h-4 rounded border-black/20 text-[#0B0B0B] focus:ring-0 cursor-pointer accent-[#0B0B0B]"
                      />
                    </td>

                    {/* Company (36px Avatar + Name + Type) */}
                    <td className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${getAvatarColor(
                            company.name
                          )}`}
                        >
                          {getInitials(company.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-[#0B0B0B] truncate leading-snug">
                            {company.name}
                          </span>
                          <span className="text-[11px] text-[#8A8A8A] truncate">
                            {company.companyType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* City & Country */}
                    <td className="px-4 text-[#0B0B0B] whitespace-nowrap">
                      <span className="truncate block">
                        {company.city}, <span className="text-[#8A8A8A]">{company.country}</span>
                      </span>
                    </td>

                    {/* Primary Contact */}
                    <td className="px-4 whitespace-nowrap">
                      {primaryContact ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="flex flex-col min-w-0">
                            <span className="font-normal text-[#0B0B0B] truncate">
                              {primaryContact.name}
                            </span>
                            <span className="text-[11px] text-[#8A8A8A] truncate">
                              {primaryContact.role}
                            </span>
                          </div>
                          {extraContactsCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F3F3F3] text-[#8A8A8A] font-medium shrink-0">
                              +{extraContactsCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8A8A8A] italic">No contact</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-4 text-[#0B0B0B] tabular-nums font-normal text-[12px] whitespace-nowrap">
                      {company.phone ? (
                        <span className="flex items-center gap-1.5 text-[#0B0B0B]">
                          <Phone size={12} className="text-[#8A8A8A]" />
                          <span>{company.phone}</span>
                        </span>
                      ) : (
                        <span className="text-[#8A8A8A]">—</span>
                      )}
                    </td>

                    {/* Profile Completeness (6px thin progress bar + percent) */}
                    <td className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 w-28">
                        <div className="flex-1 h-1.5 rounded-full bg-[#EFEFEF] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              completeness === 100
                                ? 'bg-[#D6F25C]'
                                : completeness >= 50
                                ? 'bg-[#A99BF2]'
                                : 'bg-[#F0625D]'
                            }`}
                            style={{ inlineSize: `${completeness}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#8A8A8A] tabular-nums w-8 text-end">
                          {completeness}%
                        </span>
                      </div>
                    </td>

                    {/* Temperature Tag */}
                    <td className="px-4 whitespace-nowrap">{renderTemperatureTag(company.temperature)}</td>

                    {/* Status Pill */}
                    <td className="px-4 whitespace-nowrap">{renderStatusPill(company.status)}</td>

                    {/* Row Menu Button */}
                    <td
                      className="px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCompany(company.id);
                      }}
                    >
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-black hover:bg-black/5 transition-colors"
                        title="View company details"
                        aria-label="View company details"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar at Bottom */}
      <div className="p-3 px-6 border-t border-black/[0.04] flex items-center justify-between bg-white text-[12px] text-[#8A8A8A] select-none">
        {/* Total count summary */}
        <div>
          Showing{' '}
          <span className="font-medium text-[#0B0B0B] tabular-nums">
            {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium text-[#0B0B0B] tabular-nums">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{' '}
          of <span className="font-medium text-[#0B0B0B] tabular-nums">{totalItems}</span> leads
        </div>

        {/* Page size buttons + Page Navigation */}
        <div className="flex items-center gap-4">
          {/* Page size toggle */}
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            {[10, 25, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors ${
                  pageSize === size
                    ? 'bg-[#0B0B0B] text-white shadow-sm'
                    : 'bg-[#F3F3F3] text-[#8A8A8A] hover:text-[#0B0B0B]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F3F3F3] text-[#0B0B0B] hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-[#F3F3F3] transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-[12px] font-medium text-[#0B0B0B] tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F3F3F3] text-[#0B0B0B] hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-[#F3F3F3] transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

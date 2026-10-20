import React from 'react';
import { Search, RotateCcw, AlertCircle } from 'lucide-react';
import { LeadTemperature } from '@/data/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  temperature: LeadTemperature | 'All';
  onTemperatureChange: (temp: LeadTemperature | 'All') => void;
  companyType: string;
  onCompanyTypeChange: (type: string) => void;
  incompleteOnly: boolean;
  onToggleIncomplete: (val: boolean) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const CITIES = [
  'All',
  'Riyadh',
  'Jeddah',
  'Dammam',
  'Khobar',
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
];

const COMPANY_TYPES = [
  'All',
  'Enterprise',
  'Enterprise Public',
  'Semi-Government PIF',
  'Government Authority',
  'Conglomerate',
  'Fintech Unicorn',
  'SME',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  city,
  onCityChange,
  temperature,
  onTemperatureChange,
  companyType,
  onCompanyTypeChange,
  incompleteOnly,
  onToggleIncomplete,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="p-4 px-6 border-b border-black/[0.04] flex flex-wrap items-center justify-between gap-3 bg-white select-none">
      {/* Left Pill Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* In-table Search Pill */}
        <div className="h-8 px-3 rounded-full bg-[#F3F3F3] border border-black/[0.04] flex items-center gap-2 w-48 focus-within:w-56 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 transition-all">
          <Search size={14} className="text-[#8A8A8A] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter list..."
            className="w-full bg-transparent border-none outline-none text-[12px] placeholder:text-[#8A8A8A] text-[#0B0B0B]"
          />
        </div>

        {/* City Filter Pill */}
        <div className="relative">
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="h-8 ps-3 pe-7 rounded-full bg-[#F3F3F3] border border-black/[0.04] text-[12px] text-[#0B0B0B] font-normal cursor-pointer hover:bg-black/[0.06] transition-colors appearance-none outline-none focus:ring-1 focus:ring-black/20"
          >
            <option value="All">City: All</option>
            {CITIES.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-[10px] text-[#8A8A8A]">
            ▼
          </span>
        </div>

        {/* Temperature Filter Pill */}
        <div className="relative">
          <select
            value={temperature}
            onChange={(e) => onTemperatureChange(e.target.value as LeadTemperature | 'All')}
            className="h-8 ps-3 pe-7 rounded-full bg-[#F3F3F3] border border-black/[0.04] text-[12px] text-[#0B0B0B] font-normal cursor-pointer hover:bg-black/[0.06] transition-colors appearance-none outline-none focus:ring-1 focus:ring-black/20"
          >
            <option value="All">Temp: All</option>
            <option value="hot">Hot (High Priority)</option>
            <option value="warm">Warm (Engaged)</option>
            <option value="cold">Cold (Low Urgency)</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-[10px] text-[#8A8A8A]">
            ▼
          </span>
        </div>

        {/* Company Type Filter Pill */}
        <div className="relative">
          <select
            value={companyType}
            onChange={(e) => onCompanyTypeChange(e.target.value)}
            className="h-8 ps-3 pe-7 rounded-full bg-[#F3F3F3] border border-black/[0.04] text-[12px] text-[#0B0B0B] font-normal cursor-pointer hover:bg-black/[0.06] transition-colors appearance-none outline-none focus:ring-1 focus:ring-black/20"
          >
            <option value="All">Type: All</option>
            {COMPANY_TYPES.filter((t) => t !== 'All').map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 end-2 flex items-center text-[10px] text-[#8A8A8A]">
            ▼
          </span>
        </div>

        {/* Incomplete Profiles Toggle Pill */}
        <button
          type="button"
          onClick={() => onToggleIncomplete(!incompleteOnly)}
          className={`h-8 px-3 rounded-full text-[12px] font-normal flex items-center gap-1.5 transition-all ${
            incompleteOnly
              ? 'bg-[#A99BF2] text-black font-medium shadow-sm'
              : 'bg-[#F3F3F3] text-[#8A8A8A] hover:text-[#0B0B0B] hover:bg-black/[0.06]'
          }`}
        >
          <AlertCircle size={13} strokeWidth={1.7} />
          <span>Incomplete profiles</span>
        </button>
      </div>

      {/* Right Reset Control */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="h-8 px-3 rounded-full text-[12px] font-normal text-[#8A8A8A] hover:text-[#0B0B0B] hover:bg-[#F3F3F3] transition-colors flex items-center gap-1.5"
          title="Reset all filters"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

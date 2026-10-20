import React from 'react';
import { Download, Plus } from 'lucide-react';
import { SectorType } from '@/data/types';

interface TitleBlockProps {
  sector: SectorType | 'All';
  totalCount: number;
  country: string;
  onExportCsv: () => void;
  onAddLead: () => void;
}

export const TitleBlock: React.FC<TitleBlockProps> = ({
  sector,
  totalCount,
  country,
  onExportCsv,
  onAddLead,
}) => {
  const displayTitle = sector === 'All' ? 'All Companies' : sector;
  const regionLabel = country === 'All' ? 'KSA and UAE' : country;

  return (
    <div className="flex items-center justify-between gap-4 w-full pt-1 pb-1 select-none">
      {/* Title + Muted Subtitle */}
      <div>
        <h1 className="text-[30px] font-light text-[#0B0B0B] tracking-tight leading-tight">
          {displayTitle}
        </h1>
        <p className="text-[13px] text-[#8A8A8A] font-normal mt-0.5">
          {totalCount} {totalCount === 1 ? 'company' : 'companies'} · {regionLabel}
        </p>
      </div>

      {/* Action Buttons: Secondary "Export CSV" + Primary "Add lead" with lime circle */}
      <div className="flex items-center gap-3">
        {/* Secondary Pill Button: Export CSV */}
        <button
          type="button"
          onClick={onExportCsv}
          className="h-10 px-4 rounded-full bg-white text-[#0B0B0B] border border-black/[0.06] shadow-sm text-[13px] font-medium flex items-center gap-2 hover:bg-white/80 active:scale-98 transition-all"
          title="Download filtered companies as CSV"
        >
          <Download size={15} strokeWidth={1.5} className="text-[#8A8A8A]" />
          <span>Export CSV</span>
        </button>

        {/* Primary Black Pill Button: Add lead with lime plus circle */}
        <button
          type="button"
          onClick={onAddLead}
          className="h-10 ps-4 pe-2 rounded-full bg-[#0B0B0B] text-white shadow-sm text-[13px] font-medium flex items-center gap-2.5 hover:bg-[#181818] active:scale-98 transition-all group"
        >
          <span>Add lead</span>
          <span className="w-6 h-6 rounded-full bg-[#D6F25C] text-black flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-105">
            <Plus size={14} strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </div>
  );
};

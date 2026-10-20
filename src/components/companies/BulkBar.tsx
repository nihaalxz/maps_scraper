import React from 'react';
import { CompanyStatus, SectorType, SECTORS, PIPELINE_STATUSES } from '@/data/types';
import { X, ArrowRight, FolderKanban, Download, Trash2 } from 'lucide-react';

interface BulkBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMoveStatus: (status: CompanyStatus) => void;
  onBulkChangeSector: (sector: SectorType) => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
}

export const BulkBar: React.FC<BulkBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkMoveStatus,
  onBulkChangeSector,
  onBulkExport,
  onBulkDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="absolute bottom-6 inset-x-0 mx-auto w-fit z-30 animate-in fade-in slide-in-from-bottom-4 duration-150 select-none">
      <div className="bg-[#0B0B0B] text-white rounded-full px-5 py-2.5 shadow-2xl border border-white/10 flex items-center gap-4 text-[13px]">
        {/* Count Badge + Clear */}
        <div className="flex items-center gap-2 pe-3 border-e border-white/10">
          <span className="w-5 h-5 rounded-full bg-[#D6F25C] text-black font-semibold text-[11px] flex items-center justify-center">
            {selectedCount}
          </span>
          <span className="font-normal text-white">selected</span>
          <button
            onClick={onClearSelection}
            className="text-[#8A8A8A] hover:text-white ms-1 p-0.5 rounded-full"
            title="Deselect all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Move to Status */}
        <div className="flex items-center gap-1.5">
          <ArrowRight size={13} className="text-[#8A8A8A]" />
          <span className="text-[12px] text-[#8A8A8A]">Move:</span>
          {PIPELINE_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => onBulkMoveStatus(status)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {status.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Reassign Sector Dropdown */}
        <div className="flex items-center gap-1.5 ps-2 border-s border-white/10">
          <FolderKanban size={13} className="text-[#8A8A8A]" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBulkChangeSector(e.target.value as SectorType);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-transparent text-[11px] text-[#D6F25C] font-medium outline-none cursor-pointer hover:underline"
          >
            <option value="" disabled className="bg-[#0B0B0B] text-white">
              Set sector...
            </option>
            {SECTORS.map((s) => (
              <option key={s} value={s} className="bg-[#0B0B0B] text-white">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Export Selected */}
        <button
          onClick={onBulkExport}
          className="p-1.5 text-[#8A8A8A] hover:text-white transition-colors"
          title="Export selected rows as CSV"
        >
          <Download size={14} />
        </button>

        {/* Delete Selected */}
        <button
          onClick={onBulkDelete}
          className="p-1.5 text-[#F0625D] hover:text-[#ff827e] transition-colors"
          title="Delete selected companies"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

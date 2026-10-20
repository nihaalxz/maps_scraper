import React from 'react';
import { CompanyStatus, PIPELINE_STATUSES, LeadStats } from '@/data/types';

interface StatusTabsProps {
  activeStatus: CompanyStatus;
  onSelectStatus: (status: CompanyStatus) => void;
  stats?: LeadStats;
}

export const StatusTabs: React.FC<StatusTabsProps> = ({
  activeStatus,
  onSelectStatus,
  stats,
}) => {
  const getCount = (status: CompanyStatus): number => {
    if (!stats) return 0;
    switch (status) {
      case 'New Customers':
        return stats.newCustomers;
      case 'Old Customers':
        return stats.oldCustomers;
      case 'Closed Customers':
        return stats.closedCustomers;
      default:
        return 0;
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Pipeline customer status"
      className="flex items-center gap-1.5 ps-1 select-none"
    >
      {PIPELINE_STATUSES.map((status) => {
        const isActive = activeStatus === status;
        const count = getCount(status);

        return (
          <button
            key={status}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelectStatus(status)}
            className={`px-4 py-2 text-[13px] rounded-full flex items-center gap-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
              isActive
                ? 'bg-white text-[#0B0B0B] font-medium shadow-xs'
                : 'bg-transparent text-[#8A8A8A] font-normal hover:text-[#0B0B0B] hover:bg-white/60'
            }`}
          >
            <span>{status}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full tabular-nums ${
                isActive
                  ? 'bg-black/[0.06] text-[#0B0B0B] font-semibold'
                  : 'bg-black/[0.04] text-[#8A8A8A]'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

import React from 'react';
import { KpiFilterType, LeadStats } from '@/data/types';

interface StatTilesProps {
  stats?: LeadStats;
  activeKpi: KpiFilterType;
  onSelectKpi: (kpi: KpiFilterType) => void;
  isLoading?: boolean;
}

export const StatTiles: React.FC<StatTilesProps> = ({
  stats,
  activeKpi,
  onSelectKpi,
  isLoading = false,
}) => {
  const tiles: Array<{
    id: KpiFilterType;
    label: string;
    value: number;
    color: string;
    borderColor: string;
  }> = [
    {
      id: 'all',
      label: 'All leads',
      value: stats?.total ?? 0,
      color: '#D6F25C',
      borderColor: 'border-[#D6F25C]/80',
    },
    {
      id: 'followup',
      label: 'Follow-ups',
      value: stats?.followUpNeeded ?? 0,
      color: '#F0625D',
      borderColor: 'border-[#F0625D]/80',
    },
    {
      id: 'hot',
      label: 'Hot leads',
      value: stats?.hotLeads ?? 0,
      color: '#7DD3EA',
      borderColor: 'border-[#7DD3EA]/80',
    },
    {
      id: 'missing_contact',
      label: 'No contacts',
      value: stats?.missingContacts ?? 0,
      color: '#A99BF2',
      borderColor: 'border-[#A99BF2]/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {tiles.map((tile) => {
        const isActive = activeKpi === tile.id;
        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onSelectKpi(isActive && tile.id !== 'all' ? 'all' : tile.id)}
            className={`flex flex-col justify-between p-2.5 rounded-[20px] bg-[#181818] border border-white/[0.06] text-start transition-all duration-150 group cursor-pointer relative h-[78px] ${
              isActive ? 'ring-2 ring-[#D6F25C] bg-[#222222]' : 'hover:bg-[#202020]'
            }`}
          >
            {/* Top Row: Outlined mini square + Label */}
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-[2.5px] border ${tile.borderColor} shrink-0 inline-block`}
                style={{ backgroundColor: isActive ? tile.color : 'transparent' }}
              />
              <span className="text-[11px] text-[#8A8A8A] font-normal whitespace-nowrap leading-tight group-hover:text-white transition-colors">
                {tile.label}
              </span>
            </div>

            {/* Bottom Row: Big Numeral with tabular nums */}
            <div className="self-end mt-auto">
              <span className="text-[26px] font-light text-white tracking-tight tabular-nums leading-none">
                {isLoading ? '–' : tile.value}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

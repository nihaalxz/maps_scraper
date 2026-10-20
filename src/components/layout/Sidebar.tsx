import React from 'react';
import { IconRail } from './IconRail';
import { StatTiles } from './StatTiles';
import { SectorList } from './SectorList';
import { KpiFilterType, LeadStats, SectorType } from '@/data/types';

import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  selectedSector: SectorType | 'All';
  onSelectSector: (sector: SectorType | 'All') => void;
  activeKpi: KpiFilterType;
  onSelectKpi: (kpi: KpiFilterType) => void;
  stats?: LeadStats;
  isLoadingStats?: boolean;
  activeView?: 'dashboard' | 'companies' | 'followups' | 'scraper' | 'settings';
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedSector,
  onSelectSector,
  activeKpi,
  onSelectKpi,
  stats,
  isLoadingStats,
  activeView = 'companies',
}) => {
  const navigate = useNavigate();
  const isCollapsed = activeView === 'scraper';

  return (
    <aside
      className={`h-full rounded-[28px] bg-[#0B0B0B] text-white flex shrink-0 overflow-hidden shadow-2xl border border-white/[0.04] select-none sidebar-shell ${
        isCollapsed ? 'w-16' : 'w-[300px]'
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* 64px Icon Rail */}
      <IconRail
        activeView={activeView}
        onSelectView={(view) => {
          if (view === 'scraper') {
            navigate('/scraper');
          } else if (view === 'companies' || view === 'dashboard') {
            navigate('/');
          }
        }}
      />

      {/* ~236px Sector & KPI Column with smooth slide & fade animation */}
      <div
        className={`w-[236px] bg-[#141414] px-3.5 pt-4 pb-3.5 flex flex-col shrink-0 h-full overflow-hidden sidebar-panel ${
          isCollapsed
            ? 'opacity-0 -translate-x-6 pointer-events-none'
            : 'opacity-100 translate-x-0'
        }`}
      >
        {/* 2x2 Metric Stat Tiles */}
        <StatTiles
          stats={stats}
          activeKpi={activeKpi}
          onSelectKpi={onSelectKpi}
          isLoading={isLoadingStats}
        />

        {/* Industry Sectors Stack */}
        <SectorList
          selectedSector={selectedSector}
          onSelectSector={onSelectSector}
          stats={stats}
        />
      </div>
    </aside>
  );
};

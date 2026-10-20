import React from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SectorType, KpiFilterType } from '@/data/types';
import { useStats } from '@/hooks/useCompanies';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isScraper = location.pathname.startsWith('/scraper');
  const selectedSector = (searchParams.get('sector') || 'All') as SectorType | 'All';
  const activeKpi = (searchParams.get('kpi') || 'all') as KpiFilterType;

  const { data: stats, isLoading: isLoadingStats } = useStats(selectedSector);

  const handleSelectSector = (sector: SectorType | 'All') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sector === 'All') next.delete('sector');
      else next.set('sector', sector);
      next.delete('page');
      return next;
    });
    if (isScraper) {
      navigate('/');
    }
  };

  const handleSelectKpi = (kpi: KpiFilterType) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (kpi === 'all') next.delete('kpi');
      else next.set('kpi', kpi);
      next.delete('page');
      return next;
    });
    if (isScraper) {
      navigate('/');
    }
  };

  return (
    <div className="h-screen w-screen p-3 box-border bg-[#E4E4E4] flex gap-3 overflow-hidden font-sans">
      {/* Persistent Sidebar: Remains continuously mounted across routes for smooth 60fps CSS transitions */}
      <Sidebar
        selectedSector={selectedSector}
        onSelectSector={handleSelectSector}
        activeKpi={activeKpi}
        onSelectKpi={handleSelectKpi}
        stats={stats}
        isLoadingStats={isLoadingStats}
        activeView={isScraper ? 'scraper' : 'companies'}
      />

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

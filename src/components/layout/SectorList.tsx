import React, { useState } from 'react';
import {
  SectorType,
  SECTORS,
  LeadStats,
} from '@/data/types';
import {
  Globe,
  Home,
  HardHat,
  Fuel,
  ShieldCheck,
  BedDouble,
  Sofa,
  ShoppingBag,
  UtensilsCrossed,
  Stethoscope,
  GraduationCap,
  Landmark,
  Ticket,
  Megaphone,
  Factory,
  Truck,
  Car,
  Cpu,
  Shapes,
  ChevronDown,
  LucideIcon,
} from 'lucide-react';

interface SectorListProps {
  selectedSector: SectorType | 'All';
  onSelectSector: (sector: SectorType | 'All') => void;
  stats?: LeadStats;
}

const SECTOR_ICON_MAP: Record<SectorType | 'All', LucideIcon> = {
  All: Globe,
  'Real Estate': Home,
  Construction: HardHat,
  'Fuel & Energy': Fuel,
  Safety: ShieldCheck,
  'Hotels & Hospitality': BedDouble,
  'Furniture & Interior': Sofa,
  'Retail & Shopping': ShoppingBag,
  'Food & Beverage': UtensilsCrossed,
  Healthcare: Stethoscope,
  Education: GraduationCap,
  Government: Landmark,
  'Events & Exhibitions': Ticket,
  'Advertising & Media': Megaphone,
  Manufacturing: Factory,
  'Logistics & Transport': Truck,
  Automotive: Car,
  'IT & Technology': Cpu,
  Others: Shapes,
};

export const SectorList: React.FC<SectorListProps> = ({
  selectedSector,
  onSelectSector,
  stats,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sectorCounts = stats?.sectorCounts;
  const totalCount = stats?.total ?? 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full mt-3.5 select-none">
      {/* Header with collapsible chevron */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between px-2 py-1.5 cursor-pointer text-[#8A8A8A] hover:text-white transition-colors group"
      >
        <span className="text-[11px] font-medium tracking-wider uppercase">
          Industry sectors
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isCollapsed ? '-rotate-90' : 'rotate-0'
          }`}
        />
      </div>

      {/* Sector Rows Stack */}
      {!isCollapsed && (
        <div className="flex flex-col gap-1.5 overflow-y-auto pe-1 mt-1.5 flex-1 scrollbar-thin">
          {/* "All sectors" row at the top */}
          <button
            type="button"
            onClick={() => onSelectSector('All')}
            className={`w-full flex items-center justify-between p-1.5 ps-2 pe-2 rounded-[20px] transition-all duration-150 text-start group ${
              selectedSector === 'All'
                ? 'bg-[#D6F25C] text-black font-medium shadow-sm'
                : 'bg-[#181818]/60 hover:bg-[#1C1C1C] text-[#D1D1D1] border border-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  selectedSector === 'All'
                    ? 'bg-black text-[#D6F25C]'
                    : 'bg-white/[0.08] text-[#8A8A8A] group-hover:text-white'
                }`}
              >
                <Globe size={16} strokeWidth={1.5} />
              </div>
              <span className="text-[12.5px] min-w-0 truncate font-normal leading-tight">
                All sectors
              </span>
            </div>

            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0 tabular-nums ms-1.5 ${
                selectedSector === 'All'
                  ? 'bg-[#E3F788] text-black font-semibold'
                  : 'bg-white/[0.06] text-[#8A8A8A]'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Individual Sector Rows */}
          {SECTORS.map((sector) => {
            const isSelected = selectedSector === sector;
            const IconComponent = SECTOR_ICON_MAP[sector] || Shapes;
            const count = sectorCounts ? sectorCounts[sector] ?? 0 : 0;

            return (
              <button
                key={sector}
                type="button"
                onClick={() => onSelectSector(sector)}
                className={`w-full flex items-center justify-between p-1.5 ps-2 pe-2 rounded-[20px] transition-all duration-150 text-start group ${
                  isSelected
                    ? 'bg-[#D6F25C] text-black font-medium shadow-sm'
                    : 'bg-[#181818]/60 hover:bg-[#1C1C1C] text-[#D1D1D1] border border-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-black text-[#D6F25C]'
                        : 'bg-white/[0.08] text-[#8A8A8A] group-hover:text-white'
                    }`}
                  >
                    <IconComponent size={16} strokeWidth={1.5} />
                  </div>
                  <span className="text-[12.5px] min-w-0 truncate font-normal leading-tight">
                    {sector}
                  </span>
                </div>

                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0 tabular-nums ms-1.5 ${
                    isSelected
                      ? 'bg-[#E3F788] text-black font-semibold'
                      : 'bg-white/[0.06] text-[#8A8A8A]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

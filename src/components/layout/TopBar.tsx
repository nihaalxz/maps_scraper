import React, { useEffect } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import { CountryCode } from '@/data/types';

interface TopBarProps {
  country: CountryCode | 'All';
  onSelectCountry: (country: CountryCode | 'All') => void;
  onOpenCommandPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  country,
  onSelectCountry,
  onOpenCommandPalette,
}) => {

  // Keyboard shortcut listener for "/" to focus search input and "Ctrl+K" / "Cmd+K" to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        onOpenCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <div className="flex items-center justify-between gap-4 w-full select-none">
      {/* Left: Global Search Pill */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="h-10 px-4 rounded-full bg-white border border-black/[0.06] shadow-sm flex items-center gap-2.5 text-start w-80 text-[#8A8A8A] hover:border-black/20 hover:text-[#0B0B0B] transition-all group cursor-pointer"
          aria-label="Search leads and contacts"
        >
          <Search size={16} strokeWidth={1.5} className="text-[#8A8A8A] group-hover:text-black transition-colors" />
          <span className="text-[13px] font-normal flex-1 truncate">
            Search companies, contacts...
          </span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#F3F3F3] text-[10px] font-medium text-[#8A8A8A] border border-black/[0.04]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Center/End: Country Switcher + Manager Chip */}
      <div className="flex items-center gap-3">
        {/* Country Switcher Pill */}
        <div className="h-10 bg-white rounded-full p-1 border border-black/[0.06] shadow-sm inline-flex items-center gap-1">
          {(['All', 'KSA', 'UAE'] as const).map((c) => {
            const isSelected = country === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onSelectCountry(c)}
                className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#0B0B0B] text-white shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#0B0B0B] hover:bg-black/[0.04]'
                }`}
              >
                {c === 'All' ? 'All regions' : c}
              </button>
            );
          })}
        </div>

        {/* Manager Chip (styled exactly like the reference top-right chip) */}
        <div className="h-10 bg-white rounded-full ps-1.5 pe-3 py-1 border border-black/[0.06] shadow-sm flex items-center gap-2.5 cursor-pointer hover:border-black/20 transition-colors">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
            alt="Laila Mansoor"
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <div className="flex flex-col text-start leading-tight">
            <span className="text-[10px] text-[#8A8A8A] font-normal">Manager</span>
            <span className="text-[12px] font-medium text-[#0B0B0B]">Laila M.</span>
          </div>
          <MoreHorizontal size={14} className="text-[#8A8A8A] ms-1" />
        </div>
      </div>
    </div>
  );
};

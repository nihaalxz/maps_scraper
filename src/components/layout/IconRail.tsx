import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  Import,
  Settings,
  Bell,
} from 'lucide-react';

interface IconRailProps {
  activeView: 'dashboard' | 'companies' | 'followups' | 'scraper' | 'settings';
  onSelectView: (view: 'dashboard' | 'companies' | 'followups' | 'scraper' | 'settings') => void;
  unreadCount?: number;
}

export const IconRail: React.FC<IconRailProps> = ({
  activeView,
  onSelectView,
  unreadCount = 2,
}) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies' as const, label: 'All companies', icon: Building2 },
    { id: 'followups' as const, label: 'Follow-ups', icon: CalendarClock },
    { id: 'scraper' as const, label: 'Google Maps Scraper & Import', icon: Import },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-16 bg-[#080808] flex flex-col items-center pt-4 pb-4 shrink-0 border-e border-white/[0.04] justify-between h-full select-none relative z-20">
      {/* Top Navigation Stack - starting at 16px from top */}
      <nav className="flex flex-col items-center gap-3 w-full px-2" aria-label="Main Navigation">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectView(id)}
              aria-label={label}
              className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F25C] ${
                isActive
                  ? 'bg-[#D6F25C] text-black shadow-sm font-semibold'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />

              {/* Tooltip on the end side of the rail */}
              <div
                role="tooltip"
                className="pointer-events-none absolute start-full ms-2.5 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-[8px] bg-[#0B0B0B] border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl opacity-0 scale-95 transition-all duration-150 delay-150 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100"
              >
                {label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Pinned Controls */}
      <div className="flex flex-col items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="group relative w-10 h-10 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F25C]"
        >
          <Bell size={20} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 end-2.5 w-2 h-2 rounded-full bg-[#D6F25C] ring-2 ring-[#080808]" />
          )}

          {/* Tooltip */}
          <div
            role="tooltip"
            className="pointer-events-none absolute start-full ms-2.5 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-[8px] bg-[#0B0B0B] border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl opacity-0 scale-95 transition-all duration-150 delay-150 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100"
          >
            Notifications
          </div>
        </button>

        {/* User Avatar */}
        <button
          type="button"
          aria-label="Profile"
          className="group relative w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6F25C]"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 p-0.5 cursor-pointer hover:ring-[#D6F25C] transition-colors">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Fahad Al-Harbi"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Tooltip */}
          <div
            role="tooltip"
            className="pointer-events-none absolute start-full ms-2.5 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-[8px] bg-[#0B0B0B] border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl opacity-0 scale-95 transition-all duration-150 delay-150 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100"
          >
            Profile
          </div>
        </button>
      </div>
    </div>
  );
};

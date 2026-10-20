import React from 'react';

export type ProfileTabType = 'details' | 'contacts' | 'notes' | 'activity';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onSelectTab: (tab: ProfileTabType) => void;
  contactsCount?: number;
  notesCount?: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onSelectTab,
  contactsCount = 0,
  notesCount = 0,
}) => {
  const tabs: Array<{
    id: ProfileTabType;
    label: string;
    chip?: string;
  }> = [
    { id: 'details', label: 'Details' },
    { id: 'contacts', label: 'Contacts', chip: `${contactsCount}/5` },
    { id: 'notes', label: 'Notes', chip: notesCount > 0 ? `${notesCount}` : undefined },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div
      role="tablist"
      aria-label="Company profile sections"
      className="flex items-center gap-1.5 px-6 py-2.5 bg-[#F3F3F3] border-b border-black/[0.06] select-none"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`px-3.5 py-1.5 text-[12px] rounded-full flex items-center gap-1.5 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
              isActive
                ? 'bg-white text-[#0B0B0B] font-medium border border-black/[0.06] shadow-xs'
                : 'bg-transparent text-[#8A8A8A] font-normal hover:text-[#0B0B0B] hover:bg-black/[0.04]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.chip !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                  isActive
                    ? 'bg-black/[0.06] text-[#0B0B0B] font-semibold'
                    : 'bg-black/[0.04] text-[#8A8A8A]'
                }`}
              >
                {tab.chip}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

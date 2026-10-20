import React, { useState, useEffect } from 'react';
import { Company, ContactPerson } from '@/data/types';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs, ProfileTabType } from './ProfileTabs';
import { DetailsTab } from './DetailsTab';
import { ContactsTab } from './ContactsTab';
import { NotesTab } from './NotesTab';
import { ActivityTab } from './ActivityTab';

interface CompanyPanelProps {
  company: Company | null;
  onClose: () => void;
  onPrevCompany?: () => void;
  onNextCompany?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onUpdateCompany: (updates: Partial<Company>) => void;
  onSaveContact: (contact: Omit<ContactPerson, 'id'> & { id?: string }) => void;
  onDeleteContact: (contactId: string) => void;
  onAddNote: (note: string) => void;
}

export const CompanyPanel: React.FC<CompanyPanelProps> = ({
  company,
  onClose,
  onPrevCompany,
  onNextCompany,
  hasPrev = false,
  hasNext = false,
  onUpdateCompany,
  onSaveContact,
  onDeleteContact,
  onAddNote,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('details');

  // Keyboard navigation: Esc to close, ArrowUp for previous, ArrowDown for next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept inside active input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onPrevCompany?.();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNextCompany?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevCompany, onNextCompany]);

  if (!company) return null;

  return (
    <aside
      className="w-[460px] h-full rounded-[28px] bg-white shadow-panel border border-black/[0.06] flex flex-col shrink-0 overflow-hidden z-40 animate-slide-in-end transition-all"
      aria-label={`Profile panel for ${company.name}`}
    >
      {/* 1. Header (Avatar, Title, Tags, Action Circles) */}
      <ProfileHeader
        company={company}
        onClose={onClose}
        onPrevCompany={onPrevCompany}
        onNextCompany={onNextCompany}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* 2. Folder Tabs Row */}
      <ProfileTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        contactsCount={company.contacts?.length || 0}
        notesCount={company.notes?.length || 0}
      />

      {/* 3. Soft Gray Content Container (#F3F3F3) */}
      <div className="flex-1 bg-[#F3F3F3] overflow-y-auto">
        {activeTab === 'details' && (
          <DetailsTab company={company} onUpdateCompany={onUpdateCompany} />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={company.contacts || []}
            onSaveContact={onSaveContact}
            onDeleteContact={onDeleteContact}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab notes={company.notes || []} onAddNote={onAddNote} />
        )}

        {activeTab === 'activity' && (
          <ActivityTab timeline={company.timeline || []} />
        )}
      </div>
    </aside>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Company } from '@/data/types';
import { Search, Building, User, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onSelectCompany: (companyId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  companies,
  onSelectCompany,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return {
        matchingCompanies: companies.slice(0, 5),
        matchingContacts: [],
      };
    }

    const q = query.toLowerCase().trim();

    const matchingCompanies = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );

    const matchingContacts: Array<{
      contactName: string;
      role: string;
      companyId: string;
      companyName: string;
    }> = [];

    companies.forEach((c) => {
      c.contacts?.forEach((ct) => {
        if (
          ct.name.toLowerCase().includes(q) ||
          ct.role.toLowerCase().includes(q) ||
          ct.email.toLowerCase().includes(q)
        ) {
          matchingContacts.push({
            contactName: ct.name,
            role: ct.role,
            companyId: c.id,
            companyName: c.name,
          });
        }
      });
    });

    return {
      matchingCompanies: matchingCompanies.slice(0, 6),
      matchingContacts: matchingContacts.slice(0, 6),
    };
  }, [companies, query]);

  const totalResults =
    searchResults.matchingCompanies.length + searchResults.matchingContacts.length;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (totalResults === 0 ? 0 : (prev + 1) % totalResults));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (totalResults === 0 ? 0 : (prev - 1 + totalResults) % totalResults));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalResults === 0) return;

      if (selectedIndex < searchResults.matchingCompanies.length) {
        const comp = searchResults.matchingCompanies[selectedIndex];
        onSelectCompany(comp.id);
        onClose();
      } else {
        const contactIdx = selectedIndex - searchResults.matchingCompanies.length;
        const contact = searchResults.matchingContacts[contactIdx];
        if (contact) {
          onSelectCompany(contact.companyId);
          onClose();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06]">
          <Search size={18} className="text-[#8A8A8A]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search companies, decision makers, sectors..."
            className="flex-1 text-[14px] text-[#0B0B0B] placeholder:text-[#8A8A8A] bg-transparent outline-none border-none"
          />
          <button
            onClick={onClose}
            className="text-[#8A8A8A] hover:text-[#0B0B0B] p-1 rounded-full"
            aria-label="Close command palette"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-3">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#8A8A8A]">
              No matching companies or contacts found for "{query}".
            </div>
          ) : (
            <>
              {/* Companies Section */}
              {searchResults.matchingCompanies.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-wider text-[#8A8A8A] uppercase px-3 py-1">
                    Companies
                  </span>
                  {searchResults.matchingCompanies.map((c, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCompany(c.id);
                          onClose();
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-[18px] text-start transition-colors ${
                          isSelected
                            ? 'bg-[#D6F25C] text-black font-medium'
                            : 'hover:bg-[#F3F3F3] text-[#0B0B0B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Building
                            size={16}
                            className={isSelected ? 'text-black' : 'text-[#8A8A8A]'}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] truncate">{c.name}</span>
                            <span
                              className={`text-[11px] truncate ${
                                isSelected ? 'text-black/70' : 'text-[#8A8A8A]'
                              }`}
                            >
                              {c.sector} · {c.city}, {c.country}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="opacity-40" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Contacts Section */}
              {searchResults.matchingContacts.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-wider text-[#8A8A8A] uppercase px-3 py-1">
                    Contacts
                  </span>
                  {searchResults.matchingContacts.map((ct, idx) => {
                    const activeIndex = searchResults.matchingCompanies.length + idx;
                    const isSelected = selectedIndex === activeIndex;
                    return (
                      <button
                        key={`${ct.companyId}_${idx}`}
                        type="button"
                        onClick={() => {
                          onSelectCompany(ct.companyId);
                          onClose();
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-[18px] text-start transition-colors ${
                          isSelected
                            ? 'bg-[#D6F25C] text-black font-medium'
                            : 'hover:bg-[#F3F3F3] text-[#0B0B0B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <User
                            size={16}
                            className={isSelected ? 'text-black' : 'text-[#8A8A8A]'}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] truncate">{ct.contactName}</span>
                            <span
                              className={`text-[11px] truncate ${
                                isSelected ? 'text-black/70' : 'text-[#8A8A8A]'
                              }`}
                            >
                              {ct.role} @ {ct.companyName}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="opacity-40" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-5 py-2.5 bg-[#F9F9F9] border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#8A8A8A]">
          <span>Navigate with ↑ ↓ · Press Enter to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};

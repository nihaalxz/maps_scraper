import React, { useState, useEffect } from 'react';
import { Company, SectorType, SECTORS } from '@/data/types';
import { calculateProfileCompleteness } from '@/lib/completeness';
import {
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { showToast } from '@/store/useToastStore';

interface DetailsTabProps {
  company: Company;
  onUpdateCompany: (updates: Partial<Company>) => void;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({
  company,
  onUpdateCompany,
}) => {
  // Local form state for inline-editable fields
  const [phone, setPhone] = useState(company.phone || '');
  const [address, setAddress] = useState(company.address || '');
  const [website, setWebsite] = useState(company.website || '');
  const [linkedIn, setLinkedIn] = useState(company.linkedIn || '');
  const [instagram, setInstagram] = useState(company.instagram || '');
  const [sector, setSector] = useState<SectorType>(company.sector);
  const [description, setDescription] = useState(company.description || '');

  // Follow-up card state
  const [followUpFlag, setFollowUpFlag] = useState(company.followUpFlag || false);
  const [followUpDate, setFollowUpDate] = useState(company.followUpDate || '');
  const [followUpNote, setFollowUpNote] = useState(company.followUpNote || '');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync when company changes
  useEffect(() => {
    setPhone(company.phone || '');
    setAddress(company.address || '');
    setWebsite(company.website || '');
    setLinkedIn(company.linkedIn || '');
    setInstagram(company.instagram || '');
    setSector(company.sector);
    setDescription(company.description || '');
    setFollowUpFlag(company.followUpFlag || false);
    setFollowUpDate(company.followUpDate || '');
    setFollowUpNote(company.followUpNote || '');
  }, [company]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard', text, 'info');
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleBlurField = (field: keyof Company, val: unknown) => {
    if (company[field] !== val) {
      onUpdateCompany({ [field]: val });
    }
  };

  const completeness = calculateProfileCompleteness(company);

  const handleSaveFollowUp = () => {
    onUpdateCompany({
      followUpFlag,
      followUpDate: followUpDate || undefined,
      followUpNote: followUpNote || undefined,
    });
  };

  const handleMarkDoneFollowUp = () => {
    setFollowUpFlag(false);
    onUpdateCompany({
      followUpFlag: false,
      followUpNote: `Completed on ${new Date().toLocaleDateString()}`,
    });
    showToast('Follow-up task completed', company.name, 'success');
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto select-none">
      {/* 1. LAVENDER CARD: Profile Completeness (styled like reference "Interested in..." card) */}
      <div className="rounded-[24px] bg-[#A99BF2] text-[#0B0B0B] p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[16px] font-medium leading-tight">
              Profile completeness
            </h3>
            <p className="text-[12px] opacity-80 mt-0.5">
              Data enrichment checklist
            </p>
          </div>
          <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center">
            <ArrowUpRight size={15} />
          </div>
        </div>

        {/* Big Light Percentage */}
        <div className="my-3">
          <span className="text-[34px] font-light tracking-tight tabular-nums">
            {completeness.score}%
          </span>
        </div>

        {/* Checklist of Dimensions */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-black/10">
          {completeness.items.map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-[12px]">
              {item.completed ? (
                <CheckCircle2 size={14} className="text-black shrink-0" />
              ) : (
                <XCircle size={14} className="text-black/40 shrink-0" />
              )}
              <span className={item.completed ? 'opacity-90 font-medium' : 'opacity-60'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. LIME CARD: Follow-up Task (styled like reference "Task" card) */}
      <div className="rounded-[24px] bg-[#D6F25C] text-[#0B0B0B] p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-medium">Follow-up task</span>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={followUpFlag}
              onChange={(e) => setFollowUpFlag(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-black after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black/80" />
          </label>
        </div>

        {/* Follow-up Note Text Field */}
        <div className="bg-white/80 rounded-[18px] p-3 flex flex-col gap-2">
          <input
            type="text"
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            placeholder="Next steps (e.g. Call CEO, Deliver deck)..."
            className="w-full bg-transparent border-none outline-none text-[12px] text-black font-medium placeholder:text-black/40"
          />

          <div className="flex items-center justify-between text-[11px] text-black/70 pt-1 border-t border-black/5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] text-black cursor-pointer"
              />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 font-medium">
              {followUpFlag ? 'Action Pending' : 'No Action'}
            </span>
          </div>
        </div>

        {/* Bottom Action Buttons: Save & Mark Done */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveFollowUp}
            className="flex-1 h-9 rounded-full bg-[#0B0B0B] text-white text-[12px] font-medium hover:bg-[#181818] transition-colors flex items-center justify-center gap-1.5"
          >
            <Send size={12} />
            <span>Save task</span>
          </button>
          <button
            type="button"
            onClick={handleMarkDoneFollowUp}
            disabled={!followUpFlag}
            className="px-4 h-9 rounded-full bg-white text-black text-[12px] font-medium hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            <Check size={13} />
            <span>Mark done</span>
          </button>
        </div>
      </div>

      {/* 3. WHITE CARD: Inline-Editable Corporate Profile Fields */}
      <div className="rounded-[24px] bg-white p-5 border border-black/[0.04] shadow-sm flex flex-col gap-4">
        <h4 className="text-[14px] font-medium text-[#0B0B0B]">Company details</h4>

        <div className="flex flex-col gap-3">
          {/* Sector Selector */}
          <div>
            <label className="text-[11px] text-[#8A8A8A] font-normal block mb-1">
              Industry Sector
            </label>
            <select
              value={sector}
              onChange={(e) => {
                const s = e.target.value as SectorType;
                setSector(s);
                handleBlurField('sector', s);
              }}
              className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] font-medium border-none outline-none focus:ring-1 focus:ring-black/20 cursor-pointer"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-[11px] text-[#8A8A8A] font-normal block mb-1">
              Primary Switchboard Phone
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => handleBlurField('phone', phone)}
                placeholder="+966 11 000 0000"
                className="flex-1 h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] border-none outline-none focus:ring-1 focus:ring-black/20"
              />
              <button
                type="button"
                onClick={() => handleCopy(phone, 'phone')}
                className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-black/10 flex items-center justify-center text-[#8A8A8A] hover:text-black transition-colors"
                title="Copy phone"
              >
                {copiedKey === 'phone' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Website Field */}
          <div>
            <label className="text-[11px] text-[#8A8A8A] font-normal block mb-1">
              Website URL
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onBlur={() => handleBlurField('website', website)}
                placeholder="https://company.com"
                className="flex-1 h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] border-none outline-none focus:ring-1 focus:ring-black/20"
              />
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-black/10 flex items-center justify-center text-[#8A8A8A] hover:text-black transition-colors"
                  title="Open website"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {/* LinkedIn Field */}
          <div>
            <label className="text-[11px] text-[#8A8A8A] font-normal block mb-1">
              LinkedIn Page URL
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                onBlur={() => handleBlurField('linkedIn', linkedIn)}
                placeholder="https://linkedin.com/company/..."
                className="flex-1 h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] border-none outline-none focus:ring-1 focus:ring-black/20"
              />
              {linkedIn && (
                <a
                  href={linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-black/10 flex items-center justify-center text-[#8A8A8A] hover:text-black transition-colors"
                  title="Open LinkedIn"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Instagram Field */}
          <div>
            <label className="text-[11px] text-[#8A8A8A] font-normal block mb-1">
              Instagram Profile URL
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                onBlur={() => handleBlurField('instagram', instagram)}
                placeholder="https://instagram.com/..."
                className="flex-1 h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] border-none outline-none focus:ring-1 focus:ring-black/20"
              />
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-black/10 flex items-center justify-center text-[#8A8A8A] hover:text-black transition-colors"
                  title="Open Instagram"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Address Field */}
          <div>
            <label className="text-[11px] text-[#8A8A8A] font-normal block mb-1">
              Headquarters Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => handleBlurField('address', address)}
              placeholder="Building, street, district, city..."
              className="w-full p-2.5 rounded-[16px] bg-[#F3F3F3] text-[12px] text-[#0B0B0B] border-none outline-none focus:ring-1 focus:ring-black/20 resize-none"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="text-[11px] text-[#8A8A8A] font-normal block mb-1">
              Commercial Description & Lead Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleBlurField('description', description)}
              placeholder="Summary of business activities and strategic value..."
              className="w-full p-2.5 rounded-[16px] bg-[#F3F3F3] text-[12px] text-[#0B0B0B] border-none outline-none focus:ring-1 focus:ring-black/20 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Company } from '@/data/types';
import {
  X,
  Phone,
  Globe,
  Mail,
  Linkedin,
  Instagram,
  MessageCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface ProfileHeaderProps {
  company: Company;
  onClose: () => void;
  onPrevCompany?: () => void;
  onNextCompany?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  company,
  onClose,
  onPrevCompany,
  onNextCompany,
  hasPrev = false,
  hasNext = false,
}) => {
  const primaryContact = company.contacts?.[0];

  // Quick Action circle configs
  const hasPhone = Boolean(company.phone);
  const hasEmail = Boolean(primaryContact?.email);
  const hasWebsite = Boolean(company.website);
  const hasLinkedIn = Boolean(company.linkedIn);
  const hasInstagram = Boolean(company.instagram);

  const cleanPhone = company.phone ? company.phone.replace(/[^0-9+]/g, '') : '';

  return (
    <div className="p-6 pb-4 bg-white select-none">
      {/* Top navigation controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Prev / Next buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={onPrevCompany}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F3F3F3] text-[#0B0B0B] hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-[#F3F3F3] transition-colors"
            title="Previous lead (Up arrow)"
            aria-label="Previous lead"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={onNextCompany}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[#F3F3F3] text-[#0B0B0B] hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-[#F3F3F3] transition-colors"
            title="Next lead (Down arrow)"
            aria-label="Next lead"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F3F3F3] text-[#8A8A8A] hover:text-[#0B0B0B] hover:bg-black/10 transition-colors"
          title="Close panel (Esc)"
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Header Info: 56px Avatar + Name + Subtitle */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-[#FFE5D9] text-[#9A3412] flex items-center justify-center text-lg font-medium shrink-0 shadow-sm">
          {company.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[24px] font-light text-[#0B0B0B] tracking-tight truncate leading-tight">
              {company.name}
            </h2>
          </div>

          <p className="text-[12px] text-[#8A8A8A] mt-0.5 truncate">
            {company.companyType} · {company.city}, {company.country}
          </p>

          {/* Conjoined Tag Pair (Temperature + Status) matching reference */}
          <div className="mt-2.5 inline-flex items-center rounded-full p-0.5 bg-black/[0.04] border border-black/[0.04]">
            {/* Temperature Tag */}
            <span
              className={`px-3 py-0.5 rounded-full text-[11px] font-medium ${
                company.temperature === 'hot'
                  ? 'bg-[#F0625D] text-white'
                  : company.temperature === 'warm'
                  ? 'bg-[#D6F25C] text-black'
                  : 'bg-[#7DD3EA] text-black'
              }`}
            >
              {company.temperature.charAt(0).toUpperCase() + company.temperature.slice(1)}
            </span>

            {/* Pipeline Status Tag */}
            <span className="px-3 py-0.5 rounded-full text-[11px] font-normal text-[#0B0B0B]">
              {company.status}
            </span>
          </div>
        </div>
      </div>

      {/* 40px Lime Circular Quick Action Buttons (matching reference style) */}
      <div className="flex items-center gap-2.5 mt-5 pt-3 border-t border-black/[0.04]">
        {/* Call */}
        <a
          href={hasPhone ? `tel:${cleanPhone}` : undefined}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            hasPhone
              ? 'bg-[#D6F25C] text-black hover:scale-105 active:scale-95 shadow-sm'
              : 'bg-[#F3F3F3] text-[#B0B0B0] cursor-not-allowed'
          }`}
          title={hasPhone ? `Call ${company.phone}` : 'No phone number available'}
          aria-label="Call company"
        >
          <Phone size={17} strokeWidth={1.75} />
        </a>

        {/* WhatsApp */}
        <a
          href={hasPhone ? `https://wa.me/${cleanPhone.replace('+', '')}` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            hasPhone
              ? 'bg-[#D6F25C] text-black hover:scale-105 active:scale-95 shadow-sm'
              : 'bg-[#F3F3F3] text-[#B0B0B0] cursor-not-allowed'
          }`}
          title={hasPhone ? 'Chat on WhatsApp' : 'No phone available for WhatsApp'}
          aria-label="WhatsApp"
        >
          <MessageCircle size={17} strokeWidth={1.75} />
        </a>

        {/* Email */}
        <a
          href={hasEmail ? `mailto:${primaryContact?.email}` : undefined}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            hasEmail
              ? 'bg-[#D6F25C] text-black hover:scale-105 active:scale-95 shadow-sm'
              : 'bg-[#F3F3F3] text-[#B0B0B0] cursor-not-allowed'
          }`}
          title={hasEmail ? `Email ${primaryContact?.email}` : 'No primary email available'}
          aria-label="Send email"
        >
          <Mail size={17} strokeWidth={1.75} />
        </a>

        {/* Website */}
        <a
          href={hasWebsite ? company.website : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            hasWebsite
              ? 'bg-[#D6F25C] text-black hover:scale-105 active:scale-95 shadow-sm'
              : 'bg-[#F3F3F3] text-[#B0B0B0] cursor-not-allowed'
          }`}
          title={hasWebsite ? `Visit ${company.website}` : 'No website listed'}
          aria-label="Visit website"
        >
          <Globe size={17} strokeWidth={1.75} />
        </a>

        {/* LinkedIn */}
        <a
          href={hasLinkedIn ? company.linkedIn : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            hasLinkedIn
              ? 'bg-[#D6F25C] text-black hover:scale-105 active:scale-95 shadow-sm'
              : 'bg-[#F3F3F3] text-[#B0B0B0] cursor-not-allowed'
          }`}
          title={hasLinkedIn ? `LinkedIn Profile` : 'No LinkedIn available'}
          aria-label="Visit LinkedIn"
        >
          <Linkedin size={17} strokeWidth={1.75} />
        </a>

        {/* Instagram */}
        <a
          href={hasInstagram ? company.instagram : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            hasInstagram
              ? 'bg-[#D6F25C] text-black hover:scale-105 active:scale-95 shadow-sm'
              : 'bg-[#F3F3F3] text-[#B0B0B0] cursor-not-allowed'
          }`}
          title={hasInstagram ? `Instagram Profile` : 'No Instagram available'}
          aria-label="Visit Instagram"
        >
          <Instagram size={17} strokeWidth={1.75} />
        </a>
      </div>
    </div>
  );
};

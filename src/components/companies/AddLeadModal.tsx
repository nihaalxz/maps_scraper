import React, { useState } from 'react';
import {
  CompanyStatus,
  CountryCode,
  LeadTemperature,
  PIPELINE_STATUSES,
  SectorType,
  SECTORS,
} from '@/data/types';
import { X, Building, Check } from 'lucide-react';
import { showToast } from '@/store/useToastStore';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    sector: SectorType;
    companyType: string;
    status: CompanyStatus;
    temperature: LeadTemperature;
    country: CountryCode;
    city: string;
    address: string;
    phone: string;
    website: string;
    description: string;
    followUpFlag: boolean;
    primaryContactName?: string;
    primaryContactRole?: string;
    primaryContactEmail?: string;
  }) => void;
  defaultSector?: SectorType | 'All';
  defaultStatus?: CompanyStatus;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultSector = 'All',
  defaultStatus = 'New Customers',
}) => {
  const [name, setName] = useState('');
  const [sector, setSector] = useState<SectorType>(
    defaultSector !== 'All' ? defaultSector : 'Real Estate'
  );
  const [companyType, setCompanyType] = useState('Enterprise');
  const [status, setStatus] = useState<CompanyStatus>(defaultStatus);
  const [temperature, setTemperature] = useState<LeadTemperature>('hot');
  const [country, setCountry] = useState<CountryCode>('KSA');
  const [city, setCity] = useState('Riyadh');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [followUpFlag, setFollowUpFlag] = useState(false);

  // Primary Contact
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Validation Error', 'Company name is required', 'error');
      return;
    }

    onSubmit({
      name: name.trim(),
      sector,
      companyType,
      status,
      temperature,
      country,
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      website: website.trim(),
      description: description.trim(),
      followUpFlag,
      primaryContactName: contactName.trim() || undefined,
      primaryContactRole: contactRole.trim() || undefined,
      primaryContactEmail: contactEmail.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D6F25C] text-black flex items-center justify-center">
              <Building size={16} />
            </div>
            <h3 className="text-[16px] font-medium text-[#0B0B0B]">Add New Lead</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-black hover:bg-black/5"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Company Name */}
          <div>
            <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Roshn Group, ADNOC..."
              className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[13px] text-[#0B0B0B] border-none outline-none focus:ring-1 focus:ring-black/20"
            />
          </div>

          {/* Sector & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                Sector *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as SectorType)}
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none cursor-pointer"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                Company Type
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none cursor-pointer"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="Enterprise Public">Enterprise Public</option>
                <option value="Semi-Government PIF">Semi-Government PIF</option>
                <option value="Government Authority">Government Authority</option>
                <option value="Conglomerate">Conglomerate</option>
                <option value="Fintech Unicorn">Fintech Unicorn</option>
                <option value="SME">SME</option>
              </select>
            </div>
          </div>

          {/* Pipeline Status & Temperature */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CompanyStatus)}
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none cursor-pointer"
              >
                {PIPELINE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                Temperature
              </label>
              <select
                value={temperature}
                onChange={(e) => setTemperature(e.target.value as LeadTemperature)}
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none cursor-pointer"
              >
                <option value="hot">Hot (High Priority)</option>
                <option value="warm">Warm (Engaged)</option>
                <option value="cold">Cold (Low Urgency)</option>
              </select>
            </div>
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => {
                  const c = e.target.value as CountryCode;
                  setCountry(c);
                  setCity(c === 'KSA' ? 'Riyadh' : 'Dubai');
                }}
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none cursor-pointer"
              >
                <option value="KSA">KSA (Saudi Arabia)</option>
                <option value="UAE">UAE (Emirates)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City name"
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none focus:ring-1 focus:ring-black/20"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
              Office Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building, street, district..."
              className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none focus:ring-1 focus:ring-black/20"
            />
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 / +971..."
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none focus:ring-1 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full h-9 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none focus:ring-1 focus:ring-black/20"
              />
            </div>
          </div>

          {/* Primary Contact Preview */}
          <div className="p-3 bg-[#F9F9F9] rounded-[20px] flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#0B0B0B]">
              Primary Contact (Optional)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name"
                className="h-8 px-3 rounded-full bg-white text-[12px] outline-none border border-black/[0.04]"
              />
              <input
                type="text"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="Role / Title"
                className="h-8 px-3 rounded-full bg-white text-[12px] outline-none border border-black/[0.04]"
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Email"
                className="h-8 px-3 rounded-full bg-white text-[12px] outline-none border border-black/[0.04]"
              />
            </div>
          </div>

          {/* Follow-up Checkbox */}
          <div className="flex items-center gap-2 ps-1">
            <input
              type="checkbox"
              id="followUpCheckbox"
              checked={followUpFlag}
              onChange={(e) => setFollowUpFlag(e.target.checked)}
              className="w-4 h-4 rounded text-black accent-[#0B0B0B] cursor-pointer"
            />
            <label htmlFor="followUpCheckbox" className="text-[12px] text-[#0B0B0B] cursor-pointer">
              Schedule urgent follow-up task for this lead
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-medium text-[#8A8A8A] block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief commercial notes..."
              className="w-full p-2.5 rounded-[16px] bg-[#F3F3F3] text-[12px] text-[#0B0B0B] outline-none resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.04]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-full text-[12px] text-[#8A8A8A] hover:bg-[#F3F3F3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-9 rounded-full bg-[#0B0B0B] text-white hover:bg-[#181818] text-[12px] font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Check size={14} />
              <span>Create Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

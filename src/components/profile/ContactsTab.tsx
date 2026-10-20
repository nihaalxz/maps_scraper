import React, { useState } from 'react';
import { ContactPerson } from '@/data/types';
import {
  Plus,
  Phone,
  Mail,
  Linkedin,
  MessageCircle,
  Pencil,
  Trash2,
  Check,
  X,
  User,
} from 'lucide-react';
import { showToast } from '@/store/useToastStore';

interface ContactsTabProps {
  contacts: ContactPerson[];
  onSaveContact: (contact: Omit<ContactPerson, 'id'> & { id?: string }) => void;
  onDeleteContact: (contactId: string) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts = [],
  onSaveContact,
  onDeleteContact,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLinkedIn, setFormLinkedIn] = useState('');

  const isAtLimit = contacts.length >= 5;

  const handleStartAdd = () => {
    if (isAtLimit) {
      showToast('Contact limit reached', 'Maximum 5 contacts allowed per company', 'warning');
      return;
    }
    setEditingId(null);
    setFormName('');
    setFormRole('');
    setFormPhone('');
    setFormEmail('');
    setFormLinkedIn('');
    setIsAdding(true);
  };

  const handleStartEdit = (contact: ContactPerson) => {
    setIsAdding(false);
    setEditingId(contact.id);
    setFormName(contact.name);
    setFormRole(contact.role);
    setFormPhone(contact.phone);
    setFormEmail(contact.email);
    setFormLinkedIn(contact.linkedIn || '');
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim()) {
      showToast('Validation Error', 'Name and Job Role are required', 'error');
      return;
    }

    onSaveContact({
      id: editingId || undefined,
      name: formName.trim(),
      role: formRole.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      linkedIn: formLinkedIn.trim() || undefined,
    });

    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto select-none">
      {/* Header with counter and Add Contact Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#0B0B0B]">
            Decision makers
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tabular-nums ${
              isAtLimit
                ? 'bg-[#F0625D]/10 text-[#F0625D]'
                : 'bg-black/5 text-[#8A8A8A]'
            }`}
          >
            {contacts.length} / 5
          </span>
        </div>

        {/* Add Contact Button */}
        <button
          type="button"
          disabled={isAtLimit}
          onClick={handleStartAdd}
          title={isAtLimit ? 'Maximum 5 contacts reached' : 'Add marketing contact'}
          className="h-8 px-3 rounded-full bg-[#D6F25C] text-black font-medium text-[12px] flex items-center gap-1.5 hover:bg-[#C8E548] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={14} strokeWidth={2} />
          <span>Add contact</span>
        </button>
      </div>

      {/* Inline Form (Add or Edit) */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmitForm}
          className="rounded-[20px] bg-white p-4 border-2 border-[#D6F25C] shadow-sm flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#0B0B0B]">
              {isAdding ? 'New Contact' : 'Edit Contact'}
            </span>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-[#8A8A8A] hover:text-black p-1"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Full name *"
              required
              className="h-8 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-black outline-none focus:ring-1 focus:ring-black/20"
            />
            <input
              type="text"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              placeholder="Job title / Role *"
              required
              className="h-8 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-black outline-none focus:ring-1 focus:ring-black/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="Direct phone"
              className="h-8 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-black outline-none focus:ring-1 focus:ring-black/20"
            />
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="Direct email"
              className="h-8 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-black outline-none focus:ring-1 focus:ring-black/20"
            />
          </div>

          <input
            type="url"
            value={formLinkedIn}
            onChange={(e) => setFormLinkedIn(e.target.value)}
            placeholder="LinkedIn profile URL"
            className="h-8 px-3 rounded-full bg-[#F3F3F3] text-[12px] text-black outline-none focus:ring-1 focus:ring-black/20"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-3 h-7 rounded-full text-[11px] font-medium text-[#8A8A8A] hover:bg-[#F3F3F3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 h-7 rounded-full text-[11px] font-medium bg-[#0B0B0B] text-white hover:bg-[#181818] flex items-center gap-1"
            >
              <Check size={12} />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      {/* Contact Cards List */}
      <div className="flex flex-col gap-2.5">
        {contacts.length === 0 ? (
          <div className="rounded-[20px] bg-white p-8 text-center border border-black/[0.04]">
            <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#8A8A8A] mx-auto mb-2">
              <User size={18} />
            </div>
            <p className="text-[13px] font-medium text-[#0B0B0B]">No marketing contacts</p>
            <p className="text-[11px] text-[#8A8A8A] mt-0.5">
              Add key decision-makers (up to 5) to nurture this account.
            </p>
          </div>
        ) : (
          contacts.map((contact) => {
            const cleanPhone = contact.phone ? contact.phone.replace(/[^0-9+]/g, '') : '';
            return (
              <div
                key={contact.id}
                className="rounded-[20px] bg-white p-4 border border-black/[0.04] shadow-sm flex flex-col gap-3 group hover:border-black/10 transition-colors"
              >
                {/* Top Row: Avatar + Name + Role + Edit/Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#F3F3F3] text-[#0B0B0B] font-semibold flex items-center justify-center text-[12px] shrink-0">
                      {contact.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-[13px] text-[#0B0B0B] truncate">
                        {contact.name}
                      </span>
                      <span className="text-[11px] text-[#8A8A8A] truncate">
                        {contact.role}
                      </span>
                    </div>
                  </div>

                  {/* Edit & Delete Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(contact)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-[#0B0B0B] hover:bg-[#F3F3F3] transition-colors"
                      title="Edit contact"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteContact(contact.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-[#F0625D] hover:bg-[#F0625D]/10 transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="flex flex-col gap-1 text-[11px] text-[#8A8A8A] pt-1 border-t border-black/[0.03]">
                  {contact.phone && (
                    <span className="truncate">Tel: {contact.phone}</span>
                  )}
                  {contact.email && (
                    <span className="truncate">Email: {contact.email}</span>
                  )}
                </div>

                {/* Quick Action Circles: Call, Email, WhatsApp, LinkedIn */}
                <div className="flex items-center gap-2 pt-1">
                  {contact.phone && (
                    <a
                      href={`tel:${cleanPhone}`}
                      className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-[#D6F25C] text-black flex items-center justify-center transition-colors"
                      title={`Call ${contact.phone}`}
                    >
                      <Phone size={13} />
                    </a>
                  )}

                  {contact.phone && (
                    <a
                      href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-[#D6F25C] text-black flex items-center justify-center transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={13} />
                    </a>
                  )}

                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-[#D6F25C] text-black flex items-center justify-center transition-colors"
                      title={`Email ${contact.email}`}
                    >
                      <Mail size={13} />
                    </a>
                  )}

                  {contact.linkedIn && (
                    <a
                      href={contact.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-[#D6F25C] text-black flex items-center justify-center transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin size={13} />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';

interface NotesTabProps {
  notes: string[];
  onAddNote: (note: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes = [],
  onAddNote,
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddNote(content.trim());
    setContent('');
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto select-none">
      {/* Note Composer (white pill textarea with lime send circle) */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] bg-white p-3.5 border border-black/[0.06] shadow-sm flex items-center gap-2"
      >
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add an internal note or meeting minutes..."
          className="flex-1 bg-transparent border-none outline-none text-[12px] text-[#0B0B0B] placeholder:text-[#8A8A8A] resize-none px-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <button
          type="submit"
          disabled={!content.trim()}
          className="w-9 h-9 rounded-full bg-[#D6F25C] text-black hover:bg-[#C8E548] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
          title="Send note"
          aria-label="Add note"
        >
          <Send size={14} className="ms-0.5" />
        </button>
      </form>

      {/* Notes List */}
      <div className="flex flex-col gap-2.5">
        {notes.length === 0 ? (
          <div className="rounded-[20px] bg-white p-8 text-center border border-black/[0.04]">
            <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#8A8A8A] mx-auto mb-2">
              <FileText size={18} />
            </div>
            <p className="text-[13px] font-medium text-[#0B0B0B]">No notes logged yet</p>
            <p className="text-[11px] text-[#8A8A8A] mt-0.5">
              Record customer insights, negotiation highlights, or commercial requirements.
            </p>
          </div>
        ) : (
          notes.map((note, index) => (
            <div
              key={index}
              className="rounded-[20px] bg-white p-4 border border-black/[0.04] shadow-sm flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-[#8A8A8A]">
                <span className="font-medium text-[#0B0B0B]">Sales Note</span>
                <span>Touchpoint #{notes.length - index}</span>
              </div>
              <p className="text-[12px] text-[#0B0B0B] leading-relaxed whitespace-pre-wrap">
                {note}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { TimelineActivity, TimelineEventType } from '@/data/types';
import {
  GitCommit,
  UserPlus,
  StickyNote,
  Clock,
  ArrowRightLeft,
  CheckCircle,
} from 'lucide-react';

interface ActivityTabProps {
  timeline: TimelineActivity[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  timeline = [],
}) => {
  const getNodeConfig = (type: TimelineEventType) => {
    switch (type) {
      case 'status_change':
        return {
          icon: ArrowRightLeft,
          bg: 'bg-[#7DD3EA]', // Sky blue
          text: 'text-black',
          badge: 'Status change',
        };
      case 'contact_added':
      case 'contact_updated':
      case 'contact_deleted':
        return {
          icon: UserPlus,
          bg: 'bg-[#D6F25C]', // Lime
          text: 'text-black',
          badge: 'Contact',
        };
      case 'note_added':
        return {
          icon: StickyNote,
          bg: 'bg-[#A99BF2]', // Lavender
          text: 'text-black',
          badge: 'Note',
        };
      case 'followup_updated':
        return {
          icon: Clock,
          bg: 'bg-[#FFE5D9]', // Coral tint
          text: 'text-[#9A3412]',
          badge: 'Task',
        };
      default:
        return {
          icon: GitCommit,
          bg: 'bg-[#F3F3F3]',
          text: 'text-black',
          badge: 'System',
        };
    }
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto select-none">
      {timeline.length === 0 ? (
        <div className="rounded-[20px] bg-white p-8 text-center border border-black/[0.04]">
          <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#8A8A8A] mx-auto mb-2">
            <CheckCircle size={18} />
          </div>
          <p className="text-[13px] font-medium text-[#0B0B0B]">No activity logged</p>
          <p className="text-[11px] text-[#8A8A8A] mt-0.5">
            Transitions and interactions will automatically be tracked here.
          </p>
        </div>
      ) : (
        <div className="relative ps-6 py-2">
          {/* Vertical Timeline Guide Line */}
          <div className="absolute inset-y-4 start-3 w-px bg-black/[0.08]" />

          <div className="flex flex-col gap-6">
            {timeline.map((event) => {
              const config = getNodeConfig(event.type);
              const IconComponent = config.icon;

              return (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* 36px Circular Icon Node */}
                  <div
                    className={`absolute -start-6 w-9 h-9 rounded-full ${config.bg} ${config.text} flex items-center justify-center shrink-0 shadow-sm ring-4 ring-[#F3F3F3]`}
                  >
                    <IconComponent size={15} strokeWidth={1.8} />
                  </div>

                  {/* Event Card (matching reference style) */}
                  <div className="flex-1 ms-6 rounded-[20px] bg-white p-4 border border-black/[0.04] shadow-sm flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-normal text-[#8A8A8A]">
                        {formatDate(event.timestamp)} · {event.author}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-[#0B0B0B] font-medium shrink-0">
                        {config.badge}
                      </span>
                    </div>

                    <p className="text-[12px] font-medium text-[#0B0B0B] leading-snug">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

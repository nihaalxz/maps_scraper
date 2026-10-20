import React from 'react';
import {
  CheckCircle2,
  Layers,
  Database,
  Building2,
  Workflow,
  Sparkles,
} from 'lucide-react';

export const PlaceholderPage: React.FC = () => {
  const toolchainItems = [
    { label: 'React 18 & TypeScript (Strict)', icon: Layers },
    { label: 'Tailwind CSS & shadcn/ui Base', icon: Sparkles },
    { label: 'TanStack Query & TanStack Table', icon: Database },
    { label: 'Zustand State Management', icon: Workflow },
    { label: 'Repository Interface & Mock Architecture', icon: Building2 },
    { label: 'Vitest & React Testing Library', icon: CheckCircle2 },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 selection:bg-primary/20">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
          Arab Season Leads - setup complete
        </h1>
        <p className="text-slate-600 text-base max-w-lg mx-auto mb-8">
          The development foundation, project documentation, strict TypeScript
          toolchain, and repository contract are fully configured and verified.
        </p>

        <div className="grid grid-cols-2 gap-3 text-left mb-8">
          {toolchainItems.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
            >
              <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Project Root: LEAD EXTRACTOR</span>
          <span>Target: Desktop-first (min 1100px) • RTL-Ready</span>
          <span>Dev Server: Port 5173</span>
        </div>
      </div>
    </main>
  );
};

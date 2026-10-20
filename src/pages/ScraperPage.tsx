import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Upload,
  Building2,
  MapPin,
  Phone,
  Globe,
  Star,
  Download,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { SECTORS, CompanyStatus, PIPELINE_STATUSES } from '@/data/types';
import { companyRepository } from '@/data/repository';
import { ScrapedLead } from '@/data/apiRepository';
import { useCompanies } from '@/hooks/useCompanies';
import { showToast } from '@/store/useToastStore';

export const ScraperPage: React.FC = () => {
  const navigate = useNavigate();

  // App queries for command palette
  const { data: allCompanies = [] } = useCompanies({});

  // Mode: Live Scraper vs File Import
  const [activeTab, setActiveTab] = useState<'live' | 'file'>('live');

  // Search parameters (Pure natural language search)
  const [query, setQuery] = useState('Real estate companies in Tokyo');
  const [limit, setLimit] = useState(20);
  const [selectedSector, setSelectedSector] = useState<string>('Auto-detect');

  // Scraping state
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [targetStatus, setTargetStatus] = useState<CompanyStatus>('New Customers');
  const [isImporting, setIsImporting] = useState(false);

  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Filter within results
  const [tableSearch, setTableSearch] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sample quick searches in natural language
  const sampleSearches = [
    'Real estate companies in Tokyo',
    'IT companies in Gurugram',
    'Restaurants in Musaffah',
    'Hotels & Resorts in Dubai',
    'Construction Contracting in Riyadh',
    'Tech Startups in London',
    'Coffee shops in Paris',
    'Logistics companies in Singapore',
  ];

  const handleStartScrape = async () => {
    if (!query.trim()) {
      showToast('Validation Error', 'Search query cannot be empty', 'error');
      return;
    }

    setIsScraping(true);
    try {
      const res = await companyRepository.scrapeGoogleMaps({
        query: query.trim(),
        limit,
        sector: selectedSector === 'Auto-detect' ? undefined : selectedSector,
      });

      setScrapedLeads(res.leads);
      setSelectedIndices(res.leads.map((_, idx) => idx));
      showToast('Scraping Complete', `Extracted ${res.count} leads with auto-assigned sectors`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Scraping failed';
      showToast('Scraping Failed', msg, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFileName(file.name);
    setIsScraping(true);
    try {
      const res = await companyRepository.uploadScraperFile(file);
      setScrapedLeads(res.leads);
      setSelectedIndices(res.leads.map((_, idx) => idx));
      showToast('File Imported', `Parsed ${res.count} business leads from ${file.name}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file';
      showToast('Upload Error', msg, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImportToPipeline = async () => {
    if (selectedIndices.length === 0) {
      showToast('Selection Required', 'Select at least one lead to import', 'info');
      return;
    }

    const leadsToImport = selectedIndices.map((idx) => scrapedLeads[idx]);
    setIsImporting(true);
    try {
      const res = await companyRepository.importScrapedLeads(leadsToImport, targetStatus);
      showToast(
        'Pipeline Updated',
        `Successfully imported ${res.importedCount} accounts to ${targetStatus}!`,
        'success'
      );
      // Remove imported items from current preview
      const remaining = scrapedLeads.filter((_, idx) => !selectedIndices.includes(idx));
      setScrapedLeads(remaining);
      setSelectedIndices([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      showToast('Import Error', msg, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCsv = () => {
    if (scrapedLeads.length === 0) return;
    const items = selectedIndices.length > 0 ? selectedIndices.map((i) => scrapedLeads[i]) : scrapedLeads;

    const headers = ['Name', 'Sector', 'Category', 'City', 'Country', 'Phone', 'Website', 'Address', 'Rating', 'Reviews'];
    const rows = items.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.sector}"`,
      `"${l.category || ''}"`,
      `"${l.city}"`,
      `"${l.country}"`,
      `"${l.phone || ''}"`,
      `"${l.website || ''}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      l.rating || 0,
      l.reviews_count || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google_maps_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Ready', `Downloaded ${items.length} leads as CSV`, 'success');
  };

  const filteredLeads = useMemo(() => {
    if (!tableSearch.trim()) return scrapedLeads;
    const s = tableSearch.toLowerCase();
    return scrapedLeads.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        (l.sector && l.sector.toLowerCase().includes(s)) ||
        l.city.toLowerCase().includes(s) ||
        (l.country && l.country.toLowerCase().includes(s)) ||
        (l.phone && l.phone.includes(s)) ||
        (l.category && l.category.toLowerCase().includes(s))
    );
  }, [scrapedLeads, tableSearch]);

  const toggleSelectAll = () => {
    if (selectedIndices.length === scrapedLeads.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(scrapedLeads.map((_, idx) => idx));
    }
  };

  const toggleSelectRow = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleUpdateLeadSector = (index: number, newSector: string) => {
    setScrapedLeads((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], sector: newSector };
      return next;
    });
  };

  return (
    <>
      {/* MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden gap-3 relative">
        {/* Top Row: Global Search / Command Palette + Country Switcher + Manager Chip */}
        <TopBar
          country="All"
          onSelectCountry={() => {}}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Title Block matching the Dashboard language */}
        <div className="flex items-center justify-between gap-4 w-full pt-1 pb-1 select-none">
          <div>
            <h1 className="text-[30px] font-light text-[#0B0B0B] tracking-tight leading-tight flex items-center gap-3">
              <span>Lead Scraper & Importer</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#D6F25C] text-black">
                Google Maps Engine
              </span>
            </h1>
            <p className="text-[13px] text-[#8A8A8A] font-normal mt-0.5">
              {scrapedLeads.length > 0
                ? `${scrapedLeads.length} leads extracted · ${selectedIndices.length} selected for pipeline import`
                : 'Scrape verified business accounts with real phones, ratings and websites into Arab Season CRM'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {scrapedLeads.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="h-10 px-4 rounded-full bg-white text-[#0B0B0B] border border-black/[0.06] shadow-sm text-[13px] font-medium flex items-center gap-2 hover:bg-white/80 active:scale-98 transition-all"
                title="Download extracted leads as CSV"
              >
                <Download size={15} strokeWidth={1.5} className="text-[#8A8A8A]" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/')}
              className="h-10 px-4 rounded-full bg-[#0B0B0B] text-white shadow-sm text-[13px] font-medium flex items-center gap-2 hover:bg-[#181818] active:scale-98 transition-all"
            >
              <Building2 size={15} strokeWidth={1.5} />
              <span>Back to Pipeline</span>
            </button>
          </div>
        </div>

        {/* 3. White Rounded Card matching the Dashboard Table Card */}
        <div className="bg-white rounded-[28px] border border-black/[0.06] flex-1 flex flex-col min-h-0 overflow-hidden relative shadow-sm">
          {/* Top Control Bar inside the card */}
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3.5 bg-slate-50/40">
            {/* Mode Selector & Filter Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="bg-slate-200/60 p-1 rounded-full flex gap-1 border border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => setActiveTab('live')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full flex items-center gap-2 transition-all ${
                    activeTab === 'live'
                      ? 'bg-[#0B0B0B] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search size={13} />
                  Live Google Maps
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full flex items-center gap-2 transition-all ${
                    activeTab === 'file'
                      ? 'bg-[#0B0B0B] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload size={13} />
                  Upload Scraper File
                </button>
              </div>

              {scrapedLeads.length > 0 && (
                <div className="relative">
                  <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search results..."
                    className="w-56 bg-white border border-slate-200 rounded-full ps-8 pe-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              )}
            </div>

            {activeTab === 'live' ? (
              /* LIVE NATURAL LANGUAGE FORM */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  {/* Natural Language Input */}
                  <div className="relative flex-1">
                    <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleStartScrape();
                      }}
                      placeholder="Type natural query (e.g. Real estate companies in Tokyo, IT companies in Gurugram, Restaurants in Musaffah)..."
                      className="w-full bg-white border border-slate-200 rounded-full ps-10 pe-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  {/* Target Sector Selector */}
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="bg-white border border-slate-200 rounded-full px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-black shadow-sm cursor-pointer"
                  >
                    <option value="Auto-detect">Auto-detect 18 Sectors</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* Limit Pills */}
                  <div className="bg-white border border-slate-200 rounded-full p-1 shadow-sm flex items-center gap-1">
                    {[10, 25, 50, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setLimit(num)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                          limit === num
                            ? 'bg-slate-900 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Start Scraping Button */}
                  <button
                    type="button"
                    disabled={isScraping}
                    onClick={handleStartScrape}
                    className="px-5 py-2.5 rounded-full bg-[#D6F25C] hover:bg-[#c7e252] text-black font-semibold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isScraping ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Scraping...</span>
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        <span>Start Scraping</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick suggestions pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] font-medium text-slate-400 me-1">Quick searches:</span>
                  {sampleSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuery(s)}
                      className="text-[11px] px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-colors shadow-2xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* FILE IMPORT DROPZONE */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('file-upload-input')?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#D6F25C] bg-[#D6F25C]/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  {uploadedFileName || 'Drop CSV or JSON scraper export here (or click to browse)'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Compatible with exports from gosom/google-maps-scraper, omkarcloud (Botasaurus), or custom datasets.
                </p>
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Table / Empty State Container */}
          <div className="flex-1 overflow-auto">
            {scrapedLeads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Building2 size={28} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  No Leads Extracted Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mb-4">
                  Search in natural language above (e.g. <em>&quot;Real estate companies in Tokyo&quot;</em>) or upload a CSV export to extract genuine business accounts into the Arab Season CRM pipeline.
                </p>
                <button
                  type="button"
                  onClick={handleStartScrape}
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Run Quick Search: Real Estate in Tokyo
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-medium select-none z-10">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIndices.length === scrapedLeads.length && scrapedLeads.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Company Name</th>
                    <th className="py-3 px-3">Auto-Detected Sector</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Website</th>
                    <th className="py-3 px-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, idx) => {
                    const isSelected = selectedIndices.includes(idx);
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelected ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(idx)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Name & Category */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{lead.name}</div>
                          {lead.category && (
                            <div className="text-[11px] text-slate-400">{lead.category}</div>
                          )}
                        </td>

                        {/* Sector Dropdown Badge */}
                        <td className="py-3 px-3">
                          <select
                            value={lead.sector}
                            onChange={(e) => handleUpdateLeadSector(idx, e.target.value)}
                            className="text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-slate-400 cursor-pointer"
                          >
                            {SECTORS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span>
                              {lead.city}
                              {lead.city && lead.country ? ', ' : ''}
                              {lead.country}
                            </span>
                          </div>
                          {lead.address && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                              {lead.address}
                            </div>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-3">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-slate-800 hover:text-emerald-600 flex items-center gap-1 font-mono text-[11px]"
                            >
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span>{lead.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Website */}
                        <td className="py-3 px-3">
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-700 hover:text-black flex items-center gap-1 truncate max-w-[150px] text-[11px] underline"
                            >
                              <Globe size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">
                                {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Rating & Reviews */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 font-semibold text-slate-800">
                            <Star size={13} className="text-amber-400 fill-amber-400" />
                            <span>{lead.rating ? lead.rating.toFixed(1) : '—'}</span>
                            {lead.reviews_count ? (
                              <span className="text-slate-400 text-[11px] font-normal">
                                ({lead.reviews_count})
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* 4. Floating Import Bar (styled like BulkBar) */}
          {scrapedLeads.length > 0 && selectedIndices.length > 0 && (
            <div className="absolute bottom-6 inset-x-0 mx-auto w-fit z-30 animate-in fade-in slide-in-from-bottom-4 duration-150 select-none pointer-events-auto">
              <div className="bg-[#0B0B0B] text-white rounded-full px-5 py-2.5 shadow-2xl border border-white/10 flex items-center gap-4 text-[13px]">
                {/* Selection Badge */}
                <div className="flex items-center gap-2 pe-3 border-e border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#D6F25C] text-black font-semibold text-[11px] flex items-center justify-center">
                    {selectedIndices.length}
                  </span>
                  <span className="font-normal text-white">selected</span>
                  <button
                    type="button"
                    onClick={() => setSelectedIndices([])}
                    className="text-[#8A8A8A] hover:text-white ms-1 p-0.5 rounded-full"
                    title="Deselect all"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Target Status Choice */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-[#8A8A8A]">Import as:</span>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as CompanyStatus)}
                    className="bg-white/10 text-white rounded-full px-3 py-1 text-xs font-medium border border-white/10 focus:outline-none cursor-pointer"
                  >
                    {PIPELINE_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-neutral-900 text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Import Action */}
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={handleImportToPipeline}
                  className="px-4 py-1.5 rounded-full bg-[#D6F25C] hover:bg-[#c7e252] text-black font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Import to Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        companies={allCompanies}
        onSelectCompany={() => {
          navigate('/');
        }}
      />

      <ToastContainer />
    </>
  );
};

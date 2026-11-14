/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BadgePercent, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  FileText, 
  BookOpen, 
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Settings2,
  UserCheck
} from 'lucide-react';
import { 
  ClosureDeal, 
  formatIndianCurrency, 
  calculateFinancialStats,
  getTreatmentSittingsLeft,
  getTreatmentAmountLeft
} from '../utils/clinicLogic';

interface ClosuresTabProps {
  deals: ClosureDeal[];
  onOpenCollectPayment: (deal: ClosureDeal) => void;
  onOpenRecordNewClosure: () => void;
  onDaySummaryReport: () => void;
  onIncrementSitting?: (dealId: string, treatmentId: string) => void;
  onManageTreatmentsForPatientId?: (patientId: string) => void;
  searchQuery: string;
}

export const ClosuresTab: React.FC<ClosuresTabProps> = ({
  deals,
  onOpenCollectPayment,
  onOpenRecordNewClosure,
  onDaySummaryReport,
  onIncrementSitting,
  onManageTreatmentsForPatientId,
  searchQuery,
}) => {
  const [dealFilter, setDealFilter] = useState<'all' | 'due' | 'cleared' | 'multi' | 'hair' | 'skin' | 'surgical'>('all');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'due_desc' | 'total_desc' | 'recent'>('due_desc');
  const [expandedDealIds, setExpandedDealIds] = useState<Set<string>>(new Set(['DEAL-2384', 'DEAL-2198']));

  const stats = calculateFinancialStats(deals);

  const query = (localSearch || searchQuery).toLowerCase().trim();

  const toggleExpand = (dealId: string) => {
    setExpandedDealIds((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  const filteredDeals = deals.filter((deal) => {
    if (query) {
      const match =
        deal.patientName.toLowerCase().includes(query) ||
        deal.patientId.toLowerCase().includes(query) ||
        deal.phone.includes(query) ||
        deal.packageName.toLowerCase().includes(query) ||
        (deal.treatments && deal.treatments.some((t) => t.treatmentName.toLowerCase().includes(query)));
      if (!match) return false;
    }

    if (dealFilter === 'due') {
      return deal.remainingBalanceDue > 0;
    }
    if (dealFilter === 'cleared') {
      return deal.remainingBalanceDue === 0;
    }
    if (dealFilter === 'multi') {
      return deal.treatments && deal.treatments.length > 1;
    }
    if (dealFilter === 'hair') {
      return (
        deal.packageName.toLowerCase().includes('hair') ||
        deal.packageName.toLowerCase().includes('fue') ||
        deal.packageName.toLowerCase().includes('prp') ||
        (deal.treatments && deal.treatments.some((t) => t.category === 'hair'))
      );
    }
    if (dealFilter === 'skin') {
      return (
        deal.packageName.toLowerCase().includes('skin') ||
        deal.packageName.toLowerCase().includes('peel') ||
        deal.packageName.toLowerCase().includes('laser') ||
        deal.packageName.toLowerCase().includes('acne') ||
        (deal.treatments && deal.treatments.some((t) => t.category === 'skin' || t.category === 'laser'))
      );
    }
    if (dealFilter === 'surgical') {
      return deal.isSurgical;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'due_desc') {
      return b.remainingBalanceDue - a.remainingBalanceDue;
    }
    if (sortBy === 'total_desc') {
      return b.totalPrice - a.totalPrice;
    }
    return b.id.localeCompare(a.id);
  });

  const multiDealCount = deals.filter((d) => d.treatments && d.treatments.length > 1).length;

  return (
    <div className="flex flex-col w-full relative pb-12 max-w-7xl mx-auto">
      
      {/* Top Meta & Shift Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-ledger uppercase tracking-wider text-slate-400 font-semibold">
              Clinical Billing &amp; Treatment Ledger
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-[11px] font-ledger text-[#6366F1] font-bold">
              Multi-Treatment Closure Engine Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E1B4B]">
            Treatment Closures &amp; Balances
          </h1>
        </div>

        {/* Quick Ledger Meta Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-ledger text-slate-800 font-medium">Paper Vol. 04 / Sec 12</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenRecordNewClosure}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 transition-all text-xs font-bold border border-amber-300 shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Record Treatment Closure</span>
          </button>

          <button
            type="button"
            onClick={onDaySummaryReport}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#1E1B4B] text-white hover:bg-[#312E81] transition-all text-xs font-semibold shadow-sm cursor-pointer active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-teal-300" />
            <span>Day Summary Report</span>
          </button>
        </div>
      </div>

      {/* 1. Top 3 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
        
        {/* Card 1: Total Agreed Deals */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-ledger uppercase tracking-wider text-slate-500 font-semibold">
                Total Agreed Closures
              </span>
              <div className="mt-1 text-2xl lg:text-3xl font-bold text-[#1E1B4B] tracking-tight">
                {formatIndianCurrency(stats.totalAgreed)}
              </div>
              <span className="text-xs text-slate-400 font-ledger">
                ₹{(stats.totalAgreed / 100000).toFixed(1)} Lakhs gross booked across all treatments
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6366F1]">
              <CheckCircle className="w-6 h-6 text-[#6366F1]" />
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3" /> {multiDealCount} Multi-Treatment
              </span>
            </div>
            <span className="text-xs font-ledger font-medium text-[#6366F1]">
              {stats.totalDeals} Packages Active
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
            <div className="h-full bg-[#6366F1]" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Card 2: Total Collected */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-ledger uppercase tracking-wider text-slate-500 font-semibold">
                Total Paid / Realized
              </span>
              <div className="mt-1 text-2xl lg:text-3xl font-bold text-emerald-700 tracking-tight">
                {formatIndianCurrency(stats.totalCollected)}
              </div>
              <span className="text-xs text-slate-400 font-ledger">
                ₹{(stats.totalCollected / 100000).toFixed(1)} Lakhs realized at counter
              </span>
            </div>

            {/* Circular Micro Progress Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                ></path>
                <path
                  className="text-emerald-600"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${stats.collectionRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
              </svg>
              <span className="absolute text-xs font-ledger text-slate-900 font-bold">
                {Math.round(stats.collectionRate)}%
              </span>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-emerald-800">
                {stats.collectionRate}% Collection Rate
              </span>
            </div>
            <span className="text-xs text-slate-500 font-ledger">
              Cleared {stats.clearedCount} cases
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
            <div
              className="h-full bg-emerald-600"
              style={{ width: `${Math.min(100, stats.collectionRate)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Pending Balances to Collect */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-100/50 p-5 border border-amber-200/90 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-ledger uppercase tracking-wider text-amber-800 font-bold">
                Remaining Balances to Collect
              </span>
              <div className="mt-1 text-2xl lg:text-3xl font-bold text-amber-900 tracking-tight">
                {formatIndianCurrency(stats.totalPending)}
              </div>
              <span className="text-xs text-amber-800/80 font-ledger">
                ₹{(stats.totalPending / 100000).toFixed(1)} Lakhs uncollected dues
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900 border border-amber-300">
              <Clock className="w-6 h-6 text-amber-900" />
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-ledger text-[11px] font-bold shadow-xs">
                {stats.accountsWithDues} Outstanding
              </span>
              <span className="text-xs text-amber-950 font-medium">Follow-up on next sittings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-800" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-200">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${Math.max(5, 100 - stats.collectionRate)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* 2. Controls, Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setDealFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              dealFilter === 'all'
                ? 'bg-[#1E1B4B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Deals <span className="ml-1 font-ledger text-slate-400">({deals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDealFilter('due')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              dealFilter === 'due'
                ? 'bg-[#1E1B4B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Has Due Balance <span className="ml-0.5 text-amber-300 font-ledger font-bold">({stats.accountsWithDues})</span>
          </button>

          <button
            type="button"
            onClick={() => setDealFilter('cleared')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              dealFilter === 'cleared'
                ? 'bg-[#1E1B4B] text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Fully Cleared <span className="ml-1 font-ledger text-slate-400">({stats.clearedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setDealFilter('multi')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              dealFilter === 'multi'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Multiple Treatments</span>
            <span className="ml-1 font-ledger text-amber-800 font-bold">({multiDealCount})</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <button
            type="button"
            onClick={() => setDealFilter('hair')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
              dealFilter === 'hair'
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>💇 Hair Care</span>
          </button>

          <button
            type="button"
            onClick={() => setDealFilter('skin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
              dealFilter === 'skin'
                ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>✨ Skin Care</span>
          </button>
        </div>

        {/* Right Search + Quick Sort */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search patient, skin, hair..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-inner"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#6366F1] cursor-pointer"
          >
            <option value="due_desc">Due: Highest</option>
            <option value="total_desc">Deal: Highest</option>
            <option value="recent">Recent Entry</option>
          </select>
        </div>

      </div>

      {/* 3. Package Closures & Installments Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-8">
        
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wide">
              Treatment Closures, Sittings &amp; Balances Log
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] text-[11px] font-ledger font-semibold border border-indigo-100">
              Live Sittings &amp; Ledger Tracking
            </span>
          </div>
          <span className="text-xs font-ledger text-slate-400">
            Showing {filteredDeals.length} of {deals.length} Closures
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-500 font-ledger uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Patient &amp; Contact</th>
                <th className="py-3 px-4">Procedure(s) &amp; Sittings</th>
                <th className="py-3 px-4 text-right">Agreed Total</th>
                <th className="py-3 px-4 text-right">Paid to Date</th>
                <th className="py-3 px-4 text-right">Remaining Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.map((deal) => {
                const initials = deal.patientName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('');

                const isExpanded = expandedDealIds.has(deal.id);
                const hasTreatments = deal.treatments && deal.treatments.length > 0;
                const treatmentCount = deal.treatments?.length || 1;

                // Total sittings aggregate for this deal
                const totalSittings = deal.treatments?.reduce((sum, t) => sum + (t.totalSittings || 0), 0) || 0;
                const completedSittings = deal.treatments?.reduce((sum, t) => sum + (t.completedSittings || 0), 0) || 0;

                return (
                  <React.Fragment key={deal.id}>
                    <tr
                      className={`transition-colors ${
                        isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Patient info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleExpand(deal.id)}
                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-bold shadow-xs cursor-pointer transition-colors"
                            title="Toggle multi-treatment breakdown"
                          >
                            {initials}
                          </button>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              {deal.patientName}
                              {treatmentCount > 1 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-ledger text-[10px] font-bold border border-amber-300">
                                  {treatmentCount} Treatments
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-ledger text-slate-400 flex items-center gap-1">
                              <span>#{deal.patientId}</span>
                              <span>•</span>
                              <span>{deal.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Procedure, Sittings & Breakdown Toggle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">{deal.packageName}</span>
                          <button
                            type="button"
                            onClick={() => toggleExpand(deal.id)}
                            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#6366F1] hover:text-[#4338CA] cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Breakdown'}</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Sittings overview badge */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {totalSittings > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-ledger text-[11px] font-semibold border border-indigo-100">
                              <span>Sittings:</span>
                              <strong>{completedSittings} / {totalSittings} Done</strong>
                            </span>
                          )}

                          <span className="text-[11px] font-ledger text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{deal.otSlot || deal.closureDate}</span>
                          </span>
                        </div>
                      </td>

                      {/* Agreed Total */}
                      <td className="py-3.5 px-4 text-right text-xs font-semibold text-slate-900 font-ledger">
                        {formatIndianCurrency(deal.totalPrice)}
                      </td>

                      {/* Paid to Date */}
                      <td className="py-3.5 px-4 text-right text-xs font-semibold text-emerald-700 font-ledger">
                        {formatIndianCurrency(deal.advancePaid)}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right text-sm font-bold font-ledger">
                        {deal.remainingBalanceDue > 0 ? (
                          <span className="text-amber-900">{formatIndianCurrency(deal.remainingBalanceDue)}</span>
                        ) : (
                          <span className="text-emerald-700">₹0</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {deal.remainingBalanceDue === 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium text-[11px] inline-flex items-center gap-1 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Fully Cleared
                          </span>
                        ) : deal.statusBadge === 'OT Gate Block' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-medium text-[11px] inline-flex items-center gap-1 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            OT Gate Block
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                            {deal.statusBadge}
                          </span>
                        )}
                      </td>

                      {/* Action button */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {deal.remainingBalanceDue > 0 ? (
                            <button
                              type="button"
                              onClick={() => onOpenCollectPayment(deal)}
                              className="h-8 px-3 rounded-lg bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer active:scale-95"
                            >
                              <CreditCard className="w-3 h-3 text-teal-300" />
                              <span>Collect Due</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenCollectPayment(deal)}
                              className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Receipts ({deal.payments.length})</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDABLE MULTI-TREATMENT BREAKDOWN ROW */}
                    {isExpanded && hasTreatments && (
                      <tr className="bg-slate-50/70 border-b border-indigo-100/60">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="rounded-xl bg-white p-4 border border-slate-200/90 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                              <span className="text-xs font-bold text-[#1E1B4B] uppercase font-ledger tracking-wide flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-[#6366F1]" />
                                Individual Treatment Agreements ({deal.treatments?.length})
                              </span>
                              
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-ledger text-slate-500">
                                  Maintained for {deal.patientName} &bull; Folio {deal.paperCitation}
                                </span>
                                {onManageTreatmentsForPatientId && (
                                  <button
                                    type="button"
                                    onClick={() => onManageTreatmentsForPatientId(deal.patientId)}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold text-xs border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Manage Treatments</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Sub-grid of individual treatments */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {deal.treatments?.map((treatment, tIndex) => {
                                const remaining = getTreatmentAmountLeft(treatment);
                                const sittingsLeft = getTreatmentSittingsLeft(treatment);
                                const percent = treatment.totalSittings > 0
                                  ? Math.round((treatment.completedSittings / treatment.totalSittings) * 100)
                                  : 0;

                                return (
                                  <div
                                    key={treatment.id}
                                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 shadow-2xs ${
                                      treatment.category === 'hair'
                                        ? 'bg-indigo-50/30 border-indigo-200/80 hover:border-indigo-300'
                                        : 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                          treatment.category === 'hair'
                                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                            : treatment.category === 'skin'
                                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                            : 'bg-purple-100 text-purple-900 border border-purple-200'
                                        }`}>
                                          {treatment.category === 'hair' ? '💇 Hair Treatment' : treatment.category === 'skin' ? '✨ Skin Care' : '⚡ Laser'}
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                          {treatment.treatmentName}
                                        </span>
                                      </div>

                                      {/* Sittings increment button */}
                                      {onIncrementSitting && treatment.completedSittings < treatment.totalSittings && (
                                        <button
                                          type="button"
                                          onClick={() => onIncrementSitting(deal.id, treatment.id)}
                                          className="h-6 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                          title="Log 1 completed sitting for this treatment"
                                        >
                                          <span>+1 Sitting Done</span>
                                        </button>
                                      )}
                                    </div>

                                    {/* Financial numbers for this treatment */}
                                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                                        <span className="text-slate-400 block font-ledger text-[10px]">Closure Amt</span>
                                        <span className="font-bold font-ledger text-slate-800">
                                          {formatIndianCurrency(treatment.closureAmount)}
                                        </span>
                                      </div>

                                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                                        <span className="text-emerald-700 block font-ledger text-[10px]">Paid</span>
                                        <span className="font-bold font-ledger text-emerald-800">
                                          {formatIndianCurrency(treatment.paidAmount)}
                                        </span>
                                      </div>

                                      <div className={`p-2 rounded-lg border ${
                                        remaining > 0
                                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      }`}>
                                        <span className="block font-ledger text-[10px] font-bold">Left to Pay</span>
                                        <span className="font-bold font-ledger">
                                          {remaining > 0 ? formatIndianCurrency(remaining) : '₹0 (Clear)'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Sittings progress bar */}
                                    <div className="pt-1 bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                      <div className="flex items-center justify-between text-[11px] font-ledger text-slate-700">
                                        <span>
                                          Appeared: <strong className="text-emerald-700">{treatment.completedSittings}</strong> / Finalized: <strong>{treatment.totalSittings}</strong>
                                        </span>
                                        <span className={`font-bold px-2 py-0.2 rounded ${
                                          sittingsLeft > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                                        }`}>
                                          {sittingsLeft > 0 ? `${sittingsLeft} Sittings Left` : 'All Done!'}
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            percent === 100
                                              ? 'bg-emerald-500'
                                              : treatment.category === 'hair'
                                              ? 'bg-indigo-600'
                                              : 'bg-rose-600'
                                          }`}
                                          style={{ width: `${percent}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Therapist Sitting Track Record */}
                                    {treatment.sittingHistory && treatment.sittingHistory.length > 0 && (
                                      <div className="pt-1.5 space-y-1">
                                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 font-ledger uppercase">
                                          <UserCheck className="w-3 h-3 text-indigo-600" />
                                          Therapist Log:
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {treatment.sittingHistory.map((s, sIdx) => (
                                            <span
                                              key={s.id || sIdx}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 shadow-2xs"
                                              title={s.notes ? `Date: ${s.date}\nNotes: ${s.notes}` : `Date: ${s.date}`}
                                            >
                                              <strong className="text-indigo-900">#{s.sittingNumber}</strong>
                                              <span className="font-semibold text-slate-800">{s.therapistName}</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {treatment.notes && (
                                      <p className="text-[11px] font-ledger text-slate-500 italic pt-0.5">
                                        Note: {treatment.notes}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Status & Legacy Paper Citation */}
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between text-slate-500 font-ledger text-xs gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#6366F1]" />
              Registered in Physical Binder:{' '}
              <strong className="text-slate-800">Vol. 2 &amp; Vol. 3 — Skin &amp; Hair Restorations</strong>
            </span>
            <span>•</span>
            <span>Folio Page Reference 89-94</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Payment Gateway Live Hook:</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] font-semibold border border-indigo-100">
              HDFC Merchant #74920
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

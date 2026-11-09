






/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder,
  Wallet,
  BookOpen,
  CalendarCheck,
  Printer,
  Download,
  LayoutGrid,
  List,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Layers,
  Settings2
} from 'lucide-react';
import {
  Patient,
  formatIndianCurrency,
  filterPatients,
  getTreatmentSittingsLeft,
  getTreatmentAmountLeft,
  formatBookingChannel,
  formatConsultationOutcome,
  formatFeeStatus
} from '../utils/clinicLogic';

interface PatientsTabProps {
  patients: Patient[];
  totalPendingDues: number;
  todayVisitsCount: number;
  completedVisitsCount: number;
  onViewProfile: (patient: Patient) => void;
  onRecordDealForPatient: (patient: Patient) => void;
  onScheduleForPatient: (patient: Patient) => void;
  onExportAuditLog: () => void;
  onPrintRegisterSheet: () => void;
  onManageTreatments?: (patient: Patient) => void;
  searchQuery: string;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  patients,
  totalPendingDues,
  todayVisitsCount,
  completedVisitsCount,
  onViewProfile,
  onRecordDealForPatient,
  onScheduleForPatient,
  onExportAuditLog,
  onPrintRegisterSheet,
  onManageTreatments,
  searchQuery,
}) => {
  const [selectedConcern, setSelectedConcern] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'cards' | 'dense'>('cards');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const filteredPatients = filterPatients(
    patients,
    searchQuery,
    selectedConcern,
    quickFilter,
    sortBy
  );

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const displayedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col w-full pb-10 max-w-7xl mx-auto">

      {/* 4 Top Metric & Notice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Metric 1: Total Registry */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#1E1B4B]">
              <Folder className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <p className="font-ledger text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL REGISTRY</p>
              <p className="text-2xl font-bold text-slate-900">{patients.length} Patients</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-ledger text-[11px] font-bold border border-emerald-100">
            100% Synced
          </span>
        </div>

        {/* Metric 2: Outstanding Dues */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Wallet className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-ledger text-[11px] font-bold text-slate-400 uppercase tracking-wider">OUTSTANDING DUES</p>
              <p className="text-2xl font-bold text-amber-800">{formatIndianCurrency(totalPendingDues)}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-ledger text-[11px] font-bold border border-amber-200">
            {patients.filter(p => p.hasPendingBalance).length} Accounts
          </span>
        </div>

        {/* Metric 3: Desk Ledgers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <BookOpen className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="font-ledger text-[11px] font-bold text-slate-400 uppercase tracking-wider">DESK LEDGERS</p>
              <p className="text-2xl font-bold text-slate-900">3 Volumes</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-ledger text-[11px] font-bold border border-indigo-100">
            Verified
          </span>
        </div>

        {/* Metric 4: Visits Today */}
        <div className="bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-indigo-950 p-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(30,27,75,0.3)] flex items-center justify-between text-white transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
              <CalendarCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <p className="font-ledger text-[11px] font-semibold opacity-75 uppercase tracking-wider">VISITS TODAY</p>
              <p className="text-2xl font-bold">{todayVisitsCount} Scheduled</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
            {completedVisitsCount} Completed
          </span>
        </div>

      </div>

      {/* Main Directory Workspace Card */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col gap-6">

        {/* Directory Header & Action Utilities */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Active Patient Directory</h1>
              <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
                {filteredPatients.length} Records
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              Migrated &amp; mapped with Clinic Physical Logbooks (Blue Spiral, OT Book &amp; OPD Registers)
            </p>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onPrintRegisterSheet}
              className="h-10 px-3.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Daily Register Sheet</span>
            </button>

            <button
              type="button"
              onClick={onExportAuditLog}
              className="h-10 px-3.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Audit Log</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* View Mode Toggle: Cards vs Dense */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'cards'
                  ? 'bg-white text-[#1E1B4B] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#6366F1]" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('dense')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${viewMode === 'dense'
                  ? 'bg-white text-[#1E1B4B] shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
                  }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Dense</span>
              </button>
            </div>
          </div>
        </div>

        {/* Treatment Categorization Pills & Secondary Filters */}
        <div className="flex flex-col gap-3 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80">

          {/* Main Concern Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="font-ledger text-[11px] font-bold text-slate-400 uppercase whitespace-nowrap mr-1">Concerns:</span>

            <button
              type="button"
              onClick={() => setSelectedConcern('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedConcern === 'all'
                ? 'bg-[#1E1B4B] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50 shadow-xs'
                }`}
            >
              All Treatments ({patients.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedConcern('fue')}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${selectedConcern === 'fue'
                ? 'bg-[#1E1B4B] text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50 font-medium shadow-xs'
                }`}
            >
              FUE Hair Transplant ({patients.filter(p => p.concernCategory === 'fue').length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedConcern('prp')}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${selectedConcern === 'prp'
                ? 'bg-[#1E1B4B] text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50 font-medium shadow-xs'
                }`}
            >
              PRP &amp; GFC Therapy ({patients.filter(p => p.concernCategory === 'prp').length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedConcern('laser')}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${selectedConcern === 'laser'
                ? 'bg-[#1E1B4B] text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50 font-medium shadow-xs'
                }`}
            >
              Laser Hair Reduction ({patients.filter(p => p.concernCategory === 'laser').length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedConcern('acne')}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${selectedConcern === 'acne'
                ? 'bg-[#1E1B4B] text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50 font-medium shadow-xs'
                }`}
            >
              Acne &amp; Skin Rejuvenation ({patients.filter(p => p.concernCategory === 'acne').length})
            </button>
          </div>

          {/* Quick View Flags & Sort */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-ledger text-[11px] font-bold text-slate-400 uppercase whitespace-nowrap mr-1">Quick View:</span>

              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'pending' ? 'all' : 'pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${quickFilter === 'pending'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/70 hover:bg-amber-100'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                Has Pending Balance
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'followup' ? 'all' : 'followup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${quickFilter === 'followup'
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Follow-up Due This Week
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'verified' ? 'all' : 'verified')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${quickFilter === 'verified'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Paper Verified
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'in_talks' ? 'all' : 'in_talks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${quickFilter === 'in_talks'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                  }`}
              >
                <span>🟡</span>
                <span>In Talks</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'treatment_booked' ? 'all' : 'treatment_booked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${quickFilter === 'treatment_booked'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                  }`}
              >
                <span>🟢</span>
                <span>Treatment Booked</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'medicines_only' ? 'all' : 'medicines_only')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${quickFilter === 'medicines_only'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300 font-bold'
                  : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                  }`}
              >
                <span>💊</span>
                <span>Medicines Only</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter(quickFilter === 'refused_treatment' ? 'all' : 'refused_treatment')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${quickFilter === 'refused_treatment'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                  : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                  }`}
              >
                <span>🔴</span>
                <span>Refused</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-ledger text-xs font-medium text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white text-slate-800 text-xs border border-slate-200 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs cursor-pointer"
              >
                <option value="recent">Recently Added / Updated</option>
                <option value="balance_desc">Highest Outstanding Balance</option>
                <option value="name_asc">Patient Name (A-Z)</option>
                <option value="book_order">Physical Volume &amp; Page Order</option>
              </select>
            </div>
          </div>

        </div>

        {/* Dense Table View vs Card View */}
        {viewMode === 'dense' ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-ledger uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient / ID</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Treatment / Procedure</th>
                  <th className="py-3 px-4">Paper Register Citation</th>
                  <th className="py-3 px-4">Status &amp; Dues</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{patient.name}</div>
                      <div className="text-[11px] text-slate-500">{patient.age} yrs • {patient.gender} • <span className="font-ledger font-semibold">#{patient.id}</span></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{patient.phone}</div>
                      <a
                        href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(patient.name)},%20greetings%20from%20COSMEDIQ%20Clinic!`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 mt-0.5"
                      >
                        WhatsApp Direct &rarr;
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {patient.treatments && patient.treatments.length > 0 ? (
                        <div className="flex flex-col gap-1.5 max-w-md">
                          {patient.treatments.map((t) => {
                            const isHair = t.category === 'hair';
                            const sitsLeft = getTreatmentSittingsLeft(t);
                            const amtLeft = getTreatmentAmountLeft(t);
                            return (
                              <div
                                key={t.id}
                                className={`p-1.5 rounded-lg border text-xs flex flex-col gap-1 ${isHair
                                  ? 'bg-indigo-50/50 border-indigo-200'
                                  : 'bg-rose-50/50 border-rose-200'
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-1 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isHair
                                        ? 'bg-indigo-100 text-indigo-900'
                                        : 'bg-rose-100 text-rose-900'
                                        }`}
                                    >
                                      {isHair ? '💇 Hair' : '✨ Skin'}
                                    </span>
                                    <span className="font-bold text-slate-800">{t.treatmentName}</span>
                                  </div>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${sitsLeft > 0
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-emerald-100 text-emerald-900'
                                      }`}
                                  >
                                    {sitsLeft > 0 ? `${sitsLeft} left` : 'Done'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-ledger text-slate-600 flex-wrap">
                                  <span>Closure: <strong>{formatIndianCurrency(t.closureAmount)}</strong></span>
                                  <span>•</span>
                                  <span className="text-emerald-700">Paid: <strong>{formatIndianCurrency(t.paidAmount)}</strong></span>
                                  <span>•</span>
                                  <span className={amtLeft > 0 ? 'text-amber-900 font-bold' : 'text-emerald-700'}>
                                    Left: {amtLeft > 0 ? formatIndianCurrency(amtLeft) : '₹0'}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Sittings: <strong>{t.completedSittings}/{t.totalSittings}</strong> ({sitsLeft} left)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-800">{patient.treatmentConcern}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-ledger text-[11px]">
                          📖 {patient.paperRegisterCitation.volume}, {patient.paperRegisterCitation.page} • {patient.paperRegisterCitation.diaryType}
                        </span>
                        {patient.consultationOutcome && patient.consultationOutcome !== 'pending_consultation' && (() => {
                          const outcome = formatConsultationOutcome(patient.consultationOutcome);
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${outcome.badgeClass} w-fit`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${outcome.dotColor}`}></span>
                              <span>{outcome.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {patient.hasPendingBalance ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200 text-xs">
                          {formatIndianCurrency(patient.dueAmount)} Due
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-xs">
                          Fully Paid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                        {onManageTreatments && (
                          <button
                            type="button"
                            onClick={() => onManageTreatments(patient)}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-semibold text-xs border border-indigo-200 transition-colors cursor-pointer"
                            title="Manage skin and hair treatments"
                          >
                            Treatments
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onViewProfile(patient)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => onRecordDealForPatient(patient)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200 transition-colors cursor-pointer"
                        >
                          Deal
                        </button>
                        <button
                          type="button"
                          onClick={() => onScheduleForPatient(patient)}
                          className="px-2.5 py-1 rounded-lg bg-[#1E1B4B] hover:bg-[#312E81] text-white font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Visit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View Matching Design in Image 2 */
          <div className="flex flex-col gap-4">
            {displayedPatients.map((patient, index) => {
              const initials = patient.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <div
                  key={patient.id}
                  className="animate-fade-in-up p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col xl:flex-row xl:items-center justify-between gap-4 group"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5 flex-1">

                    {/* Patient Demographic Block */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/90 text-[#1E1B4B] border border-indigo-100 flex items-center justify-center text-base font-bold shrink-0 shadow-xs transition-transform group-hover:scale-105 duration-200">
                        {initials}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-slate-900 group-hover:text-[#1E1B4B] transition-colors">
                            {patient.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {patient.age} yrs • {patient.gender}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-ledger text-xs font-semibold">
                            #{patient.id}
                          </span>
                        </div>

                        {/* Mobile and Direct WhatsApp Link */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs font-medium text-slate-600 tracking-wide font-ledger">
                            {patient.phone}
                          </span>

                          <a
                            href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(patient.name)},%20this%20is%20Priya%20from%20COSMEDIQ%20Skin%20and%20Hair%20Clinic.%20Following%20up%20on%20your%20treatment%20session.`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-200 active:scale-95 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 fill-current text-emerald-600" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path>
                            </svg>
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${patient.phone}`}
                            className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors active:scale-95"
                            title="Direct Dial"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Concern Badge & Physical Paper Register Citation */}
                    <div className="flex flex-col gap-2 lg:border-l lg:pl-5 border-slate-100 flex-1">
                      {patient.treatments && patient.treatments.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {patient.treatments.map((t) => {
                            const isHair = t.category === 'hair';
                            const sitsLeft = getTreatmentSittingsLeft(t);
                            const amtLeft = getTreatmentAmountLeft(t);
                            return (
                              <div
                                key={t.id}
                                className={`px-2.5 py-1.5 rounded-xl border text-xs flex flex-col gap-1 transition-all ${isHair
                                  ? 'bg-indigo-50/60 text-indigo-950 border-indigo-200 hover:border-indigo-300'
                                  : 'bg-rose-50/60 text-rose-950 border-rose-200 hover:border-rose-300'
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isHair
                                        ? 'bg-indigo-100 text-indigo-900'
                                        : 'bg-rose-100 text-rose-900'
                                        }`}
                                    >
                                      {isHair ? '💇 Hair' : '✨ Skin'}
                                    </span>
                                    <span className="font-bold text-slate-900">{t.treatmentName}</span>
                                  </div>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${sitsLeft > 0
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-emerald-100 text-emerald-900'
                                      }`}
                                  >
                                    {sitsLeft > 0 ? `${sitsLeft} Sittings Left` : 'All Sittings Done'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-ledger text-slate-600 flex-wrap">
                                  <span>Closure: <strong>{formatIndianCurrency(t.closureAmount)}</strong></span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-semibold">
                                    Paid: {formatIndianCurrency(t.paidAmount)}
                                  </span>
                                  <span>•</span>
                                  <span className={amtLeft > 0 ? 'text-amber-900 font-bold' : 'text-emerald-700'}>
                                    Left to Pay: {amtLeft > 0 ? formatIndianCurrency(amtLeft) : '₹0 (Clear)'}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Sittings: <strong>{t.completedSittings}/{t.totalSittings}</strong> ({sitsLeft} left)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-950 font-ledger text-xs font-semibold border border-indigo-100">
                            {patient.treatmentConcern}
                          </span>
                        </div>
                      )}

                      {/* Distinct Paper Register Citation Tag & Consultation Outcome */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 text-slate-700 font-ledger text-xs border border-slate-200/80 shadow-2xs">
                          <span className="text-amber-700">📖</span>
                          <span className="font-bold text-slate-900">
                            {patient.paperRegisterCitation.volume}, {patient.paperRegisterCitation.page}
                          </span>
                          <span className="text-slate-400">• {patient.paperRegisterCitation.diaryType}</span>
                          <BadgeCheck className="w-3.5 h-3.5 text-[#6366F1]" />
                        </div>

                        {patient.bookingChannel && (() => {
                          const channel = formatBookingChannel(patient.bookingChannel);
                          return (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${channel.badgeClass}`}>
                              <span>{channel.icon}</span>
                              <span>{channel.label}</span>
                            </span>
                          );
                        })()}

                        {patient.consultationOutcome && patient.consultationOutcome !== 'pending_consultation' && (() => {
                          const outcome = formatConsultationOutcome(patient.consultationOutcome);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border ${outcome.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${outcome.dotColor}`}></span>
                              <span>{outcome.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                  </div>

                  {/* Status, Balances & Quick Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-5 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                    <div className="flex flex-col text-left xl:text-right">
                      <span className={`text-xs font-semibold flex items-center xl:justify-end gap-1.5 ${patient.statusType === 'scheduled'
                        ? 'text-[#6366F1]'
                        : patient.statusType === 'completed'
                          ? 'text-emerald-700'
                          : patient.statusType === 'pending'
                            ? 'text-amber-800'
                            : 'text-slate-700'
                        }`}>
                        {patient.statusType === 'scheduled' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366F1]"></span>
                          </span>
                        )}
                        {patient.statusType === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {patient.statusType === 'pending' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                        {patient.statusText}
                      </span>

                      <div className="mt-1 flex items-center xl:justify-end gap-2">
                        {patient.hasPendingBalance ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                            {formatIndianCurrency(patient.dueAmount)} Due
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                            Fully Paid (₹0 Due)
                          </span>
                        )}
                        <span className="font-ledger text-xs text-slate-400 font-medium">
                          (Total {formatIndianCurrency(patient.totalDealAmount)})
                        </span>
                      </div>
                    </div>

                    {/* Quick 4 Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {onManageTreatments && (
                        <button
                          type="button"
                          onClick={() => onManageTreatments(patient)}
                          className="h-9 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          title="Manage Skin & Hair Treatments"
                        >
                          <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Treatments</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onViewProfile(patient)}
                        className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        View Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => onRecordDealForPatient(patient)}
                        className="h-9 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        + Record Deal
                      </button>

                      <button
                        type="button"
                        onClick={() => onScheduleForPatient(patient)}
                        className="h-9 px-3.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        + Schedule Visit
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Desk Quick Legend & Pagination Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 bg-slate-50/90 border border-slate-200/80 px-4 py-2.5 rounded-xl">
            <span className="text-base">💡</span>
            <span className="text-xs text-slate-600">
              <strong className="font-semibold text-slate-900">Need physical chart?</strong> Check the{' '}
              <span className="text-amber-800 font-bold">📖 Diary volume &amp; page number</span> printed on each patient badge to locate their hardcopy binder instantly.
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-ledger text-xs text-slate-400 whitespace-nowrap">
              Showing <span className="font-bold text-slate-800">{displayedPatients.length}</span> of {filteredPatients.length} Patients | {patients.filter(p => p.hasPendingBalance).length} with pending physical verification
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer active:scale-95'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${currentPage === pageNum
                    ? 'bg-[#1E1B4B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage >= totalPages
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer active:scale-95'
                  }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  UserPlus, 
  PlusCircle, 
  CalendarPlus, 
  Download 
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/clinicLogic';

interface HeaderProps {
  activeTab: 'patients' | 'closures' | 'appointments' | 'inventory';
  setActiveTab: (tab: 'patients' | 'closures' | 'appointments' | 'inventory') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewPatient: () => void;
  onOpenRecordClosure: () => void;
  onOpenBookVisit: () => void;
  onExportData: () => void;
  patientCount: number;
  totalPendingDues: number;
  todayVisitsCount: number;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenNewPatient,
  onOpenRecordClosure,
  onOpenBookVisit,
  onExportData,
  patientCount,
  totalPendingDues,
  todayVisitsCount,
  lowStockCount,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-slate-200/90 shadow-[0_2px_12px_rgba(30,27,75,0.04)]">
      <div className="h-32 w-full px-4 sm:px-6 lg:px-10 flex flex-col justify-between pt-3 pb-0">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 lg:gap-4">
          
          {/* Brand Logo & Clinic Desk Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('patients')}>
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1WSDWhBYLfoQ5nnn8fjxD2cyBiwKAspAi2WY6qS80ErhGY9RWa36jCWMQFoUu0jLX2ELVkfctMmqJnCC0SO7y0e_xkLuejQOMuoUnArxWNkjkRHiCUQ4NiLwyxcQQOfcogevdnr6tgfogi7Qo7LTlvGpvl99XZKWm-l9XJDMrxxThA3wr4JtQTWFB4_6XSySsmqwECxmhhw5-D2QUtH1WXO4mcxpGKpV-nZUw9H-8tUdPaWVc2Z3kLi1w"
                alt="COSMEDIQ Brand Logo"
                className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1E1B4B]">COSMEDIQ</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-[#1E1B4B] font-semibold text-[11px] sm:text-xs border border-indigo-100 whitespace-nowrap">
                Staff Desk
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium text-[11px] border border-emerald-200 whitespace-nowrap" title="System Online">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden md:inline">Online</span>
              </span>
            </div>
          </div>

          {/* Center Prominent Omnibox Search Bar */}
          <div className="flex-1 max-w-lg min-w-[200px] sm:min-w-[260px] mx-1 sm:mx-3">
            <div className="relative flex items-center w-full group">
              <Search className="absolute left-3.5 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#6366F1] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by name, mobile, or ID..."
                className="w-full h-10 pl-9 pr-12 bg-slate-50/90 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200/90 focus:outline-none focus:bg-white focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/15 transition-all shadow-inner duration-200"
              />
              <span className="absolute right-2.5 px-1.5 py-0.5 rounded-md bg-white text-slate-500 font-ledger text-[10px] font-semibold border border-slate-200 shadow-xs pointer-events-none hidden sm:inline-block">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* + New Patient (Solid Teal / Navy Gradient Button) */}
            <button
              type="button"
              onClick={onOpenNewPatient}
              className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white text-xs sm:text-sm font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(30,27,75,0.22)] cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4 text-teal-300" />
              <span className="whitespace-nowrap">+ New Patient</span>
            </button>

            {/* + Record Closure (Amber outlined pill for package deals) */}
            <button
              type="button"
              onClick={onOpenRecordClosure}
              className="hidden xl:flex h-9 sm:h-10 px-3 rounded-xl bg-white text-amber-900 font-semibold text-xs border border-amber-300 hover:bg-amber-50 active:scale-95 transition-all items-center justify-center gap-1 shadow-xs cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Record Closure</span>
            </button>

            {/* + Book Visit (Blue outlined pill) */}
            <button
              type="button"
              onClick={onOpenBookVisit}
              className="hidden xl:flex h-9 sm:h-10 px-3 rounded-xl bg-white text-indigo-900 font-semibold text-xs border border-indigo-200 hover:bg-indigo-50 active:scale-95 transition-all items-center justify-center gap-1 shadow-xs cursor-pointer shrink-0"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Book Visit</span>
            </button>

            {/* Quick backup download icon */}
            <button
              type="button"
              onClick={onExportData}
              title="Export / Backup Clinic Ledger Data"
              className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-white text-slate-600 hover:text-[#1E1B4B] hover:bg-slate-50 border border-slate-200/90 active:scale-95 flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Staff Desk Profile Badge */}
            <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 shrink-0">
              <div className="relative shrink-0" title="Priya S. (Front Desk) - Morning Shift">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvxZrljr7e3aKhVlPQmHfzC0TDJnf14cq_txfgZT9cThbEL-8DeCCRPE2QQ16sri_kXMv1icOW_4AYc4t3kG7eolpqIvkotDvEqxf5MukcoWPk-y9k4EGmFe3sQIIunplIIzPwbQGeoZVzWvYYAs2EdQxBZB-lJ1Pgchb9tzhHTTAHA2XA30M-I3IyCIACByfmqyojj03QduK6j7pUot5JsC9grLjucPzQCMIKBFc_qOgdAsKPCGZd"
                  alt="Priya S."
                  className="w-8 h-8 rounded-full ring-2 ring-indigo-200 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="hidden 2xl:flex flex-col text-left shrink-0">
                <span className="text-xs font-bold text-slate-900 leading-tight">Priya S.</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Big Obvious Navigation Tabs */}
        <nav className="flex items-center gap-4 sm:gap-8 overflow-x-auto pt-1 relative scrollbar-none">
          {/* Tab 1: Patient Records */}
          <button
            type="button"
            onClick={() => setActiveTab('patients')}
            className={`relative pb-3 pt-1 flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'patients'
                ? 'text-[#1E1B4B] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Patient Records</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
              activeTab === 'patients'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {patientCount} Patients
            </span>
            {activeTab === 'patients' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1E1B4B] via-[#6366F1] to-[#1E1B4B] rounded-full shadow-[0_1px_6px_rgba(99,102,241,0.5)]"></span>
            )}
          </button>

          {/* Tab 2: Treatment Closures & Balances */}
          <button
            type="button"
            onClick={() => setActiveTab('closures')}
            className={`relative pb-3 pt-1 flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'closures'
                ? 'text-[#6366F1] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Treatment Closures & Balances</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              {formatIndianCurrency(totalPendingDues)} Due
            </span>
            {activeTab === 'closures' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1] rounded-full shadow-[0_1px_6px_rgba(99,102,241,0.5)]"></span>
            )}
          </button>

          {/* Tab 3: Appointments & Follow-ups */}
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`relative pb-3 pt-1 flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'text-[#1E1B4B] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Appointments & Follow-ups</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              {todayVisitsCount} Today
            </span>
            {activeTab === 'appointments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1B4B] rounded-full"></span>
            )}
          </button>

          {/* Tab 4: Clinic Stocks & Inventory */}
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`relative pb-3 pt-1 flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'text-[#6366F1] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Clinic Stocks & Inventory</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
              lowStockCount > 0
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {lowStockCount} Low
            </span>
            {activeTab === 'inventory' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1] rounded-full"></span>
            )}
          </button>
        </nav>

      </div>
    </header>
  );
};

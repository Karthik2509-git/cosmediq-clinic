/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Download, Sparkles, BookOpen } from 'lucide-react';
import { Patient, formatIndianCurrency } from '../utils/clinicLogic';

interface DailyRegisterSheetModalProps {
  patients: Patient[];
  onClose: () => void;
}

export const DailyRegisterSheetModal: React.FC<DailyRegisterSheetModalProps> = ({
  patients,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/40 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E1B4B] text-white flex items-center justify-center">
              <Printer className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E1B4B]">
                Daily Register Sheet (Hardcopy Verification)
              </h2>
              <span className="text-xs text-slate-500 font-ledger">
                Printable ledger sheet for front-desk paper binder reconciliation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-9 px-4 rounded-xl bg-[#1E1B4B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#312E81] transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-6 max-h-[75vh] overflow-y-auto text-slate-900 print:max-h-none print:p-0">
          
          <div className="border-b border-slate-300 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-[#1E1B4B] tracking-tight">
                COSMEDIQ — Skin &amp; Hair Transplant Specialist
              </h1>
              <p className="text-xs text-slate-500 font-ledger">
                Reception Daily Ledger &bull; Staff: Priya S. (Morning Shift) &bull; Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-ledger">
                Total Patients: {patients.length}
              </span>
            </div>
          </div>

          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-ledger text-[11px] uppercase border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">File ID</th>
                <th className="p-2 border-r border-slate-300">Patient Name</th>
                <th className="p-2 border-r border-slate-300">Phone</th>
                <th className="p-2 border-r border-slate-300">Treatment Concern</th>
                <th className="p-2 border-r border-slate-300">Paper Binder Citation</th>
                <th className="p-2 border-r border-slate-300 text-right">Due Balance</th>
                <th className="p-2 text-center">Staff Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-ledger">
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className="p-2 font-bold border-r border-slate-300">#{p.id}</td>
                  <td className="p-2 font-semibold border-r border-slate-300">{p.name} ({p.age}y/{p.gender[0]})</td>
                  <td className="p-2 border-r border-slate-300">{p.phone}</td>
                  <td className="p-2 border-r border-slate-300">
                    {p.treatments && p.treatments.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {p.treatments.map((t) => {
                          const isHair = t.category === 'hair';
                          const leftSits = Math.max(0, t.totalSittings - (t.completedSittings || 0));
                          const leftAmt = Math.max(0, t.closureAmount - (t.paidAmount || 0));
                          return (
                            <div key={t.id} className="text-[11px] leading-tight">
                              <strong>{isHair ? '[Hair]' : '[Skin]'}</strong> {t.treatmentName} &bull;{' '}
                              <span>
                                Closure: {formatIndianCurrency(t.closureAmount)} (Paid: {formatIndianCurrency(t.paidAmount)}, Left: {formatIndianCurrency(leftAmt)})
                              </span>{' '}
                              &bull; <strong>Sittings: {t.completedSittings}/{t.totalSittings} ({leftSits} left)</strong>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="truncate max-w-xs block">{p.treatmentConcern}</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-slate-300 font-semibold text-amber-900">
                    📖 {p.paperRegisterCitation.volume}, {p.paperRegisterCitation.page} ({p.paperRegisterCitation.diaryType})
                  </td>
                  <td className="p-2 border-r border-slate-300 text-right font-bold">
                    {p.hasPendingBalance ? formatIndianCurrency(p.dueAmount) : '₹0 (Clear)'}
                  </td>
                  <td className="p-2 text-center text-slate-300 font-mono">
                    [ ______ ]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-ledger">
            <span>Verified against clinic physical logbooks</span>
            <span>Desk Terminal #01 (Reception Main)</span>
          </div>

        </div>

      </div>
    </div>
  );
};

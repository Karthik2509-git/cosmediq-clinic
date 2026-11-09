/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Building2, 
  Phone, 
  Printer, 
  BookOpen, 
  CheckCircle2, 
  Tv, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { ClosureDeal, formatIndianCurrency } from '../utils/clinicLogic';

interface CollectPaymentModalProps {
  deal: ClosureDeal | null;
  onClose: () => void;
  onConfirmPayment: (
    dealId: string,
    amount: number,
    paymentDetails: {
      method: 'UPI / QR' | 'Cash Desk' | 'POS Card' | 'Bank / NEFT';
      referenceNo: string;
      notes: string;
      staffName: string;
      thermalReceiptPrinted: boolean;
      paperLedgerUpdated: boolean;
    }
  ) => void;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  deal,
  onClose,
  onConfirmPayment,
}) => {
  if (!deal) return null;

  const due = deal.remainingBalanceDue;
  const [amountStr, setAmountStr] = useState<string>(due.toLocaleString('en-IN'));
  const [selectedMethod, setSelectedMethod] = useState<'UPI / QR' | 'Cash Desk' | 'POS Card' | 'Bank / NEFT'>('UPI / QR');
  const [refNo, setRefNo] = useState<string>(`UPI/HDFC/${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [notes, setNotes] = useState<string>('Staff collected before OT prep room admission');
  const [printReceipt, setPrintReceipt] = useState<boolean>(true);
  const [updatePaperBook, setUpdatePaperBook] = useState<boolean>(true);
  const [customerScreenActive, setCustomerScreenActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successRecorded, setSuccessRecorded] = useState<boolean>(false);

  const parsedAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;

  const handlePreset = (type: 'full' | 'half' | 'custom') => {
    if (type === 'full') {
      setAmountStr(due.toLocaleString('en-IN'));
    } else if (type === 'half') {
      const half = Math.round(due / 2);
      setAmountStr(half.toLocaleString('en-IN'));
    } else {
      setAmountStr('');
    }
  };

  const handleMethodChange = (mode: 'UPI / QR' | 'Cash Desk' | 'POS Card' | 'Bank / NEFT') => {
    setSelectedMethod(mode);
    if (mode === 'UPI / QR') {
      setRefNo(`UPI/HDFC/${Math.floor(100000000 + Math.random() * 900000000)}`);
    } else if (mode === 'POS Card') {
      setRefNo(`POS/CARD/${Math.floor(100000 + Math.random() * 900000)}`);
    } else if (mode === 'Cash Desk') {
      setRefNo(`CASH/DESK/00${Math.floor(100 + Math.random() * 900)}`);
    } else {
      setRefNo(`NEFT/SBIN/${Math.floor(1000000 + Math.random() * 9000000)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessRecorded(true);

      setTimeout(() => {
        onConfirmPayment(deal.id, parsedAmount, {
          method: selectedMethod,
          referenceNo: refNo,
          notes: notes,
          staffName: 'Priya S.',
          thermalReceiptPrinted: printReceipt,
          paperLedgerUpdated: updatePaperBook,
        });
        onClose();
      }, 900);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/40 animate-fade-in overflow-y-auto">
      
      {/* Modal Card Surface */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto transform transition-all animate-fade-in-up">
        
        {/* Top Modal Ribbon Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E1B4B] to-[#6366F1] text-white flex items-center justify-center shadow-md shadow-indigo-950/20">
              <CreditCard className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E1B4B] tracking-tight leading-tight">
                Collect Balance Payment
              </h2>
              <span className="text-xs font-ledger text-slate-500">
                Front Desk Billing Receipt Module
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[calc(88vh-130px)] overflow-y-auto">
          
          {/* Patient & Treatment Context Banner */}
          <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1E1B4B]">{deal.patientName}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-800 text-[11px] font-ledger font-medium">
                  #{deal.patientId}
                </span>
              </div>

              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 font-ledger">
                  <Phone className="w-3 h-3 text-slate-400" /> {deal.phone}
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  {deal.packageName}
                </span>
              </div>

              <div className="text-xs font-ledger text-slate-500 pt-0.5">
                Agreed Deal: <span className="text-[#1E1B4B] font-semibold">{formatIndianCurrency(deal.totalPrice)}</span>
                {' '}• Previously Paid:{' '}
                <span className="text-emerald-700 font-semibold">{formatIndianCurrency(deal.advancePaid)} (Advance)</span>
              </div>
            </div>

            {/* Outstanding Due Callout Box */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/90 border border-amber-300 rounded-xl p-3 sm:p-3.5 flex flex-col items-start sm:items-end justify-center min-w-[150px] shadow-xs">
              <span className="text-[10px] font-ledger uppercase tracking-wider text-amber-800 font-bold">
                Outstanding Due
              </span>
              <div className="text-2xl font-bold font-ledger text-amber-900 tracking-tight leading-none mt-1">
                {formatIndianCurrency(deal.remainingBalanceDue)}
              </div>
              <span className="text-[11px] font-ledger text-amber-800 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Mandatory before OT
              </span>
            </div>
          </div>

          {/* Individual Treatments Breakdown (If Deal has multiple treatments) */}
          {deal.treatments && deal.treatments.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1E1B4B] uppercase font-ledger">
                <span>Treatment Balances Breakdown ({deal.treatments.length} Items)</span>
                <span className="text-[11px] font-normal text-slate-500">Click &quot;Pay Balance&quot; to auto-fill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deal.treatments.map((t) => {
                  const rem = Math.max(0, t.closureAmount - t.paidAmount);
                  const isHair = t.category === 'hair';
                  const sittingsLeft = Math.max(0, t.totalSittings - t.completedSittings);
                  return (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                        isHair ? 'bg-indigo-50/40 border-indigo-200' : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900 gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isHair ? 'bg-indigo-100 text-indigo-900' : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {isHair ? '💇 Hair' : '✨ Skin'}
                          </span>
                          <span className="truncate">{t.treatmentName}</span>
                        </div>
                        {rem > 0 && (
                          <button
                            type="button"
                            onClick={() => setAmountStr(rem.toLocaleString('en-IN'))}
                            className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[10px] whitespace-nowrap cursor-pointer transition-colors"
                            title="Auto-fill this treatment's due amount"
                          >
                            Pay ₹{rem.toLocaleString('en-IN')}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-ledger text-slate-600">
                        <span>
                          Closure: {formatIndianCurrency(t.closureAmount)} &bull; Paid: {formatIndianCurrency(t.paidAmount)}
                        </span>
                        <span className={rem > 0 ? 'text-amber-900 font-bold' : 'text-emerald-700 font-semibold'}>
                          {rem > 0 ? `${formatIndianCurrency(rem)} Left` : 'Cleared'}
                        </span>
                      </div>
                      <div className="text-[10px] font-ledger text-slate-500">
                        Sittings: <strong>{t.completedSittings}</strong> of <strong>{t.totalSittings}</strong> appeared ({sittingsLeft} left)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Amount Input & Quick-Select Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="collect-amount" className="text-xs font-bold text-[#1E1B4B]">
                Amount Being Collected Today (₹) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-ledger text-slate-400">
                Clearance Target: {due > 0 ? `${Math.min(100, Math.round((parsedAmount / due) * 100))}%` : '100%'}
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-ledger text-lg font-bold text-slate-400">₹</span>
              <input
                id="collect-amount"
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full h-12 pl-9 pr-48 rounded-xl bg-white font-ledger text-xl font-bold text-[#1E1B4B] border border-slate-300 shadow-inner focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                required
              />

              {/* Amount Preset Chips */}
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePreset('full')}
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                    parsedAmount === due && due > 0
                      ? 'bg-[#6366F1] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Full ₹{Math.round(due / 1000)}k
                </button>

                <button
                  type="button"
                  onClick={() => handlePreset('half')}
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                    parsedAmount === Math.round(due / 2) && due > 0
                      ? 'bg-[#6366F1] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Half ₹{Math.round(due / 2000)}k
                </button>

                <button
                  type="button"
                  onClick={() => handlePreset('custom')}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold transition-all transform hover:-translate-y-0.5 bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {/* Select Payment Method Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1E1B4B]">
              Select Payment Method <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* UPI / QR */}
              <button
                type="button"
                onClick={() => handleMethodChange('UPI / QR')}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center transform hover:-translate-y-0.5 cursor-pointer ${
                  selectedMethod === 'UPI / QR'
                    ? 'border-[#6366F1] bg-indigo-50/70 text-[#1E1B4B] shadow-sm ring-2 ring-[#6366F1]/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${
                  selectedMethod === 'UPI / QR' ? 'bg-indigo-100 text-[#6366F1]' : 'bg-slate-100 text-slate-500'
                }`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">UPI / QR</span>
                <span className="text-[10px] font-ledger text-[#6366F1] font-medium mt-0.5">Instant Verify</span>
              </button>

              {/* Cash Desk */}
              <button
                type="button"
                onClick={() => handleMethodChange('Cash Desk')}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center transform hover:-translate-y-0.5 cursor-pointer ${
                  selectedMethod === 'Cash Desk'
                    ? 'border-[#6366F1] bg-indigo-50/70 text-[#1E1B4B] shadow-sm ring-2 ring-[#6366F1]/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${
                  selectedMethod === 'Cash Desk' ? 'bg-indigo-100 text-[#6366F1]' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Cash Desk</span>
                <span className="text-[10px] font-ledger text-slate-400 mt-0.5">Physical Safe</span>
              </button>

              {/* POS Card */}
              <button
                type="button"
                onClick={() => handleMethodChange('POS Card')}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center transform hover:-translate-y-0.5 cursor-pointer ${
                  selectedMethod === 'POS Card'
                    ? 'border-[#6366F1] bg-indigo-50/70 text-[#1E1B4B] shadow-sm ring-2 ring-[#6366F1]/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${
                  selectedMethod === 'POS Card' ? 'bg-indigo-100 text-[#6366F1]' : 'bg-slate-100 text-slate-500'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">POS Card</span>
                <span className="text-[10px] font-ledger text-slate-400 mt-0.5">Swipe / Tap</span>
              </button>

              {/* Bank / NEFT */}
              <button
                type="button"
                onClick={() => handleMethodChange('Bank / NEFT')}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center transform hover:-translate-y-0.5 cursor-pointer ${
                  selectedMethod === 'Bank / NEFT'
                    ? 'border-[#6366F1] bg-indigo-50/70 text-[#1E1B4B] shadow-sm ring-2 ring-[#6366F1]/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${
                  selectedMethod === 'Bank / NEFT' ? 'bg-indigo-100 text-[#6366F1]' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Bank / NEFT</span>
                <span className="text-[10px] font-ledger text-slate-400 mt-0.5">Direct Credit</span>
              </button>

            </div>
          </div>

          {/* Active QR Scan Helper Subpanel with Interactive Pulse and Scan Shimmer */}
          {selectedMethod === 'UPI / QR' && (
            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 bg-white p-2 rounded-xl shadow-xs border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                  {/* Scan Line Animation */}
                  <div className="absolute inset-x-0 h-1 qr-scanner-overlay animate-scan-line pointer-events-none"></div>
                  {/* Inline Clean QR Vector */}
                  <svg className="w-full h-full text-[#1E1B4B]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm3 8h1v2h-1v-2zm-3 2h2v1h-2v-1zm4 1h1v1h-1v-1zm-4 2h1v3h-1v-3zm3 0h3v1h-3v-1zm0 2h3v1h-3v-1zm-2-1h1v2h-1v-2z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E1B4B] flex items-center gap-1.5">
                    <span>Front Counter Dynamic QR Active</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Patient can scan using GPay, PhonePe, Paytm, or BHIM.
                  </div>
                  <div className="text-[11px] font-ledger text-[#6366F1] font-semibold mt-1">
                    cosmediq.clinic@hdfcbank
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCustomerScreenActive(!customerScreenActive)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold border shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                  customerScreenActive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-[#1E1B4B] border-indigo-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-[#6366F1]" />
                <span>{customerScreenActive ? 'Displaying on Screen ✓' : 'Display on Customer Screen'}</span>
              </button>
            </div>
          )}

          {/* Transaction Ref & Handover Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label htmlFor="txn-ref" className="text-xs font-bold text-[#1E1B4B]">
                Transaction / Bank Reference No. <span className="text-rose-500">*</span>
              </label>
              <input
                id="txn-ref"
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white font-ledger text-xs text-slate-800 border border-slate-300 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs transition-all"
                required
              />
              <span className="text-[11px] font-ledger text-slate-400">
                Verified against clinic bank account
              </span>
            </div>

            <div className="space-y-1">
              <label htmlFor="staff-handover" className="text-xs font-bold text-[#1E1B4B]">
                Counter Notes &amp; OT Handoff
              </label>
              <input
                id="staff-handover"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white text-xs text-slate-800 border border-slate-300 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs transition-all"
              />
              <span className="text-[11px] font-ledger text-slate-400">
                Transferred to Sister Shalini (OT Lead)
              </span>
            </div>
          </div>

          {/* Physical Register & Thermal Print Checkboxes */}
          <div className="pt-1 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all">
              <input
                type="checkbox"
                checked={printReceipt}
                onChange={(e) => setPrintReceipt(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#6366F1] focus:ring-[#6366F1]/30 accent-[#6366F1]"
              />
              <div>
                <span className="text-xs font-semibold text-[#1E1B4B] flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Print Official Thermal 3-Inch Patient Receipt
                </span>
                <span className="block text-[11px] text-slate-500 font-ledger">
                  Sends print command to Counter Thermal Printer #01 (Dual copy: 1 for patient, 1 for accounts stapler).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all">
              <input
                type="checkbox"
                checked={updatePaperBook}
                onChange={(e) => setUpdatePaperBook(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#6366F1] focus:ring-[#6366F1]/30 accent-[#6366F1]"
              />
              <div>
                <span className="text-xs font-semibold text-[#1E1B4B] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  Update Physical Paper Ledger Book
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-ledger font-bold text-[10px]">
                    {deal.paperCitation || 'Vol 1, Page 92'}
                  </span>
                </span>
                <span className="block text-[11px] text-slate-500 font-ledger">
                  Auto-generates printable entry slip for physical ledger audit stamp.
                </span>
              </div>
            </label>
          </div>

          {/* Modal Action Buttons Footer */}
          <div className="px-1 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 font-ledger text-xs">
              <ShieldCheck className="w-4 h-4 text-[#6366F1]" />
              <span>Logged by: Priya S. (Terminal #01)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || successRecorded}
                className={`h-10 px-5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer ${
                  successRecorded
                    ? 'bg-emerald-600 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-[#1E1B4B] via-[#262163] to-[#1E1B4B] hover:opacity-95 shadow-indigo-950/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-300" />
                    <span>Recording to Ledger...</span>
                  </>
                ) : successRecorded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Payment Settled ({formatIndianCurrency(parsedAmount)})!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-teal-300" />
                    <span>Confirm &amp; Record Payment ({formatIndianCurrency(parsedAmount)})</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

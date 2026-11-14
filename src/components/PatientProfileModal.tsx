/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  BookOpen, 
  CreditCard, 
  Calendar, 
  BadgeCheck, 
  Clock, 
  FileText,
  AlertTriangle,
  Send,
  Layers,
  CheckCircle2,
  Plus,
  Settings2,
  Sparkles,
  UserCheck,
  History
} from 'lucide-react';
import {
  Patient,
  TreatmentPlanItem,
  formatIndianCurrency,
  getTreatmentSittingsLeft,
  getTreatmentAmountLeft,
  formatBookingChannel,
  formatConsultationOutcome,
  formatFeeStatus,
} from '../utils/clinicLogic';

interface PatientProfileModalProps {
  patient: Patient | null;
  onClose: () => void;
  onRecordDeal: (patient: Patient) => void;
  onScheduleVisit: (patient: Patient) => void;
  onCollectBalance?: (patient: Patient) => void;
  onIncrementSitting?: (patientId: string, treatmentId: string) => void;
  onManageTreatments?: (patient: Patient) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patient,
  onClose,
  onRecordDeal,
  onScheduleVisit,
  onCollectBalance,
  onIncrementSitting,
  onManageTreatments,
}) => {
  if (!patient) return null;

  const treatments = patient.treatments || [];
  const hairTreatments = treatments.filter((t) => t.category === 'hair');
  const skinTreatments = treatments.filter((t) => t.category === 'skin' || t.category === 'laser');
  const hasTreatments = treatments.length > 0;

  const renderTreatmentCard = (treatment: TreatmentPlanItem) => {
    const isHair = treatment.category === 'hair';
    const sittingsLeft = getTreatmentSittingsLeft(treatment);
    const amountLeft = getTreatmentAmountLeft(treatment);
    const pct = treatment.totalSittings > 0
      ? Math.round((treatment.completedSittings / treatment.totalSittings) * 100)
      : 0;

    return (
      <div
        key={treatment.id}
        className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
          isHair
            ? 'bg-indigo-50/40 border-indigo-200/80 hover:border-indigo-300'
            : 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isHair
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                  : 'bg-rose-100 text-rose-900 border border-rose-200'
              }`}
            >
              {isHair ? '💇 Hair Treatment' : '✨ Skin Treatment'}
            </span>
            <span className="text-xs font-bold text-slate-900">{treatment.treatmentName}</span>
          </div>

          {onIncrementSitting && treatment.completedSittings < treatment.totalSittings && (
            <button
              type="button"
              onClick={() => onIncrementSitting(patient.id, treatment.id)}
              className="h-6 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>+1 Sitting Appeared</span>
            </button>
          )}
        </div>

        {/* 3 Metrics: Closure Amount, Amount Paid, Amount Left to Pay */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] font-ledger text-slate-400 block font-semibold">CLOSURE AMT</span>
            <span className="font-bold font-ledger text-slate-900">
              {formatIndianCurrency(treatment.closureAmount)}
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] font-ledger text-emerald-700 block font-semibold">PAID BY PATIENT</span>
            <span className="font-bold font-ledger text-emerald-800">
              {formatIndianCurrency(treatment.paidAmount)}
            </span>
          </div>

          <div
            className={`p-2 rounded-lg border ${
              amountLeft > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span className="text-[10px] font-ledger block font-semibold">AMOUNT LEFT TO PAY</span>
            <span className="font-bold font-ledger">
              {amountLeft > 0 ? formatIndianCurrency(amountLeft) : '₹0 (Clear)'}
            </span>
          </div>
        </div>

        {/* Sittings breakdown: Finalized, Appeared, Left */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-ledger text-slate-700">
            <span>
              Finalized: <strong>{treatment.totalSittings}</strong> | Appeared:{' '}
              <strong className="text-emerald-700">{treatment.completedSittings}</strong>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                sittingsLeft > 0
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {sittingsLeft > 0 ? `${sittingsLeft} Sittings Left` : 'All Done!'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pct === 100 ? 'bg-emerald-500' : isHair ? 'bg-indigo-600' : 'bg-rose-600'
              }`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
        </div>

        {/* Sittings & Therapist History Timeline */}
        {treatment.sittingHistory && treatment.sittingHistory.length > 0 ? (
          <div className="bg-white/90 rounded-lg p-2.5 border border-slate-200/90 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                Therapist Track Record ({treatment.sittingHistory.length} {treatment.sittingHistory.length === 1 ? 'Sitting' : 'Sittings'} Logged)
              </span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {treatment.sittingHistory.map((sit, idx) => (
                <div
                  key={sit.id || idx}
                  className="flex items-center justify-between bg-slate-50/80 px-2 py-1.5 rounded-md border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{sit.sittingNumber || idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-500">Therapist:</span>
                      <span className="font-bold text-indigo-950 px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-[11px]">
                        {sit.therapistName}
                      </span>
                      {sit.notes && (
                        <span className="text-[11px] text-slate-500 italic max-w-xs truncate">
                          “{sit.notes}”
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-ledger text-slate-400 whitespace-nowrap pl-2">
                    {sit.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : treatment.completedSittings > 0 ? (
          <div className="bg-amber-50/70 rounded-lg p-2 border border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between">
            <span>{treatment.completedSittings} of {treatment.totalSittings} sittings completed.</span>
          </div>
        ) : null}

        {treatment.notes && (
          <p className="text-[11px] font-ledger text-slate-500 italic">
            Notes: {treatment.notes}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/40 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1E1B4B] text-white flex items-center justify-center font-bold text-lg shadow-md">
              {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-ledger text-xs font-bold">
                  #{patient.id}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-ledger">
                {patient.age} yrs • {patient.gender} • Registered {patient.registeredDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onManageTreatments && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onManageTreatments(patient);
                }}
                className="h-8 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Manage Treatments</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Communication & Status Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-ledger text-xs font-bold text-slate-700">{patient.phone}</span>
              <a
                href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(patient.name)},%20greetings%20from%20COSMEDIQ%20Skin%20and%20Hair%20Clinic.`}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open WhatsApp Chat</span>
              </a>
            </div>

            <span className="text-xs font-semibold text-[#6366F1] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {patient.statusText}
            </span>
          </div>

          {/* Physical Diary Citation Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-lg">
                📖
              </div>
              <div>
                <span className="text-[11px] font-ledger uppercase tracking-wider text-amber-800 font-bold block">
                  Physical Register Binder Citation
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {patient.paperRegisterCitation.volume}, {patient.paperRegisterCitation.page}
                </span>
                <span className="text-xs text-amber-900 ml-2 font-medium">
                  ({patient.paperRegisterCitation.diaryType})
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-ledger text-xs font-bold border border-emerald-300">
              <BadgeCheck className="w-4 h-4 text-emerald-600" /> Hardcopy Verified
            </span>
          </div>

          {/* Consultation Outcome & Channel Info Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider font-ledger">
                OPD Consultation &amp; Inquiry Status
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Booking Channel */}
                {(() => {
                  const channel = formatBookingChannel(patient.bookingChannel);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${channel.badgeClass}`}>
                      <span>{channel.icon}</span>
                      <span>{channel.label}</span>
                    </span>
                  );
                })()}

                {/* Consultation Fee */}
                {patient.consultationFee && (() => {
                  const fee = formatFeeStatus(patient.consultationFee);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${fee.badgeClass}`}>
                      <CreditCard className="w-3 h-3" />
                      <span>{fee.label}</span>
                    </span>
                  );
                })()}

                {/* Consultation Outcome */}
                {(() => {
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

            {(patient.followUpDate || patient.outcomeNotes) && (
              <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1.5 text-xs text-slate-700">
                {patient.followUpDate && (
                  <div className="flex items-center gap-2 font-ledger">
                    <span className="font-semibold text-amber-800">📅 Follow-up Reminder:</span>
                    <span>{patient.followUpDate}</span>
                  </div>
                )}
                {patient.outcomeNotes && (
                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/70 italic">
                    "{patient.outcomeNotes}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Individual Treatments Breakdown (Hair & Skin Separated) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider font-ledger flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#6366F1]" />
                  Active Skin &amp; Hair Treatments ({treatments.length})
                </span>
                <span className="text-[11px] font-ledger text-slate-400">
                  Separately tracked closure amount, paid, left to pay &amp; sittings
                </span>
              </div>

              {onManageTreatments && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onManageTreatments(patient);
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add / Manage Treatments</span>
                </button>
              )}
            </div>

            {hasTreatments ? (
              <div className="space-y-4">
                {/* Hair Treatments Group */}
                {hairTreatments.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">💇</span>
                      <span className="text-xs font-bold text-indigo-950 uppercase font-ledger tracking-wide">
                        Hair Treatments ({hairTreatments.length})
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {hairTreatments.map(renderTreatmentCard)}
                    </div>
                  </div>
                )}

                {/* Skin Treatments Group */}
                {skinTreatments.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✨</span>
                      <span className="text-xs font-bold text-rose-950 uppercase font-ledger tracking-wide">
                        Skin Treatments ({skinTreatments.length})
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {skinTreatments.map(renderTreatmentCard)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <span className="text-xs font-bold text-[#1E1B4B] block">{patient.treatmentConcern}</span>
                <p className="text-xs text-slate-500 font-ledger">
                  No individual skin/hair treatments registered yet.
                </p>
                {onManageTreatments && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onManageTreatments(patient);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Skin or Hair Treatments</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Grand Financial Overview Cards */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider font-ledger">
              Combined Financial Ledger
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-ledger text-slate-400 block font-semibold">TOTAL AGREED</span>
                <span className="text-base font-bold font-ledger text-slate-900">
                  {formatIndianCurrency(patient.totalDealAmount)}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-ledger text-emerald-700 block font-semibold">PAID TO DATE</span>
                <span className="text-base font-bold font-ledger text-emerald-800">
                  {formatIndianCurrency(patient.paidAmount)}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                patient.hasPendingBalance
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <span className="text-[11px] font-ledger block font-semibold">BALANCE DUE</span>
                <span className="text-base font-bold font-ledger">
                  {patient.hasPendingBalance ? formatIndianCurrency(patient.dueAmount) : '₹0 (Clear)'}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Desk Notes */}
          {patient.notes && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Clinical Handover / Front-Desk Notes
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-ledger">
                {patient.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-400 font-ledger">
              COSMEDIQ Clinical Operating Environment
            </span>

            <div className="flex items-center gap-2">
              {onManageTreatments && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onManageTreatments(patient);
                  }}
                  className="h-9 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
                >
                  Manage Treatments
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScheduleVisit(patient);
                }}
                className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                + Schedule Visit
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordDeal(patient);
                }}
                className="h-9 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                + Record Package Closure
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};


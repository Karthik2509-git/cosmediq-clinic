/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  User,
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  Check,
  Building,
  ShieldCheck,
  Send
} from 'lucide-react';
import {
  Appointment,
  Patient,
  ConsultationOutcome,
  ConsultationFeeRecord,
  formatIndianCurrency,
  formatBookingChannel,
  formatConsultationOutcome,
  formatFeeStatus,
} from '../utils/clinicLogic';

interface ConsultationOutcomeModalProps {
  appointment: Appointment | null;
  patient?: Patient | null;
  onClose: () => void;
  onSaveOutcome: (
    appointmentId: string,
    patientId: string,
    outcome: ConsultationOutcome,
    feeUpdate?: ConsultationFeeRecord,
    notes?: string,
    followUpDate?: string
  ) => void;
  onOpenRecordClosure?: (patient: Patient) => void;
}

export const ConsultationOutcomeModal: React.FC<ConsultationOutcomeModalProps> = ({
  appointment,
  patient,
  onClose,
  onSaveOutcome,
  onOpenRecordClosure,
}) => {
  if (!appointment) return null;

  const currentOutcome: ConsultationOutcome =
    appointment.consultationOutcome || patient?.consultationOutcome || 'pending_consultation';

  const [selectedOutcome, setSelectedOutcome] = useState<ConsultationOutcome>(
    currentOutcome === 'pending_consultation' ? 'in_talks' : currentOutcome
  );

  const initialFee: ConsultationFeeRecord = appointment.consultationFee ||
    patient?.consultationFee || {
      amount: 500,
      status: 'paid_before',
      method: 'UPI / QR',
    };

  const [feeRecord, setFeeRecord] = useState<ConsultationFeeRecord>(initialFee);
  const [outcomeNotes, setOutcomeNotes] = useState<string>(
    appointment.outcomeNotes || patient?.outcomeNotes || ''
  );
  const [followUpDate, setFollowUpDate] = useState<string>(
    appointment.followUpDate || patient?.followUpDate || 'After 3 Days'
  );

  const channelMeta = formatBookingChannel(appointment.bookingChannel || patient?.bookingChannel);
  const feeMeta = formatFeeStatus(feeRecord);

  const handleSettleFee = (method: 'UPI / QR' | 'Cash Desk' | 'POS Card') => {
    setFeeRecord((prev) => ({
      ...prev,
      status: 'paid_after',
      method,
      paidAt: 'Just now (Post-Consult Desk)',
    }));
  };

  const handleWaiveFee = () => {
    setFeeRecord((prev) => ({
      ...prev,
      status: 'waived',
      amount: 0,
      method: 'Waived',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOutcome(
      appointment.id,
      appointment.patientId,
      selectedOutcome,
      feeRecord,
      outcomeNotes.trim(),
      selectedOutcome === 'in_talks' ? followUpDate : undefined
    );

    if (selectedOutcome === 'treatment_booked' && patient && onOpenRecordClosure) {
      onClose();
      onOpenRecordClosure(patient);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/50 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up">
        
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-teal-300 font-bold">
              🩺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Post-Consultation Patient Outcome</h2>
                <span className="px-2 py-0.5 rounded bg-white/20 text-white font-ledger text-xs font-bold">
                  #{appointment.patientId}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-ledger">
                Track treatment decision, doctor consultation fees &amp; permanent patient profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Patient Demographic & Inquiry Channel Context Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{appointment.patientName}</span>
                <span className="text-xs text-slate-500 font-ledger">{appointment.phone}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-ledger flex-wrap">
                <span>Doctor: <strong>{appointment.doctor}</strong></span>
                <span>•</span>
                <span>Time: <strong>{appointment.time} ({appointment.date})</strong></span>
              </div>
            </div>

            {/* Booking Channel Badge */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${channelMeta.badgeClass}`}>
                <span>{channelMeta.icon}</span>
                <span>Inquiry: {channelMeta.label}</span>
              </span>
            </div>
          </div>

          {/* Section 1: Doctor Consultation Fee Settlement */}
          <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 uppercase font-ledger tracking-wide flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>1. Doctor Consultation Fee (OPD Receipt)</span>
              </label>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${feeMeta.badgeClass}`}>
                {feeMeta.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Consultation Fee Amount (₹)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={feeRecord.amount}
                    onChange={(e) =>
                      setFeeRecord((prev) => ({
                        ...prev,
                        amount: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-24 h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-bold font-ledger text-slate-900"
                  />
                  <div className="flex items-center gap-1">
                    {[500, 800, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() =>
                          setFeeRecord((prev) => ({
                            ...prev,
                            amount: amt,
                          }))
                        }
                        className={`px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${
                          feeRecord.amount === amt
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fee Payment Status Stepper */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Payment Collection Status
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {feeRecord.status !== 'paid_before' && feeRecord.status !== 'paid_after' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSettleFee('UPI / QR')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
                      >
                        Collect UPI / QR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSettleFee('Cash Desk')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
                      >
                        Collect Cash
                      </button>
                      <button
                        type="button"
                        onClick={handleWaiveFee}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                      >
                        Waive Fee
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Fee Settled ({feeRecord.method})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFeeRecord((prev) => ({
                            ...prev,
                            status: 'pending',
                          }))
                        }
                        className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Post-Consultation Patient Outcome */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase font-ledger tracking-wide block">
                2. What did the patient decide after Doctor Consultation? *
              </label>
              <p className="text-[11px] text-slate-500 font-ledger mt-0.5">
                Select one outcome. This decision will be permanently attached to the patient&apos;s medical registry record.
              </p>
            </div>

            {/* 4 Outcome Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: Treatment Booked */}
              <div
                onClick={() => setSelectedOutcome('treatment_booked')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedOutcome === 'treatment_booked'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>🟢</span>
                      <span>Treatment Booked / Closed</span>
                    </span>
                    <input
                      type="radio"
                      checked={selectedOutcome === 'treatment_booked'}
                      onChange={() => setSelectedOutcome('treatment_booked')}
                      className="text-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 font-ledger mt-1">
                    Patient agreed to procedural package (FUE, PRP, HydraFacial, etc.).
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold text-emerald-800 uppercase font-ledger">
                  &rarr; Directly opens Package Closure &amp; Balances
                </span>
              </div>

              {/* Option 2: In Talks / Considering */}
              <div
                onClick={() => setSelectedOutcome('in_talks')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedOutcome === 'in_talks'
                    ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-amber-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>🟡</span>
                      <span>In Talks / Considering</span>
                    </span>
                    <input
                      type="radio"
                      checked={selectedOutcome === 'in_talks'}
                      onChange={() => setSelectedOutcome('in_talks')}
                      className="text-amber-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 font-ledger mt-1">
                    Interested in treatment, discussing budget/family. Follow-up required.
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold text-amber-800 uppercase font-ledger">
                  &bull; Flagged for front-desk follow-up reminder
                </span>
              </div>

              {/* Option 3: Medicines & Prescription Only */}
              <div
                onClick={() => setSelectedOutcome('medicines_only')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedOutcome === 'medicines_only'
                    ? 'border-sky-500 bg-sky-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-sky-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <span>🔵</span>
                      <span>Medicines &amp; Rx Only</span>
                    </span>
                    <input
                      type="radio"
                      checked={selectedOutcome === 'medicines_only'}
                      onChange={() => setSelectedOutcome('medicines_only')}
                      className="text-sky-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 font-ledger mt-1">
                    Prescribed medicines/lotions only. Did not opt for procedure.
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold text-sky-800 uppercase font-ledger">
                  &bull; Stored permanently in patient registry
                </span>
              </div>

              {/* Option 4: Refused / Not Interested */}
              <div
                onClick={() => setSelectedOutcome('refused_treatment')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedOutcome === 'refused_treatment'
                    ? 'border-rose-500 bg-rose-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-rose-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <span>🔴</span>
                      <span>Refused / Not Interested</span>
                    </span>
                    <input
                      type="radio"
                      checked={selectedOutcome === 'refused_treatment'}
                      onChange={() => setSelectedOutcome('refused_treatment')}
                      className="text-rose-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 font-ledger mt-1">
                    Consultation completed, declined procedure or not ready.
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold text-rose-800 uppercase font-ledger">
                  &bull; Profile preserved for future inquiries
                </span>
              </div>

            </div>
          </div>

          {/* Conditional Detail: Follow-up Date for "In Talks" */}
          {selectedOutcome === 'in_talks' && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <label className="text-xs font-bold text-amber-950 block">
                Next Follow-up Call / Message Date
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {['Tomorrow', 'After 3 Days', 'Next Monday', 'Next Weekend'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFollowUpDate(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      followUpDate === preset
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                <input
                  type="text"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  placeholder="Or enter custom date"
                  className="h-8 px-3 rounded-lg bg-white border border-amber-300 text-xs text-slate-800 font-ledger"
                />
              </div>
            </div>
          )}

          {/* Staff Consultation Notes */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Doctor Consultation Notes / Staff Summary
            </label>
            <textarea
              rows={2}
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder="e.g. Advised PRP 4 sessions. Patient checking with spouse regarding budget. Follow up via WhatsApp on Friday."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-ledger text-slate-800 focus:bg-white focus:border-indigo-500"
            ></textarea>
          </div>

          {/* Patient Registry Guarantee Banner */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs text-slate-600 font-ledger">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Permanent Record Guarantee:</strong> Regardless of outcome, {appointment.patientName}&apos;s profile, contact details, file number, and consultation fee will remain permanently in your clinic patient records.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 text-teal-300" />
              <span>
                {selectedOutcome === 'treatment_booked'
                  ? 'Save & Record Package Closure &rarr;'
                  : 'Save Outcome to Patient Records'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


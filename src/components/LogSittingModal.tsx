/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  History,
  AlertCircle
} from 'lucide-react';
import {
  TreatmentPlanItem,
  SittingRecord,
  CLINIC_THERAPIST_PRESETS,
  getTreatmentSittingsLeft
} from '../utils/clinicLogic';

interface LogSittingModalProps {
  patientName: string;
  patientId: string;
  treatment: TreatmentPlanItem | null;
  onClose: () => void;
  onConfirmSitting: (details: {
    therapistName: string;
    date: string;
    notes?: string;
  }) => void;
}

export const LogSittingModal: React.FC<LogSittingModalProps> = ({
  patientName,
  patientId,
  treatment,
  onClose,
  onConfirmSitting,
}) => {
  if (!treatment) return null;

  const currentSittings = treatment.completedSittings || 0;
  const nextSittingNumber = Math.min(treatment.totalSittings, currentSittings + 1);
  const isFinalSitting = nextSittingNumber === treatment.totalSittings;

  // Format default date and time
  const now = new Date();
  const defaultDateStr = `${now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}, ${now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const [therapistName, setTherapistName] = useState<string>('Priya S.');
  const [sittingDate, setSittingDate] = useState<string>(defaultDateStr);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const history: SittingRecord[] = treatment.sittingHistory || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!therapistName.trim()) {
      setError('Please select or enter the therapist name who conducted this sitting.');
      return;
    }
    setError('');
    onConfirmSitting({
      therapistName: therapistName.trim(),
      date: sittingDate.trim() || defaultDateStr,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-slate-900/40 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-emerald-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Log Completed Sitting
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-200">
                  Sitting #{nextSittingNumber} of {treatment.totalSittings}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-ledger">
                Record the therapist who performed this clinical session
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 cursor-pointer transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Patient & Treatment Context Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-ledger text-slate-400 uppercase tracking-wider block font-semibold">
                Patient & Treatment
              </span>
              <span className="text-sm font-bold text-slate-900">
                {patientName}
              </span>
              <span className="text-xs text-slate-500 font-ledger ml-2">
                ({patientId})
              </span>
              <p className="text-xs font-semibold text-indigo-900 mt-0.5">
                {treatment.treatmentName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-ledger text-slate-400 uppercase tracking-wider block font-semibold">
                Progress
              </span>
              <span className="text-xs font-bold font-ledger text-emerald-700">
                {nextSittingNumber} / {treatment.totalSittings} Done
              </span>
              {isFinalSitting && (
                <span className="block text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                  Final Sitting!
                </span>
              )}
            </div>
          </div>

          {/* Therapist Selection (Key Feature) */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Therapist Name <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Tap preset or type name
              </span>
            </label>

            {/* Quick 1-Click Preset Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {CLINIC_THERAPIST_PRESETS.map((preset) => {
                const isSelected = therapistName.trim() === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTherapistName(preset);
                      setError('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Custom Therapist Name Input */}
            <div className="relative pt-1">
              <input
                type="text"
                value={therapistName}
                onChange={(e) => {
                  setTherapistName(e.target.value);
                  setError('');
                }}
                placeholder="Enter therapist name..."
                required
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Date & Time Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Sitting Date & Time
            </label>
            <input
              type="text"
              value={sittingDate}
              onChange={(e) => setSittingDate(e.target.value)}
              placeholder="e.g. 14 Nov 2026, 04:30 PM"
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-ledger text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Clinical Procedure Notes (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Sitting / Procedure Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 4ml PRP injected in frontal hairline; tolerated well. Next visit in 3 weeks."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Previous Sittings History for this Treatment */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                <History className="w-3 h-3 text-slate-400" />
                Previous Sittings Track Record:
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 rounded-lg bg-slate-50/80 p-2 border border-slate-200 text-[11px]">
                {history.map((sit, idx) => (
                  <div
                    key={sit.id || idx}
                    className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                        Sitting #{sit.sittingNumber || idx + 1}
                      </span>
                      <span className="text-slate-600">
                        Therapist: <strong className="text-slate-900">{sit.therapistName}</strong>
                      </span>
                      {sit.notes && (
                        <span className="text-slate-400 italic truncate max-w-[140px]">
                          “{sit.notes}”
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-ledger">
                      {sit.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Log Sitting #{nextSittingNumber}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

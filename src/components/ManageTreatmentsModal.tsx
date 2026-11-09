/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scissors,
  Sparkle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  Patient,
  TreatmentPlanItem,
  formatIndianCurrency,
  getTreatmentSittingsLeft,
  getTreatmentAmountLeft,
  calculateTreatmentsSummary,
  calculateCategoryTreatmentsSummary,
  POPULAR_TREATMENT_PRESETS,
} from '../utils/clinicLogic';

interface ManageTreatmentsModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSaveTreatments: (patientId: string, updatedTreatments: TreatmentPlanItem[]) => void;
}

export const ManageTreatmentsModal: React.FC<ManageTreatmentsModalProps> = ({
  patient,
  onClose,
  onSaveTreatments,
}) => {
  if (!patient) return null;

  // Initialize treatments state from patient. If empty, provide a clean default item
  const initialTreatments: TreatmentPlanItem[] =
    patient.treatments && patient.treatments.length > 0
      ? patient.treatments.map((t) => ({ ...t }))
      : [
          {
            id: `TRT-${Date.now()}-1`,
            treatmentName: patient.treatmentConcern || 'PRP Hair Density Restoration (4 Sessions)',
            category: patient.concernCategory === 'acne' || patient.concernCategory === 'laser' ? 'skin' : 'hair',
            closureAmount: patient.totalDealAmount || 22000,
            paidAmount: patient.paidAmount || 0,
            remainingAmount: Math.max(0, (patient.totalDealAmount || 22000) - (patient.paidAmount || 0)),
            totalSittings: 4,
            completedSittings: 0,
          },
        ];

  const [treatments, setTreatments] = useState<TreatmentPlanItem[]>(initialTreatments);
  const [activeFilter, setActiveFilter] = useState<'all' | 'hair' | 'skin'>('all');
  const [showPresetInfo, setShowPresetInfo] = useState<boolean>(true);

  // Live summaries
  const hairSummary = calculateCategoryTreatmentsSummary(treatments, 'hair');
  const skinSummary = calculateCategoryTreatmentsSummary(treatments, 'skin');
  const overallSummary = calculateTreatmentsSummary(treatments);

  // Filtered treatments list
  const displayedTreatments = treatments.filter((t) => {
    if (activeFilter === 'hair') return t.category === 'hair';
    if (activeFilter === 'skin') return t.category === 'skin' || t.category === 'laser';
    return true;
  });

  // Handler to update fields of a treatment
  const handleUpdate = (id: string, updates: Partial<TreatmentPlanItem>) => {
    setTreatments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          const closure = Number(updated.closureAmount) || 0;
          const paid = Number(updated.paidAmount) || 0;
          updated.closureAmount = closure;
          updated.paidAmount = paid;
          updated.remainingAmount = Math.max(0, closure - paid);
          
          const totalSits = Number(updated.totalSittings) || 1;
          let compSits = Number(updated.completedSittings) || 0;
          if (compSits > totalSits) compSits = totalSits;
          if (compSits < 0) compSits = 0;
          updated.totalSittings = totalSits;
          updated.completedSittings = compSits;
          return updated;
        }
        return item;
      })
    );
  };

  // Add a new blank treatment of a specific category
  const handleAddNewTreatment = (category: 'hair' | 'skin') => {
    const isHair = category === 'hair';
    const newTrt: TreatmentPlanItem = {
      id: `TRT-${Date.now()}-${treatments.length + 1}`,
      treatmentName: isHair
        ? 'PRP Hair Density Restoration (4 Sessions)'
        : 'HydraFacial MD Deep Infusion (4 Sessions)',
      category,
      closureAmount: isHair ? 22000 : 16000,
      paidAmount: isHair ? 10000 : 8000,
      remainingAmount: isHair ? 12000 : 8000,
      totalSittings: 4,
      completedSittings: 0,
      notes: '',
    };
    setTreatments((prev) => [...prev, newTrt]);
    setActiveFilter(category);
  };

  // Add treatment from preset
  const handleAddPreset = (
    preset: { name: string; defaultPrice: number; defaultSittings: number },
    category: 'hair' | 'skin'
  ) => {
    const newTrt: TreatmentPlanItem = {
      id: `TRT-${Date.now()}-${treatments.length + 1}`,
      treatmentName: preset.name,
      category,
      closureAmount: preset.defaultPrice,
      paidAmount: Math.round(preset.defaultPrice * 0.4), // 40% suggested advance
      remainingAmount: Math.round(preset.defaultPrice * 0.6),
      totalSittings: preset.defaultSittings,
      completedSittings: 0,
      notes: '',
    };
    setTreatments((prev) => [...prev, newTrt]);
  };

  // Remove a treatment
  const handleRemove = (id: string) => {
    if (treatments.length <= 1) {
      alert('Patient must have at least one treatment. You can edit the existing treatment instead.');
      return;
    }
    setTreatments((prev) => prev.filter((t) => t.id !== id));
  };

  // Increment sittings appeared
  const handleIncrementSitting = (id: string) => {
    setTreatments((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = Math.min(t.totalSittings, t.completedSittings + 1);
          return { ...t, completedSittings: next };
        }
        return t;
      })
    );
  };

  // Decrement sittings appeared
  const handleDecrementSitting = (id: string) => {
    setTreatments((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const prevCount = Math.max(0, t.completedSittings - 1);
          return { ...t, completedSittings: prevCount };
        }
        return t;
      })
    );
  };

  // Quick mark fully paid for a treatment
  const handleMarkFullyPaid = (id: string) => {
    setTreatments((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            paidAmount: t.closureAmount,
            remainingAmount: 0,
          };
        }
        return t;
      })
    );
  };

  const handleSave = () => {
    onSaveTreatments(patient.id, treatments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md bg-slate-900/50 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-fade-in-up">
        
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300 font-bold text-lg shadow-inner">
              <Layers className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Manage Treatments for {patient.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-ledger text-xs font-bold">
                  #{patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-ledger">
                Easily manage multiple Hair &amp; Skin treatments, closure amounts, payments &amp; sittings for reception staff
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Patient Financials & Sittings Dashboard */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            
            {/* Total Closure Amount */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="font-ledger text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Closure (Agreed)
              </span>
              <span className="text-lg font-bold font-ledger text-slate-900 block mt-0.5">
                {formatIndianCurrency(overallSummary.totalClosure)}
              </span>
              <span className="text-[10px] text-slate-500 font-ledger">
                {treatments.length} total {treatments.length === 1 ? 'treatment' : 'treatments'}
              </span>
            </div>

            {/* Total Paid by Patient */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="font-ledger text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                Total Paid by Patient
              </span>
              <span className="text-lg font-bold font-ledger text-emerald-700 block mt-0.5">
                {formatIndianCurrency(overallSummary.totalPaid)}
              </span>
              <span className="text-[10px] text-emerald-600 font-ledger">
                Collected to date
              </span>
            </div>

            {/* Total Left to be Paid */}
            <div className={`p-3 rounded-xl border shadow-2xs ${
              overallSummary.totalRemaining > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <span className="font-ledger text-[10px] uppercase font-bold block tracking-wider">
                Amount Left to Pay
              </span>
              <span className="text-lg font-bold font-ledger block mt-0.5">
                {overallSummary.totalRemaining > 0
                  ? formatIndianCurrency(overallSummary.totalRemaining)
                  : '₹0 (Clear)'}
              </span>
              <span className="text-[10px] font-ledger opacity-85">
                {overallSummary.totalRemaining > 0 ? 'Pending collection' : 'Fully cleared!'}
              </span>
            </div>

            {/* Total Sittings Status */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="font-ledger text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">
                Sittings Status
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-ledger text-indigo-950">
                  {overallSummary.completedSittings} / {overallSummary.totalSittings}
                </span>
                <span className="text-[11px] font-ledger text-slate-500">Appeared</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 font-ledger">
                {overallSummary.sittingsLeft} Sittings Left
              </span>
            </div>

          </div>
        </div>

        {/* Action Controls & Category Tabs */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Treatments ({treatments.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('hair')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'hair'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-900 hover:bg-white/60'
              }`}
            >
              <span>💇 Hair Treatments</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {hairSummary.count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('skin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'skin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-900 hover:bg-white/60'
              }`}
            >
              <span>✨ Skin Treatments</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {skinSummary.count}
              </span>
            </button>
          </div>

          {/* Quick Add Buttons for Non-Technical Staff */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddNewTreatment('hair')}
              className="h-8 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Add Hair Treatment</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddNewTreatment('skin')}
              className="h-8 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>+ Add Skin Treatment</span>
            </button>
          </div>

        </div>

        {/* Scrollable Treatments Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick Staff Guidance Note */}
          {showPresetInfo && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2.5">
                <span className="text-base">💡</span>
                <div>
                  <span className="font-bold block">Front Desk Staff Quick Guide:</span>
                  <p className="mt-0.5 text-amber-800 leading-relaxed font-ledger text-[11px]">
                    You can manage both <strong>Hair</strong> and <strong>Skin</strong> treatments separately for this patient. Click <strong>&quot;+1 Appeared&quot;</strong> when the patient arrives for their session. The <strong>Amount Left to Pay</strong> and <strong>Sittings Left</strong> calculate automatically!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetInfo(false)}
                className="text-amber-600 hover:text-amber-800 p-1 cursor-pointer"
                title="Dismiss tip"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* List of Treatments */}
          {displayedTreatments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm font-bold text-slate-700">
                No {activeFilter === 'hair' ? 'Hair' : activeFilter === 'skin' ? 'Skin' : ''} treatments added yet
              </p>
              <p className="text-xs text-slate-400 font-ledger mt-1 mb-4">
                Click one of the buttons below to add a treatment for this patient
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAddNewTreatment('hair')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-indigo-700"
                >
                  + Add Hair Treatment
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNewTreatment('skin')}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-rose-700"
                >
                  + Add Skin Treatment
                </button>
              </div>
            </div>
          ) : (
            displayedTreatments.map((treatment, index) => {
              const isHair = treatment.category === 'hair';
              const sittingsLeft = getTreatmentSittingsLeft(treatment);
              const amountLeft = getTreatmentAmountLeft(treatment);
              const sittingsPercent =
                treatment.totalSittings > 0
                  ? Math.round((treatment.completedSittings / treatment.totalSittings) * 100)
                  : 0;

              return (
                <div
                  key={treatment.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs space-y-4 ${
                    isHair
                      ? 'border-indigo-200 bg-gradient-to-br from-white via-indigo-50/20 to-indigo-50/40 hover:border-indigo-300'
                      : 'border-rose-200 bg-gradient-to-br from-white via-rose-50/20 to-rose-50/40 hover:border-rose-300'
                  }`}
                >
                  {/* Treatment Card Top Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isHair
                          ? 'bg-indigo-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}>
                        {index + 1}
                      </span>

                      {/* Category Switcher */}
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleUpdate(treatment.id, { category: 'hair' })}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            treatment.category === 'hair'
                              ? 'bg-indigo-100 text-indigo-950 border border-indigo-200'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          💇 Hair
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate(treatment.id, { category: 'skin' })}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            treatment.category === 'skin'
                              ? 'bg-rose-100 text-rose-950 border border-rose-200'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          ✨ Skin
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-slate-500 font-ledger">
                        Treatment #{index + 1}
                      </span>
                    </div>

                    {/* Remove Action */}
                    {treatments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemove(treatment.id)}
                        className="text-slate-400 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                        title="Delete this treatment"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Treatment Name & Presets */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Treatment / Procedure Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={treatment.treatmentName}
                      onChange={(e) => handleUpdate(treatment.id, { treatmentName: e.target.value })}
                      placeholder="e.g. PRP Hair Density (4 Sessions) or HydraFacial MD"
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
                    />

                    {/* Quick 1-Click Preset Suggestions */}
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-0.5">
                      <span className="text-[10px] font-bold text-slate-400 font-ledger uppercase whitespace-nowrap">
                        1-Click Presets:
                      </span>
                      {(isHair ? POPULAR_TREATMENT_PRESETS.hair : POPULAR_TREATMENT_PRESETS.skin).map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            handleUpdate(treatment.id, {
                              treatmentName: preset.name,
                              closureAmount: preset.defaultPrice,
                              totalSittings: preset.defaultSittings,
                              remainingAmount: Math.max(0, preset.defaultPrice - treatment.paidAmount),
                            });
                          }}
                          className="px-2 py-0.5 rounded-full bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                        >
                          {preset.name.split('(')[0].trim()} ({formatIndianCurrency(preset.defaultPrice)})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section A: Financials (Closure, Paid, Amount Left to Pay) */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-ledger text-slate-400 block">
                      Financial Agreement &amp; Payments
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Closure Amount */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Closure Amount (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={treatment.closureAmount}
                          onChange={(e) =>
                            handleUpdate(treatment.id, { closureAmount: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold font-ledger text-slate-900 focus:bg-white focus:border-indigo-500"
                        />
                        <span className="text-[10px] text-slate-400 font-ledger mt-0.5 block">
                          Agreed package cost
                        </span>
                      </div>

                      {/* 2. Amount Paid by Patient */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-emerald-800 block">
                            Amount Paid (₹) *
                          </label>
                          {amountLeft > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMarkFullyPaid(treatment.id)}
                              className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                            >
                              + Mark Full
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={treatment.paidAmount}
                          onChange={(e) =>
                            handleUpdate(treatment.id, { paidAmount: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full h-9 px-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs font-bold font-ledger text-emerald-800 focus:bg-white focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-emerald-600 font-ledger mt-0.5 block">
                          Patient payment collected
                        </span>
                      </div>

                      {/* 3. Amount Left to be Paid (Auto-calculated) */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Amount Left to Pay (₹)
                        </label>
                        <div
                          className={`h-9 px-3 rounded-lg border flex items-center justify-between font-ledger font-bold text-xs ${
                            amountLeft > 0
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          <span>{amountLeft > 0 ? formatIndianCurrency(amountLeft) : '₹0'}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/70">
                            {amountLeft > 0 ? 'Pending' : 'Cleared'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-ledger mt-0.5 block">
                          Auto-calculated balance
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Sittings (Finalized, Appeared, Left) */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-ledger text-slate-400 block">
                      Sittings Schedule &amp; Attendance Tracking
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Sittings Finalized */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          No. of Sittings Finalized *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={treatment.totalSittings}
                          onChange={(e) =>
                            handleUpdate(treatment.id, { totalSittings: parseInt(e.target.value, 10) || 1 })
                          }
                          className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold font-ledger text-slate-900 focus:bg-white text-center"
                        />
                        <span className="text-[10px] text-slate-400 font-ledger mt-0.5 block text-center">
                          Total planned sessions
                        </span>
                      </div>

                      {/* Sittings Appeared with 1-Click Steppers */}
                      <div>
                        <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                          Sittings Appeared (Done)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={treatment.totalSittings}
                            value={treatment.completedSittings}
                            onChange={(e) =>
                              handleUpdate(treatment.id, { completedSittings: parseInt(e.target.value, 10) || 0 })
                            }
                            className="w-16 h-9 px-2 rounded-lg bg-indigo-50/60 border border-indigo-200 text-xs font-bold font-ledger text-indigo-950 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleIncrementSitting(treatment.id)}
                            disabled={treatment.completedSittings >= treatment.totalSittings}
                            className="flex-1 h-9 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs transition-all active:scale-95"
                            title="Log patient attended next sitting"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+1 Appeared</span>
                          </button>
                          {treatment.completedSittings > 0 && (
                            <button
                              type="button"
                              onClick={() => handleDecrementSitting(treatment.id)}
                              className="h-9 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer transition-colors"
                              title="Undo last attendance"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-indigo-600 font-ledger mt-0.5 block">
                          Patient visit attendance
                        </span>
                      </div>

                      {/* Sittings Left to Appear (Auto-calculated) */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          No. of Sittings Left
                        </label>
                        <div
                          className={`h-9 px-3 rounded-lg border flex items-center justify-between font-ledger font-bold text-xs ${
                            sittingsLeft > 0
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          <span>{sittingsLeft} Sittings Left</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/70">
                            {sittingsLeft > 0 ? `${sittingsPercent}% Done` : '100% Done'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-ledger mt-0.5 block">
                          Remaining visits to complete
                        </span>
                      </div>

                    </div>

                    {/* Visual Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-ledger text-slate-500 mb-1">
                        <span>
                          Attendance Progress: <strong>{treatment.completedSittings} of {treatment.totalSittings} sittings completed</strong>
                        </span>
                        <span className="font-bold text-slate-700">{sittingsPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            sittingsPercent === 100
                              ? 'bg-emerald-500'
                              : isHair
                              ? 'bg-indigo-600'
                              : 'bg-rose-600'
                          }`}
                          style={{ width: `${sittingsPercent}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}

          {/* Quick Add Preset Shelves at Bottom */}
          <div className="pt-2 space-y-3">
            <span className="text-xs font-bold text-slate-700 block font-ledger uppercase tracking-wider">
              1-Click Add Popular Clinic Treatments:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Hair Presets Shelf */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>💇</span>
                  <span>Popular Hair Treatments</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TREATMENT_PRESETS.hair.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPreset(preset, 'hair')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-600 text-slate-700 hover:text-white border border-indigo-200 text-xs font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      + {preset.name.split('(')[0].trim()} ({formatIndianCurrency(preset.defaultPrice)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Presets Shelf */}
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Popular Skin Treatments</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TREATMENT_PRESETS.skin.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPreset(preset, 'skin')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-600 text-slate-700 hover:text-white border border-rose-200 text-xs font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      + {preset.name.split('(')[0].trim()} ({formatIndianCurrency(preset.defaultPrice)})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer with Save CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-ledger text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All financial dues and sittings left will synchronize to the patient&apos;s record &amp; ledger.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Treatments &amp; Update Ledger</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


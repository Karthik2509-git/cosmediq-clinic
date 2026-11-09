/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Plus, 
  Trash2, 
  User, 
  CheckCircle2, 
  Layers, 
  Calendar,
  AlertCircle,
  Scissors,
  Sparkle,
  RotateCcw
} from 'lucide-react';
import { 
  Patient, 
  ClosureDeal, 
  TreatmentPlanItem, 
  formatIndianCurrency,
  POPULAR_TREATMENT_PRESETS,
  getTreatmentSittingsLeft,
  getTreatmentAmountLeft
} from '../utils/clinicLogic';

interface RecordClosureModalProps {
  patients: Patient[];
  preselectedPatient?: Patient | null;
  onClose: () => void;
  onAddClosureDeal: (
    deal: Omit<ClosureDeal, 'id' | 'payments'>,
    initialPayment?: number,
    newPatientData?: Omit<Patient, 'id' | 'registeredDate'>
  ) => void;
}

interface TreatmentFormState {
  id: string;
  treatmentName: string;
  category: 'hair' | 'skin' | 'laser' | 'general';
  closureAmount: number;
  paidAmount: number;
  totalSittings: number;
  completedSittings: number;
  notes: string;
}

const POPULAR_TREATMENTS = {
  hair: [
    { name: 'FUE Hair Transplant (2,500 Grafts)', defaultPrice: 65000, defaultSittings: 1 },
    { name: 'Sapphire FUE Hairline Restoration (3,000 Grafts)', defaultPrice: 85000, defaultSittings: 1 },
    { name: 'PRP Hair Density Restoration (4 Sessions)', defaultPrice: 22000, defaultSittings: 4 },
    { name: 'GFC (Growth Factor Concentrate) Therapy (6 Sessions)', defaultPrice: 28000, defaultSittings: 6 },
    { name: 'Beard Reconstruction FUE (1,200 Grafts)', defaultPrice: 45000, defaultSittings: 1 },
    { name: 'Scalp Micropigmentation (SMP — 3 Sessions)', defaultPrice: 30000, defaultSittings: 3 },
  ],
  skin: [
    { name: 'Carbon Laser Hollywood Peel (4 Sessions)', defaultPrice: 12000, defaultSittings: 4 },
    { name: 'Acne Scars 18G Subcision + Cross (3 Sittings)', defaultPrice: 18000, defaultSittings: 3 },
    { name: 'TCA Cross & Salicylic Peeling (4 Sittings)', defaultPrice: 14000, defaultSittings: 4 },
    { name: 'HydraFacial MD Deep Infusion (4 Sessions)', defaultPrice: 16000, defaultSittings: 4 },
    { name: 'Microneedling / Dermapen RF (4 Sessions)', defaultPrice: 20000, defaultSittings: 4 },
    { name: 'Fractional CO2 Laser Resurfacing (3 Sessions)', defaultPrice: 24000, defaultSittings: 3 },
    { name: 'Glutathione Skin Brightening Cycle (6 Sessions)', defaultPrice: 24000, defaultSittings: 6 },
  ],
  laser: [
    { name: 'Laser Hair Reduction — Full Face & Neck (6 Sittings)', defaultPrice: 18000, defaultSittings: 6 },
    { name: 'Laser Hair Reduction — Full Body (6 Sittings)', defaultPrice: 45000, defaultSittings: 6 },
    { name: 'Underarms & Bikini Diode Laser (6 Sittings)', defaultPrice: 15000, defaultSittings: 6 },
  ],
};

export const RecordClosureModal: React.FC<RecordClosureModalProps> = ({
  patients,
  preselectedPatient,
  onClose,
  onAddClosureDeal,
}) => {
  // Patient mode: select existing vs enter new patient
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>(
    preselectedPatient ? 'existing' : 'existing'
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient ? preselectedPatient.id : (patients[0]?.id || '')
  );

  // New patient state (if walk-in)
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('+91 ');
  const [newAge, setNewAge] = useState<number>(30);
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // Treatments array: supports multiple skin or hair treatments
  const [treatments, setTreatments] = useState<TreatmentFormState[]>([
    {
      id: 'TRT-1',
      treatmentName: 'FUE Hair Transplant (2,500 Grafts)',
      category: 'hair',
      closureAmount: 65000,
      paidAmount: 25000,
      totalSittings: 1,
      completedSittings: 0,
      notes: 'OT-1 planned. Scalp density assessment completed.',
    },
  ]);

  // Overall metadata
  const [otSlot, setOtSlot] = useState<string>('Tomorrow 10:00 AM (OT-1)');
  const [isSurgical, setIsSurgical] = useState<boolean>(true);
  const [paperCitation, setPaperCitation] = useState<string>('Vol. 2, Page 20 • Blue Spiral Diary');
  const [paymentMode, setPaymentMode] = useState<'UPI / QR' | 'Cash Desk' | 'POS Card' | 'Bank / NEFT'>('UPI / QR');

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Financial aggregates calculated live
  const totalClosureAmount = treatments.reduce((sum, t) => sum + (Number(t.closureAmount) || 0), 0);
  const totalAdvancePaid = treatments.reduce((sum, t) => sum + (Number(t.paidAmount) || 0), 0);
  const totalBalanceDue = Math.max(0, totalClosureAmount - totalAdvancePaid);
  const totalSittingsCount = treatments.reduce((sum, t) => sum + (Number(t.totalSittings) || 0), 0);
  const completedSittingsCount = treatments.reduce((sum, t) => sum + (Number(t.completedSittings) || 0), 0);

  // Treatment handlers
  const handleAddTreatment = (category: 'hair' | 'skin' = 'skin') => {
    const newIdx = treatments.length + 1;
    const isHair = category === 'hair';
    setTreatments((prev) => [
      ...prev,
      {
        id: `TRT-${Date.now()}-${newIdx}`,
        treatmentName: isHair
          ? 'PRP Hair Density Restoration (4 Sessions)'
          : 'Carbon Laser Hollywood Peel (4 Sessions)',
        category,
        closureAmount: isHair ? 22000 : 14000,
        paidAmount: isHair ? 10000 : 5000,
        totalSittings: 4,
        completedSittings: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveTreatment = (id: string) => {
    if (treatments.length <= 1) return;
    setTreatments((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTreatment = (id: string, updates: Partial<TreatmentFormState>) => {
    setTreatments((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          // Ensure completedSittings doesn't exceed totalSittings
          if (updated.completedSittings > updated.totalSittings) {
            updated.completedSittings = updated.totalSittings;
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleSelectPreset = (
    id: string,
    preset: { name: string; defaultPrice: number; defaultSittings: number },
    category: 'hair' | 'skin' | 'laser' | 'general'
  ) => {
    handleUpdateTreatment(id, {
      treatmentName: preset.name,
      category,
      closureAmount: preset.defaultPrice,
      paidAmount: Math.round(preset.defaultPrice * 0.4), // suggest 40% advance
      totalSittings: preset.defaultSittings,
      completedSittings: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetPatientId = selectedPatientId;
    let targetPatientName = selectedPatient?.name || 'Walk-in Patient';
    let targetPhone = selectedPatient?.phone || newPhone;
    let newPatientData: Omit<Patient, 'id' | 'registeredDate'> | undefined = undefined;

    if (patientMode === 'new') {
      if (!newName.trim()) return;
      targetPatientName = newName.trim();
      targetPhone = newPhone.trim();

      newPatientData = {
        name: targetPatientName,
        phone: targetPhone,
        age: Number(newAge) || 30,
        gender: newGender,
        treatmentConcern: treatments.map((t) => t.treatmentName).join(' + '),
        concernCategory: treatments.some((t) => t.category === 'hair') ? 'fue' : 'acne',
        paperRegisterCitation: {
          volume: 'Vol 2',
          page: 'Page ' + Math.floor(10 + Math.random() * 80),
          diaryType: 'Blue Spiral Diary',
          isVerified: true,
        },
        statusText: totalBalanceDue === 0 ? 'Deal Closed & Cleared' : 'Deal Closed — Pending Balance',
        statusType: totalBalanceDue === 0 ? 'completed' : 'pending',
        totalDealAmount: totalClosureAmount,
        paidAmount: totalAdvancePaid,
        dueAmount: totalBalanceDue,
        hasPendingBalance: totalBalanceDue > 0,
        notes: `Recorded at doctor closure desk: ${treatments.length} treatments agreed.`,
      };
    }

    // Prepare structured TreatmentPlanItem[]
    const treatmentPlanItems: TreatmentPlanItem[] = treatments.map((t) => {
      const closure = Number(t.closureAmount) || 0;
      const paid = Number(t.paidAmount) || 0;
      return {
        id: t.id,
        treatmentName: t.treatmentName.trim() || 'Custom Treatment',
        category: t.category,
        closureAmount: closure,
        paidAmount: paid,
        remainingAmount: Math.max(0, closure - paid),
        totalSittings: Number(t.totalSittings) || 1,
        completedSittings: Number(t.completedSittings) || 0,
        notes: t.notes.trim(),
      };
    });

    const packageSummaryName = treatments.length > 1
      ? `Combo: ${treatments.map((t) => t.treatmentName.split('(')[0].trim()).join(' + ')}`
      : treatments[0]?.treatmentName || 'Clinical Treatment Package';

    onAddClosureDeal(
      {
        patientId: targetPatientId,
        patientName: targetPatientName,
        phone: targetPhone,
        packageName: packageSummaryName,
        treatments: treatmentPlanItems,
        totalPrice: totalClosureAmount,
        advancePaid: totalAdvancePaid,
        remainingBalanceDue: totalBalanceDue,
        statusBadge: totalBalanceDue === 0 ? 'Fully Cleared' : (isSurgical ? 'OT Gate Block' : 'Installment Due'),
        statusType: totalBalanceDue === 0 ? 'cleared' : (isSurgical ? 'ot_block' : 'due'),
        closureDate: 'Today',
        otSlot,
        isSurgical,
        paperCitation,
      },
      totalAdvancePaid > 0 ? totalAdvancePaid : undefined,
      newPatientData
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/50 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-b border-amber-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">Record Doctor Treatment Closure</h2>
              <span className="text-xs font-ledger text-amber-800/90">
                Patient Details, Multi-Treatment Breakdown, Sittings &amp; Balances
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* Section 1: Patient Selection or Walk-in Registration */}
          <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 font-ledger">
                <User className="w-4 h-4 text-[#6366F1]" />
                <span>1. Patient Details</span>
              </label>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPatientMode('existing')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    patientMode === 'existing'
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Existing Registered
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('new')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    patientMode === 'new'
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + New Walk-in Patient
                </button>
              </div>
            </div>

            {patientMode === 'existing' ? (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Select Existing Patient from Registry *
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.id}) — {p.phone} • {p.treatmentConcern}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <div className="mt-2 text-[11px] font-ledger text-slate-500 flex items-center gap-3">
                    <span>Age: {selectedPatient.age} yrs • {selectedPatient.gender}</span>
                    <span>•</span>
                    <span>Paper Citation: {selectedPatient.paperRegisterCitation.volume}, {selectedPatient.paperRegisterCitation.page}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mobile No. *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98201 00000"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-ledger"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Age &amp; Gender *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={newAge}
                      min="1"
                      max="120"
                      onChange={(e) => setNewAge(parseInt(e.target.value, 10) || 25)}
                      className="w-16 h-9 px-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                    />
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="flex-1 h-9 px-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                    >
                      <option value="Male">M</option>
                      <option value="Female">F</option>
                      <option value="Other">O</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Multiple Skin / Hair Treatments Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 font-ledger">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>2. Agreed Treatments Breakdown ({treatments.length})</span>
                </label>
                <p className="text-[11px] text-slate-500 font-ledger mt-0.5">
                  Enter closure amount, advance paid, total sittings and completed sittings for each skin or hair treatment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddTreatment('hair')}
                  className="h-8 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Add Hair Treatment</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTreatment('skin')}
                  className="h-8 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-600" />
                  <span>+ Add Skin Treatment</span>
                </button>
              </div>
            </div>

            {/* Treatment Cards List */}
            <div className="space-y-4">
              {treatments.map((treatment, index) => {
                const treatmentBalance = Math.max(0, treatment.closureAmount - treatment.paidAmount);
                const sittingsLeft = Math.max(0, treatment.totalSittings - treatment.completedSittings);
                const isHair = treatment.category === 'hair';
                const sittingsPercent = treatment.totalSittings > 0 
                  ? Math.round((treatment.completedSittings / treatment.totalSittings) * 100) 
                  : 0;

                return (
                  <div
                    key={treatment.id}
                    className={`p-4 rounded-xl border bg-white shadow-xs space-y-3.5 relative transition-all duration-200 hover:shadow-sm ${
                      isHair ? 'border-indigo-200 hover:border-indigo-400' : 'border-rose-200 hover:border-rose-400'
                    }`}
                  >
                    {/* Treatment Card Top Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center font-ledger ${
                          isHair ? 'bg-indigo-700' : 'bg-rose-700'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Treatment #{index + 1}
                        </span>
                        
                        {/* Category Selector Tabs */}
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateTreatment(treatment.id, { category: 'hair' })}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                              treatment.category === 'hair'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            💇 Hair
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateTreatment(treatment.id, { category: 'skin' })}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                              treatment.category === 'skin'
                                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            ✨ Skin
                          </button>
                        </div>
                      </div>

                      {/* Remove Button (if more than 1) */}
                      {treatments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTreatment(treatment.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                          title="Remove treatment"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Preset Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Treatment Name / Procedure Description *
                        </label>
                        <span className="text-[10px] font-ledger text-slate-400">
                          Quick Presets available below
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={treatment.treatmentName}
                        onChange={(e) => handleUpdateTreatment(treatment.id, { treatmentName: e.target.value })}
                        placeholder="e.g. PRP Hair Density (4 Sessions) or HydraFacial MD"
                        className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#6366F1]"
                      />

                      {/* Quick Presets Pills */}
                      <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto scrollbar-none py-0.5">
                        <span className="text-[10px] text-slate-400 font-ledger whitespace-nowrap font-bold">Presets:</span>
                        {(treatment.category === 'hair'
                          ? POPULAR_TREATMENT_PRESETS.hair
                          : POPULAR_TREATMENT_PRESETS.skin
                        ).map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleSelectPreset(treatment.id, preset, treatment.category)}
                            className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                          >
                            {preset.name.split('(')[0].trim()} ({formatIndianCurrency(preset.defaultPrice)})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Financials & Sittings Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {/* 1. Closure Amount */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Closure Amount (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={treatment.closureAmount}
                          onChange={(e) => handleUpdateTreatment(treatment.id, { closureAmount: parseInt(e.target.value, 10) || 0 })}
                          className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-ledger font-bold text-slate-900 focus:bg-white"
                        />
                      </div>

                      {/* 2. Paid Amount */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Paid by Patient (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={treatment.paidAmount}
                          onChange={(e) => handleUpdateTreatment(treatment.id, { paidAmount: parseInt(e.target.value, 10) || 0 })}
                          className="w-full h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-ledger font-bold text-emerald-700 focus:bg-white"
                        />
                      </div>

                      {/* 3. Remaining Amount (Auto-Calculated) */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Amount Left to Pay (₹)
                        </label>
                        <div className={`h-9 px-2.5 rounded-lg border flex items-center font-ledger font-bold text-xs ${
                          treatmentBalance > 0
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}>
                          {formatIndianCurrency(treatmentBalance)}
                        </div>
                      </div>

                      {/* 4. Sittings Progress & Count */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Sittings (Done / Total) *
                          </label>
                          <span className={`text-[10px] font-bold ${sittingsLeft > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {sittingsLeft > 0 ? `${sittingsLeft} Left` : 'Done'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={treatment.totalSittings}
                            value={treatment.completedSittings}
                            onChange={(e) => handleUpdateTreatment(treatment.id, { completedSittings: parseInt(e.target.value, 10) || 0 })}
                            className="w-14 h-9 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-ledger font-bold text-center text-slate-800"
                            title="Completed / Appeared Sittings"
                          />
                          <span className="text-slate-400 font-bold text-xs">/</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={treatment.totalSittings}
                            onChange={(e) => handleUpdateTreatment(treatment.id, { totalSittings: parseInt(e.target.value, 10) || 1 })}
                            className="w-14 h-9 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-ledger font-bold text-center text-slate-800"
                            title="Total Sittings Finalized"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Micro Sittings Progress Bar Indicator */}
                    <div className="pt-1 flex items-center justify-between text-[11px] font-ledger text-slate-500">
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              sittingsPercent === 100 ? 'bg-emerald-500' : isHair ? 'bg-indigo-600' : 'bg-rose-600'
                            }`}
                            style={{ width: `${sittingsPercent}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-slate-700 whitespace-nowrap">
                          {treatment.completedSittings} of {treatment.totalSittings} sittings appeared &bull;{' '}
                          <strong className={sittingsLeft > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                            {sittingsLeft} Left to Attend
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateTreatment(treatment.id, {
                            completedSittings: Math.min(treatment.totalSittings, treatment.completedSittings + 1),
                          })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 cursor-pointer active:scale-95"
                        >
                          +1 Appeared
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Add Another Treatment CTA */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleAddTreatment('hair')}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>+ Add Hair Treatment</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddTreatment('skin')}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-rose-600" />
                <span>+ Add Skin Treatment</span>
              </button>
            </div>
          </div>

          {/* Section 3: Grand Total Financial Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-amber-100/60 border border-amber-300/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-amber-200/80 pb-2">
              <span className="text-xs font-bold text-amber-950 uppercase font-ledger tracking-wider">
                Total Closure Agreement Summary
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-ledger text-[11px] font-bold shadow-2xs">
                {treatments.length} {treatments.length === 1 ? 'Treatment' : 'Treatments'} • {totalSittingsCount} Total Sittings
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                <span className="text-[10px] font-ledger text-slate-500 block uppercase font-bold">
                  Total Closure Amount
                </span>
                <span className="text-lg sm:text-xl font-bold font-ledger text-slate-900">
                  {formatIndianCurrency(totalClosureAmount)}
                </span>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                <span className="text-[10px] font-ledger text-emerald-700 block uppercase font-bold">
                  Advance Paid Today
                </span>
                <span className="text-lg sm:text-xl font-bold font-ledger text-emerald-800">
                  {formatIndianCurrency(totalAdvancePaid)}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                totalBalanceDue > 0
                  ? 'bg-amber-100/90 border-amber-400 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <span className="text-[10px] font-ledger block uppercase font-bold">
                  Calculated Due Balance
                </span>
                <span className="text-lg sm:text-xl font-bold font-ledger">
                  {formatIndianCurrency(totalBalanceDue)}
                </span>
              </div>
            </div>

            {totalBalanceDue > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-900 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  Remaining balance of <strong>{formatIndianCurrency(totalBalanceDue)}</strong> will be tracked for collection on subsequent sittings.
                </span>
              </div>
            )}
          </div>

          {/* Section 4: Schedule, OT & Physical Register Citation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                OT Slot / Sitting Schedule
              </label>
              <input
                type="text"
                value={otSlot}
                onChange={(e) => setOtSlot(e.target.value)}
                placeholder="Tomorrow 10:00 AM (OT-1)"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#6366F1]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Physical Paper Register Citation
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={paperCitation}
                  onChange={(e) => setPaperCitation(e.target.value)}
                  placeholder="Vol. 2, Page 20 • Blue Spiral Diary"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-ledger focus:bg-white focus:border-[#6366F1]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isSurgical}
                onChange={(e) => setIsSurgical(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
              />
              <span className="font-semibold">Contains Surgical Procedure (Requires OT Prep &amp; Consent)</span>
            </label>

            {totalAdvancePaid > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-600 font-ledger">
                <span>Advance Mode:</span>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="h-8 px-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <option value="UPI / QR">UPI / QR</option>
                  <option value="Cash Desk">Cash Desk</option>
                  <option value="POS Card">POS Card</option>
                  <option value="Bank / NEFT">Bank / NEFT</option>
                </select>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Log {treatments.length} Treatment {treatments.length === 1 ? 'Closure' : 'Closures'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

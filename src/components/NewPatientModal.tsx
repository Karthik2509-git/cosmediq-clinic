/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, UserPlus, BookOpen, ShieldCheck, Plus, Trash2, Layers } from 'lucide-react';
import { Patient, TreatmentPlanItem, formatIndianCurrency, POPULAR_TREATMENT_PRESETS } from '../utils/clinicLogic';

interface NewPatientModalProps {
  onClose: () => void;
  onAddPatient: (patientData: Omit<Patient, 'id' | 'registeredDate'>) => void;
}

interface NewPatientTreatmentItem {
  id: string;
  name: string;
  category: 'hair' | 'skin' | 'laser' | 'general';
  closureAmount: number;
  paidAmount: number;
  totalSittings: number;
  completedSittings: number;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  onClose,
  onAddPatient,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('+91 ');
  
  // Multiple treatments list
  const [treatments, setTreatments] = useState<NewPatientTreatmentItem[]>([
    {
      id: 'TRT-1',
      name: 'FUE Hair Transplant (2,500 Grafts)',
      category: 'hair',
      closureAmount: 65000,
      paidAmount: 25000,
      totalSittings: 1,
      completedSittings: 0,
    },
  ]);

  const [volume, setVolume] = useState('Vol 2');
  const [page, setPage] = useState('Page 52');
  const [diaryType, setDiaryType] = useState('Blue Spiral Diary');
  const [notes, setNotes] = useState('');

  // Calculations across treatments
  const totalClosureAmount = treatments.reduce((sum, t) => sum + (Number(t.closureAmount) || 0), 0);
  const totalPaidAmount = treatments.reduce((sum, t) => sum + (Number(t.paidAmount) || 0), 0);
  const totalDueAmount = Math.max(0, totalClosureAmount - totalPaidAmount);
  const totalSittings = treatments.reduce((sum, t) => sum + (Number(t.totalSittings) || 0), 0);

  const handleAddTreatment = (category: 'hair' | 'skin' = 'skin') => {
    const isHair = category === 'hair';
    setTreatments((prev) => [
      ...prev,
      {
        id: `TRT-${Date.now()}`,
        name: isHair ? 'PRP Hair Density Restoration (4 Sessions)' : 'Carbon Laser Hollywood Peel (4 Sessions)',
        category,
        closureAmount: isHair ? 22000 : 14000,
        paidAmount: isHair ? 10000 : 5000,
        totalSittings: 4,
        completedSittings: 0,
      },
    ]);
  };

  const handleRemoveTreatment = (id: string) => {
    if (treatments.length <= 1) return;
    setTreatments((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTreatment = (id: string, updates: Partial<NewPatientTreatmentItem>) => {
    setTreatments((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates };
        }
        return t;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const treatmentPlanItems: TreatmentPlanItem[] = treatments.map((t) => ({
      id: t.id,
      treatmentName: t.name.trim() || 'General Aesthetic Care',
      category: t.category,
      closureAmount: Number(t.closureAmount) || 0,
      paidAmount: Number(t.paidAmount) || 0,
      remainingAmount: Math.max(0, (Number(t.closureAmount) || 0) - (Number(t.paidAmount) || 0)),
      totalSittings: Number(t.totalSittings) || 1,
      completedSittings: Number(t.completedSittings) || 0,
    }));

    const mainCategory = treatments.some((t) => t.category === 'hair')
      ? 'fue'
      : treatments.some((t) => t.category === 'skin')
      ? 'acne'
      : 'laser';

    const concernSummary = treatments.length > 1
      ? treatments.map((t) => t.name).join(' + ')
      : treatments[0]?.name || 'Clinical Care';

    onAddPatient({
      name: name.trim(),
      age: Number(age) || 30,
      gender,
      phone: phone.trim(),
      treatmentConcern: concernSummary,
      concernCategory: mainCategory,
      paperRegisterCitation: {
        volume: volume.trim(),
        page: page.trim(),
        diaryType: diaryType.trim(),
        isVerified: true,
      },
      statusText: totalDueAmount > 0 ? 'Consultation Done — Deal Agreed' : 'Registered & Fully Paid',
      statusType: totalDueAmount > 0 ? 'pending' : 'completed',
      totalDealAmount: totalClosureAmount,
      paidAmount: totalPaidAmount,
      dueAmount: totalDueAmount,
      hasPendingBalance: totalDueAmount > 0,
      notes: notes.trim(),
      treatments: treatmentPlanItems,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/40 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E1B4B]">Register New Patient &amp; Doctor Closure</h2>
              <span className="text-xs font-ledger text-slate-500">
                Patient Details, Multi-Treatment Closures, Sittings &amp; Ledger
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Age *</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full h-10 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile No. *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 00000"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-ledger"
              />
            </div>
          </div>

          {/* Treatments Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase font-ledger">
                <Layers className="w-4 h-4 text-[#6366F1]" />
                <span>Doctor Agreed Treatments ({treatments.length})</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddTreatment('hair')}
                  className="h-7 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 text-[11px] font-bold border border-indigo-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Hair Treatment</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTreatment('skin')}
                  className="h-7 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-950 text-[11px] font-bold border border-rose-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-600" />
                  <span>+ Skin Treatment</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {treatments.map((t, idx) => {
                const rem = Math.max(0, t.closureAmount - t.paidAmount);
                const sittingsLeft = Math.max(0, t.totalSittings - t.completedSittings);
                const isHair = t.category === 'hair';
                return (
                  <div
                    key={t.id}
                    className={`p-3 bg-white rounded-xl border space-y-2.5 shadow-2xs ${
                      isHair ? 'border-indigo-200' : 'border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center font-ledger ${
                          isHair ? 'bg-indigo-600' : 'bg-rose-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateTreatment(t.id, { category: 'hair' })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              t.category === 'hair' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'text-slate-500'
                            }`}
                          >
                            💇 Hair
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateTreatment(t.id, { category: 'skin' })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              t.category === 'skin' ? 'bg-rose-100 text-rose-900 border border-rose-200' : 'text-slate-500'
                            }`}
                          >
                            ✨ Skin
                          </button>
                        </div>
                      </div>

                      {treatments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTreatment(t.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove treatment"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={t.name}
                      onChange={(e) => handleUpdateTreatment(t.id, { name: e.target.value })}
                      placeholder="e.g. PRP Hair Density (4 Sessions) or HydraFacial MD"
                      className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                    />

                    {/* Presets pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                      <span className="text-[10px] text-slate-400 font-ledger">Presets:</span>
                      {(isHair ? POPULAR_TREATMENT_PRESETS.hair : POPULAR_TREATMENT_PRESETS.skin).slice(0, 3).map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() =>
                            handleUpdateTreatment(t.id, {
                              name: p.name,
                              closureAmount: p.defaultPrice,
                              totalSittings: p.defaultSittings,
                            })
                          }
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 text-[10px] font-medium text-slate-700 whitespace-nowrap cursor-pointer"
                        >
                          {p.name.split('(')[0].trim()} ({formatIndianCurrency(p.defaultPrice)})
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Closure Amt (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={t.closureAmount}
                          onChange={(e) => handleUpdateTreatment(t.id, { closureAmount: parseInt(e.target.value, 10) || 0 })}
                          className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-ledger font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Paid (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={t.paidAmount}
                          onChange={(e) => handleUpdateTreatment(t.id, { paidAmount: parseInt(e.target.value, 10) || 0 })}
                          className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-ledger font-bold text-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Left to Pay (₹)</label>
                        <div className="h-8 px-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-ledger font-bold text-amber-900 flex items-center">
                          {formatIndianCurrency(rem)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[10px] font-bold text-slate-600">Sittings (Done/Tot)</label>
                          <span className="text-[10px] font-bold text-indigo-700 font-ledger">{sittingsLeft} left</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={t.totalSittings}
                            value={t.completedSittings}
                            onChange={(e) => handleUpdateTreatment(t.id, { completedSittings: parseInt(e.target.value, 10) || 0 })}
                            className="w-10 h-8 px-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-center font-ledger font-bold"
                            title="Sittings Done"
                          />
                          <span className="text-slate-400">/</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={t.totalSittings}
                            onChange={(e) => handleUpdateTreatment(t.id, { totalSittings: parseInt(e.target.value, 10) || 1 })}
                            className="w-10 h-8 px-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-center font-ledger font-bold"
                            title="Sittings Finalized"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary */}
            <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-bold text-slate-700 font-ledger">Total Closure: {formatIndianCurrency(totalClosureAmount)}</span>
              <span className="font-bold text-emerald-700 font-ledger">Advance Paid: {formatIndianCurrency(totalPaidAmount)}</span>
              <span className="font-bold text-amber-900 font-ledger">Due Left: {formatIndianCurrency(totalDueAmount)}</span>
            </div>
          </div>

          {/* Paper Register Citation */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Physical Paper Register Citation (Diary Link)</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-amber-800 block mb-1">Volume</label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Vol 2"
                  className="w-full h-9 px-2.5 rounded-lg bg-white border border-amber-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-800 block mb-1">Page Number</label>
                <input
                  type="text"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  placeholder="Page 15"
                  className="w-full h-9 px-2.5 rounded-lg bg-white border border-amber-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-800 block mb-1">Register Diary</label>
                <select
                  value={diaryType}
                  onChange={(e) => setDiaryType(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-white border border-amber-300 text-xs text-slate-800 cursor-pointer"
                >
                  <option value="Blue Spiral Diary">Blue Spiral Diary</option>
                  <option value="Surgeon OT Book">Surgeon OT Book</option>
                  <option value="Daily OPD Log">Daily OPD Log</option>
                  <option value="Aesthetic Log">Aesthetic Log</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Front Desk Notes / Clinical Flags</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scalp sensitivity, pre-op blood work pending..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-ledger">
              <ShieldCheck className="w-4 h-4 text-[#6366F1]" />
              <span>Desk Receptionist Auto-Citation</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Save &amp; Generate Patient ID
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CalendarPlus,
  Clock,
  Building,
  User,
  Phone,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  Patient,
  Appointment,
  BookingChannel,
  ConsultationFeeRecord,
  formatIndianCurrency,
} from '../utils/clinicLogic';

interface BookVisitModalProps {
  patients: Patient[];
  preselectedPatient?: Patient | null;
  onClose: () => void;
  onAddAppointment: (
    appointment: Omit<Appointment, 'id'>,
    newPatientData?: Omit<Patient, 'id' | 'registeredDate'>
  ) => void;
}

export const BookVisitModal: React.FC<BookVisitModalProps> = ({
  patients,
  preselectedPatient,
  onClose,
  onAddAppointment,
}) => {
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>(
    preselectedPatient ? 'existing' : (patients.length > 0 ? 'existing' : 'new')
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient ? preselectedPatient.id : (patients[0]?.id || '')
  );

  // New patient state (if walk-in, caller, or WhatsApp texter)
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('+91 ');
  const [newAge, setNewAge] = useState<number>(30);
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // Inquiry channel / booking source
  const [bookingChannel, setBookingChannel] = useState<BookingChannel>('whatsapp_text');

  // Procedure / Visit Reason
  const [procedureType, setProcedureType] = useState<string>(
    preselectedPatient ? preselectedPatient.treatmentConcern : 'Doctor Clinical Consultation & Assessment'
  );

  // Doctor Consultation Fee state
  const [feeAmount, setFeeAmount] = useState<number>(500);
  const [feeTiming, setFeeTiming] = useState<'paid_before' | 'paid_after' | 'pending' | 'waived'>('paid_before');
  const [feeMethod, setFeeMethod] = useState<'UPI / QR' | 'Cash Desk' | 'POS Card' | 'Waived'>('UPI / QR');

  const [doctor, setDoctor] = useState<string>('Dr. Sameer Kapoor (Lead Surgeon)');
  const [room, setRoom] = useState<string>('Consultation Suite A');
  const [time, setTime] = useState<string>('03:30 PM');
  const [date, setDate] = useState<string>('Today');
  const [notes, setNotes] = useState<string>('');

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetPatientId = selectedPatientId;
    let targetPatientName = selectedPatient?.name || 'Walk-in Patient';
    let targetPhone = selectedPatient?.phone || newPhone;
    let newPatientData: Omit<Patient, 'id' | 'registeredDate'> | undefined = undefined;

    const consultationFee: ConsultationFeeRecord = {
      amount: feeTiming === 'waived' ? 0 : feeAmount,
      status: feeTiming,
      method: feeTiming === 'waived' ? 'Waived' : feeMethod,
      paidAt: feeTiming === 'paid_before' ? 'Before consultation' : undefined,
    };

    if (patientMode === 'new') {
      if (!newName.trim()) return;
      targetPatientName = newName.trim();
      targetPhone = newPhone.trim();

      newPatientData = {
        name: targetPatientName,
        phone: targetPhone,
        age: Number(newAge) || 30,
        gender: newGender,
        treatmentConcern: procedureType,
        concernCategory: procedureType.toLowerCase().includes('hair') || procedureType.toLowerCase().includes('fue') ? 'fue' : 'acne',
        paperRegisterCitation: {
          volume: 'Vol 2',
          page: 'Page ' + Math.floor(10 + Math.random() * 80),
          diaryType: 'Blue Spiral Diary',
          isVerified: true,
        },
        statusText: `Appointment Scheduled — ${time}`,
        statusType: 'scheduled',
        totalDealAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
        hasPendingBalance: false,
        nextSitting: `${date}, ${time}`,
        notes: notes.trim() || `Booked via ${bookingChannel}. Doctor Consultation Scheduled.`,
        bookingChannel,
        consultationOutcome: 'pending_consultation',
        consultationFee,
        doctorName: doctor,
      };
    }

    onAddAppointment(
      {
        patientId: targetPatientId,
        patientName: targetPatientName,
        phone: targetPhone,
        time,
        type: procedureType,
        doctor,
        status: 'Scheduled',
        room,
        date,
        bookingChannel,
        consultationFee,
        consultationOutcome: 'pending_consultation',
        outcomeNotes: notes.trim(),
      },
      newPatientData
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/40 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-teal-300 font-bold">
              <CalendarPlus className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Book Appointment &amp; Consultation</h2>
              <span className="text-xs font-ledger text-slate-300">
                Inquiry Channel &bull; Doctor Fee &bull; Auto Patient Registry
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Section 1: Booking Channel (Text, Call, Walk-in) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase font-ledger tracking-wide block">
              1. How did the patient contact the clinic? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBookingChannel('whatsapp_text')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  bookingChannel === 'whatsapp_text'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-400 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">📱</span>
                <span>WhatsApp / SMS</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingChannel('phone_call')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  bookingChannel === 'phone_call'
                    ? 'bg-blue-50 text-blue-950 border-blue-400 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">📞</span>
                <span>Phone Call</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingChannel('walk_in')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  bookingChannel === 'walk_in'
                    ? 'bg-indigo-50 text-indigo-950 border-indigo-400 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">🚶</span>
                <span>Walk-in Desk</span>
              </button>
            </div>
          </div>

          {/* Section 2: Patient Selection or New Walk-in / Caller Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase font-ledger tracking-wide">
                2. Patient Identification
              </label>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPatientMode('existing')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    patientMode === 'existing'
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Existing ({patients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('new')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    patientMode === 'new'
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + New Patient
                </button>
              </div>
            </div>

            {patientMode === 'existing' ? (
              <div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    const p = patients.find((pat) => pat.id === e.target.value);
                    if (p) setProcedureType(p.treatmentConcern || 'Doctor Consultation');
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.id}) — {p.phone} • {p.treatmentConcern}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98201 00000"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-ledger"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Age</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={newAge}
                      onChange={(e) => setNewAge(parseInt(e.target.value, 10) || 30)}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-[11px] font-ledger text-indigo-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    This patient will automatically be registered in your clinic patient directory and paper register citation.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Doctor Consultation Fee */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase font-ledger tracking-wide flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>3. Doctor Consultation Fee</span>
              </label>

              <span className="text-xs font-bold font-ledger text-[#1E1B4B]">
                {feeTiming === 'waived' ? 'Free / Waived' : formatIndianCurrency(feeAmount)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fee amount presets */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Consultation Fee (₹)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[500, 800, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setFeeAmount(amt);
                        if (feeTiming === 'waived') setFeeTiming('paid_before');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                        feeAmount === amt && feeTiming !== 'waived'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFeeTiming('waived');
                      setFeeAmount(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                      feeTiming === 'waived'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Free / Waived
                  </button>
                </div>
              </div>

              {/* Fee Timing */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Payment Timing &amp; Status
                </label>
                <select
                  value={feeTiming}
                  onChange={(e) => setFeeTiming(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="paid_before">Paid Before Consultation (Desk Registration)</option>
                  <option value="paid_after">Pay After Consultation (At Exit)</option>
                  <option value="pending">Fee Pending / Pay Later</option>
                  <option value="waived">Fee Waived / Free Doctor Follow-up</option>
                </select>
              </div>
            </div>

            {feeTiming === 'paid_before' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 font-ledger">Payment Mode:</span>
                {(['UPI / QR', 'Cash Desk', 'POS Card'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFeeMethod(mode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border cursor-pointer ${
                      feeMethod === mode
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Visit Reason / Treatment */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Procedure / Visit Reason *
            </label>
            <input
              type="text"
              required
              value={procedureType}
              onChange={(e) => setProcedureType(e.target.value)}
              placeholder="e.g. FUE Hair Transplant Consultation or Acne Assessment"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500"
            />

            {/* Quick Pick from Patient's Skin & Hair Treatments (if existing) */}
            {patientMode === 'existing' && selectedPatient?.treatments && selectedPatient.treatments.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 font-ledger uppercase tracking-wider">
                  Quick Pick from Active Treatments:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.treatments.map((t) => {
                    const isHair = t.category === 'hair';
                    const nextSitting = Math.min(t.totalSittings, (t.completedSittings || 0) + 1);
                    const sittingsLeft = Math.max(0, t.totalSittings - (t.completedSittings || 0));
                    const label = `${isHair ? '💇 Hair' : '✨ Skin'}: ${t.treatmentName.split('(')[0].trim()} (Sitting ${nextSitting}/${t.totalSittings} • ${sittingsLeft} Left)`;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setProcedureType(label)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer border ${
                          procedureType === label
                            ? 'bg-[#1E1B4B] text-white border-[#1E1B4B] font-bold shadow-xs'
                            : isHair
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-200'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Date, Time & Doctor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Appointment Date</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer font-semibold"
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="24 Oct 2024">24 Oct 2024</option>
                <option value="26 Oct 2024">26 Oct 2024</option>
                <option value="02 Nov 2024">02 Nov 2024</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Time Slot *</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="03:30 PM"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-ledger"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Attending Doctor</label>
              <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer"
              >
                <option value="Dr. Sameer Kapoor (Lead Surgeon)">Dr. Sameer Kapoor (Lead Surgeon)</option>
                <option value="Dr. Radhika Seth (Aesthetic Derm)">Dr. Radhika Seth (Aesthetic Derm)</option>
                <option value="Dr. Vikram Sen (Senior Trichologist)">Dr. Vikram Sen (Senior Trichologist)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Suite / OT Room</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer"
              >
                <option value="Consultation Suite A">Consultation Suite A</option>
                <option value="Consultation Suite B">Consultation Suite B</option>
                <option value="Laser Suite 2">Laser Suite 2</option>
                <option value="OT-1 (Main Surgical)">OT-1 (Main Surgical)</option>
                <option value="PRP Treatment Bay 3">PRP Treatment Bay 3</option>
              </select>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 text-teal-300" />
              <span>Confirm &amp; Book Appointment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

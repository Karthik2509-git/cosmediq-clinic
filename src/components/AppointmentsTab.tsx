/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  User, 
  Phone, 
  Sparkles, 
  Building, 
  CalendarPlus, 
  Send,
  CreditCard,
  AlertCircle,
  FileText,
  Check,
  RotateCcw,
  MessageCircle,
  Stethoscope,
  Briefcase
} from 'lucide-react';
import { 
  Appointment, 
  Patient, 
  formatIndianCurrency, 
  formatBookingChannel, 
  formatConsultationOutcome, 
  formatFeeStatus 
} from '../utils/clinicLogic';

interface AppointmentsTabProps {
  appointments: Appointment[];
  patients?: Patient[];
  onBookNewVisit: () => void;
  onToggleAppointmentStatus: (id: string) => void;
  onOpenOutcomeModal: (appointment: Appointment) => void;
  onViewPatientProfile?: (patient: Patient) => void;
  onOpenRecordClosureForPatient?: (patient: Patient) => void;
  searchQuery: string;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  patients = [],
  onBookNewVisit,
  onToggleAppointmentStatus,
  onOpenOutcomeModal,
  onViewPatientProfile,
  onOpenRecordClosureForPatient,
  searchQuery,
}) => {
  const [filter, setFilter] = useState<
    'all' | 'today' | 'fee_pending' | 'in_talks' | 'treatment_booked' | 'medicines_only' | 'refused' | 'surgeries' | 'completed'
  >('all');

  const query = searchQuery.toLowerCase().trim();

  // Metric calculations
  const todayVisits = appointments.filter((a) => a.date === 'Today');
  
  // Doctor consultation fees calculated
  const totalFeesCollected = appointments.reduce((sum, a) => {
    const fee = a.consultationFee;
    if (fee && (fee.status === 'paid_before' || fee.status === 'paid_after')) {
      return sum + (fee.amount || 0);
    }
    return sum;
  }, 0);

  const pendingFeesCount = appointments.filter(
    (a) => a.consultationFee?.status === 'pending'
  ).length;

  const inTalksCount = appointments.filter(
    (a) => a.consultationOutcome === 'in_talks'
  ).length;

  const treatmentBookedCount = appointments.filter(
    (a) => a.consultationOutcome === 'treatment_booked'
  ).length;

  const filteredAppointments = appointments.filter((apt) => {
    if (query) {
      const match =
        apt.patientName.toLowerCase().includes(query) ||
        apt.phone.includes(query) ||
        apt.type.toLowerCase().includes(query) ||
        apt.doctor.toLowerCase().includes(query) ||
        apt.patientId.toLowerCase().includes(query);
      if (!match) return false;
    }

    if (filter === 'today') return apt.date === 'Today';
    if (filter === 'fee_pending') {
      return apt.consultationFee?.status === 'pending';
    }
    if (filter === 'in_talks') return apt.consultationOutcome === 'in_talks';
    if (filter === 'treatment_booked') return apt.consultationOutcome === 'treatment_booked';
    if (filter === 'medicines_only') return apt.consultationOutcome === 'medicines_only';
    if (filter === 'refused') return apt.consultationOutcome === 'refused_treatment';
    if (filter === 'completed') return apt.status === 'Completed';
    if (filter === 'surgeries') {
      return (
        apt.type.toLowerCase().includes('ot') ||
        apt.type.toLowerCase().includes('surgery') ||
        apt.room.includes('OT')
      );
    }

    return true;
  });

  return (
    <div className="flex flex-col w-full pb-12 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-ledger uppercase tracking-wider text-slate-400 font-semibold">
              Clinic OPD, Inquiries &amp; Doctor Fees
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-[11px] font-ledger text-[#6366F1] font-bold">
              Reception Schedule &amp; Outcomes
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E1B4B]">
            Appointments &amp; Consultations
          </h1>
        </div>

        <button
          type="button"
          onClick={onBookNewVisit}
          className="h-10 px-4 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <CalendarPlus className="w-4 h-4 text-teal-300" />
          <span>+ Book New Appointment / Walk-in</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Metric 1: Today's OPD Schedule */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-ledger uppercase tracking-wider text-slate-400 font-bold block mb-1">
              TODAY'S QUEUE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-ledger">
                {todayVisits.length}
              </span>
              <span className="text-xs text-slate-500 font-ledger">
                ({todayVisits.filter((v) => v.status === 'Completed').length} completed)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6366F1]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Doctor Fees Collected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-ledger uppercase tracking-wider text-slate-400 font-bold block mb-1">
              DOCTOR FEES COLLECTED
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-800 font-ledger">
                {formatIndianCurrency(totalFeesCollected)}
              </span>
              {pendingFeesCount > 0 && (
                <span className="text-xs text-amber-800 font-ledger font-semibold">
                  • {pendingFeesCount} fee due
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: In Talks / Follow-ups Needed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-ledger uppercase tracking-wider text-amber-800 font-bold block mb-1">
              IN TALKS (FOLLOW-UP)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-900 font-ledger">
                {inTalksCount}
              </span>
              <span className="text-xs text-slate-500 font-ledger">
                considering treatment
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Treatments Booked from OPD */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-ledger uppercase tracking-wider text-indigo-900 font-bold block mb-1">
              TREATMENTS CLOSED
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1E1B4B] font-ledger">
                {treatmentBookedCount}
              </span>
              <span className="text-xs text-slate-500 font-ledger">
                converted packages
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs mb-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
        
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#1E1B4B] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All ({appointments.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('today')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'today'
              ? 'bg-[#1E1B4B] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Today's Queue ({todayVisits.length})
        </button>

        {pendingFeesCount > 0 && (
          <button
            type="button"
            onClick={() => setFilter('fee_pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'fee_pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            ⚠️ Fee Pending ({pendingFeesCount})
          </button>
        )}

        <button
          type="button"
          onClick={() => setFilter('in_talks')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'in_talks'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          🟡 In Talks ({inTalksCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('treatment_booked')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'treatment_booked'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          🟢 Treatment Booked ({treatmentBookedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('medicines_only')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'medicines_only'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          💊 Medicines Only ({appointments.filter((a) => a.consultationOutcome === 'medicines_only').length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('refused')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'refused'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          🔴 Refused ({appointments.filter((a) => a.consultationOutcome === 'refused_treatment').length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('surgeries')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'surgeries'
              ? 'bg-[#1E1B4B] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          OT Surgeries
        </button>

        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-[#1E1B4B] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Completed ({appointments.filter((a) => a.status === 'Completed').length})
        </button>

      </div>

      {/* Appointment Cards Timeline */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No appointments found</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try choosing a different filter or book a new appointment.
          </p>
          <button
            type="button"
            onClick={onBookNewVisit}
            className="px-4 py-2 rounded-xl bg-[#1E1B4B] text-white text-xs font-bold hover:bg-[#312E81] transition-all cursor-pointer"
          >
            + Book Appointment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((apt) => {
            const isDone = apt.status === 'Completed';
            const channelMeta = formatBookingChannel(apt.bookingChannel);
            const feeMeta = formatFeeStatus(apt.consultationFee);
            const outcomeMeta = formatConsultationOutcome(apt.consultationOutcome);
            const matchingPatient = patients.find((p) => p.id === apt.patientId || p.phone === apt.phone);

            return (
              <div
                key={apt.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Header: Patient Info + Booking Channel + Time */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-[#6366F1]'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => matchingPatient && onViewPatientProfile?.(matchingPatient)}
                            className="text-base font-bold text-slate-900 hover:text-[#6366F1] text-left transition-colors cursor-pointer"
                          >
                            {apt.patientName}
                          </button>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-ledger text-[11px] text-slate-600 font-semibold">
                            #{apt.patientId}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 font-ledger flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{apt.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-ledger flex items-center gap-1 ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                      }`}>
                        <Clock className="w-3 h-3" /> {apt.time}
                      </span>
                      <span className="text-[10px] font-ledger text-slate-500 font-medium">
                        {apt.date}
                      </span>
                    </div>
                  </div>

                  {/* Channel & Fee Status Row */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {/* Booking Channel Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${channelMeta.badgeClass}`}>
                      <span>{channelMeta.icon}</span>
                      <span>{channelMeta.label}</span>
                    </span>

                    {/* Doctor Consultation Fee Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border ${feeMeta.badgeClass}`}>
                      <CreditCard className="w-3 h-3" />
                      <span>{feeMeta.label}</span>
                    </span>

                    {/* Post-Consultation Outcome Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border ${outcomeMeta.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${outcomeMeta.dotColor}`}></span>
                      <span>{outcomeMeta.label}</span>
                    </span>
                  </div>
                </div>

                {/* Procedure & Doctor Info Box */}
                <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 flex flex-col gap-2">
                  <div className="text-xs font-bold text-[#1E1B4B] flex items-center justify-between">
                    <span>{apt.type}</span>
                    {apt.room && (
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" /> {apt.room}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600 font-ledger flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-slate-700">
                      <User className="w-3 h-3 text-[#6366F1]" /> {apt.doctor}
                    </span>

                    {apt.followUpDate && (
                      <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        📅 Follow-up: {apt.followUpDate}
                      </span>
                    )}
                  </div>

                  {apt.outcomeNotes && (
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 font-ledger italic">
                      "{apt.outcomeNotes}"
                    </div>
                  )}
                </div>

                {/* Quick Reception Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    
                    {/* Primary Button: Record Outcome & Doctor Fee */}
                    <button
                      type="button"
                      onClick={() => onOpenOutcomeModal(apt)}
                      className="h-8 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#1E1B4B] border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-[#6366F1]" />
                      <span>
                        {apt.consultationOutcome && apt.consultationOutcome !== 'pending_consultation'
                          ? 'Update Outcome / Fee'
                          : '🩺 Record Outcome & Doctor Fee'}
                      </span>
                    </button>

                    {/* Toggle Visit Completed */}
                    <button
                      type="button"
                      onClick={() => onToggleAppointmentStatus(apt.id)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                        isDone
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                    >
                      {isDone ? 'Mark as Pending' : '✓ Mark Completed'}
                    </button>
                  </div>

                  {/* WhatsApp Alerts & Follow-up Links */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <a
                      href={`https://wa.me/${apt.phone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(apt.patientName)},%20reminder%20for%20your%20consultation%20at%20COSMEDIQ%20Skin%20and%20Hair%20Clinic%20today%20at%20${encodeURIComponent(apt.time)}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp Alert</span>
                    </a>

                    {apt.consultationOutcome === 'in_talks' && (
                      <a
                        href={`https://wa.me/${apt.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(apt.patientName)},%20following%20up%20from%20COSMEDIQ%20regarding%20your%20consultation%20with%20${encodeURIComponent(apt.doctor)}.%20Do%20you%20have%20any%20questions%20about%20the%20recommended%20treatment?`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Send Follow-up Message</span>
                      </a>
                    )}

                    {apt.consultationOutcome === 'treatment_booked' && matchingPatient && onOpenRecordClosureForPatient && (
                      <button
                        type="button"
                        onClick={() => onOpenRecordClosureForPatient(matchingPatient)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                      >
                        <Briefcase className="w-3 h-3" />
                        <span>Open Package Deal</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

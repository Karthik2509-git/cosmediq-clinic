/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BookingChannel = 'whatsapp_text' | 'phone_call' | 'walk_in';

export type ConsultationFeeStatus = 'paid_before' | 'paid_after' | 'pending' | 'waived';

export type ConsultationOutcome =
  | 'pending_consultation'
  | 'treatment_booked'
  | 'in_talks'
  | 'medicines_only'
  | 'refused_treatment';

export interface ConsultationFeeRecord {
  amount: number;
  status: ConsultationFeeStatus;
  method?: 'UPI / QR' | 'Cash Desk' | 'POS Card' | 'Waived';
  paidAt?: string;
  notes?: string;
}

export interface Patient {
  id: string; // e.g. "CQ-2401"
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  treatmentConcern: string;
  concernCategory: 'fue' | 'prp' | 'laser' | 'acne' | 'general';
  paperRegisterCitation: {
    volume: string;
    page: string;
    diaryType: string;
    isVerified: boolean;
  };
  statusText: string;
  statusType: 'scheduled' | 'completed' | 'followup' | 'pending';
  totalDealAmount: number;
  paidAmount: number;
  dueAmount: number;
  hasPendingBalance: boolean;
  nextSitting?: string;
  registeredDate: string;
  notes?: string;
  treatments?: TreatmentPlanItem[];
  bookingChannel?: BookingChannel;
  consultationOutcome?: ConsultationOutcome;
  consultationFee?: ConsultationFeeRecord;
  doctorName?: string;
  followUpDate?: string;
  outcomeNotes?: string;
}

export interface SittingRecord {
  id: string; // e.g. "SIT-1731589123456"
  sittingNumber: number; // 1, 2, 3...
  therapistName: string; // e.g. "Priya S.", "Anitha K."
  date: string; // e.g. "14 Nov 2026, 04:30 PM"
  notes?: string;
  treatmentId?: string;
  treatmentName?: string;
}

export interface TreatmentPlanItem {
  id: string;
  treatmentName: string;
  category: 'hair' | 'skin' | 'laser' | 'general';
  closureAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalSittings: number;
  completedSittings: number;
  notes?: string;
  nextSittingDate?: string;
  sittingHistory?: SittingRecord[];
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'UPI / QR' | 'Cash Desk' | 'POS Card' | 'Bank / NEFT';
  referenceNo: string;
  notes: string;
  staffName: string;
  thermalReceiptPrinted: boolean;
  paperLedgerUpdated: boolean;
}

export interface ClosureDeal {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  packageName: string;
  treatments?: TreatmentPlanItem[];
  totalPrice: number;
  advancePaid: number;
  remainingBalanceDue: number;
  statusBadge: string;
  statusType: 'ot_block' | 'due' | 'post_session' | 'cleared';
  closureDate: string;
  otSlot?: string;
  isSurgical: boolean;
  paperCitation: string;
  payments: PaymentRecord[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  tabCategory: 'pharmacy' | 'products';
  filterCategory: 'ot' | 'retail' | 'general';
  tag: string;
  inStock: number;
  minThreshold: number;
  unit: string;
  location: string;
  mrp?: number;
  status: 'low' | 'optimal' | 'sufficient';
  lastActionText: string;
  vendorInfo?: string;
  maxGauge: number;
}

export interface DispensationLog {
  id: string;
  title: string;
  subtitle: string;
  type: 'medicine' | 'ot' | 'retail';
  timestamp: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  time: string;
  type: string;
  doctor: string;
  status: 'Scheduled' | 'Completed' | 'In Waiting' | 'Cancelled';
  room: string;
  date: string;
  bookingChannel?: BookingChannel;
  consultationFee?: ConsultationFeeRecord;
  consultationOutcome?: ConsultationOutcome;
  outcomeNotes?: string;
  followUpDate?: string;
}

// ----------------------------------------------------
// PURE BUSINESS LOGIC & LEDGER CALCULATIONS
// ----------------------------------------------------

export function formatBookingChannel(channel?: BookingChannel): { label: string; icon: string; badgeClass: string } {
  switch (channel) {
    case 'whatsapp_text':
      return { label: 'WhatsApp / SMS', icon: '📱', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    case 'phone_call':
      return { label: 'Phone Call', icon: '📞', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' };
    case 'walk_in':
    default:
      return { label: 'Walk-in Desk', icon: '🚶', badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
  }
}

export function formatConsultationOutcome(outcome?: ConsultationOutcome): {
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  switch (outcome) {
    case 'treatment_booked':
      return { label: 'Treatment Booked / Closed', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold', dotColor: 'bg-emerald-600' };
    case 'in_talks':
      return { label: 'In Talks / Considering', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', dotColor: 'bg-amber-500' };
    case 'medicines_only':
      return { label: 'Medicines & Rx Only', badgeClass: 'bg-sky-100 text-sky-950 border-sky-300 font-bold', dotColor: 'bg-sky-500' };
    case 'refused_treatment':
      return { label: 'Refused / Not Interested', badgeClass: 'bg-rose-100 text-rose-950 border-rose-300 font-bold', dotColor: 'bg-rose-500' };
    case 'pending_consultation':
    default:
      return { label: 'Awaiting Doctor Consult', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300', dotColor: 'bg-slate-400' };
  }
}

export function formatFeeStatus(fee?: ConsultationFeeRecord): {
  label: string;
  isPaid: boolean;
  badgeClass: string;
} {
  if (!fee || fee.amount === 0 || fee.status === 'waived') {
    return { label: 'Fee Waived / Free', isPaid: true, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
  if (fee.status === 'paid_before') {
    return { label: `₹${fee.amount} Paid (Before Consult)`, isPaid: true, badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
  }
  if (fee.status === 'paid_after') {
    return { label: `₹${fee.amount} Paid (After Consult)`, isPaid: true, badgeClass: 'bg-teal-100 text-teal-900 border-teal-300 font-bold' };
  }
  return { label: `₹${fee.amount} Fee Pending`, isPaid: false, badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 font-bold' };
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount).replace('INR', '₹').trim();
}

export function formatLakhs(amount: number): string {
  if (amount >= 100000) {
    const inLakhs = (amount / 100000).toFixed(1).replace('.0', '');
    return `₹${inLakhs}L`;
  }
  return formatIndianCurrency(amount);
}

export function calculateFinancialStats(deals: ClosureDeal[]) {
  let totalAgreed = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let accountsWithDues = 0;
  let clearedCount = 0;

  for (const deal of deals) {
    totalAgreed += deal.totalPrice;
    totalCollected += deal.advancePaid;
    totalPending += deal.remainingBalanceDue;
    if (deal.remainingBalanceDue > 0) {
      accountsWithDues++;
    } else {
      clearedCount++;
    }
  }

  const collectionRate = totalAgreed > 0 ? (totalCollected / totalAgreed) * 100 : 0;

  return {
    totalAgreed,
    totalCollected,
    totalPending,
    accountsWithDues,
    clearedCount,
    collectionRate: Math.round(collectionRate * 10) / 10,
    totalDeals: deals.length,
  };
}

export function calculateTreatmentsSummary(treatments: TreatmentPlanItem[] = []) {
  const totalClosure = treatments.reduce((sum, t) => sum + (Number(t.closureAmount) || 0), 0);
  const totalPaid = treatments.reduce((sum, t) => sum + (Number(t.paidAmount) || 0), 0);
  const totalRemaining = Math.max(0, totalClosure - totalPaid);
  const totalSittings = treatments.reduce((sum, t) => sum + (Number(t.totalSittings) || 0), 0);
  const completedSittings = treatments.reduce((sum, t) => sum + (Number(t.completedSittings) || 0), 0);
  const sittingsLeft = Math.max(0, totalSittings - completedSittings);
  return {
    totalClosure,
    totalPaid,
    totalRemaining,
    totalSittings,
    completedSittings,
    sittingsLeft,
    isFullyCleared: totalRemaining === 0,
    allSittingsCompleted: totalSittings > 0 && completedSittings >= totalSittings,
  };
}

export function getTreatmentSittingsLeft(treatment: TreatmentPlanItem): number {
  const total = Number(treatment.totalSittings) || 0;
  const completed = Number(treatment.completedSittings) || 0;
  return Math.max(0, total - completed);
}

export function getTreatmentAmountLeft(treatment: TreatmentPlanItem): number {
  const closure = Number(treatment.closureAmount) || 0;
  const paid = Number(treatment.paidAmount) || 0;
  return Math.max(0, closure - paid);
}

export function calculateCategoryTreatmentsSummary(
  treatments: TreatmentPlanItem[] = [],
  category: 'hair' | 'skin'
) {
  const filtered = treatments.filter((t) => {
    if (category === 'hair') return t.category === 'hair';
    return t.category === 'skin' || t.category === 'laser';
  });
  return {
    items: filtered,
    count: filtered.length,
    ...calculateTreatmentsSummary(filtered),
  };
}

export const POPULAR_TREATMENT_PRESETS = {
  hair: [
    { name: 'FUE Hair Transplant (2,500 Grafts)', defaultPrice: 65000, defaultSittings: 1 },
    { name: 'Sapphire FUE Hairline Restoration (3,000 Grafts)', defaultPrice: 85000, defaultSittings: 1 },
    { name: 'PRP Hair Density Restoration (4 Sessions)', defaultPrice: 22000, defaultSittings: 4 },
    { name: 'GFC (Growth Factor Concentrate) Scalp Booster (6 Sessions)', defaultPrice: 28000, defaultSittings: 6 },
    { name: 'Beard Reconstruction FUE (1,200 Grafts)', defaultPrice: 45000, defaultSittings: 1 },
    { name: 'Scalp Micropigmentation (SMP — 3 Sessions)', defaultPrice: 30000, defaultSittings: 3 },
  ],
  skin: [
    { name: 'HydraFacial MD Deep Infusion (4 Sessions)', defaultPrice: 16000, defaultSittings: 4 },
    { name: 'Carbon Laser Hollywood Peel (4 Sessions)', defaultPrice: 14000, defaultSittings: 4 },
    { name: 'Acne Scars 18G Subcision + TCA (3 Sittings)', defaultPrice: 18000, defaultSittings: 3 },
    { name: 'TCA Cross & Salicylic Peeling (4 Sittings)', defaultPrice: 14000, defaultSittings: 4 },
    { name: 'Microneedling / Dermapen RF (4 Sessions)', defaultPrice: 20000, defaultSittings: 4 },
    { name: 'Glutathione Skin Brightening Cycle (6 Sessions)', defaultPrice: 24000, defaultSittings: 6 },
    { name: 'Fractional CO2 Laser Resurfacing (3 Sessions)', defaultPrice: 24000, defaultSittings: 3 },
    { name: 'Laser Hair Reduction — Full Face (6 Sittings)', defaultPrice: 18000, defaultSittings: 6 },
  ],
};

export function synchronizePatientFromTreatments(
  patient: Patient,
  treatments: TreatmentPlanItem[]
): Patient {
  const summary = calculateTreatmentsSummary(treatments);
  
  // Concise concern title
  let concernText = patient.treatmentConcern;
  if (treatments.length > 0) {
    concernText = treatments.map((t) => t.treatmentName.split('(')[0].trim()).join(' + ');
  }

  const hasHair = treatments.some((t) => t.category === 'hair');
  const hasSkin = treatments.some((t) => t.category === 'skin' || t.category === 'laser');
  
  let concernCategory = patient.concernCategory;
  if (hasHair && !hasSkin) {
    concernCategory = treatments.some((t) => t.treatmentName.toLowerCase().includes('fue')) ? 'fue' : 'prp';
  } else if (hasSkin && !hasHair) {
    concernCategory = treatments.some((t) => t.treatmentName.toLowerCase().includes('laser')) ? 'laser' : 'acne';
  }

  let statusText = patient.statusText;
  if (summary.isFullyCleared && summary.allSittingsCompleted) {
    statusText = 'Treatments Fully Cleared & All Sittings Done';
  } else if (summary.allSittingsCompleted) {
    statusText = summary.totalRemaining > 0
      ? `All ${summary.totalSittings} Sittings Done — ${formatIndianCurrency(summary.totalRemaining)} Due`
      : 'All Sittings Completed';
  } else if (summary.totalSittings > 0) {
    statusText = `Sittings: ${summary.completedSittings}/${summary.totalSittings} Done (${summary.sittingsLeft} Left)`;
  }

  return {
    ...patient,
    treatmentConcern: concernText,
    concernCategory,
    treatments,
    totalDealAmount: summary.totalClosure,
    paidAmount: summary.totalPaid,
    dueAmount: summary.totalRemaining,
    hasPendingBalance: summary.totalRemaining > 0,
    statusText,
  };
}

export const CLINIC_THERAPIST_PRESETS = [
  'Priya S.',
  'Anitha K.',
  'Kavya R.',
  'Sunita M.',
  'Rahul T.',
  'Dr. A. V. Rao',
  'Dr. Meera Reddy',
];

export function recordSittingForTreatment(
  treatment: TreatmentPlanItem,
  details: {
    therapistName: string;
    date?: string;
    notes?: string;
  }
): TreatmentPlanItem {
  const currentHistory = treatment.sittingHistory || [];
  const nextSittingNumber = (treatment.completedSittings || 0) + 1;
  const safeNumber = Math.min(treatment.totalSittings, nextSittingNumber);

  const formattedDate =
    details.date && details.date.trim() !== ''
      ? details.date.trim()
      : `${new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}, ${new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })}`;

  const newRecord: SittingRecord = {
    id: `SIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sittingNumber: safeNumber,
    therapistName: details.therapistName.trim() || 'Priya S.',
    date: formattedDate,
    notes: details.notes?.trim() || undefined,
    treatmentId: treatment.id,
    treatmentName: treatment.treatmentName,
  };

  return {
    ...treatment,
    completedSittings: safeNumber,
    sittingHistory: [...currentHistory, newRecord],
  };
}

export function removeSittingFromTreatment(
  treatment: TreatmentPlanItem,
  sittingId?: string
): TreatmentPlanItem {
  const currentHistory = treatment.sittingHistory || [];
  let updatedHistory: SittingRecord[] = [];

  if (sittingId) {
    updatedHistory = currentHistory.filter((s) => s.id !== sittingId);
  } else {
    // Remove last sitting
    updatedHistory = currentHistory.slice(0, -1);
  }

  // Re-index remaining sitting numbers
  const reindexed = updatedHistory.map((s, idx) => ({
    ...s,
    sittingNumber: idx + 1,
  }));

  const nextCompleted = Math.max(0, (treatment.completedSittings || 1) - 1);

  return {
    ...treatment,
    completedSittings: nextCompleted,
    sittingHistory: reindexed,
  };
}

export function incrementTreatmentSitting(
  deal: ClosureDeal,
  treatmentId: string,
  sittingDetails?: {
    therapistName: string;
    date?: string;
    notes?: string;
  }
): ClosureDeal {
  const updatedTreatments = (deal.treatments || []).map((t) => {
    if (t.id === treatmentId) {
      if (sittingDetails) {
        return recordSittingForTreatment(t, sittingDetails);
      }
      const nextCompleted = Math.min(t.totalSittings, t.completedSittings + 1);
      const defaultDate = `${new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}, ${new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      const fallbackRecord: SittingRecord = {
        id: `SIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sittingNumber: nextCompleted,
        therapistName: 'Priya S.',
        date: defaultDate,
        treatmentId: t.id,
        treatmentName: t.treatmentName,
      };
      return {
        ...t,
        completedSittings: nextCompleted,
        sittingHistory: [...(t.sittingHistory || []), fallbackRecord],
      };
    }
    return t;
  });

  const allCompleted = updatedTreatments.length > 0 && updatedTreatments.every((t) => t.completedSittings >= t.totalSittings);

  return {
    ...deal,
    treatments: updatedTreatments,
    statusBadge: allCompleted && deal.remainingBalanceDue === 0 ? 'Fully Cleared & Done' : deal.statusBadge,
  };
}

export function adjustTreatmentSittingInList(
  treatments: TreatmentPlanItem[],
  treatmentId: string,
  delta: number,
  therapistName?: string
): TreatmentPlanItem[] {
  return treatments.map((t) => {
    if (t.id === treatmentId) {
      const current = t.completedSittings || 0;
      const target = Math.max(0, Math.min(t.totalSittings, current + delta));
      let updated = { ...t };
      if (target > current) {
        for (let i = current; i < target; i++) {
          updated = recordSittingForTreatment(updated, {
            therapistName: therapistName || 'Priya S.',
          });
        }
      } else if (target < current) {
        for (let i = current; i > target; i--) {
          updated = removeSittingFromTreatment(updated);
        }
      }
      return updated;
    }
    return t;
  });
}

export function recordDealPayment(
  deal: ClosureDeal,
  amount: number,
  paymentDetails: Omit<PaymentRecord, 'id' | 'date' | 'amount'>
): { updatedDeal: ClosureDeal; newPayment: PaymentRecord } {
  const safeAmount = Math.max(0, Math.min(amount, deal.remainingBalanceDue));
  const newAdvance = deal.advancePaid + safeAmount;
  const newRemaining = Math.max(0, deal.totalPrice - newAdvance);

  const newPayment: PaymentRecord = {
    ...paymentDetails,
    id: `PAY-${Date.now()}`,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: safeAmount,
  };

  // Proportionally or sequentially allocate payment across treatments that have balance due
  let unallocated = safeAmount;
  const updatedTreatments = (deal.treatments || []).map((t) => {
    if (unallocated <= 0) return t;
    const dueOnTreatment = Math.max(0, (t.closureAmount || 0) - (t.paidAmount || 0));
    const payNow = Math.min(unallocated, dueOnTreatment);
    unallocated -= payNow;
    const newPaid = (t.paidAmount || 0) + payNow;
    return {
      ...t,
      paidAmount: newPaid,
      remainingAmount: Math.max(0, (t.closureAmount || 0) - newPaid),
    };
  });

  const updatedDeal: ClosureDeal = {
    ...deal,
    advancePaid: newAdvance,
    remainingBalanceDue: newRemaining,
    statusBadge: newRemaining === 0 ? 'Fully Cleared' : (deal.isSurgical ? 'OT Cleared / Ready' : 'Installment Paid'),
    statusType: newRemaining === 0 ? 'cleared' : 'due',
    payments: [newPayment, ...deal.payments],
    treatments: updatedTreatments,
  };

  return { updatedDeal, newPayment };
}

export function calculateStockHealth(inStock: number, minThreshold: number): {
  status: 'low' | 'optimal' | 'sufficient';
  percentage: number;
} {
  const percentage = Math.min(100, Math.max(0, Math.round((inStock / (minThreshold * 2.5)) * 100)));
  if (inStock <= minThreshold) {
    return { status: 'low', percentage: Math.max(10, percentage) };
  }
  if (inStock < minThreshold * 2) {
    return { status: 'optimal', percentage };
  }
  return { status: 'sufficient', percentage };
}

export function adjustInventoryStock(
  item: InventoryItem,
  delta: number
): InventoryItem {
  const newQty = Math.max(0, item.inStock + delta);
  const health = calculateStockHealth(newQty, item.minThreshold);
  const count = Math.abs(delta);
  return {
    ...item,
    inStock: newQty,
    status: health.status,
    lastActionText: delta < 0
      ? `Used ${count} ${item.unit} • Just now`
      : `Restocked +${delta} ${item.unit} • Just now`,
  };
}

export function filterPatients(
  patients: Patient[],
  query: string,
  concernCategory: string,
  quickFilter: string,
  sortBy: string
): Patient[] {
  return patients.filter((patient) => {
    // Search match: name, phone, or ID
    if (query) {
      const q = query.toLowerCase();
      const match =
        patient.name.toLowerCase().includes(q) ||
        patient.phone.toLowerCase().includes(q) ||
        patient.id.toLowerCase().includes(q) ||
        patient.treatmentConcern.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Concern category filter
    if (concernCategory !== 'all') {
      if (patient.concernCategory !== concernCategory) return false;
    }

    // Quick filter
    if (quickFilter === 'pending') {
      if (!patient.hasPendingBalance) return false;
    } else if (quickFilter === 'followup') {
      if (!patient.nextSitting && !patient.statusText.toLowerCase().includes('follow-up') && !patient.statusText.toLowerCase().includes('scheduled')) {
        return false;
      }
    } else if (quickFilter === 'verified') {
      if (!patient.paperRegisterCitation.isVerified) return false;
    } else if (quickFilter === 'in_talks') {
      if (patient.consultationOutcome !== 'in_talks') return false;
    } else if (quickFilter === 'medicines_only') {
      if (patient.consultationOutcome !== 'medicines_only') return false;
    } else if (quickFilter === 'treatment_booked') {
      if (patient.consultationOutcome !== 'treatment_booked') return false;
    } else if (quickFilter === 'refused_treatment') {
      if (patient.consultationOutcome !== 'refused_treatment') return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'balance_desc') {
      return b.dueAmount - a.dueAmount;
    }
    if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'book_order') {
      return a.paperRegisterCitation.volume.localeCompare(b.paperRegisterCitation.volume) ||
        a.paperRegisterCitation.page.localeCompare(b.paperRegisterCitation.page);
    }
    // Default recently added (id or order)
    return b.id.localeCompare(a.id);
  });
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PatientsTab } from './components/PatientsTab';
import { ClosuresTab } from './components/ClosuresTab';
import { InventoryTab } from './components/InventoryTab';
import { AppointmentsTab } from './components/AppointmentsTab';
import { CollectPaymentModal } from './components/CollectPaymentModal';
import { NewPatientModal } from './components/NewPatientModal';
import { RecordClosureModal } from './components/RecordClosureModal';
import { BookVisitModal } from './components/BookVisitModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { DailyRegisterSheetModal } from './components/DailyRegisterSheetModal';
import { GeminiStaffChatbot } from './components/GeminiStaffChatbot';
import { ManageTreatmentsModal } from './components/ManageTreatmentsModal';
import { ConsultationOutcomeModal } from './components/ConsultationOutcomeModal';
import { Toast } from './components/Toast';
import { Database, Sparkles, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';

import {
  Patient,
  ClosureDeal,
  InventoryItem,
  DispensationLog,
  Appointment,
  TreatmentPlanItem,
  ConsultationOutcome,
  ConsultationFeeRecord,
  calculateFinancialStats,
  recordDealPayment,
  adjustInventoryStock,
  formatIndianCurrency,
  incrementTreatmentSitting,
  synchronizePatientFromTreatments,
  calculateTreatmentsSummary,
} from './utils/clinicLogic';

import {
  INITIAL_PATIENTS,
  INITIAL_CLOSURE_DEALS,
  INITIAL_INVENTORY,
  INITIAL_DISPENSATION_LOGS,
  INITIAL_APPOINTMENTS,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'patients' | 'closures' | 'appointments' | 'inventory'>('patients');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core application state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [deals, setDeals] = useState<ClosureDeal[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dispensationLogs, setDispensationLogs] = useState<DispensationLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Database persistence state
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [isCleanMode, setIsCleanMode] = useState<boolean>(true);
  const [isSavingDb, setIsSavingDb] = useState<boolean>(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState<boolean>(false);

  // Modal dialog states
  const [collectPaymentDeal, setCollectPaymentDeal] = useState<ClosureDeal | null>(null);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState<boolean>(false);
  const [isRecordClosureOpen, setIsRecordClosureOpen] = useState<boolean>(false);
  const [recordClosurePatient, setRecordClosurePatient] = useState<Patient | null>(null);
  const [isBookVisitOpen, setIsBookVisitOpen] = useState<boolean>(false);
  const [bookVisitPatient, setBookVisitPatient] = useState<Patient | null>(null);
  const [profilePatient, setProfilePatient] = useState<Patient | null>(null);
  const [manageTreatmentsPatient, setManageTreatmentsPatient] = useState<Patient | null>(null);
  const [selectedOutcomeAppointment, setSelectedOutcomeAppointment] = useState<Appointment | null>(null);
  const [isRegisterSheetOpen, setIsRegisterSheetOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Initial Load from Persistent Database (/api/data)
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPatients(Array.isArray(data.patients) ? data.patients : []);
            setDeals(Array.isArray(data.deals) ? data.deals : []);
            setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
            setInventory(Array.isArray(data.inventory) ? data.inventory : []);
            setDispensationLogs(Array.isArray(data.dispensationLogs) ? data.dispensationLogs : []);
            setIsCleanMode(Boolean(data.isCleanTestWeek || (data.patients && data.patients.length === 0)));
            setIsDbConnected(true);
            setIsInitialLoadDone(true);
            return;
          }
        }
      } catch (err) {
        console.warn('API /api/data not reachable, falling back to local cache:', err);
      }

      // Offline / LocalStorage fallback
      const cached = localStorage.getItem('cosmediq_clinic_database');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setPatients(Array.isArray(parsed.patients) ? parsed.patients : []);
          setDeals(Array.isArray(parsed.deals) ? parsed.deals : []);
          setAppointments(Array.isArray(parsed.appointments) ? parsed.appointments : []);
          if (Array.isArray(parsed.inventory)) setInventory(parsed.inventory);
          if (Array.isArray(parsed.dispensationLogs)) setDispensationLogs(parsed.dispensationLogs);
        } catch (e) {
          console.error('Failed parsing localStorage cache:', e);
        }
      }
      setIsInitialLoadDone(true);
    }

    loadDatabaseData();
  }, []);

  // Auto-sync state changes back to persistent server database
  useEffect(() => {
    if (!isInitialLoadDone) return;

    const timer = setTimeout(async () => {
      const payload = {
        patients,
        deals,
        appointments,
        inventory,
        dispensationLogs,
      };

      try {
        localStorage.setItem('cosmediq_clinic_database', JSON.stringify(payload));
      } catch (e) {}

      try {
        setIsSavingDb(true);
        const res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsDbConnected(true);
        }
      } catch (err) {
        console.warn('Failed auto-sync to server database:', err);
      } finally {
        setIsSavingDb(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [patients, deals, appointments, inventory, dispensationLogs, isInitialLoadDone]);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Financial statistics
  const financialStats = calculateFinancialStats(deals);
  const lowStockCount = inventory.filter((i) => i.inStock <= i.minThreshold).length;
  const todayVisits = appointments.filter((a) => a.date === 'Today');
  const completedVisits = todayVisits.filter((a) => a.status === 'Completed').length;

  // Handlers for payments
  const handleConfirmPayment = (
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
  ) => {
    const targetDeal = deals.find((d) => d.id === dealId);
    if (!targetDeal) return;

    const { updatedDeal } = recordDealPayment(targetDeal, amount, paymentDetails);

    setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)));

    // Synchronize balance to patient record
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === targetDeal.patientId) {
          const newPaid = p.paidAmount + amount;
          const newDue = Math.max(0, p.totalDealAmount - newPaid);
          return {
            ...p,
            paidAmount: newPaid,
            dueAmount: newDue,
            hasPendingBalance: newDue > 0,
            statusText: newDue === 0 ? 'Fully Paid (₹0 Due)' : p.statusText,
          };
        }
        return p;
      })
    );

    showToast(`Payment of ${formatIndianCurrency(amount)} recorded for ${targetDeal.patientName} via ${paymentDetails.method}!`);
  };

  // Handlers for inventory
  const handleAdjustStock = (itemId: string, delta: number, customLabel?: string) => {
    const targetItem = inventory.find((i) => i.id === itemId);
    if (!targetItem) return;

    const count = Math.abs(delta);

    if (delta < 0 && targetItem.inStock <= 0) {
      showToast(`${targetItem.name} is currently out of stock!`, 'alert');
      return;
    }

    if (delta < 0 && targetItem.inStock < count) {
      showToast(`Cannot deduct ${count} ${targetItem.unit}. Only ${targetItem.inStock} left in stock!`, 'alert');
      return;
    }

    const updated = adjustInventoryStock(targetItem, delta);
    setInventory((prev) => prev.map((i) => (i.id === itemId ? updated : i)));

    // Add dispensation log
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: DispensationLog = {
      id: `LOG-${Date.now()}`,
      title: delta < 0 ? `${count}x ${targetItem.name} Used / Dispensed` : `+${delta} ${targetItem.unit} Restocked`,
      subtitle: customLabel ? `${customLabel} • ${timeStr}` : `Reception Counter • ${timeStr}`,
      type: targetItem.tabCategory === 'pharmacy' ? 'medicine' : 'retail',
      timestamp: timeStr,
    };
    setDispensationLogs((prev) => [newLog, ...prev.slice(0, 5)]);

    if (delta < 0) {
      showToast(`${count} ${targetItem.unit} of ${targetItem.name} recorded as used/dispensed.`);
    } else {
      showToast(`+${delta} ${targetItem.unit} added to ${targetItem.name} stock.`);
    }
  };

  const handleQuickReorder = () => {
    showToast(`Purchase Order #4093 drafted for ${lowStockCount} low-stock items. Sent to clinic procurement.`);
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    const targetItem = inventory.find((i) => i.id === itemId);
    if (!targetItem) return;

    const confirmed = window.confirm(
      `Remove "${targetItem.name}" from clinic stock? This will delete the item from inventory.`
    );
    if (!confirmed) return;

    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    showToast(`Removed "${targetItem.name}" from clinic inventory.`, 'info');
  };

  const handleExportVendorOrder = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['SKU,Name,InStock,MinThreshold,Unit,Status']
        .concat(
          inventory.map(
            (i) => `${i.sku},"${i.name}",${i.inStock},${i.minThreshold},${i.unit},${i.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `COSMEDIQ_Stock_Reorder_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Dispensary reorder CSV exported.');
  };

  const handleExportData = () => {
    const clinicBackup = {
      timestamp: new Date().toISOString(),
      terminal: 'Desk Terminal #01 (Reception Main)',
      patients,
      deals,
      inventory,
      appointments,
      financialStats,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(clinicBackup, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `COSMEDIQ_Clinic_Desk_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full clinic operational database exported to JSON.');
  };

  // Add new patient
  const handleAddNewPatient = (patientData: Omit<Patient, 'id' | 'registeredDate'>) => {
    const newId = `CQ-${2400 + patients.length + 1}`;
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      registeredDate: new Date().toLocaleDateString('en-CA'),
    };

    setPatients((prev) => [newPatient, ...prev]);

    // If deal amount specified, create a corresponding closure deal
    if (patientData.totalDealAmount > 0) {
      const newDeal: ClosureDeal = {
        id: `DEAL-${Date.now().toString().slice(-4)}`,
        patientId: newId,
        patientName: patientData.name,
        phone: patientData.phone,
        packageName: patientData.treatmentConcern,
        treatments: patientData.treatments || [],
        totalPrice: patientData.totalDealAmount,
        advancePaid: patientData.paidAmount,
        remainingBalanceDue: patientData.dueAmount,
        statusBadge: patientData.dueAmount === 0 ? 'Fully Cleared' : 'Installment Due',
        statusType: patientData.dueAmount === 0 ? 'cleared' : 'due',
        closureDate: 'Today',
        isSurgical: patientData.concernCategory === 'fue',
        paperCitation: `${patientData.paperRegisterCitation.volume}, ${patientData.paperRegisterCitation.page} • ${patientData.paperRegisterCitation.diaryType}`,
        payments: patientData.paidAmount > 0 ? [
          {
            id: `PAY-${Date.now()}`,
            date: 'Today',
            amount: patientData.paidAmount,
            method: 'UPI / QR',
            referenceNo: `UPI/HDFC/${Math.floor(100000000 + Math.random() * 900000000)}`,
            notes: 'Registration advance collected at reception desk',
            staffName: 'Priya S.',
            thermalReceiptPrinted: true,
            paperLedgerUpdated: true,
          }
        ] : [],
      };
      setDeals((prev) => [newDeal, ...prev]);
    }

    showToast(`Patient ${newPatient.name} (#${newId}) registered with citation 📖 ${patientData.paperRegisterCitation.volume}, ${patientData.paperRegisterCitation.page}!`);
  };

  // Add closure deal (supports multiple treatments and walk-in patient registration)
  const handleAddClosureDeal = (
    dealData: Omit<ClosureDeal, 'id' | 'payments'>,
    initialPayment?: number,
    newPatientData?: Omit<Patient, 'id' | 'registeredDate'>
  ) => {
    let finalPatientId = dealData.patientId;

    if (newPatientData) {
      finalPatientId = `CQ-${2400 + patients.length + 1}`;
      const newPatient: Patient = {
        ...newPatientData,
        id: finalPatientId,
        registeredDate: new Date().toLocaleDateString('en-CA'),
        treatments: dealData.treatments || [],
      };
      setPatients((prev) => [newPatient, ...prev]);
    }

    const newDeal: ClosureDeal = {
      ...dealData,
      patientId: finalPatientId,
      id: `DEAL-${Date.now().toString().slice(-4)}`,
      treatments: dealData.treatments || [],
      payments: initialPayment ? [
        {
          id: `PAY-${Date.now()}`,
          date: 'Today',
          amount: initialPayment,
          method: 'UPI / QR',
          referenceNo: `UPI/HDFC/${Math.floor(100000000 + Math.random() * 900000000)}`,
          notes: 'Package deal advance deposit',
          staffName: 'Priya S.',
          thermalReceiptPrinted: true,
          paperLedgerUpdated: true,
        }
      ] : [],
    };

    setDeals((prev) => [newDeal, ...prev]);

    // Update patient totals and treatments
    if (!newPatientData) {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === dealData.patientId) {
            return {
              ...p,
              totalDealAmount: dealData.totalPrice,
              paidAmount: dealData.advancePaid,
              dueAmount: dealData.remainingBalanceDue,
              hasPendingBalance: dealData.remainingBalanceDue > 0,
              treatmentConcern: dealData.packageName,
              treatments: dealData.treatments || p.treatments,
              statusText: dealData.remainingBalanceDue === 0 ? 'Deal Closed & Cleared' : 'Deal Closed — Pending Balance',
            };
          }
          return p;
        })
      );
    }

    const trtCount = dealData.treatments?.length || 1;
    showToast(`Treatment Closure recorded for ${dealData.patientName} (${trtCount} ${trtCount === 1 ? 'treatment' : 'treatments'}, ${formatIndianCurrency(dealData.totalPrice)})!`);
  };

  // Increment completed sitting for a treatment in a deal & patient
  const handleIncrementSitting = (dealIdOrPatientId: string, treatmentId: string) => {
    let targetTreatmentName = 'treatment';
    let newCompleted = 1;
    let total = 1;

    // Update in deals
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === dealIdOrPatientId || deal.patientId === dealIdOrPatientId) {
          const updated = incrementTreatmentSitting(deal, treatmentId);
          const t = updated.treatments?.find((item) => item.id === treatmentId);
          if (t) {
            targetTreatmentName = t.treatmentName;
            newCompleted = t.completedSittings;
            total = t.totalSittings;
          }
          return updated;
        }
        return deal;
      })
    );

    // Update in patients
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === dealIdOrPatientId || (p.treatments && p.treatments.some((t) => t.id === treatmentId))) {
          const updatedTreatments = (p.treatments || []).map((t) => {
            if (t.id === treatmentId) {
              const next = Math.min(t.totalSittings, t.completedSittings + 1);
              targetTreatmentName = t.treatmentName;
              newCompleted = next;
              total = t.totalSittings;
              return { ...t, completedSittings: next };
            }
            return t;
          });
          const allDone = updatedTreatments.length > 0 && updatedTreatments.every((t) => t.completedSittings >= t.totalSittings);
          return {
            ...p,
            treatments: updatedTreatments,
            statusText: allDone ? 'All Sittings Completed' : `Sitting ${newCompleted}/${total} Completed`,
          };
        }
        return p;
      })
    );

    // Also update profilePatient if currently open in modal
    setProfilePatient((prev) => {
      if (!prev) return null;
      if (prev.id === dealIdOrPatientId || (prev.treatments && prev.treatments.some((t) => t.id === treatmentId))) {
        const updatedTreatments = (prev.treatments || []).map((t) => {
          if (t.id === treatmentId) {
            return { ...t, completedSittings: Math.min(t.totalSittings, t.completedSittings + 1) };
          }
          return t;
        });
        return { ...prev, treatments: updatedTreatments };
      }
      return prev;
    });

    showToast(`Sitting logged! Completed ${newCompleted} of ${total} sittings for ${targetTreatmentName}.`);
  };

  // Add appointment (supports new walk-in / caller / WhatsApp registration)
  const handleAddAppointment = (
    appointmentData: Omit<Appointment, 'id'>,
    newPatientData?: Omit<Patient, 'id' | 'registeredDate'>
  ) => {
    let finalPatientId = appointmentData.patientId;

    if (newPatientData) {
      finalPatientId = `CQ-${2400 + patients.length + 1}`;
      const newPatient: Patient = {
        ...newPatientData,
        id: finalPatientId,
        registeredDate: new Date().toLocaleDateString('en-CA'),
      };
      setPatients((prev) => [newPatient, ...prev]);
    } else if (appointmentData.patientId) {
      // Update existing patient with channel, fee, and appointment info
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === appointmentData.patientId) {
            return {
              ...p,
              bookingChannel: appointmentData.bookingChannel || p.bookingChannel,
              consultationFee: appointmentData.consultationFee || p.consultationFee,
              consultationOutcome: appointmentData.consultationOutcome || p.consultationOutcome,
              nextSitting: `${appointmentData.date}, ${appointmentData.time}`,
              statusText: `Appointment Scheduled — ${appointmentData.time}`,
            };
          }
          return p;
        })
      );
    }

    const newApt: Appointment = {
      ...appointmentData,
      patientId: finalPatientId,
      id: `APT-${Date.now().toString().slice(-4)}`,
    };
    setAppointments((prev) => [newApt, ...prev]);
    showToast(`Visit booked for ${newApt.patientName} (${appointmentData.time})! Saved to patient registry.`);
  };

  const handleToggleAppointmentStatus = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newStatus = a.status === 'Completed' ? 'Scheduled' : 'Completed';
          showToast(`Visit for ${a.patientName} marked as ${newStatus}.`);
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  // Manage Treatments (Hair & Skin) for a patient
  const handleSaveTreatments = (patientId: string, updatedTreatments: TreatmentPlanItem[]) => {
    let targetPatientName = '';

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          targetPatientName = p.name;
          return synchronizePatientFromTreatments(p, updatedTreatments);
        }
        return p;
      })
    );

    // Synchronize to ClosureDeal if one exists for this patient
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.patientId === patientId) {
          const summary = calculateTreatmentsSummary(updatedTreatments);
          return {
            ...deal,
            packageName: updatedTreatments.map((t) => t.treatmentName.split('(')[0].trim()).join(' + '),
            treatments: updatedTreatments,
            totalPrice: summary.totalClosure,
            advancePaid: summary.totalPaid,
            remainingBalanceDue: summary.totalRemaining,
            statusBadge: summary.totalRemaining === 0 ? 'Fully Cleared' : (deal.isSurgical ? 'OT Gate Block' : 'Installment Due'),
            statusType: summary.totalRemaining === 0 ? 'cleared' : (deal.isSurgical ? 'ot_block' : 'due'),
          };
        }
        return deal;
      })
    );

    // Also update profilePatient if open
    setProfilePatient((prev) => {
      if (prev && prev.id === patientId) {
        return synchronizePatientFromTreatments(prev, updatedTreatments);
      }
      return prev;
    });

    showToast(`Treatments updated for ${targetPatientName || 'patient'}! Sittings and dues synced.`);
  };

  // Record post-consultation outcome & doctor fee settlement
  const handleSaveConsultationOutcome = (
    appointmentId: string,
    patientId: string,
    outcome: ConsultationOutcome,
    feeUpdate?: ConsultationFeeRecord,
    notes?: string,
    followUpDate?: string
  ) => {
    let patientName = '';

    // 1. Update appointment
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          patientName = apt.patientName;
          return {
            ...apt,
            consultationOutcome: outcome,
            consultationFee: feeUpdate || apt.consultationFee,
            outcomeNotes: notes ?? apt.outcomeNotes,
            followUpDate: followUpDate ?? apt.followUpDate,
            status: 'Completed',
          };
        }
        return apt;
      })
    );

    // 2. Update patient record (permanently retained in registry)
    let matchingPatient: Patient | undefined;
    setPatients((prev) => {
      const idx = prev.findIndex(
        (p) => p.id === patientId || (selectedOutcomeAppointment && p.phone === selectedOutcomeAppointment.phone)
      );
      if (idx !== -1) {
        matchingPatient = {
          ...prev[idx],
          consultationOutcome: outcome,
          consultationFee: feeUpdate || prev[idx].consultationFee,
          outcomeNotes: notes ?? prev[idx].outcomeNotes,
          followUpDate: followUpDate ?? prev[idx].followUpDate,
          statusText:
            outcome === 'treatment_booked'
              ? 'Treatment Booked / Closed'
              : outcome === 'in_talks'
              ? `In Talks — Follow-up ${followUpDate || 'Due'}`
              : outcome === 'medicines_only'
              ? 'Medicines & Prescription Only'
              : outcome === 'refused_treatment'
              ? 'Consultation Only (Refused Treatment)'
              : prev[idx].statusText,
        };
        const updated = [...prev];
        updated[idx] = matchingPatient;
        return updated;
      }
      return prev;
    });

    setSelectedOutcomeAppointment(null);

    // 3. User feedback & workflow transition
    if (outcome === 'treatment_booked') {
      const targetP = matchingPatient || patients.find((p) => p.id === patientId);
      if (targetP) {
        setRecordClosurePatient(targetP);
        setIsRecordClosureOpen(true);
      }
      showToast(`Treatment Booked for ${patientName || 'patient'}! Opening Package Deal window...`, 'success');
    } else if (outcome === 'in_talks') {
      showToast(`In Talks recorded for ${patientName || 'patient'}. Follow-up reminder scheduled!`, 'info');
    } else if (outcome === 'medicines_only') {
      showToast(`${patientName || 'Patient'} chose Medicines Only. Record permanently retained in Patient Registry.`, 'info');
    } else {
      showToast(`Refused Treatment noted. Patient details safely preserved in Registry.`, 'info');
    }
  };

  // Test Week Management: Clear All Data to start clean with 0 mock patients
  const handleClearDatabaseForTestWeek = async () => {
    const confirmed = window.confirm(
      '⚠️ Clear All Test Records: This will reset the database with 0 patients, 0 package deals, and 0 appointments so staff can test with REAL patients for the test week. Are you sure?'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/clear-all', { method: 'POST' });
      if (res.ok) {
        setPatients([]);
        setDeals([]);
        setAppointments([]);
        setInventory([]);
        setDispensationLogs([]);
        setIsCleanMode(true);
        try {
          localStorage.removeItem('cosmediq_clinic_database');
        } catch (e) {}
        showToast('Database cleared! 0 mock patients, 0 mock stock. Ready for test week.', 'success');
      }
    } catch (err) {
      showToast('Could not clear server database.', 'alert');
    }
  };

  // Test Week Management: Seed sample demo data (for previewing or staff training)
  const handleSeedDemoData = async () => {
    try {
      const res = await fetch('/api/seed-demo', { method: 'POST' });
      if (res.ok) {
        setPatients(INITIAL_PATIENTS);
        setDeals(INITIAL_CLOSURE_DEALS);
        setAppointments(INITIAL_APPOINTMENTS);
        setInventory(INITIAL_INVENTORY);
        setDispensationLogs(INITIAL_DISPENSATION_LOGS);
        setIsCleanMode(false);
        showToast('Sample clinic records loaded for staff walkthrough.', 'info');
      }
    } catch (err) {
      showToast('Could not load sample data.', 'alert');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-[#6366F1]/20 selection:text-[#1E1B4B]">
      
      {/* Global Header with 4 Navigation Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewPatient={() => setIsNewPatientOpen(true)}
        onOpenRecordClosure={() => {
          setRecordClosurePatient(null);
          setIsRecordClosureOpen(true);
        }}
        onOpenBookVisit={() => {
          setBookVisitPatient(null);
          setIsBookVisitOpen(true);
        }}
        onExportData={handleExportData}
        patientCount={patients.length}
        totalPendingDues={financialStats.totalPending}
        todayVisitsCount={todayVisits.length}
        lowStockCount={lowStockCount}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Main Workspace Screen Container */}
      <main className="w-full pt-36 px-4 sm:px-6 lg:px-10 flex-1">
        
        {/* Test Week & Persistent Database Banner */}
        <div className="max-w-7xl mx-auto mb-5 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#1E1B4B] text-xs font-bold border border-indigo-200">
              <Database className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Real Clinic Database</span>
            </span>

            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-xs font-semibold text-slate-700 font-ledger">
                {isSavingDb ? 'Saving changes...' : isDbConnected ? 'Connected & Synced' : 'Connecting to Server...'}
              </span>
            </div>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="text-xs text-slate-500 font-ledger">
              {patients.length === 0 ? (
                <strong className="text-emerald-700 font-bold">Clean Test Week Slate (0 Mock Patients)</strong>
              ) : (
                <span>{patients.length} Real Clinic Patients in Database</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleClearDatabaseForTestWeek}
              className="h-8 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold border border-slate-200 hover:border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Wipe database clean for test week so staff can manage 100% real patients"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
              <span>Clean Slate (0 Records)</span>
            </button>

            <button
              type="button"
              onClick={handleSeedDemoData}
              className="h-8 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-900 text-xs font-semibold border border-slate-200 hover:border-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Load demo clinic records for walkthrough"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>
        </div>

        {activeTab === 'patients' && (
          <PatientsTab
            patients={patients}
            totalPendingDues={financialStats.totalPending}
            todayVisitsCount={todayVisits.length}
            completedVisitsCount={completedVisits}
            onViewProfile={(p) => setProfilePatient(p)}
            onRecordDealForPatient={(p) => {
              setRecordClosurePatient(p);
              setIsRecordClosureOpen(true);
            }}
            onScheduleForPatient={(p) => {
              setBookVisitPatient(p);
              setIsBookVisitOpen(true);
            }}
            onManageTreatments={(p) => setManageTreatmentsPatient(p)}
            onExportAuditLog={handleExportData}
            onPrintRegisterSheet={() => setIsRegisterSheetOpen(true)}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'closures' && (
          <ClosuresTab
            deals={deals}
            onOpenCollectPayment={(deal) => setCollectPaymentDeal(deal)}
            onOpenRecordNewClosure={() => {
              setRecordClosurePatient(null);
              setIsRecordClosureOpen(true);
            }}
            onDaySummaryReport={() => setIsRegisterSheetOpen(true)}
            onIncrementSitting={handleIncrementSitting}
            onManageTreatmentsForPatientId={(pid) => {
              const p = patients.find((pt) => pt.id === pid);
              if (p) setManageTreatmentsPatient(p);
            }}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTab
            appointments={appointments}
            patients={patients}
            onBookNewVisit={() => {
              setBookVisitPatient(null);
              setIsBookVisitOpen(true);
            }}
            onToggleAppointmentStatus={handleToggleAppointmentStatus}
            onOpenOutcomeModal={(apt) => setSelectedOutcomeAppointment(apt)}
            onViewPatientProfile={(p) => setProfilePatient(p)}
            onOpenRecordClosureForPatient={(p) => {
              setRecordClosurePatient(p);
              setIsRecordClosureOpen(true);
            }}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            dispensationLogs={dispensationLogs}
            onAdjustStock={handleAdjustStock}
            onQuickReorder={handleQuickReorder}
            onExportVendorOrder={handleExportVendorOrder}
            onDeleteItem={handleDeleteInventoryItem}
            onAddNewItem={(item) => {
              const fullItem: InventoryItem = {
                id: `item-${Date.now()}`,
                name: item.name || 'New Consumable',
                sku: item.sku || 'SKU-NEW',
                tabCategory: item.tabCategory || 'pharmacy',
                filterCategory: item.filterCategory || 'ot',
                tag: item.tag || 'Clinical Consumable',
                inStock: item.inStock || 10,
                minThreshold: item.minThreshold || 5,
                unit: item.unit || 'Bottles',
                location: item.location || 'OT Locker',
                status: 'optimal',
                lastActionText: 'Newly registered item',
                maxGauge: (item.minThreshold || 5) * 3,
              };
              setInventory((prev) => [fullItem, ...prev]);
              showToast(`Added ${fullItem.name} to clinic stock.`);
            }}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* Global Footer matching design */}
      <footer className="w-full bg-white border-t border-slate-200 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-ledger text-xs text-slate-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span>COSMEDIQ Clinical Operating Environment v3.4</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Desk Terminal #01 (Reception Main)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Local Ledger Sync: Active</span>
            <span>•</span>
            <span>Helpdesk Intercom: Ext 402</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {collectPaymentDeal && (
        <CollectPaymentModal
          deal={collectPaymentDeal}
          onClose={() => setCollectPaymentDeal(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {isNewPatientOpen && (
        <NewPatientModal
          onClose={() => setIsNewPatientOpen(false)}
          onAddPatient={handleAddNewPatient}
        />
      )}

      {isRecordClosureOpen && (
        <RecordClosureModal
          patients={patients}
          preselectedPatient={recordClosurePatient}
          onClose={() => {
            setIsRecordClosureOpen(false);
            setRecordClosurePatient(null);
          }}
          onAddClosureDeal={handleAddClosureDeal}
        />
      )}

      {isBookVisitOpen && (
        <BookVisitModal
          patients={patients}
          preselectedPatient={bookVisitPatient}
          onClose={() => {
            setIsBookVisitOpen(false);
            setBookVisitPatient(null);
          }}
          onAddAppointment={handleAddAppointment}
        />
      )}

      {profilePatient && (
        <PatientProfileModal
          patient={profilePatient}
          onClose={() => setProfilePatient(null)}
          onRecordDeal={(p) => {
            setProfilePatient(null);
            setRecordClosurePatient(p);
            setIsRecordClosureOpen(true);
          }}
          onScheduleVisit={(p) => {
            setProfilePatient(null);
            setBookVisitPatient(p);
            setIsBookVisitOpen(true);
          }}
          onIncrementSitting={handleIncrementSitting}
          onManageTreatments={(p) => setManageTreatmentsPatient(p)}
        />
      )}

      {manageTreatmentsPatient && (
        <ManageTreatmentsModal
          patient={manageTreatmentsPatient}
          onClose={() => setManageTreatmentsPatient(null)}
          onSaveTreatments={handleSaveTreatments}
        />
      )}

      {isRegisterSheetOpen && (
        <DailyRegisterSheetModal
          patients={patients}
          onClose={() => setIsRegisterSheetOpen(false)}
        />
      )}

      {selectedOutcomeAppointment && (
        <ConsultationOutcomeModal
          appointment={selectedOutcomeAppointment}
          patient={patients.find(
            (p) =>
              p.id === selectedOutcomeAppointment.patientId ||
              p.phone === selectedOutcomeAppointment.phone
          )}
          onClose={() => setSelectedOutcomeAppointment(null)}
          onSaveOutcome={handleSaveConsultationOutcome}
          onOpenRecordClosure={(patient) => {
            setSelectedOutcomeAppointment(null);
            setRecordClosurePatient(patient);
            setIsRecordClosureOpen(true);
          }}
        />
      )}

      {/* Live Feedback Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Gemini AI Staff Desk Copilot Chatbot */}
      <GeminiStaffChatbot
        activeTab={activeTab}
        patientCount={patients.length}
        pendingDueTotal={formatIndianCurrency(financialStats.totalPending)}
        lowStockCount={lowStockCount}
        onNavigateTab={(tab) => setActiveTab(tab)}
        isOpenExternal={isChatbotOpen}
        onToggleExternal={(open) => setIsChatbotOpen(open)}
      />

    </div>
  );
}

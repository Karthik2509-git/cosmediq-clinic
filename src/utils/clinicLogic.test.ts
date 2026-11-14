import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatIndianCurrency,
  formatLakhs,
  calculateFinancialStats,
  recordDealPayment,
  calculateStockHealth,
  adjustInventoryStock,
  filterPatients,
  calculateTreatmentsSummary,
  incrementTreatmentSitting,
  getTreatmentSittingsLeft,
  getTreatmentAmountLeft,
  calculateCategoryTreatmentsSummary,
  synchronizePatientFromTreatments,
  adjustTreatmentSittingInList,
  recordSittingForTreatment,
  removeSittingFromTreatment,
} from './clinicLogic.ts';
import type { ClosureDeal, Patient, InventoryItem, TreatmentPlanItem } from './clinicLogic.ts';

test('formatIndianCurrency formats numbers with Indian rupee symbol', () => {
  const result = formatIndianCurrency(40000);
  assert.ok(result.includes('40,000'), `Expected 40,000 in ${result}`);
  assert.ok(result.includes('₹'), `Expected ₹ in ${result}`);
});

test('formatLakhs converts amounts above 100k correctly', () => {
  assert.equal(formatLakhs(1250000), '₹12.5L');
  assert.equal(formatLakhs(920000), '₹9.2L');
  assert.equal(formatLakhs(330000), '₹3.3L');
});

test('calculateFinancialStats aggregates dues, totals, and collection rates accurately', () => {
  const mockDeals: ClosureDeal[] = [
    {
      id: 'DEAL-1',
      patientId: 'CQ-2384',
      patientName: 'Vikramaditya Rao',
      phone: '+91 94480 32190',
      packageName: 'FUE Hair Transplant — 3,200 Grafts',
      totalPrice: 90000,
      advancePaid: 50000,
      remainingBalanceDue: 40000,
      statusBadge: 'OT Gate Block',
      statusType: 'ot_block',
      closureDate: 'Today',
      isSurgical: true,
      paperCitation: 'Vol 1, Page 92',
      payments: [],
    },
    {
      id: 'DEAL-2',
      patientId: 'CQ-2398',
      patientName: 'Ananya Sharma',
      phone: '+91 98112 77410',
      packageName: 'GFC Therapy — Session 3',
      totalPrice: 28000,
      advancePaid: 28000,
      remainingBalanceDue: 0,
      statusBadge: 'Fully Paid',
      statusType: 'cleared',
      closureDate: 'Today',
      isSurgical: false,
      paperCitation: 'Vol 3, Page 08',
      payments: [],
    },
  ];

  const stats = calculateFinancialStats(mockDeals);
  assert.equal(stats.totalAgreed, 118000);
  assert.equal(stats.totalCollected, 78000);
  assert.equal(stats.totalPending, 40000);
  assert.equal(stats.accountsWithDues, 1);
  assert.equal(stats.clearedCount, 1);
  assert.ok(stats.collectionRate > 60);
});

test('recordDealPayment deducts remaining balance and logs payment record', () => {
  const initialDeal: ClosureDeal = {
    id: 'DEAL-1',
    patientId: 'CQ-2384',
    patientName: 'Vikramaditya Rao',
    phone: '+91 94480 32190',
    packageName: 'FUE Hair Transplant — 3,200 Grafts',
    totalPrice: 90000,
    advancePaid: 50000,
    remainingBalanceDue: 40000,
    statusBadge: 'OT Gate Block',
    statusType: 'ot_block',
    closureDate: 'Today',
    isSurgical: true,
    paperCitation: 'Vol 1, Page 92',
    payments: [],
  };

  const { updatedDeal, newPayment } = recordDealPayment(initialDeal, 40000, {
    method: 'UPI / QR',
    referenceNo: 'UPI/HDFC/948201948',
    notes: 'Staff collected before OT prep room admission',
    staffName: 'Priya S.',
    thermalReceiptPrinted: true,
    paperLedgerUpdated: true,
  });

  assert.equal(updatedDeal.advancePaid, 90000);
  assert.equal(updatedDeal.remainingBalanceDue, 0);
  assert.equal(updatedDeal.statusBadge, 'Fully Cleared');
  assert.equal(updatedDeal.statusType, 'cleared');
  assert.equal(newPayment.amount, 40000);
  assert.equal(updatedDeal.payments.length, 1);
});

test('calculateStockHealth identifies low stock under threshold', () => {
  const healthLow = calculateStockHealth(4, 10);
  assert.equal(healthLow.status, 'low');

  const healthGood = calculateStockHealth(45, 10);
  assert.equal(healthGood.status, 'sufficient');
});

test('adjustInventoryStock increments and decrements quantity correctly', () => {
  const item: InventoryItem = {
    id: 'minoxidil',
    name: 'Minoxidil 5%',
    sku: 'MED-MNX-50',
    tabCategory: 'pharmacy',
    filterCategory: 'retail',
    tag: 'Post-Transplant Maintenance',
    inStock: 4,
    minThreshold: 10,
    unit: 'Bottles',
    location: 'Cabinet A - Shelf 2',
    status: 'low',
    lastActionText: 'Initial state',
    maxGauge: 25,
  };

  const dispensed = adjustInventoryStock(item, -1);
  assert.equal(dispensed.inStock, 3);
  assert.equal(dispensed.status, 'low');

  const restocked = adjustInventoryStock(item, 10);
  assert.equal(restocked.inStock, 14);
  assert.equal(restocked.status, 'optimal');
});

test('filterPatients correctly matches search text and filters', () => {
  const patients: Patient[] = [
    {
      id: 'CQ-2401',
      name: 'Rajesh Malhotra',
      age: 34,
      gender: 'Male',
      phone: '+91 98201 44521',
      treatmentConcern: 'FUE Hair Transplant (Grade 4 Alopecia, 2,800 Grafts)',
      concernCategory: 'fue',
      paperRegisterCitation: {
        volume: 'Vol 2',
        page: 'Page 15',
        diaryType: 'Blue Spiral Diary',
        isVerified: true,
      },
      statusText: 'Procedure Scheduled — 24 Oct',
      statusType: 'scheduled',
      totalDealAmount: 110000,
      paidAmount: 75000,
      dueAmount: 35000,
      hasPendingBalance: true,
      registeredDate: '2024-10-18',
    },
    {
      id: 'CQ-2398',
      name: 'Ananya Sharma',
      age: 28,
      gender: 'Female',
      phone: '+91 98112 77410',
      treatmentConcern: 'GFC Therapy — Session 3 of 6',
      concernCategory: 'prp',
      paperRegisterCitation: {
        volume: 'Vol 3',
        page: 'Page 08',
        diaryType: 'Daily OPD Log',
        isVerified: true,
      },
      statusText: 'Session Completed Today',
      statusType: 'completed',
      totalDealAmount: 28000,
      paidAmount: 28000,
      dueAmount: 0,
      hasPendingBalance: false,
      registeredDate: '2024-10-19',
    },
  ];

  // Search by query
  const searchResult = filterPatients(patients, 'Rajesh', 'all', 'all', 'recent');
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].name, 'Rajesh Malhotra');

  // Search by phone
  const phoneResult = filterPatients(patients, '98112', 'all', 'all', 'recent');
  assert.equal(phoneResult.length, 1);
  assert.equal(phoneResult[0].name, 'Ananya Sharma');

  // Filter by pending balance
  const pendingResult = filterPatients(patients, '', 'all', 'pending', 'recent');
  assert.equal(pendingResult.length, 1);
  assert.equal(pendingResult[0].id, 'CQ-2401');
});

test('calculateTreatmentsSummary aggregates multi-treatment closures and sittings', () => {
  const treatments: TreatmentPlanItem[] = [
    {
      id: 'TRT-1',
      treatmentName: 'PRP Hair Density (4 Sessions)',
      category: 'hair',
      closureAmount: 24000,
      paidAmount: 12000,
      remainingAmount: 12000,
      totalSittings: 4,
      completedSittings: 2,
    },
    {
      id: 'TRT-2',
      treatmentName: 'Carbon Laser Hollywood Peel (6 Sittings)',
      category: 'skin',
      closureAmount: 18000,
      paidAmount: 10000,
      remainingAmount: 8000,
      totalSittings: 6,
      completedSittings: 3,
    },
  ];

  const summary = calculateTreatmentsSummary(treatments);
  assert.equal(summary.totalClosure, 42000);
  assert.equal(summary.totalPaid, 22000);
  assert.equal(summary.totalRemaining, 20000);
  assert.equal(summary.totalSittings, 10);
  assert.equal(summary.completedSittings, 5);
  assert.equal(summary.isFullyCleared, false);
});

test('incrementTreatmentSitting advances completed sittings accurately up to total limit', () => {
  const deal: ClosureDeal = {
    id: 'DEAL-COMBO',
    patientId: 'CQ-99',
    patientName: 'Test Patient',
    phone: '+91 99999 88888',
    packageName: 'PRP + Laser Combo',
    totalPrice: 42000,
    advancePaid: 22000,
    remainingBalanceDue: 20000,
    statusBadge: 'Active Treatment',
    statusType: 'due',
    closureDate: 'Today',
    isSurgical: false,
    paperCitation: 'Vol 2, Pg 10',
    payments: [],
    treatments: [
      {
        id: 'TRT-PRP',
        treatmentName: 'PRP Hair',
        category: 'hair',
        closureAmount: 24000,
        paidAmount: 12000,
        remainingAmount: 12000,
        totalSittings: 4,
        completedSittings: 2,
      },
    ],
  };

  const updated1 = incrementTreatmentSitting(deal, 'TRT-PRP');
  assert.equal(updated1.treatments?.[0].completedSittings, 3);

  const updated2 = incrementTreatmentSitting(updated1, 'TRT-PRP');
  assert.equal(updated2.treatments?.[0].completedSittings, 4);

  // Clamped at totalSittings (4)
  const updated3 = incrementTreatmentSitting(updated2, 'TRT-PRP');
  assert.equal(updated3.treatments?.[0].completedSittings, 4);
});

test('recordDealPayment allocates payment across treatments with outstanding dues', () => {
  const dealWithTreatments: ClosureDeal = {
    id: 'DEAL-ALLOC',
    patientId: 'CQ-100',
    patientName: 'Payment Allocation Test',
    phone: '+91 91111 22222',
    packageName: 'Hair + Skin Combo',
    totalPrice: 30000,
    advancePaid: 10000,
    remainingBalanceDue: 20000,
    statusBadge: 'Installment Due',
    statusType: 'due',
    closureDate: 'Today',
    isSurgical: false,
    paperCitation: 'Vol 3, Pg 5',
    payments: [],
    treatments: [
      {
        id: 'T1',
        treatmentName: 'Treatment 1 (Hair)',
        category: 'hair',
        closureAmount: 15000,
        paidAmount: 5000,
        remainingAmount: 10000,
        totalSittings: 2,
        completedSittings: 1,
      },
      {
        id: 'T2',
        treatmentName: 'Treatment 2 (Skin)',
        category: 'skin',
        closureAmount: 15000,
        paidAmount: 5000,
        remainingAmount: 10000,
        totalSittings: 3,
        completedSittings: 0,
      },
    ],
  };

  // Pay ₹15,000 towards the ₹20,000 due
  const { updatedDeal } = recordDealPayment(dealWithTreatments, 15000, {
    method: 'UPI / QR',
    referenceNo: 'UPI/TEST/1234',
    notes: 'Partial payment',
    staffName: 'Desk',
    thermalReceiptPrinted: false,
    paperLedgerUpdated: true,
  });

  assert.equal(updatedDeal.advancePaid, 25000);
  assert.equal(updatedDeal.remainingBalanceDue, 5000);
  // T1 was ₹10,000 due, fully paid; T2 was ₹10,000 due, ₹5,000 paid, ₹5,000 remaining
  assert.equal(updatedDeal.treatments?.[0].remainingAmount, 0);
  assert.equal(updatedDeal.treatments?.[0].paidAmount, 15000);
  assert.equal(updatedDeal.treatments?.[1].remainingAmount, 5000);
  assert.equal(updatedDeal.treatments?.[1].paidAmount, 10000);
});

test('getTreatmentSittingsLeft and getTreatmentAmountLeft calculate correctly', () => {
  const treatment: TreatmentPlanItem = {
    id: 'TRT-TEST',
    treatmentName: 'HydraFacial MD',
    category: 'skin',
    closureAmount: 16000,
    paidAmount: 6000,
    remainingAmount: 10000,
    totalSittings: 4,
    completedSittings: 1,
  };

  assert.equal(getTreatmentSittingsLeft(treatment), 3);
  assert.equal(getTreatmentAmountLeft(treatment), 10000);

  // If completed exceeds total or paid exceeds closure
  const finished: TreatmentPlanItem = {
    ...treatment,
    completedSittings: 5,
    paidAmount: 20000,
  };
  assert.equal(getTreatmentSittingsLeft(finished), 0);
  assert.equal(getTreatmentAmountLeft(finished), 0);
});

test('calculateCategoryTreatmentsSummary correctly groups hair vs skin treatments', () => {
  const multiTreatments: TreatmentPlanItem[] = [
    {
      id: 'T-H1',
      treatmentName: 'FUE Hair Transplant',
      category: 'hair',
      closureAmount: 60000,
      paidAmount: 30000,
      remainingAmount: 30000,
      totalSittings: 1,
      completedSittings: 1,
    },
    {
      id: 'T-H2',
      treatmentName: 'PRP Hair Density',
      category: 'hair',
      closureAmount: 20000,
      paidAmount: 10000,
      remainingAmount: 10000,
      totalSittings: 4,
      completedSittings: 1,
    },
    {
      id: 'T-S1',
      treatmentName: 'HydraFacial MD',
      category: 'skin',
      closureAmount: 16000,
      paidAmount: 16000,
      remainingAmount: 0,
      totalSittings: 4,
      completedSittings: 2,
    },
    {
      id: 'T-L1',
      treatmentName: 'Laser Hair Reduction',
      category: 'laser',
      closureAmount: 18000,
      paidAmount: 9000,
      remainingAmount: 9000,
      totalSittings: 6,
      completedSittings: 3,
    },
  ];

  const hairSummary = calculateCategoryTreatmentsSummary(multiTreatments, 'hair');
  assert.equal(hairSummary.count, 2);
  assert.equal(hairSummary.totalClosure, 80000);
  assert.equal(hairSummary.totalPaid, 40000);
  assert.equal(hairSummary.totalRemaining, 40000);
  assert.equal(hairSummary.totalSittings, 5);
  assert.equal(hairSummary.completedSittings, 2);
  assert.equal(hairSummary.sittingsLeft, 3);

  const skinSummary = calculateCategoryTreatmentsSummary(multiTreatments, 'skin');
  // Includes skin + laser
  assert.equal(skinSummary.count, 2);
  assert.equal(skinSummary.totalClosure, 34000);
  assert.equal(skinSummary.totalPaid, 25000);
  assert.equal(skinSummary.totalRemaining, 9000);
  assert.equal(skinSummary.totalSittings, 10);
  assert.equal(skinSummary.completedSittings, 5);
  assert.equal(skinSummary.sittingsLeft, 5);
});

test('synchronizePatientFromTreatments recalculates patient financial totals and status', () => {
  const patient: Patient = {
    id: 'CQ-2401',
    name: 'Rajesh Malhotra',
    age: 34,
    gender: 'Male',
    phone: '+91 98201 44521',
    treatmentConcern: 'FUE Hair Transplant',
    concernCategory: 'fue',
    paperRegisterCitation: {
      volume: 'Vol 2',
      page: 'Page 15',
      diaryType: 'Blue Spiral Diary',
      isVerified: true,
    },
    statusText: 'Active',
    statusType: 'scheduled',
    totalDealAmount: 60000,
    paidAmount: 30000,
    dueAmount: 30000,
    hasPendingBalance: true,
    registeredDate: '2024-10-14',
  };

  const newTreatments: TreatmentPlanItem[] = [
    {
      id: 'TRT-1',
      treatmentName: 'FUE Hair Transplant (2,500 Grafts)',
      category: 'hair',
      closureAmount: 65000,
      paidAmount: 40000,
      remainingAmount: 25000,
      totalSittings: 1,
      completedSittings: 0,
    },
    {
      id: 'TRT-2',
      treatmentName: 'HydraFacial MD Skin Glow',
      category: 'skin',
      closureAmount: 15000,
      paidAmount: 15000,
      remainingAmount: 0,
      totalSittings: 3,
      completedSittings: 1,
    },
  ];

  const synced = synchronizePatientFromTreatments(patient, newTreatments);
  assert.equal(synced.totalDealAmount, 80000);
  assert.equal(synced.paidAmount, 55000);
  assert.equal(synced.dueAmount, 25000);
  assert.equal(synced.hasPendingBalance, true);
  assert.equal(synced.treatments?.length, 2);
  assert.ok(synced.treatmentConcern.includes('FUE Hair Transplant'));
  assert.ok(synced.treatmentConcern.includes('HydraFacial MD'));
});

test('adjustTreatmentSittingInList increments and decrements correctly within bounds', () => {
  const list: TreatmentPlanItem[] = [
    {
      id: 'T1',
      treatmentName: 'PRP Hair',
      category: 'hair',
      closureAmount: 20000,
      paidAmount: 20000,
      remainingAmount: 0,
      totalSittings: 4,
      completedSittings: 2,
    },
  ];

  const inc = adjustTreatmentSittingInList(list, 'T1', 1);
  assert.equal(inc[0].completedSittings, 3);

  const dec = adjustTreatmentSittingInList(inc, 'T1', -2);
  assert.equal(dec[0].completedSittings, 1);

  // Bounds test: cannot be less than 0
  const floor = adjustTreatmentSittingInList(dec, 'T1', -5);
  assert.equal(floor[0].completedSittings, 0);

  // Bounds test: cannot exceed totalSittings
  const ceil = adjustTreatmentSittingInList(floor, 'T1', 10);
  assert.equal(ceil[0].completedSittings, 4);
});

test('recordSittingForTreatment logs therapist name, notes, and sitting number accurately', () => {
  const initialTreatment: TreatmentPlanItem = {
    id: 'TRT-101',
    treatmentName: 'HydraFacial MD Deep Infusion',
    category: 'skin',
    closureAmount: 16000,
    paidAmount: 16000,
    remainingAmount: 0,
    totalSittings: 4,
    completedSittings: 0,
    sittingHistory: [],
  };

  // Sitting 1 performed by Anitha K.
  const sit1 = recordSittingForTreatment(initialTreatment, {
    therapistName: 'Anitha K.',
    notes: 'Initial deep cleansing & vortex extraction',
  });
  assert.equal(sit1.completedSittings, 1);
  assert.equal(sit1.sittingHistory?.length, 1);
  assert.equal(sit1.sittingHistory?.[0].therapistName, 'Anitha K.');
  assert.equal(sit1.sittingHistory?.[0].sittingNumber, 1);
  assert.equal(sit1.sittingHistory?.[0].notes, 'Initial deep cleansing & vortex extraction');

  // Sitting 2 performed by a different therapist: Priya S.
  const sit2 = recordSittingForTreatment(sit1, {
    therapistName: 'Priya S.',
    notes: 'GlySal acid peel pass 2, skin well hydrated',
  });
  assert.equal(sit2.completedSittings, 2);
  assert.equal(sit2.sittingHistory?.length, 2);
  assert.equal(sit2.sittingHistory?.[1].therapistName, 'Priya S.');
  assert.equal(sit2.sittingHistory?.[1].sittingNumber, 2);

  // Sitting 3 performed by Kavya R.
  const sit3 = recordSittingForTreatment(sit2, {
    therapistName: 'Kavya R.',
    notes: 'Antioxidant infusion & red LED light therapy',
  });
  assert.equal(sit3.completedSittings, 3);
  assert.equal(sit3.sittingHistory?.length, 3);
  assert.equal(sit3.sittingHistory?.[2].therapistName, 'Kavya R.');

  // Test removing a sitting entry
  const afterRemove = removeSittingFromTreatment(sit3, sit3.sittingHistory?.[1].id);
  assert.equal(afterRemove.completedSittings, 2);
  assert.equal(afterRemove.sittingHistory?.length, 2);
  // Re-indexed
  assert.equal(afterRemove.sittingHistory?.[0].sittingNumber, 1);
  assert.equal(afterRemove.sittingHistory?.[1].sittingNumber, 2);
});




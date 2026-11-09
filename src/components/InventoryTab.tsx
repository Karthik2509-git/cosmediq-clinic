/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShoppingCart, 
  BookOpen, 
  Search, 
  X, 
  QrCode, 
  Pill, 
  Sparkles, 
  Plus, 
  Minus, 
  ShoppingBag, 
  History, 
  Download, 
  PlusCircle, 
  CheckCircle2, 
  Archive, 
  Lock, 
  Store, 
  Activity,
  Layers
} from 'lucide-react';
import { InventoryItem, DispensationLog, formatIndianCurrency } from '../utils/clinicLogic';

interface InventoryTabProps {
  inventory: InventoryItem[];
  dispensationLogs: DispensationLog[];
  onAdjustStock: (itemId: string, delta: number, customLabel?: string) => void;
  onQuickReorder: () => void;
  onExportVendorOrder: () => void;
  onAddNewItem: (item: Partial<InventoryItem>) => void;
  searchQuery: string;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  dispensationLogs,
  onAdjustStock,
  onQuickReorder,
  onExportVendorOrder,
  onAddNewItem,
  searchQuery,
}) => {
  const [activeSegment, setActiveSegment] = useState<'pharmacy' | 'products'>('pharmacy');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'ot' | 'retail'>('all');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);

  // New consumable modal state
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<'pharmacy' | 'products'>('pharmacy');
  const [newItemFilter, setNewItemFilter] = useState<'ot' | 'retail' | 'general'>('ot');
  const [newItemQty, setNewItemQty] = useState<number>(20);
  const [newItemMin, setNewItemMin] = useState<number>(5);
  const [newItemUnit, setNewItemUnit] = useState<string>('Bottles');
  const [newItemLocation, setNewItemLocation] = useState<string>('OT Locker A-3');
  const [newItemTag, setNewItemTag] = useState<string>('Surgical Consumable');

  // Manual quantity adjustment modal state
  const [adjustTarget, setAdjustTarget] = useState<{
    item: InventoryItem;
    mode: 'use' | 'restock';
  } | null>(null);
  const [adjustQty, setAdjustQty] = useState<number | string>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const qtyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adjustTarget) {
      const timer = setTimeout(() => {
        qtyInputRef.current?.focus();
        qtyInputRef.current?.select();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [adjustTarget]);

  const handleOpenUseModal = (item: InventoryItem) => {
    setAdjustTarget({ item, mode: 'use' });
    setAdjustQty(1);
    setAdjustReason(
      item.id === 'lignocaine'
        ? 'OT Narcotics Use'
        : item.id === 'prp'
        ? 'PRP OPD Procedure'
        : item.id === 'punches'
        ? 'OT Hair Transplant'
        : item.tabCategory === 'pharmacy'
        ? 'Clinic OPD Procedure'
        : 'Patient Retail Counter'
    );
  };

  const handleOpenRestockModal = (item: InventoryItem) => {
    setAdjustTarget({ item, mode: 'restock' });
    setAdjustQty(5);
    setAdjustReason('Vendor Order Delivery');
  };

  const handleConfirmAdjust = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adjustTarget) return;

    const qty = Math.max(1, Math.floor(Number(adjustQty)));
    if (isNaN(qty) || qty <= 0) return;

    if (adjustTarget.mode === 'use') {
      if (qty > adjustTarget.item.inStock) {
        return;
      }
      onAdjustStock(adjustTarget.item.id, -qty, adjustReason || 'Clinic Usage');
    } else {
      onAdjustStock(adjustTarget.item.id, qty, adjustReason || 'Stock Restocked');
    }

    setAdjustTarget(null);
  };

  const renderCalculationFeedback = () => {
    if (!adjustTarget) return null;
    const qtyNum = Number(adjustQty) || 0;
    if (qtyNum <= 0) {
      return (
        <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Please enter a quantity of 1 or more.
        </div>
      );
    }

    if (adjustTarget.mode === 'use') {
      const isExceeded = qtyNum > adjustTarget.item.inStock;
      if (isExceeded) {
        return (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>Cannot deduct {qtyNum} {adjustTarget.item.unit}. Only {adjustTarget.item.inStock} currently available!</span>
          </div>
        );
      }

      const newStock = adjustTarget.item.inStock - qtyNum;
      return (
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <span className="font-medium">Stock Calculation:</span>
          <div className="flex items-center gap-1.5 font-ledger font-semibold">
            <span>{adjustTarget.item.inStock}</span>
            <span className="text-amber-600 font-bold">− {qtyNum}</span>
            <span>=</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 font-bold">
              {newStock} {adjustTarget.item.unit} remaining
            </span>
          </div>
        </div>
      );
    } else {
      const newStock = adjustTarget.item.inStock + qtyNum;
      return (
        <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
          <span className="font-medium">Stock Calculation:</span>
          <div className="flex items-center gap-1.5 font-ledger font-semibold">
            <span>{adjustTarget.item.inStock}</span>
            <span className="text-indigo-600 font-bold">+ {qtyNum}</span>
            <span>=</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-[#1E1B4B] font-bold">
              {newStock} {adjustTarget.item.unit} new stock
            </span>
          </div>
        </div>
      );
    }
  };

  const query = (localSearch || searchQuery).toLowerCase().trim();
  const lowStockItems = inventory.filter((item) => item.inStock <= item.minThreshold);

  const filteredItems = inventory.filter((item) => {
    // Search match
    if (query) {
      const match =
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.tag.toLowerCase().includes(query);
      if (!match) return false;
    }

    // Segmented tab toggle
    if (activeSegment !== item.tabCategory) {
      // If user selected specific filter chip like 'ot' or 'low', permit cross-tab view or maintain segment
      if (activeFilter === 'all') {
        return false;
      }
    }

    // Filter chip
    if (activeFilter === 'low') {
      return item.inStock <= item.minThreshold;
    }
    if (activeFilter === 'ot') {
      return item.filterCategory === 'ot';
    }
    if (activeFilter === 'retail') {
      return item.filterCategory === 'retail';
    }

    return true;
  });

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddNewItem({
      name: newItemName,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      tabCategory: newItemCategory,
      filterCategory: newItemFilter,
      tag: newItemTag,
      inStock: newItemQty,
      minThreshold: newItemMin,
      unit: newItemUnit,
      location: newItemLocation,
      status: newItemQty <= newItemMin ? 'low' : 'optimal',
      lastActionText: 'Newly registered item in clinic dispensary',
      maxGauge: newItemMin * 3,
    });

    setNewItemName('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col w-full pb-16 max-w-7xl mx-auto">
      
      {/* Top Operational Banner: Low Stock Urgent Notice */}
      <section className="w-full mb-6">
        <div className="urgent-banner-glow w-full bg-gradient-to-r from-red-50 via-rose-50/80 to-amber-50/60 border border-red-300 text-rose-950 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-bold text-red-950 flex items-center gap-2 flex-wrap">
                {lowStockItems.length} Items Running Low — Reorder required for upcoming Hair Transplant Surgeries
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-600 text-white shadow-xs">
                  Priority OT
                </span>
              </span>
              <span className="text-xs text-red-900/80 mt-0.5">
                Stock drops detected in OT Local Anesthesia, PRP Vacuum Tubes &amp; Topical Finasteride. Priority vendor dispatch recommended before Friday schedule.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onQuickReorder}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>1-Click Reorder ({lowStockItems.length} Items)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Control Deck & Segmented Selectors */}
      <section className="w-full bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm mb-6 flex flex-col gap-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Physical Ledger Citation Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="font-ledger text-[11px] text-[#6366F1] font-bold uppercase tracking-widest block">
                Operational Dispensary
              </span>
              <h2 className="text-xl sm:text-2xl text-[#1E1B4B] font-bold">
                Clinic Stock &amp; Consumables
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-ledger text-xs border border-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-[#6366F1]" />
              Log Binder #04 • Shelf Bay R-2
            </span>
          </div>

          {/* Live Search & Scanner Trigger */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search medicine, serum, syringe, graft punch..."
                className="w-full h-11 pl-10 pr-10 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#6366F1]/30 border border-slate-200 transition-all shadow-inner"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setScannerOpen(!scannerOpen)}
              title="Scan Barcode via Counter Cam"
              className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all border active:scale-95 cursor-pointer ${
                scannerOpen
                  ? 'bg-indigo-100 text-[#6366F1] border-indigo-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

        </div>

        {scannerOpen && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 animate-fade-in">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Counter optical barcode reader connected &amp; ready to scan medicine packs.
            </span>
            <button
              type="button"
              onClick={() => setScannerOpen(false)}
              className="font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Big Two-Way Segmented Control Toggle & Micro Filter */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
          
          {/* Row 1: Segmented Department Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 w-full sm:w-auto shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveSegment('pharmacy');
                  setActiveFilter('all');
                }}
                className={`flex-1 sm:flex-none h-10 px-4 sm:px-6 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeSegment === 'pharmacy' && activeFilter === 'all'
                    ? 'bg-white text-[#1E1B4B] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pill className="w-4 h-4 text-[#6366F1]" />
                <span>Clinic Pharmacy (Medicines &amp; Post-Op)</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] font-ledger text-[11px] font-semibold">
                  {inventory.filter((i) => i.tabCategory === 'pharmacy').length} Items
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSegment('products');
                  setActiveFilter('all');
                }}
                className={`flex-1 sm:flex-none h-10 px-4 sm:px-6 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeSegment === 'products' && activeFilter === 'all'
                    ? 'bg-white text-[#1E1B4B] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Clinic Products (Serums, Shampoos &amp; Care)</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-ledger text-[11px]">
                  {inventory.filter((i) => i.tabCategory === 'products').length} Items
                </span>
              </button>
            </div>

            {/* Quick Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="font-ledger text-[11px] font-bold text-slate-400 uppercase mr-1 whitespace-nowrap">
                Filter:
              </span>

              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#1E1B4B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('low')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFilter === 'low'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                Low Stock Only ({lowStockItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('ot')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'ot'
                    ? 'bg-[#1E1B4B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                OT Consumables
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('retail')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'retail'
                    ? 'bg-[#1E1B4B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Retail Dispense
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* Live Stock Grid: Responsive Tactile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {filteredItems.map((item) => {
          const isLow = item.inStock <= item.minThreshold;
          const isRetailAction = item.id === 'biotin' || item.mrp;
          const percent = Math.min(100, Math.round((item.inStock / item.maxGauge) * 100));

          // Clinical terminology for each item
          let dispenseLabel = 'Record Used';
          if (item.id === 'lignocaine') {
            dispenseLabel = 'OT Narcotics Use';
          } else if (item.id === 'prp') {
            dispenseLabel = 'Record Used';
          } else if (item.id === 'punches' || item.id === 'graftsol') {
            dispenseLabel = 'Record Used';
          } else if (item.filterCategory === 'retail' || item.tabCategory === 'products') {
            dispenseLabel = 'Sell / Dispense';
          }

          return (
            <article
              key={item.id}
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#6366F1]/40"
            >
              <div>
                {/* Card Header Tags */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-semibold flex items-center gap-1">
                    {item.tag}
                  </span>

                  {isLow ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      LOW STOCK
                    </span>
                  ) : item.vendorInfo ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold">
                      {item.vendorInfo}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Ample Stock
                    </span>
                  )}
                </div>

                {/* Item Name */}
                <h3 className="text-base font-bold text-[#1E1B4B] leading-snug mb-1 group-hover:text-[#6366F1] transition-colors">
                  {item.name}
                </h3>

                {/* SKU & Storage Location */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="font-ledger text-xs text-slate-400">SKU: {item.sku}</span>
                  {item.mrp && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="font-ledger text-xs text-slate-700 font-semibold">
                        MRP: {formatIndianCurrency(item.mrp)}
                      </span>
                    </>
                  )}
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 font-ledger text-xs">
                    <Archive className="w-3 h-3 text-slate-400" />
                    {item.location}
                  </span>
                </div>

                {/* Metric & Visual Level Gauge */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-4">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="font-ledger text-[11px] font-bold text-slate-400 block uppercase">
                        CURRENT IN-STOCK
                      </span>
                      <div className="flex items-baseline mt-0.5">
                        <span className={`text-3xl font-bold font-ledger leading-none ${
                          isLow ? 'text-red-600' : 'text-[#1E1B4B]'
                        }`}>
                          {item.inStock}
                        </span>
                        <span className="text-xs font-medium text-slate-500 ml-1.5">
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    <span className={`text-right font-ledger text-xs font-semibold px-2 py-0.5 rounded ${
                      isLow
                        ? 'text-red-700 bg-red-100'
                        : 'text-emerald-700 bg-emerald-50'
                    }`}>
                      {isLow ? `Min Threshold: ${item.minThreshold}` : 'Stock Optimal'}
                    </span>
                  </div>

                  {/* Level Gauge Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow
                          ? 'bg-gradient-to-r from-red-500 to-rose-400'
                          : 'bg-gradient-to-r from-[#6366F1] to-teal-400'
                      }`}
                      style={{ width: `${Math.max(8, percent)}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Manual Usage & Restocking Actions */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Action 1: Record Used / Dispense / Sell */}
                  {isRetailAction ? (
                    <button
                      type="button"
                      onClick={() => handleOpenUseModal(item)}
                      className="h-11 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm shadow-amber-600/20 cursor-pointer"
                      title="Enter quantity sold or dispensed to patient"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>Sell / Dispense</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenUseModal(item)}
                      className="h-11 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E1B4B] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-200"
                      title="Enter quantity used in procedure or OT"
                    >
                      <Minus className="w-4 h-4 shrink-0 text-slate-500" />
                      <span>{dispenseLabel}</span>
                    </button>
                  )}

                  {/* Action 2: Restock Stock */}
                  <button
                    type="button"
                    onClick={() => handleOpenRestockModal(item)}
                    className="h-11 px-2.5 rounded-xl bg-[#6366F1] hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm shadow-indigo-500/20 cursor-pointer"
                    title="Enter quantity received from supplier to restock"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>+ Restock Stock</span>
                  </button>
                </div>

                <span className="text-center font-ledger text-[11px] text-slate-400 pt-1 truncate">
                  {item.lastActionText}
                </span>
              </div>

            </article>
          );
        })}
      </div>

      {/* Operational Audit Trail & Recent Dispensation Strip */}
      <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6366F1]"></span>
            </div>
            <History className="w-5 h-5 text-[#6366F1]" />
            <h4 className="text-sm font-bold text-[#1E1B4B]">
              Recent Counter Dispensation &amp; Usage Log
            </h4>
          </div>
          <span className="font-ledger text-xs text-slate-400">
            Real-time local register sync active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dispensationLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-50/80 hover:bg-indigo-50/60 p-3 rounded-xl border border-slate-200/80 hover:border-indigo-200 flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#6366F1] group-hover:bg-[#6366F1] group-hover:text-white transition-all shadow-xs">
                {log.type === 'medicine' ? (
                  <Pill className="w-4 h-4" />
                ) : log.type === 'ot' ? (
                  <Activity className="w-4 h-4 text-amber-600 group-hover:text-white" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#6366F1] transition-colors">
                  {log.title}
                </p>
                <p className="font-ledger text-[11px] text-slate-400 truncate">
                  {log.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Operational Control Bar for Front Desk Staff */}
      <aside className="sticky bottom-4 z-40 w-full bg-[#1E1B4B] text-white rounded-2xl p-4 shadow-2xl shadow-indigo-950/30 border border-[#312E81] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1] text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
            <Layers className="w-5 h-5 text-teal-200" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white leading-tight truncate">
              Dispensary Operations Active
            </span>
            <span className="font-ledger text-xs text-indigo-200 truncate">
              {inventory.length} SKUs Monitored • Total Clinic Stock Value: ₹4,18,600
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onExportVendorOrder}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Vendor Order</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-[#6366F1] hover:bg-indigo-600 text-white text-xs font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Consumable</span>
          </button>
        </div>
      </aside>

      {/* Manual Stock Adjustment Modal (Usage & Restock) */}
      {adjustTarget && (
        <div 
          className="fixed inset-0 z-50 bg-[#1E1B4B]/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
          onClick={() => setAdjustTarget(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-5 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  adjustTarget.mode === 'use'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-indigo-100 text-[#6366F1] border border-indigo-200'
                }`}>
                  {adjustTarget.mode === 'use' ? (
                    <Minus className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E1B4B] leading-tight">
                    {adjustTarget.mode === 'use' ? 'Record Usage / Dispense' : 'Restock Inventory'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1">
                    {adjustTarget.item.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAdjustTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Stock Snapshot Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">
                  {adjustTarget.item.location}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-ledger text-[11px] font-bold text-slate-400 uppercase">
                  Available:
                </span>
                <span className="font-ledger text-base font-bold text-[#1E1B4B]">
                  {adjustTarget.item.inStock} {adjustTarget.item.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmAdjust} className="flex flex-col gap-4">
              {/* Question & Manual Number Entry */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wide flex items-center justify-between">
                  <span>
                    {adjustTarget.mode === 'use' ? 'How many used / dispensed?' : 'How many units to restock / add?'}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Type any number
                  </span>
                </label>

                {/* Big Tactile Number Input with Steppers */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustQty((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                    className="h-14 w-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg active:scale-95 transition-all cursor-pointer border border-slate-200 shrink-0"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      ref={qtyInputRef}
                      type="number"
                      min="1"
                      max={adjustTarget.mode === 'use' ? adjustTarget.item.inStock : undefined}
                      value={adjustQty}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setAdjustQty('');
                        } else {
                          setAdjustQty(parseInt(val, 10) || 0);
                        }
                      }}
                      className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-200 focus:border-[#6366F1] focus:bg-white rounded-2xl text-center font-ledger text-2xl font-bold text-[#1E1B4B] outline-none transition-all shadow-inner"
                      placeholder="1"
                      required
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-ledger text-xs font-semibold text-slate-400 pointer-events-none">
                      {adjustTarget.item.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustQty((prev) => {
                        const next = (Number(prev) || 0) + 1;
                        if (adjustTarget.mode === 'use' && next > adjustTarget.item.inStock) {
                          return prev;
                        }
                        return next;
                      });
                    }}
                    className="h-14 w-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg active:scale-95 transition-all cursor-pointer border border-slate-200 shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
                  {(adjustTarget.mode === 'use' ? [1, 2, 3, 5, 10] : [5, 10, 20, 50, 100]).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAdjustQty(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-ledger font-semibold transition-all cursor-pointer ${
                        Number(adjustQty) === num
                          ? 'bg-[#1E1B4B] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {adjustTarget.mode === 'use' ? `${num}` : `+${num}`}
                    </button>
                  ))}
                  {adjustTarget.mode === 'use' && adjustTarget.item.inStock > 0 && (
                    <button
                      type="button"
                      onClick={() => setAdjustQty(adjustTarget.item.inStock)}
                      className="px-2.5 py-1 rounded-lg text-xs font-ledger font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
                    >
                      All ({adjustTarget.item.inStock})
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Calculation & Validation Feedback */}
              {renderCalculationFeedback()}

              {/* Department / Reason Tag */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Operation / Usage Note
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(adjustTarget.mode === 'use'
                    ? ['OT Surgery', 'OPD Procedure', 'Patient Retail Sale', 'Damage / Sample']
                    : ['Vendor Delivery Restock', 'Stock Transfer', 'OPD Refill', 'Inventory Audit']
                  ).map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setAdjustReason(note)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        adjustReason === note
                          ? 'bg-[#1E1B4B] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !adjustQty ||
                    Number(adjustQty) <= 0 ||
                    (adjustTarget.mode === 'use' && Number(adjustQty) > adjustTarget.item.inStock)
                  }
                  className={`h-11 px-6 rounded-xl text-white text-xs font-bold active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    adjustTarget.mode === 'use'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                      : 'bg-[#6366F1] hover:bg-indigo-600 shadow-indigo-600/30'
                  }`}
                >
                  {adjustTarget.mode === 'use'
                    ? `Confirm & Deduct (${Number(adjustQty) || 0} ${adjustTarget.item.unit})`
                    : `Confirm Restock (+${Number(adjustQty) || 0} ${adjustTarget.item.unit})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1E1B4B]/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1E1B4B]">New Consumable Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Item / Consumable Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Sodium Chloride 0.9% 500ml"
                  className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#6366F1]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Dispensary Tab
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 focus:outline-none"
                  >
                    <option value="pharmacy">Clinic Pharmacy</option>
                    <option value="products">Clinic Products</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newItemTag}
                    onChange={(e) => setNewItemTag(e.target.value)}
                    placeholder="e.g., Surgical OT Equipment"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Unit Type
                  </label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="Bottles, Packs, Vials"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemMin}
                    onChange={(e) => setNewItemMin(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Storage Shelf / Bay
                  </label>
                  <input
                    type="text"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    placeholder="OT Locker A-3"
                    className="w-full h-10 px-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#6366F1] hover:bg-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Consumable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

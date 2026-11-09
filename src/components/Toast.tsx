/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'alert' | 'info';
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
}) => {
  if (!message) return null;

  return (
    <div className="fixed top-36 right-4 sm:right-8 z-50 bg-[#1E1B4B] text-white border border-indigo-900/60 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in-up">
      {type === 'success' && <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />}
      {type === 'alert' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
      {type === 'info' && <Info className="w-5 h-5 text-indigo-300 shrink-0" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

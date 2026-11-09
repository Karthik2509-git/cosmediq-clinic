/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  Bot, 
  User, 
  ChevronDown, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  BookOpen, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiStaffChatbotProps {
  activeTab: 'patients' | 'closures' | 'appointments' | 'inventory';
  patientCount: number;
  pendingDueTotal: string;
  lowStockCount: number;
  onNavigateTab?: (tab: 'patients' | 'closures' | 'appointments' | 'inventory') => void;
  isOpenExternal?: boolean;
  onToggleExternal?: (open: boolean) => void;
}

const INITIAL_SUGGESTIONS = [
  "How do I collect a pending balance payment?",
  "What is the 'Paper Register Citation'?",
  "How to dispense medicine/serum to OT?",
  "How to record a new package deal?",
  "How do I print the daily OPD register?",
  "What are the 4 main tabs on this portal?",
];

export const GeminiStaffChatbot: React.FC<GeminiStaffChatbotProps> = ({
  activeTab,
  patientCount,
  pendingDueTotal,
  lowStockCount,
  onNavigateTab,
  isOpenExternal,
  onToggleExternal,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onToggleExternal) {
      onToggleExternal(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Namaste & Welcome to COSMEDIQ Staff Copilot!**\n\nI am your intelligent assistant powered by **Gemini 3.8 Flash**, ready to answer any questions about using this clinic operating desk.\n\nHere is how I can help:\n• **Collecting Payments:** Step-by-step guidance on recording UPI, Cash, POS, or Bank dues on Tab 2.\n• **Paper Register Citations:** How to link physical clinic diary volume & page numbers to digital records.\n• **OT Dispensing & Restocking:** How to use the inventory steppers in Tab 4.\n• **Shortcuts & Tips:** Press **⌘K** to search patients instantly!\n\nWhat would you like to know or check today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation payload for backend Gemini API
      const conversationPayload = [...messages, userMessage].map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationPayload,
          currentContext: {
            activeTab,
            patientCount,
            pendingDueTotal,
            lowStockCount,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'No response returned from the assistant.';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Unable to reach Gemini Assistant right now.**\n\n*Quick offline clinic guide:*\n• **To collect balance:** Go to **Tab 2 (Treatment Closures)** and click the amber **'+ Collect Balance'** button.\n• **To add a patient:** Click the solid teal **'+ New Patient'** button in the top right.\n• **To search:** Press **⌘K** on your keyboard.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-cleared',
        role: 'assistant',
        content: `Chat history cleared. How can I help you operate the COSMEDIQ desk portal right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Convert simple markdown into clean HTML/JSX
  const renderMessageContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {paragraphs.map((paragraph, pIdx) => {
          const lines = paragraph.split('\n');
          return (
            <div key={pIdx} className="space-y-1">
              {lines.map((line, lIdx) => {
                // Bullet points
                if (line.startsWith('• ') || line.startsWith('- ')) {
                  const bulletText = line.replace(/^[•-]\s*/, '');
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>{formatInlineMarkdown(bulletText)}</span>
                    </div>
                  );
                }
                // Numbered list
                if (/^\d+\.\s/.test(line)) {
                  const num = line.match(/^(\d+)\.\s/)?.[1];
                  const numText = line.replace(/^\d+\.\s*/, '');
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-2">
                      <span className="font-semibold text-teal-700 min-w-[1.2rem]">{num}.</span>
                      <span>{formatInlineMarkdown(numText)}</span>
                    </div>
                  );
                }
                return <p key={lIdx}>{formatInlineMarkdown(line)}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper for inline bold, italic, and code highlighting
  const formatInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-200 text-teal-800 px-1 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const getTabFriendlyName = (tab: string) => {
    switch (tab) {
      case 'patients':
        return 'Tab 1: Patient Records';
      case 'closures':
        return 'Tab 2: Treatment Closures';
      case 'appointments':
        return 'Tab 3: Appointments';
      case 'inventory':
        return 'Tab 4: Stocks & Inventory';
      default:
        return tab;
    }
  };

  return (
    <>
      {/* Floating Trigger Button (when chat is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-teal-400/30"
          title="Open COSMEDIQ Staff Copilot (Gemini AI)"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-teal-800" />
          </div>
          <div className="text-left font-sans">
            <div className="text-xs font-bold tracking-wide uppercase text-teal-100 flex items-center gap-1.5">
              <span>Staff Copilot</span>
              <span className="bg-teal-900/60 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">Gemini 3.8</span>
            </div>
            <div className="text-[11px] text-teal-50 opacity-90">Got questions? Ask for help</div>
          </div>
        </button>
      )}

      {/* Slide-Up Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10 md:inset-16'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] md:w-[480px] h-[600px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-teal-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    COSMEDIQ Staff Copilot
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/80">
                  Powered by Gemini 3.8 • Clinic Desk Knowledge
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize size' : 'Expand full view'}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Copilot"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-slate-500">Live Context:</span>
              <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {getTabFriendlyName(activeTab)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span>{patientCount} pts</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">{pendingDueTotal} due</span>
            </div>
          </div>

          {/* Messages Container with generous top & bottom padding */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50 scroll-smooth">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] group relative ${isUser ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`p-3.5 rounded-2xl shadow-sm text-sm ${
                        isUser
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{message.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-teal-700 p-0.5"
                          title="Copy answer"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center justify-start text-slate-500 text-xs">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs text-slate-600">Copilot is researching the portal guidelines...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          <div className="bg-white border-t border-slate-100 p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
              <span>Quick Staff Questions</span>
              <span className="text-teal-600 font-medium">Tap to Ask</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none pb-0.5">
              {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  disabled={isLoading}
                  className="bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-full transition-all text-left font-medium active:scale-95 cursor-pointer leading-tight"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Copilot anything about using this portal..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-md transition-all shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

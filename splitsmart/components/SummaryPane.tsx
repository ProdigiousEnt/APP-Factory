
import React, { useState } from 'react';
import { Totals } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, Copy, Users, TrendingUp, ChevronRight, Save, Loader2, Edit3 } from 'lucide-react';

interface SummaryPaneProps {
  totals: Totals;
  currency: string;
  onSave?: () => void;
  isSaving?: boolean;
  onTipChange?: (newTip: number) => void;
}

const SummaryPane: React.FC<SummaryPaneProps> = ({ totals, currency, onSave, isSaving, onTipChange }) => {
  const people = Object.keys(totals);

  const handleEditTip = () => {
    const firstPerson = people[0];
    const currentTip = firstPerson ? totals[firstPerson].tip : 0;
    const newTipStr = prompt(`Enter tip amount (current: ${currency}${currentTip.toFixed(2)}):`, currentTip.toString());
    if (newTipStr !== null) {
      const newTip = parseFloat(newTipStr);
      if (!isNaN(newTip) && newTip >= 0 && onTipChange) {
        onTipChange(newTip);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 overflow-y-auto">
      <div className="px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Summary</h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-600 active:scale-90 transition-all">
              <Share2 size={18} />
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || people.length === 0}
              className="px-4 py-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100 flex items-center gap-2 text-white active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span className="text-sm font-bold">Save Split</span>
            </button>
          </div>
        </div>

        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 mb-4">
              <Users size={32} />
            </div>
            <h3 className="font-bold text-zinc-900 mb-1">No assignments yet</h3>
            <p className="text-sm text-zinc-500 font-medium">Chat with Gemini to start splitting items between friends.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-48">
            {people.map((person, idx) => (
              <motion.div
                key={person}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={64} className="text-indigo-600" />
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg">
                      {person.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg leading-none">{person}</h3>
                      <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-1.5">{totals[person].items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-zinc-900">{currency}{totals[person].total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {totals[person].items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                        <span className="text-zinc-600 font-medium truncate max-w-[150px]">{item.itemName}</span>
                        {item.sharedWithCount > 1 && (
                          <span className="text-[10px] bg-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">Shared</span>
                        )}
                      </div>
                      <span className="text-zinc-400 font-bold tracking-tight">{currency}{item.individualCost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <div className="flex gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <div className="flex flex-col">
                      <span>Tax</span>
                      <span className="text-zinc-800">{currency}{totals[person].tax.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Tip</span>
                      <span className="text-zinc-800">{currency}{totals[person].tip.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleEditTip}
                    className="flex items-center gap-1 text-indigo-600 font-bold text-xs hover:gap-2 transition-all"
                  >
                    <Edit3 size={12} /> Edit Tip
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPane;


import React, { useState } from 'react';
import { ReceiptData, Assignment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt as ReceiptIcon, Info, ChevronRight, Plus, X, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ReceiptPaneProps {
  receipt: ReceiptData;
  assignments: Assignment[];
  onAssign: (itemId: string, personName: string) => void;
  onUnassign: (itemId: string, personName: string) => void;
}

const ReceiptPane: React.FC<ReceiptPaneProps> = ({ receipt, assignments, onAssign, onUnassign }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    try { await Haptics.impact({ style }); } catch (e) { }
  };

  const handleAddPerson = (itemId: string) => {
    if (!newName.trim()) return;
    triggerHaptic(ImpactStyle.Medium);
    onAssign(itemId, newName.trim());
    setNewName('');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50/50">
      <div className="px-5 py-6">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Receipt Items</h2>
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{receipt.items.length} Items</span>
        </div>
        <p className="text-zinc-500 text-sm font-medium">Tap items to assign people manually or use AI Chat.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-64 space-y-3">
        {receipt.items.map((item, idx) => {
          const itemPeople = assignments
            .filter(a => a.itemIds.includes(item.id))
            .map(a => a.personName);

          const isEditing = editingItemId === item.id;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id}
              className={`bg-white rounded-3xl p-4 shadow-sm border transition-all ${isEditing ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-zinc-100 hover:border-zinc-300'}`}
              onClick={() => {
                if (!isEditing) {
                  triggerHaptic(ImpactStyle.Light);
                  setEditingItemId(item.id);
                  setNewName('');
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                  <span className="font-bold text-lg">{item.quantity}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-zinc-900 truncate pr-2">{item.name}</h3>
                    <span className="font-black text-zinc-900">{receipt.currency}{item.price.toFixed(2)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {itemPeople.length > 0 ? (
                      itemPeople.map((name, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl group"
                        >
                          <span className="text-[11px] font-bold uppercase tracking-tight">{name}</span>
                          {isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic(ImpactStyle.Light);
                                onUnassign(item.id, name);
                              }}
                              className="p-0.5 hover:bg-indigo-200 rounded-full"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                        <Info size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Unassigned</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing && <ChevronRight size={18} className="text-zinc-300" />}
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Type a name (e.g. John)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPerson(item.id)}
                            className="w-full bg-zinc-50 border-none rounded-2xl py-2.5 pl-9 pr-4 text-sm font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <button
                          onClick={() => handleAddPerson(item.id)}
                          disabled={!newName.trim()}
                          className="bg-indigo-600 text-white p-2.5 rounded-2xl active:scale-95 disabled:opacity-50 transition-all font-bold"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 py-1"
                      >
                        Done Editing
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Floating Footer */}
      <div className="absolute bottom-4 left-4 right-4 bg-zinc-900 text-white rounded-3xl p-5 shadow-2xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ReceiptIcon size={20} className="text-indigo-300" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Subtotal</p>
            <p className="text-xl font-black">{receipt.currency}{receipt.total.toFixed(2)}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Tax & Tip</p>
          <p className="text-lg font-bold text-indigo-300">+{receipt.currency}{(receipt.tax + (receipt.tip || 0)).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPane;

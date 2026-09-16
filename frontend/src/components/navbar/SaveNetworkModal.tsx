import React, { useState, useEffect } from 'react';
import { X, Save, Tag, AlignLeft, Network, Layers, Sparkles } from 'lucide-react';
import { NetworkGraph, ResilienceResult } from '@/lib/types';

interface SaveNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, category: string) => void;
  currentName: string;
  currentDescription?: string;
  currentCategory?: string;
  graph: NetworkGraph;
  resilience?: ResilienceResult | null;
}

export const SaveNetworkModal: React.FC<SaveNetworkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName,
  currentDescription = '',
  currentCategory = 'Custom Design',
  graph,
  resilience,
}) => {
  const [name, setName] = useState(currentName || 'Untitled Topology');
  const [description, setDescription] = useState(currentDescription || '');
  const [category, setCategory] = useState(currentCategory || 'Custom Design');

  useEffect(() => {
    if (isOpen) {
      setName(currentName || 'Untitled Topology');
      setDescription(currentDescription || '');
      setCategory(currentCategory || 'Custom Design');
    }
  }, [isOpen, currentName, currentDescription, currentCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim(), category);
  };

  const categories = [
    'Custom Design',
    'Enterprise & Campus',
    'Cloud & Datacenter',
    'Critical Infrastructure / SCADA',
    'IoT & Smart Edge',
    'ISP / Mesh Core'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-white/[0.08] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/70 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/60 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Save Network Topology
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Save this network to your local library to edit or stress-test later.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Topology Preview Specs Pill */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Hardware</span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                  {graph.nodes.length} nodes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Network className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Fiber Links</span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                  {graph.edges.length} links
                </span>
              </div>
            </div>
          </div>

          {/* Field 1: Network Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Network Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Headquarters Core Backbone"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>

          {/* Field 2: Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Category (Optional)</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#0f1422] text-slate-900 dark:text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Field 3: Description (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlignLeft className="w-3 h-3 text-slate-400" />
              <span>Description (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add architecture notes, purpose, redundancy constraints, or subnet details..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

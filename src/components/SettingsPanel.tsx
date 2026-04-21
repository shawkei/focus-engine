/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusStore } from '../store/useStore';
import { X, Clock, Plus, Trash2, RotateCcw, ChevronRight, Volume2, VolumeX, BarChart2, LayoutGrid } from 'lucide-react';
import { EnergyLevel } from '../types';
import { soundService, SoundType } from '../lib/audio';

export const SettingsPanel: React.FC = () => {
  const { 
    isSettingsOpen, 
    toggleSettings, 
    categoryDurations, 
    selectedGoal, 
    setCategoryDuration,
    customCategories,
    addCategory,
    deleteCategory,
    resetStats,
    audioEnabled,
    setAudioEnabled,
    audioSound,
    setAudioSound,
    setCurrentView
  } = useFocusStore();

  const [newCatName, setNewCatName] = useState('');
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  const soundOptions: { name: string; id: SoundType }[] = [
    { name: 'NEURAL CHIME', id: 'chime' },
    { name: 'DIGITAL ALERT', id: 'digital' },
    { name: 'OS PULSE', id: 'pulse' },
  ];

  const durations = categoryDurations[selectedGoal] || { low: 15, normal: 25, high: 45 };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettings}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card-bg border-l border-white/5 z-[101] shadow-2xl overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5 sticky top-0 bg-card-bg/80 backdrop-blur-md z-10">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-blue mb-1">SYSTEM.CONFIG</p>
                <h2 className="text-2xl font-rounded font-black text-white uppercase tracking-tighter">PARAMETERS</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSettings}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="p-8 space-y-12">
              {/* Navigation Quick Actions */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <LayoutGrid size={16} className="text-accent-blue" />
                  <h3 className="text-xs uppercase font-black tracking-[0.2em] text-white/30">QUICK.NAV</h3>
                </div>
                <button 
                  onClick={() => {
                    setCurrentView('stats');
                    toggleSettings();
                  }}
                  className="w-full p-6 bg-accent-blue/10 border border-accent-blue/20 rounded-3xl flex items-center justify-between group hover:bg-accent-blue/20 transition-all"
                >
                  <div className="flex items-center gap-4 text-accent-blue">
                    <BarChart2 size={24} className="group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-sm font-black uppercase tracking-tight">ANALYSIS CENTER</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">DEEP LOG EXPLORATION</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-accent-blue/40" />
                </button>
              </section>

              {/* Audio Settings */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className="text-accent-blue" />
                    <h3 className="text-xs uppercase font-black tracking-[0.2em] text-white/30">AUDITORY.LINKS</h3>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${audioEnabled ? 'bg-accent-blue' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: audioEnabled ? 24 : 0 }}
                    />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {audioEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {soundOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setAudioSound(opt.id);
                            soundService.play(opt.id);
                          }}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            audioSound === opt.id 
                              ? 'bg-accent-blue/10 border-accent-blue text-accent-blue' 
                              : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">{opt.name}</span>
                          {audioSound === opt.id && <div className="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(0,122,255,1)]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Duration Settings */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={16} className="text-accent-blue" />
                  <h3 className="text-xs uppercase font-black tracking-[0.2em] text-white/30">DURATIONS: {selectedGoal}</h3>
                </div>
                <div className="space-y-4">
                  {(['low', 'normal', 'high'] as EnergyLevel[]).map((level) => (
                    <div key={level} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-accent-blue/30 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-1">{level} energy</span>
                        <span className="text-xl font-rounded font-black uppercase text-white">{durations[level]} MINS</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setCategoryDuration(selectedGoal, level, Math.max(1, durations[level] - 5))}
                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold hover:bg-white/10 transition-colors"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => setCategoryDuration(selectedGoal, level, Math.min(180, durations[level] + 5))}
                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold hover:bg-accent-blue text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Category Management */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Plus size={16} className="text-accent-blue" />
                  <h3 className="text-xs uppercase font-black tracking-[0.2em] text-white/30">COLLECTIONS</h3>
                </div>
                
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="NEW LOG..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold font-rounded uppercase tracking-widest focus:outline-none focus:border-accent-blue/50 placeholder:text-white/10"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-accent-blue p-4 rounded-2xl text-white shadow-lg shadow-accent-blue/20"
                  >
                    <Plus size={20} />
                  </motion.button>
                </form>

                <div className="space-y-2">
                  {customCategories.map((cat) => (
                    <motion.div 
                      key={cat}
                      layout
                      className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
                    >
                      <span className="text-xs font-bold font-rounded uppercase tracking-widest text-white/60">{cat}</span>
                      {cat !== 'Work' && cat !== 'Custom' && (
                        <button 
                          onClick={() => deleteCategory(cat)}
                          className="text-white/10 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Dangerous Area */}
              <section className="pt-12 border-t border-white/5">
                {!isResetConfirming ? (
                  <button 
                    onClick={() => setIsResetConfirming(true)}
                    className="w-full p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-3xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4 text-red-500">
                      <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">REBOOT CORE DATA</span>
                    </div>
                    <ChevronRight size={16} className="text-red-500/30" />
                  </button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] text-center">CONFIRM SYSTEM WIPE?</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          resetStats();
                          setIsResetConfirming(false);
                          toggleSettings();
                        }}
                        className="flex-1 p-6 bg-red-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20"
                      >
                        EXECUTE
                      </button>
                      <button 
                        onClick={() => setIsResetConfirming(false)}
                        className="p-6 bg-white/5 text-white/40 rounded-3xl font-black uppercase tracking-widest text-xs"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Version footer */}
            <div className="p-8 mt-auto opacity-10">
              <p className="text-[8px] font-black tracking-[0.5em] text-center">FOCUS.ENGINE VERSION 2.0.4 // NEURAL PROTOCOL ENABLED</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

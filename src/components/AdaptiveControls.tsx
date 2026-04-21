/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusStore } from '../store/useStore';
import { 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull, 
  Briefcase, 
  GraduationCap, 
  Target, 
  Settings2,
  Plus,
  X
} from 'lucide-react';
import { EnergyLevel, GoalType } from '../types';

export const AdaptiveControls: React.FC = () => {
  const { 
    energyLevel, 
    setEnergyLevel, 
    selectedGoal, 
    setSelectedGoal, 
    isRunning,
    customCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    categoryDurations,
    setCategoryDuration
  } = useFocusStore();

  const [isAdding, setIsAdding] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [editingCat, setEditingCat] = React.useState<string | null>(null);
  const [editBuffer, setEditBuffer] = React.useState('');
  const [isConfiguringEnergies, setIsConfiguringEnergies] = React.useState(false);

  const energies: { level: EnergyLevel; icon: any; label: string }[] = [
    { level: 'low', icon: BatteryLow, label: 'Low' },
    { level: 'normal', icon: BatteryMedium, label: 'Normal' },
    { level: 'high', icon: BatteryFull, label: 'High' },
  ];

  const handleAdd = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
      setIsAdding(false);
    }
  };

  const handleUpdate = (oldName: string) => {
    if (editBuffer.trim() && editBuffer !== oldName) {
      updateCategory(oldName, editBuffer.trim());
    }
    setEditingCat(null);
  };

  const handleDurationChange = (level: EnergyLevel, val: string) => {
    const mins = parseInt(val);
    if (!isNaN(mins)) {
      setCategoryDuration(selectedGoal, level, mins);
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-700 pb-4 ${isRunning ? 'opacity-20 pointer-events-none blur-3xl scale-95' : 'opacity-100'}`}>
      {/* Energy Selection & Duration Editing */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bento-card !p-5 md:!p-6 space-y-4 md:space-y-5 border-accent-blue/10"
      >
        <div className="flex justify-between items-center">
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-blue">NEURAL.ENERGY</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsConfiguringEnergies(!isConfiguringEnergies)}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
              isConfiguringEnergies ? 'bg-accent-blue text-white border-accent-blue' : 'bg-white/5 text-white/30 border-white/10'
            }`}
          >
            {isConfiguringEnergies ? 'DONE' : 'EDIT TIMES'}
          </motion.button>
        </div>
        <div className="space-y-2">
          {energies.map(({ level, label }) => {
            const currentDuration = categoryDurations[selectedGoal]?.[level] || 0;
            return (
              <motion.div
                key={level}
                className={`flex items-center justify-between w-full p-5 rounded-[24px] transition-all duration-500 border ${
                  energyLevel === level && !isConfiguringEnergies
                    ? 'bg-accent-blue text-white border-accent-blue shadow-[0_0_30px_rgba(0,122,255,0.3)]' 
                    : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
                }`}
                onClick={() => !isConfiguringEnergies && setEnergyLevel(level)}
              >
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{label}</span>
                
                {isConfiguringEnergies ? (
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                    <input 
                      type="number"
                      min="1"
                      max="999"
                      value={currentDuration}
                      onChange={(e) => handleDurationChange(level, e.target.value)}
                      className="w-10 bg-transparent text-white font-black text-center outline-none"
                    />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">MIN</span>
                  </div>
                ) : (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                    energyLevel === level ? 'bg-white/20 border-white/30' : 'bg-black/20 border-white/5 text-white/30'
                  }`}>
                    {currentDuration}m
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Goal Selection & Category Management */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bento-card !p-5 md:!p-6 space-y-4 md:space-y-6 border-white/5"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30 mb-1">MODULE.TARGET</p>
            <h3 className="text-lg md:text-xl font-black text-white tracking-tight uppercase">
               <span className="accent-text !text-accent-blue">{selectedGoal}</span>
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAdding(!isAdding)}
            className="w-10 h-10 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue"
          >
            <Plus size={20} />
          </motion.button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div className="flex gap-2">
                <input 
                  autoFocus
                  placeholder="NEW CATEGORY NAME..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-accent-blue transition-colors"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button 
                  onClick={handleAdd}
                  className="bg-accent-blue text-white px-6 rounded-2xl font-black text-xs uppercase"
                >
                  ADD
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
          {customCategories.map((name) => (
            <div key={name} className="relative group">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGoal(name)}
                onDoubleClick={() => {
                  if (name !== 'Custom' && name !== 'Work') {
                    setEditingCat(name);
                    setEditBuffer(name);
                  }
                }}
                className={`flex items-center justify-center w-full px-4 py-5 rounded-[24px] border transition-all duration-500 whitespace-nowrap ${
                  selectedGoal === name 
                    ? 'bg-white text-black border-white shadow-xl translate-y-[-2px]' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-accent-blue/40'
                }`}
              >
                {editingCat === name ? (
                  <input
                    autoFocus
                    className="bg-transparent border-none text-center font-black outline-none w-full uppercase"
                    value={editBuffer}
                    onChange={(e) => setEditBuffer(e.target.value.toUpperCase())}
                    onBlur={() => handleUpdate(name)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(name)}
                  />
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest">{name}</span>
                )}
              </motion.button>
              
              {name !== 'Custom' && name !== 'Work' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(name);
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/20 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-500/20 transition-all z-20"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

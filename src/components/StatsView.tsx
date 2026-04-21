/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useFocusStore } from '../store/useStore';
import { Sparkles, Flame, Clock, Trophy } from 'lucide-react';
import { getFocusInsight } from '../lib/gemini';

export const StatsView: React.FC = () => {
  const { stats, sessions } = useFocusStore();
  const [insight, setInsight] = useState<string>("Thinking...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function updateInsight() {
      setLoading(true);
      const text = await getFocusInsight(sessions);
      setInsight(text);
      setLoading(false);
    }
    updateInsight();
  }, [sessions.length]);

  const cards = [
    { label: 'Streak', value: `${stats.streakDays}d`, icon: Flame },
    { label: 'Minutes', value: `${stats.totalFocusTime}m`, icon: Clock },
    { label: 'Sessions', value: stats.sessionsCompleted, icon: Trophy },
  ];

  return (
    <div className="py-2 space-y-6">
      {/* Insight Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bento-card !p-4 md:!p-6 flex gap-4 md:gap-6 items-center overflow-hidden relative group border-accent-blue/10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-blue/20 transition-colors" />
        
        <div className="bg-accent-blue/10 p-2.5 md:p-3 rounded-[20px] border border-accent-blue/20 text-accent-blue relative z-10">
          <Sparkles size={20} md:size={22} strokeWidth={2} />
        </div>
        <div className="relative z-10 flex-1">
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-blue mb-1 md:mb-2">NEURAL.GEN</p>
          <p className={`text-sm md:text-base font-rounded font-black text-white leading-tight ${loading ? 'animate-pulse' : ''}`}>
             "{insight}"
          </p>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <motion.div 
            key={card.label} 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bento-card !p-4 md:!p-5 flex flex-col items-center justify-center text-center group hover:bg-accent-blue transition-all duration-700"
          >
            <div className={`p-2 md:p-2.5 rounded-xl bg-white/5 mb-3 md:mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-transform`}>
              <card.icon size={16} md:size={18} className="text-white group-hover:text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl md:text-2xl font-rounded font-black tracking-tighter group-hover:text-white">{card.value}</span>
            <span className="text-[8px] md:text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mt-0.5 md:mt-1 group-hover:text-white/60">{card.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

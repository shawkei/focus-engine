/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusStore } from '../store/useStore';
import { Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FeedbackOverlay: React.FC = () => {
  const { timeLeft, isRunning, currentSession, completeSession } = useFocusStore();
  
  const showFeedback = !isRunning && currentSession && timeLeft === 0;

  useEffect(() => {
    if (showFeedback) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#FFFFFF', '#333333']
      });
    }
  }, [showFeedback]);

  if (!showFeedback) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-black w-full max-w-sm p-12 rounded-[56px] shadow-[0_0_100px_rgba(0,122,255,0.2)] border border-accent-blue/20 text-white text-center space-y-10"
      >
        <div className="space-y-4">
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-blue">VALIDATION.PROCESS</p>
          <h2 className="text-4xl font-rounded font-black leading-tight tracking-tighter uppercase">
            TARGET <span className="accent-text !text-white underline decoration-accent-blue underline-offset-8">ATTAINED</span>?
          </h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">SESSION: {currentSession.duration}M [{currentSession.goal.toUpperCase()}]</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => completeSession(true)}
            className="group bg-accent-blue text-white p-8 rounded-[32px] flex flex-col items-center gap-3 transition-all active:scale-95 shadow-lg shadow-accent-blue/30"
          >
            <div className="text-3xl font-rounded font-black">Y</div>
            <span className="text-[10px] font-black uppercase tracking-widest">AFFIRMATIVE</span>
          </button>
          <button
            onClick={() => completeSession(false)}
            className="group bg-white/5 border border-white/10 text-white p-8 rounded-[32px] flex flex-col items-center gap-3 transition-all active:scale-95 hover:bg-white/10"
          >
            <div className="text-3xl font-rounded font-black">N</div>
            <span className="text-[10px] font-black uppercase tracking-widest">NEGATIVE</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

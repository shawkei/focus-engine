/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusStore } from '../store/useStore';
import { Play, Square, Coffee } from 'lucide-react';
import { soundService } from '../lib/audio';

export const MainTimer: React.FC = () => {
  const { 
    timeLeft, 
    isRunning, 
    startSession, 
    stopSession, 
    tick, 
    energyLevel,
    audioEnabled,
    audioSound
  } = useFocusStore();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      const { audioSound, customAudioData } = useFocusStore.getState();
      if (audioEnabled && audioSound) {
        soundService.play(audioSound, customAudioData);
      }
    }
  }, [timeLeft, isRunning, audioEnabled]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, tick]);

  const getDigits = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const mStr = mins.toString().padStart(2, '0');
    const sStr = secs.toString().padStart(2, '0');
    return [...mStr, ':', ...sStr];
  };

  const timerDigits = getDigits(timeLeft);

  const getFullDuration = () => {
    const durations = { low: 15, normal: 25, high: 45 };
    return durations[energyLevel] * 60;
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
  const radius = isMobile ? 100 : 120;
  const size = isMobile ? 260 : 320;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = (timeLeft / getFullDuration()) * 100;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 md:space-y-12 py-6 md:py-10">
      <div 
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center float-slow"
      >
        {/* Glow behind circle */}
        <div className="absolute inset-0 bg-accent-blue/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" />
        
        {/* Background Circle */}
        <svg 
          style={{ width: size, height: size }}
          className="absolute -rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={isMobile ? 6 : 8}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
            className="text-accent-blue timer-circle"
            style={{ 
              filter: `drop-shadow(0 0 15px rgba(0, 122, 255, 0.5))`,
            }}
          />
        </svg>

        <div className="text-center z-10 flex flex-col items-center bg-black/40 backdrop-blur-sm p-6 md:p-8 rounded-full border border-white/5 shadow-2xl">
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-7xl font-rounded font-black tracking-normal text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}
            <span className="text-accent-blue mx-0.5 md:mx-1 animate-pulse">:</span>
            {(timeLeft % 60).toString().padStart(2, '0')}
          </motion.div>
          <motion.div 
            animate={isRunning ? { opacity: [0.3, 1, 0.3] } : { opacity: 1 }}
            transition={isRunning ? { repeat: Infinity, duration: 2 } : {}}
            className="mt-4 md:mt-6 flex items-center justify-center gap-2"
          >
             <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isRunning ? 'bg-accent-blue shadow-[0_0_8px_rgba(0,122,255,0.8)]' : 'bg-white/20'}`} />
             <p className="text-[9px] md:text-[11px] uppercase font-black tracking-[0.4em] text-white/50">
                {isRunning ? 'NEURAL.LINK' : 'OS.READY'}
             </p>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center space-x-6 z-20 w-full max-w-xs md:max-w-none px-4 text-center justify-center">
        <AnimatePresence mode="wait">
          {!isRunning ? (
            <motion.button
              key="start"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={startSession}
              className="btn-primary-bw w-full md:w-64 h-14 md:h-16 text-base md:text-lg tracking-widest uppercase font-black"
            >
              <Play size={18} fill="currentColor" />
              START FLOW
            </motion.button>
          ) : (
            <motion.button
              key="stop"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={stopSession}
              className="btn-secondary-bw w-full md:w-64 h-14 md:h-16 text-base md:text-lg tracking-widest uppercase font-black !border-white/20 hover:!border-white/40"
            >
              HALT.EXEC
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

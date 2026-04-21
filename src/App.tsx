/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MainTimer } from './components/MainTimer';
import { AdaptiveControls } from './components/AdaptiveControls';
import { FeedbackOverlay } from './components/FeedbackOverlay';
import { StatsView } from './components/StatsView';
import { DetailedStats } from './components/DetailedStats';
import { Settings2, User, Target, Flame, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusStore } from './store/useStore';
import { SettingsPanel } from './components/SettingsPanel';

export default function App() {
  const toggleSettings = useFocusStore((state) => state.toggleSettings);
  const currentView = useFocusStore((state) => state.currentView);
  const setCurrentView = useFocusStore((state) => state.setCurrentView);

  React.useEffect(() => {
    // Request notification permission if available
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[100dvh] bg-bento-bg p-0 md:p-8 lg:p-12">
      {/* App Container - Desktop Layout */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-10 px-6"
      >
        
        {/* Left Bento Column (Desktop Only) */}
        <div className="hidden xl:flex flex-col gap-8 w-80">
          <motion.div variants={itemVariants} className="bento-card h-[420px] flex flex-col justify-between group border-accent-blue/10">
            <div className="space-y-4">
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-blue">CORE.LOGIC</p>
              <h2 className="text-3xl font-black text-white leading-[1] tracking-tighter uppercase font-rounded">
                DEEP STATE <br/> <span className="accent-text text-white text-4xl underline decoration-accent-blue/30 underline-offset-8">NEURAL</span>
              </h2>
              <p className="text-sm text-white/40 leading-relaxed font-medium">System optimizes for maximum cognitive load and high-retention flow sessions.</p>
            </div>
            <div className="space-y-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <div className="h-14 w-full bg-accent-blue rounded-2xl" />
              <div className="h-14 w-3/4 bg-accent-blue rounded-2xl" />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bento-card h-52 bg-accent-blue text-white border-none flex flex-col justify-between shadow-[0_0_50px_rgba(0,122,255,0.2)]">
             <div className="flex justify-between items-start">
               <p className="text-[10px] uppercase font-black tracking-widest text-white/50">EFFICIENCY</p>
               <Target size={20} className="text-white" strokeWidth={3} />
             </div>
             <div>
               <p className="text-5xl font-rounded font-black tracking-tighter">94%</p>
               <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">PEAK FOCUS INDEX</p>
             </div>
          </motion.div>
        </div>

        {/* Central Mobile Mockup */}
        <motion.div 
          variants={itemVariants}
          className="relative w-full max-w-md h-[100dvh] md:h-[820px] bg-black md:rounded-[64px] shadow-[0_0_100px_rgba(0,122,255,0.1)] overflow-hidden flex flex-col md:border-[16px] border-white/5"
        >
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50 mix-blend-screen invert" />
          
          <AnimatePresence mode="wait">
            {currentView === 'main' ? (
              <motion.div 
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <header className="pt-16 px-6 md:px-12 flex justify-between items-center z-20">
                  <div className="flex gap-4 items-center">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="pill uppercase tracking-[0.4em] font-black !px-6 !py-2 border-accent-blue/30"
                    >
                      <div className="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(0,122,255,1)]" />
                      FOCUS ENGINE
                    </motion.div>
                    <motion.button 
                      whileHover={{ scale: 1.1, color: '#007AFF' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentView('stats')}
                      className="text-white/20 p-2 hover:text-white transition-all"
                    >
                      <BarChart2 size={24} strokeWidth={2} />
                    </motion.button>
                  </div>
                  <motion.button 
                    whileHover={{ rotate: 90, scale: 1.1, color: '#007AFF' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSettings}
                    className="text-white/20 p-2 hover:text-white transition-all"
                  >
                    <Settings2 size={24} strokeWidth={2} />
                  </motion.button>
                </header>

                <main className="flex-1 overflow-y-auto no-scrollbar pb-32 z-10 px-6 md:px-10">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-10 mb-2 text-center"
                  >
                     <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase mb-1 font-rounded">SYNCHRONY</h1>
                     <p className="text-accent-blue text-[10px] font-black uppercase tracking-[0.4em]">LINK.ESTABLISHED</p>
                  </motion.div>

                  <MainTimer />
                  
                  <div className="space-y-6 mt-8">
                    <StatsView />
                    <AdaptiveControls />
                  </div>
                </main>
              </motion.div>
            ) : (
              <DetailedStats key="stats" />
            )}
          </AnimatePresence>

          <FeedbackOverlay />
        </motion.div>

        {/* Right Bento Column (Desktop Only) */}
        <div className="hidden xl:flex flex-col gap-8 w-80">
          <motion.div variants={itemVariants} className="bento-card flex-1 flex flex-col border-white/10 group">
             <div className="flex justify-between items-start mb-14">
               <p className="text-[10px] uppercase font-black tracking-widest text-white/30">SYSTEM.LOG</p>
               <Flame size={20} className="text-white group-hover:text-accent-blue transition-colors" strokeWidth={2.5} />
             </div>
             <div className="space-y-10 flex-1">
                <div className="group">
                  <p className="text-[10px] uppercase font-bold text-white/20 mb-3 tracking-[0.3em]">PEAK.WINDOW</p>
                  <p className="text-2xl font-rounded font-black leading-tight text-white uppercase tracking-tighter">02:00 <span className="accent-text !text-white opacity-50 text-xl">AM</span></p>
                </div>
                <div className="h-px bg-white/5" />
                <div className="group">
                  <p className="text-[10px] uppercase font-bold text-white/20 mb-3 tracking-[0.3em]">STATUS</p>
                  <p className="text-2xl font-rounded font-black leading-tight text-accent-blue uppercase tracking-tighter">RE-ARMED</p>
                </div>
             </div>
             
             <div className="mt-12 p-6 bg-accent-blue/5 rounded-3xl border border-accent-blue/10">
               <div className="flex justify-between items-center text-[10px] font-black text-accent-blue uppercase tracking-[0.3em] mb-4">
                 <span>NEURAL LOAD</span>
                 <span>78%</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "78%" }}
                   transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                   className="h-full bg-accent-blue shadow-[0_0_10px_rgba(0,122,255,0.5)]" 
                 />
               </div>
             </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bento-card bg-transparent border-accent-blue/20 text-white h-[280px] relative overflow-hidden group hover:bg-accent-blue hover:text-white transition-all duration-700">
             <p className="text-[10px] uppercase font-black tracking-widest text-white/40 group-hover:text-white/60 mb-4 relative z-10 transition-colors">OS.CORE</p>
             <p className="text-3xl font-rounded font-black mb-8 relative z-10 tracking-tighter leading-none uppercase transition-colors">INITIATE <br/>FULL FOCUS?</p>
             <div className="flex gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl hover:bg-white/10 group-hover:bg-white/20 transition-all cursor-pointer border border-white/5 group-hover:border-white/10">A</div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl hover:bg-white/10 group-hover:bg-white/20 transition-all cursor-pointer border border-white/5 group-hover:border-white/10">B</div>
             </div>
          </motion.div>
        </div>

      </motion.div>

      <SettingsPanel />
    </div>
  );
}


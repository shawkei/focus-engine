/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusStore } from '../store/useStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  ArrowRight,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { 
  startOfHour, 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  isWithinInterval, 
  format, 
  subDays,
  eachDayOfInterval,
  isSameDay,
  parseISO
} from 'date-fns';

type TimePeriod = 'Hour' | 'Day' | 'Week' | 'Month' | 'Year' | 'Custom';

export const DetailedStats: React.FC = () => {
  const { sessions, setCurrentView } = useFocusStore();
  const [period, setPeriod] = useState<TimePeriod>('Week');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Filter sessions based on period
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case 'Hour':
        start = startOfHour(now);
        break;
      case 'Day':
        start = startOfDay(now);
        break;
      case 'Week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'Month':
        start = startOfMonth(now);
        break;
      case 'Year':
        start = startOfYear(now);
        break;
      case 'Custom':
        start = startOfDay(new Date(customRange.start));
        end = startOfDay(new Date(customRange.end));
        // Ensure end includes the full day
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = startOfWeek(now);
    }

    return sessions.filter(s => {
      const sDate = new Date(s.startTime);
      return isWithinInterval(sDate, { start, end });
    });
  }, [sessions, period, customRange]);

  // Aggregate data for Bar Chart (last 7 days unless specified otherwise)
  const barData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(date => {
      const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), date));
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        name: format(date, 'EEE'),
        mins: totalMinutes,
        fullDate: format(date, 'MMM dd')
      };
    });
  }, [sessions]);

  // Aggregate data for Pie Chart (Category split)
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSessions.forEach(s => {
      counts[s.goal] = (counts[s.goal] || 0) + s.duration;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredSessions]);

  const COLORS = ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#4CD964'];

  const stats = useMemo(() => {
    const totalMins = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
    const completed = filteredSessions.filter(s => s.completed).length;
    return { totalMins, completed };
  }, [filteredSessions]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full"
    >
      {/* Header */}
      <header className="pt-16 px-6 md:px-12 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentView('main')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-blue mb-0.5">ANALYTICS.CORE</p>
            <h2 className="text-2xl font-rounded font-black text-white uppercase tracking-tighter">DATA CENTER</h2>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-6 md:px-12 mt-8">
        {/* Filters */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={14} className="text-accent-blue" />
            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">TIMEFRAME SELECTOR</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['Hour', 'Day', 'Week', 'Month', 'Year', 'Custom'] as TimePeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p 
                    ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' 
                    : 'bg-white/5 text-white/30 border border-white/5 hover:border-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {period === 'Custom' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 flex flex-col gap-4 overflow-hidden"
              >
                <div className="w-full space-y-2">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-4">START DATE</p>
                  <input 
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black text-white outline-none focus:border-accent-blue appearance-none"
                  />
                </div>
                
                <div className="w-full space-y-2">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-4">END DATE</p>
                  <input 
                    type="date"
                    value={customRange.end}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black text-white outline-none focus:border-accent-blue appearance-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bento-card !p-6 border-accent-blue/10 bg-accent-blue/[0.02]">
              <div className="flex justify-between items-start mb-4">
                 <p className="text-[10px] font-bold text-accent-blue/50 uppercase tracking-widest">TOTAL.EFFORT</p>
                 <TrendingUp size={16} className="text-accent-blue" />
              </div>
              <p className="text-3xl font-rounded font-black text-white">{stats.totalMins}<span className="text-xs text-white/40 ml-1">MIN</span></p>
           </div>
           <div className="bento-card !p-6 border-white/5">
              <div className="flex justify-between items-start mb-4">
                 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">COMPLETED</p>
                 <LayoutGrid size={16} className="text-white/20" />
              </div>
              <p className="text-3xl font-rounded font-black text-white">{stats.completed}</p>
           </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
           {/* Weekly Progress Bar Chart */}
           <div className="bento-card !p-8">
              <div className="flex items-center gap-2 mb-8">
                <BarChart3 size={16} className="text-accent-blue" />
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">7-DAY ACTIVITY</h3>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ 
                        backgroundColor: '#0A0A0A', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        fontSize: '10px',
                        fontFamily: 'Lexend'
                      }}
                    />
                    <Bar 
                      dataKey="mins" 
                      radius={[4, 4, 0, 0]} 
                      fill="#007AFF"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

            {/* Category Distribution Pie Chart */}
            <div className="bento-card !p-6 md:!p-8">
               <div className="flex items-center gap-2 mb-6">
                 <PieChartIcon size={16} className="text-accent-blue" />
                 <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">CATEGORY SPLIT</h3>
               </div>
               <div className="h-[300px] w-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={70}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{ 
                         backgroundColor: '#0A0A0A', 
                         border: '1px solid rgba(255,255,255,0.1)',
                         borderRadius: '16px',
                         fontSize: '10px',
                         fontFamily: 'Lexend'
                       }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 justify-center">
                 {pieData.map((d, i) => (
                   <div key={d.name} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{d.name}</span>
                   </div>
                 ))}
              </div>
            </div>
        </div>

        {/* Session Log */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock size={16} className="text-accent-blue" />
            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">DETAILED LOGS</h3>
          </div>
          <div className="space-y-3">
             {filteredSessions.length > 0 ? (
               filteredSessions.map((s, i) => (
                 <motion.div 
                   key={s.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl"
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.completed ? 'bg-accent-blue/10 text-accent-blue' : 'bg-red-500/10 text-red-500'}`}>
                          {s.completed ? <TrendingUp size={16} /> : <Clock size={16} />}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">{s.goal}</p>
                          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{format(new Date(s.startTime), 'MMM dd, HH:mm')}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-white uppercase font-rounded">{s.duration}m</p>
                       <p className="text-[8px] font-bold text-accent-blue/50 uppercase tracking-widest">{s.energyLevel}</p>
                    </div>
                 </motion.div>
               ))
             ) : (
               <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">NO.DATA.FOUND</p>
               </div>
             )}
          </div>
        </section>
      </main>
    </motion.div>
  );
};

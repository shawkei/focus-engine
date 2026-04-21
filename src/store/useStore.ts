/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FocusSession, EnergyLevel, GoalType, UserStats } from '../types';
import { isSameDay, parseISO } from 'date-fns';

interface FocusState {
  currentSession: FocusSession | null;
  sessions: FocusSession[];
  energyLevel: EnergyLevel;
  selectedGoal: string;
  customCategories: string[];
  categoryDurations: Record<string, Record<EnergyLevel, number>>;
  stats: UserStats;
  isSettingsOpen: boolean;
  currentView: 'main' | 'stats';
  
  // Audio State
  audioEnabled: boolean;
  audioSound: 'digital' | 'chime' | 'pulse' | 'custom';
  customAudioData: string | null; // Base64 or Blob URL
  customAudioName: string | null;
  
  // Timer State
  isRunning: boolean;
  timeLeft: number; // seconds
  
  // Actions
  toggleSettings: () => void;
  setCurrentView: (view: 'main' | 'stats') => void;
  setAudioEnabled: (enabled: boolean) => void;
  setAudioSound: (sound: 'digital' | 'chime' | 'pulse' | 'custom') => void;
  setCustomAudio: (name: string, data: string) => void;
  setEnergyLevel: (level: EnergyLevel) => void;
  setSelectedGoal: (goal: string) => void;
  setCategoryDuration: (category: string, level: EnergyLevel, minutes: number) => void;
  addCategory: (name: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  startSession: () => void;
  stopSession: () => void;
  completeSession: (wasFocused: boolean) => void;
  tick: () => void;
  resetStats: () => void;
}

const INITIAL_DURATIONS: Record<EnergyLevel, number> = {
  low: 15,
  normal: 25,
  high: 45,
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      energyLevel: 'normal',
      selectedGoal: 'Work',
      customCategories: ['Work', 'Study', 'Skill', 'Custom'],
      categoryDurations: {
        'Work': { ...INITIAL_DURATIONS },
        'Study': { ...INITIAL_DURATIONS },
        'Skill': { ...INITIAL_DURATIONS },
        'Custom': { low: 25, normal: 50, high: 90 },
      },
      stats: {
        totalFocusTime: 0,
        sessionsCompleted: 0,
        streakDays: 0,
        lastSessionDate: null,
      },
      isSettingsOpen: false,
      currentView: 'main',
      audioEnabled: true,
      audioSound: 'chime',
      customAudioData: null,
      customAudioName: null,
      isRunning: false,
      timeLeft: INITIAL_DURATIONS['normal'] * 60,

      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      setCurrentView: (view) => set({ currentView: view }),
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
      setAudioSound: (sound) => set({ audioSound: sound }),
      setCustomAudio: (name, data) => set({ customAudioName: name, customAudioData: data, audioSound: 'custom' }),

      setEnergyLevel: (level) => {
        const { isRunning, selectedGoal, categoryDurations } = get();
        if (!isRunning) {
          const duration = categoryDurations[selectedGoal]?.[level] || INITIAL_DURATIONS[level];
          set({ energyLevel: level, timeLeft: duration * 60 });
        } else {
          set({ energyLevel: level });
        }
      },

      setSelectedGoal: (goal) => {
        const { isRunning, energyLevel, categoryDurations } = get();
        if (!isRunning) {
          const duration = categoryDurations[goal]?.[energyLevel] || INITIAL_DURATIONS[energyLevel];
          set({ selectedGoal: goal, timeLeft: duration * 60 });
        } else {
          set({ selectedGoal: goal });
        }
      },

      setCategoryDuration: (category, level, minutes) => {
        const { categoryDurations, energyLevel, selectedGoal, isRunning } = get();
        const validatedMinutes = Math.max(1, Math.min(minutes, 999));
        
        const newDurations = {
          ...categoryDurations,
          [category]: {
            ...(categoryDurations[category] || INITIAL_DURATIONS),
            [level]: validatedMinutes
          }
        };

        set({ categoryDurations: newDurations });

        if (!isRunning && selectedGoal === category && energyLevel === level) {
          set({ timeLeft: validatedMinutes * 60 });
        }
      },

      addCategory: (name) => {
        const { customCategories, categoryDurations } = get();
        if (!customCategories.includes(name)) {
          set({ 
            customCategories: [...customCategories, name],
            categoryDurations: {
              ...categoryDurations,
              [name]: { ...INITIAL_DURATIONS }
            }
          });
        }
      },

      updateCategory: (oldName, newName) => {
        const { customCategories, selectedGoal, categoryDurations } = get();
        if (oldName === 'Custom') return;
        const newDurations = { ...categoryDurations };
        if (newDurations[oldName]) {
          newDurations[newName] = newDurations[oldName];
          delete newDurations[oldName];
        }
        
        const newCats = customCategories.map(c => c === oldName ? newName : c);
        set({ 
          customCategories: newCats,
          selectedGoal: selectedGoal === oldName ? newName : selectedGoal,
          categoryDurations: newDurations
        });
      },

      deleteCategory: (name) => {
        const { customCategories, selectedGoal, categoryDurations } = get();
        if (name === 'Custom' || name === 'Work') return;
        
        const newDurations = { ...categoryDurations };
        delete newDurations[name];

        set({ 
          customCategories: customCategories.filter(c => c !== name),
          selectedGoal: selectedGoal === name ? 'Work' : selectedGoal,
          categoryDurations: newDurations
        });
      },

      startSession: () => {
        const { energyLevel, selectedGoal, categoryDurations } = get();
        const duration = categoryDurations[selectedGoal]?.[energyLevel] || INITIAL_DURATIONS[energyLevel];
        
        const newSession: FocusSession = {
          id: Math.random().toString(36).substring(7),
          startTime: Date.now(),
          duration,
          goal: selectedGoal as any,
          energyLevel,
          wasFocused: null,
          completed: false,
        };

        set({
          currentSession: newSession,
          isRunning: true,
          timeLeft: duration * 60,
        });
      },

      stopSession: () => {
        const { selectedGoal, energyLevel, categoryDurations } = get();
        const duration = categoryDurations[selectedGoal]?.[energyLevel] || INITIAL_DURATIONS[energyLevel];
        set({ isRunning: false, currentSession: null, timeLeft: duration * 60 });
      },

      completeSession: (wasFocused) => {
        const { currentSession, sessions, stats, energyLevel, selectedGoal, categoryDurations } = get();
        if (!currentSession) return;

        const updatedSession = { ...currentSession, wasFocused, completed: true };
        const newSessions = [updatedSession, ...sessions];
        
        // Update stats
        const today = new Date();
        const lastDate = stats.lastSessionDate ? parseISO(stats.lastSessionDate) : null;
        let newStreak = stats.streakDays;

        if (!lastDate) {
          newStreak = 1;
        } else if (isSameDay(today, lastDate)) {
          // Stayed the same
        } else if (isSameDay(today, new Date(lastDate.getTime() + 86400000))) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        const resetDuration = categoryDurations[selectedGoal]?.[energyLevel] || INITIAL_DURATIONS[energyLevel];

        set({
          sessions: newSessions,
          currentSession: null,
          isRunning: false,
          timeLeft: resetDuration * 60,
          stats: {
            totalFocusTime: stats.totalFocusTime + updatedSession.duration,
            sessionsCompleted: stats.sessionsCompleted + 1,
            streakDays: newStreak,
            lastSessionDate: today.toISOString(),
          },
        });
      },

      tick: () => {
        const { timeLeft, isRunning } = get();
        if (isRunning && timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        } else if (isRunning && timeLeft === 0) {
          set({ isRunning: false });
        }
      },

      resetStats: () => set({
        sessions: [],
        stats: {
          totalFocusTime: 0,
          sessionsCompleted: 0,
          streakDays: 0,
          lastSessionDate: null,
        }
      }),
    }),
    {
      name: 'focus-engine-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        stats: state.stats,
        energyLevel: state.energyLevel,
        selectedGoal: state.selectedGoal,
        customCategories: state.customCategories,
        categoryDurations: state.categoryDurations,
        audioSound: state.audioSound,
        audioEnabled: state.audioEnabled,
        customAudioData: state.customAudioData,
        customAudioName: state.customAudioName,
      }),
    }
  )
);

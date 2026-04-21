/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EnergyLevel = 'low' | 'normal' | 'high';

export type GoalType = 'Work' | 'Study' | 'Skill' | 'Custom';

export interface FocusSession {
  id: string;
  startTime: number; // timestamp
  duration: number; // minutes
  goal: GoalType;
  energyLevel: EnergyLevel;
  wasFocused: boolean | null;
  completed: boolean;
}

export interface UserStats {
  totalFocusTime: number; // minutes
  sessionsCompleted: number;
  streakDays: number;
  lastSessionDate: string | null; // ISO string
}

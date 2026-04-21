/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { FocusSession } from "../types";

export async function getFocusInsight(sessions: FocusSession[]) {
  if (sessions.length < 3) {
    return "Complete a few more sessions to unlock smart insights! You're doing great.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3-flash-preview";

  const sessionSummary = sessions.slice(0, 5).map(s => ({
    goal: s.goal,
    energy: s.energyLevel,
    focused: s.wasFocused,
    duration: s.duration,
    time: new Date(s.startTime).getHours() + ":00"
  }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `
        Act as a friendly, minimalist productivity coach. 
        Analyze these recent pomodoro sessions and give ONE short (max 15 words) insight that is human and helpful.
        Avoid clichés. Focus on the data provided.

        Recent Sessions: ${JSON.stringify(sessionSummary)}

        Format: Just the text insight.
      `,
    });

    return response.text || "Keep it up, you're making steady progress today.";
  } catch (error) {
    console.error("AI Insight error:", error);
    return "Focus is a muscle. Each session makes you stronger.";
  }
}

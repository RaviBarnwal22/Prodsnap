// AI Coach — Shared Types
// Admin-only module. No changes to existing Prodsnap functionality.

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RevisionItem {
  topic: string;
  nextRevisionDate: string; // ISO date string YYYY-MM-DD
  intervalDays: number;
  masteryLevel: number; // 0–100
}

export interface LearningState {
  currentTopic: string;
  currentPhaseIndex: number; // 0-based index into CURRICULUM
  masteryScore: number; // 0–100 overall mastery
  streak: number; // consecutive days
  lastSessionDate: string | null; // YYYY-MM-DD
  completedTopics: string[];
  weakConcepts: string[];
  strongConcepts: string[];
  revisionSchedule: RevisionItem[];
  interviewReadiness: number; // 0–100
  sessionCount: number;
  todayObjective: string;
  todayTimeEstimate: string;
}

export interface SessionSummary {
  date: string; // YYYY-MM-DD
  summary: string;
  topicsCovered: string[];
}

export interface CoachProfile {
  name: string;
  currentRole: string;
  company: string;
  experience: string;
  education: string;
  background: string[];
  certifications?: string[];
  targetCompanies: string[];
  goal: string;
  sideProject: string;
  linkedin?: string;
}

export interface RevisionCard {
  id: string;
  date: string;          // YYYY-MM-DD
  concept: string;       // Short title
  context: string;       // Why it matters / what was discussed
  topicTag: string;      // e.g. "AI Strategy"
}

export interface CoachState {
  messages: CoachMessage[];
  learningState: LearningState;
  recentSession: SessionSummary | null;
  profile: CoachProfile;
  revisionDeck: RevisionCard[];
}

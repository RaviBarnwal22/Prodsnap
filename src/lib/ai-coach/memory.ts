import fs from 'fs/promises';
import path from 'path';
import { CoachProfile, LearningState, SessionSummary, CoachMessage, CoachState, RevisionCard } from './types';

const DATA_DIR = path.join(process.cwd(), '.data', 'ai-coach');

// Default initial profile based on the prompt
const DEFAULT_PROFILE: CoachProfile = {
    name: "Ravi Barnwal",
    currentRole: "Product Strategy & GTM Leader | AI-Driven Enterprise SaaS at IBM",
    company: "IBM",
    experience: "8+ years of experience driving AI-led enterprise transformation across SaaS and complex enterprise ecosystems.",
    education: "MBA Gold Medalist (IIM Bodh Gaya), B.Tech (NIST)",
    background: [
        "Product & Market Strategy",
        "AI Commercialization & Modernization",
        "Go-to-Market Strategy",
        "Strategic Roadmapping",
        "AI/LLM Product Concepts",
        "Market & Ecosystem Analysis",
        "Competitive Intelligence & Positioning",
        "Enterprise SaaS & Platform Strategy",
        "Executive Storytelling & Presentations",
        "Global Stakeholder Alignment",
        "Cross-functional Executive Leadership",
        "Data-Driven Product Decisions",
        "Former Product Manager at KPMG",
        "Former Product Strategy Manager at Maruti Suzuki",
        "Former Business Analyst at Infosys Ltd"
    ],
    certifications: [
        "Certified Scrum Product Owner® by Scrum Alliance",
        "Product Management Fellow at Insurjio’22",
        "Hold 3 Tableau Badges (Analyst, Desktop, Author)"
    ],
    targetCompanies: [
        "Google",
        "Microsoft",
        "OpenAI",
        "Anthropic",
        "Meta",
        "Amazon",
        "Atlassian",
        "SAP",
        "Databricks",
        "Snowflake",
        "NVIDIA"
    ],
    goal: "Prepare for Senior AI PM interviews in 3–4 months.",
    sideProject: "Founder of Prodsnap (an AI-powered product management learning platform using LLM-assisted feedback)",
    linkedin: "https://www.linkedin.com/in/barnwalravi/"
};

const DEFAULT_LEARNING_STATE: LearningState = {
    currentTopic: "AI Foundations",
    currentPhaseIndex: 0,
    masteryScore: 0,
    streak: 0,
    lastSessionDate: null,
    completedTopics: [],
    weakConcepts: [],
    strongConcepts: [],
    revisionSchedule: [],
    interviewReadiness: 0,
    sessionCount: 0,
    todayObjective: "Understand the core concepts of LLMs and Transformers",
    todayTimeEstimate: "45 mins"
};

async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
    await ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    try {
        const data = await fs.readFile(filepath, 'utf-8');
        return JSON.parse(data) as T;
    } catch {
        // File doesn't exist or is invalid, return default
        return defaultValue;
    }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
    await ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getProfile(): Promise<CoachProfile> {
    return readJsonFile('profile.json', DEFAULT_PROFILE);
}

export async function saveProfile(profile: CoachProfile): Promise<void> {
    await writeJsonFile('profile.json', profile);
}

export async function getLearningState(): Promise<LearningState> {
    return readJsonFile('learning-state.json', DEFAULT_LEARNING_STATE);
}

export async function saveLearningState(state: LearningState): Promise<void> {
    await writeJsonFile('learning-state.json', state);
}

export async function getMessages(): Promise<CoachMessage[]> {
    return readJsonFile('messages.json', []);
}

export async function saveMessages(messages: CoachMessage[]): Promise<void> {
    // Keep only the last 50 messages to prevent file from growing indefinitely
    const trimmedMessages = messages.slice(-50);
    await writeJsonFile('messages.json', trimmedMessages);
}

export async function getRecentSessions(): Promise<SessionSummary[]> {
    return readJsonFile('sessions.json', []);
}

export async function saveRecentSessions(sessions: SessionSummary[]): Promise<void> {
    // Keep only last 10 session summaries
    const trimmedSessions = sessions.slice(-10);
    await writeJsonFile('sessions.json', trimmedSessions);
}

export async function getRevisionDeck(): Promise<RevisionCard[]> {
    return readJsonFile('revision-deck.json', []);
}

export async function saveRevisionDeck(cards: RevisionCard[]): Promise<void> {
    await writeJsonFile('revision-deck.json', cards);
}

export async function addRevisionCard(card: RevisionCard): Promise<void> {
    const deck = await getRevisionDeck();
    // Avoid exact duplicates by concept name
    const filtered = deck.filter(c => c.concept.toLowerCase() !== card.concept.toLowerCase());
    filtered.push(card);
    await saveRevisionDeck(filtered);
}

export async function getFullState(): Promise<CoachState> {
    const [profile, learningState, messages, sessions, revisionDeck] = await Promise.all([
        getProfile(),
        getLearningState(),
        getMessages(),
        getRecentSessions(),
        getRevisionDeck()
    ]);

    return {
        profile,
        learningState,
        messages,
        recentSession: sessions.length > 0 ? sessions[sessions.length - 1] : null,
        revisionDeck
    };
}

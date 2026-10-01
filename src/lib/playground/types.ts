export interface PlaygroundQuestion {
    caseTitle: string
    /** "case" = drawn from a real case in the library, "bonus" = outside example. */
    source: 'case' | 'bonus'
    scenario: string
    question: string
    options: string[]
    correctIndex: number
    explanation: string
    /** One entry per option; empty string for the correct option. */
    whyWrong: string[]
}

export interface Meme {
    top: string
    bottom: string
}

export interface PlaygroundSection {
    key: string
    competency: string
    subtitle: string
    lesson: {
        hook: string
        what: string
        how: string[]
        example: string
        mistake: string
    }
    memes?: { correct: Meme[]; wrong: Meme[] }
    videoQuery?: string
    questions: PlaygroundQuestion[]
}

export interface PlaygroundCategoryData {
    slug: string
    framework: string
    sections: Record<string, PlaygroundSection>
}

/** Per-viewer progress, kept in localStorage. */
export interface SectionProgress {
    best: number
    stars: number
}

export interface PlaygroundProgress {
    xp: number
    categories: Record<string, Record<string, SectionProgress>>
}

/**
 * Per-category grading rubrics.
 *
 * The evaluator used to score every case against the six CIRCLES dimensions,
 * whatever the case actually was. That is wrong for most of the library: an RCA
 * answer that jumps to solutions before diagnosing is a BAD answer, yet a
 * "list_solutions" dimension rewarded exactly that. A guesstimate has no user
 * segmentation to speak of. Behavioural questions have no product at all.
 *
 * So the rubric is chosen by the question's category, and the JSON schema the
 * model must return is generated from that rubric rather than hardcoded.
 *
 * Two invariants hold across every rubric, and both matter:
 *
 *  1. Exactly SIX dimensions. The UI renders whatever keys come back, but the
 *     0-5 scale and the "overall is the average" rule assume a fixed count.
 *  2. The first dimension is always discovery — what the candidate established
 *     before answering, including via the Interviewer Hub. It is the one thing
 *     every PM interview format tests.
 *
 * Every dimension also declares a `competency`. Dimension keys differ per
 * rubric, so without this the skill radar could not compare an RCA attempt with
 * a design attempt. The radar aggregates on competency, not on dimension key.
 */

/** Stable radar axes. Dimension keys vary by rubric; these do not. */
export const COMPETENCIES = [
    'problem_framing',
    'user_insight',
    'structured_thinking',
    'prioritization',
    'solutioning',
    'measurement',
] as const

export type Competency = typeof COMPETENCIES[number]

export interface RubricDimension {
    /** JSON key the model returns. Shown in the UI with underscores replaced. */
    key: string
    /** What the grader is being asked to judge. */
    guidance: string
    /** Radar axis this dimension rolls up into. */
    competency: Competency
}

export interface Rubric {
    /** Named in the feedback so the candidate learns the right mental model. */
    framework: string
    /** Exactly six. The first is always discovery. */
    dimensions: RubricDimension[]
}

const discovery = (guidance: string): RubricDimension => ({
    key: 'discovery_and_framing',
    guidance,
    competency: 'problem_framing',
})

const DESIGN: Rubric = {
    framework: 'CIRCLES',
    dimensions: [
        discovery('Clarifying questions asked in the Interviewer Hub, constraints established, and a sharp restatement of the goal before designing.'),
        { key: 'user_segmentation', guidance: 'Depth of segmentation and a defended choice of which segment to build for.', competency: 'user_insight' },
        { key: 'pain_points', guidance: 'Specific, non-obvious user needs and the evidence or reasoning behind them.', competency: 'user_insight' },
        { key: 'solution_ideation', guidance: 'Creativity, feasibility and range of proposed solutions.', competency: 'solutioning' },
        { key: 'prioritization_logic', guidance: 'An explicit basis for choosing between solutions: impact, effort, reach or strategic fit.', competency: 'prioritization' },
        { key: 'tradeoffs_and_metrics', guidance: 'Risks, second-order effects, counter-metrics and how success would be measured.', competency: 'measurement' },
    ],
}

const METRICS: Rubric = {
    framework: 'Goal → Signals → Metrics (HEART / AARRR where it fits)',
    dimensions: [
        discovery('What was clarified about the product goal and stage before choosing metrics, including via the Interviewer Hub.'),
        { key: 'north_star', guidance: 'A single defended north star that reflects delivered user value, not vanity volume.', competency: 'structured_thinking' },
        { key: 'input_metrics', guidance: 'The drivers that actually move the north star, and how they decompose.', competency: 'structured_thinking' },
        { key: 'counter_metrics', guidance: 'Guardrails that would catch the north star being gamed or won at the expense of users.', competency: 'measurement' },
        { key: 'segmentation_and_instrumentation', guidance: 'How the metric would be cut (cohort, platform, geography) and practically instrumented.', competency: 'user_insight' },
        { key: 'decision_use', guidance: 'What decision each metric would drive, and the threshold that would trigger action.', competency: 'prioritization' },
    ],
}

const RCA: Rubric = {
    framework: 'Structured Root Cause Analysis',
    dimensions: [
        discovery('Questions asked to pin down the metric, magnitude, window and scope before hypothesising. Jumping to causes without this is a serious flaw.'),
        { key: 'metric_decomposition', guidance: 'Breaking the affected metric into its component parts to localise the drop.', competency: 'structured_thinking' },
        { key: 'internal_vs_external', guidance: 'Systematic separation of internal causes (release, bug, pricing) from external (seasonality, competitor, macro).', competency: 'structured_thinking' },
        { key: 'segmentation_isolation', guidance: 'Slicing by platform, geography, cohort and channel to isolate where the change is concentrated.', competency: 'user_insight' },
        { key: 'hypothesis_validation', guidance: 'Named hypotheses with the specific data or test that would confirm or kill each one.', competency: 'measurement' },
        { key: 'remediation', guidance: 'Proportionate next steps and prevention. Only credit solutions AFTER the diagnosis is sound; an answer that leads with fixes has not done RCA.', competency: 'solutioning' },
    ],
}

const GUESSTIMATE: Rubric = {
    framework: 'Top-down Estimation',
    dimensions: [
        discovery('Scope clarified before calculating: geography, timeframe, unit and what exactly is being counted.'),
        { key: 'structure', guidance: 'A clean, MECE breakdown into a calculable tree.', competency: 'structured_thinking' },
        { key: 'assumptions', guidance: 'Assumptions stated explicitly with a defensible basis, not pulled from nowhere.', competency: 'structured_thinking' },
        { key: 'arithmetic', guidance: 'Correct, traceable arithmetic with sensible rounding.', competency: 'measurement' },
        { key: 'sanity_check', guidance: 'A reality check of the final number against a known reference point.', competency: 'measurement' },
        { key: 'sensitivity', guidance: 'Which assumption the answer is most sensitive to, and how the number moves if it is wrong.', competency: 'prioritization' },
    ],
}

const STRATEGY: Rubric = {
    framework: 'Market → Moat → Options',
    dimensions: [
        discovery('What was established about company goals, constraints and time horizon before recommending.'),
        { key: 'market_analysis', guidance: 'Market size, growth, structure and where value accrues.', competency: 'structured_thinking' },
        { key: 'competitive_position', guidance: 'Honest read of competitors and of this company\'s real, durable advantage.', competency: 'user_insight' },
        { key: 'strategic_options', guidance: 'Genuine alternatives considered, typically build, buy or partner.', competency: 'solutioning' },
        { key: 'recommendation_and_rationale', guidance: 'A clear pick with the reasoning that eliminated the others. Fence-sitting scores low.', competency: 'prioritization' },
        { key: 'risks_and_sequencing', guidance: 'What could go wrong, what is sequenced first, and what would prove the bet is working.', competency: 'measurement' },
    ],
}

const GTM: Rubric = {
    framework: 'Segment → Position → Channel → Measure',
    dimensions: [
        discovery('Launch goal, constraints and definition of success clarified up front.'),
        { key: 'target_segment', guidance: 'A specific beachhead segment and why it is the right wedge.', competency: 'user_insight' },
        { key: 'positioning', guidance: 'Differentiated value proposition and message for that segment.', competency: 'structured_thinking' },
        { key: 'channel_strategy', guidance: 'Channels matched to where the segment actually is, with acquisition economics considered.', competency: 'solutioning' },
        { key: 'pricing_and_packaging', guidance: 'Pricing tied to value delivered and willingness to pay.', competency: 'prioritization' },
        { key: 'launch_metrics', guidance: 'Launch sequencing plus the metrics and thresholds that define success or a rollback.', competency: 'measurement' },
    ],
}

const GROWTH: Rubric = {
    framework: 'Growth Loop / Funnel',
    dimensions: [
        discovery('Current funnel, retention baseline and business goal established before proposing levers.'),
        { key: 'funnel_or_loop', guidance: 'A concrete model of how growth compounds, or where the funnel leaks.', competency: 'structured_thinking' },
        { key: 'lever_identification', guidance: 'The specific lever chosen and why it has the most headroom.', competency: 'prioritization' },
        { key: 'retention_insight', guidance: 'Understanding of the retention curve, activation moment and habit loop.', competency: 'user_insight' },
        { key: 'experiment_design', guidance: 'A testable hypothesis with a success metric, guardrail and rough sizing.', competency: 'measurement' },
        { key: 'scaling_plan', guidance: 'What happens after the win, and the second-order effects of scaling it.', competency: 'solutioning' },
    ],
}

const TECH: Rubric = {
    framework: 'System Reasoning for PMs',
    dimensions: [
        discovery('Requirements, scale and constraints clarified before designing.'),
        { key: 'system_understanding', guidance: 'Correct grasp of the components involved and how they interact.', competency: 'structured_thinking' },
        { key: 'user_impact', guidance: 'Translation of technical choices into consequences a user would feel.', competency: 'user_insight' },
        { key: 'technical_tradeoffs', guidance: 'Cost, latency, complexity and reliability weighed against each other.', competency: 'prioritization' },
        { key: 'feasibility', guidance: 'Realistic, buildable proposals and awareness of what is hard.', competency: 'solutioning' },
        { key: 'risk_and_monitoring', guidance: 'Failure modes, degradation paths and what would be monitored.', competency: 'measurement' },
    ],
}

const BEHAVIORAL: Rubric = {
    framework: 'STAR with Reflection',
    dimensions: [
        discovery('Context and stakes set clearly enough for the listener to judge the difficulty.'),
        { key: 'situation_and_task', guidance: 'A specific, real situation with the candidate\'s actual remit made clear.', competency: 'structured_thinking' },
        { key: 'actions_taken', guidance: 'What the candidate personally did, in first person. "We" throughout is a weakness.', competency: 'solutioning' },
        { key: 'stakeholder_handling', guidance: 'Influence without authority, conflict handling and communication.', competency: 'user_insight' },
        { key: 'result', guidance: 'Concrete outcome, quantified where possible.', competency: 'measurement' },
        { key: 'reflection', guidance: 'Honest lesson learned and what they would do differently. Self-awareness, not self-promotion.', competency: 'prioritization' },
    ],
}

/**
 * Applied on top of the chosen rubric when the case is an AI product case, so
 * AI-specific judgement is graded without losing the rubric that fits the
 * question type. Kept additive for exactly that reason.
 */
export const AI_PRODUCT_ADDENDUM = `
**AI Product Lens (apply to every dimension above)**: This is an AI product case. Also weigh whether the candidate reasoned about model choice and cost, evaluation and quality measurement, failure modes and hallucination, the human-in-the-loop design, data and feedback loops, and latency as a UX constraint. An answer that treats AI as magic, with no evaluation strategy and no failure handling, cannot score above 3 on any dimension however polished the prose.
`

const RUBRICS: Record<string, Rubric> = {
    CONSUMER_PRODUCT_DESIGN: DESIGN,
    'Product Sense': DESIGN,
    PRODUCT_DESIGN: DESIGN,
    AI_PRODUCT: DESIGN,
    METRICS: METRICS,
    RCA: RCA,
    'Root Cause Analysis': RCA,
    GUESTIMATES: GUESSTIMATE,
    GUESSTIMATES: GUESSTIMATE,
    STRATEGY: STRATEGY,
    GTM: GTM,
    GROWTH_RETENTION: GROWTH,
    TECH_ACUMEN: TECH,
    BEHAVIORAL: BEHAVIORAL,
}

/** Falls back to the design rubric, which is the closest thing to a general PM rubric. */
export function getRubric(category?: string): Rubric {
    if (!category) return DESIGN
    return RUBRICS[category] || RUBRICS[category.toUpperCase()] || DESIGN
}

/** Dimension keys for a category, in order. Used to validate and clamp scores. */
export function getRubricKeys(category?: string): string[] {
    return getRubric(category).dimensions.map(d => d.key)
}

/**
 * Maps a returned dimension key to its radar axis. Accepts keys from any
 * rubric, plus the six legacy CIRCLES keys so submissions graded before this
 * existed still aggregate instead of silently scoring zero.
 */
const LEGACY_KEY_COMPETENCY: Record<string, Competency> = {
    comprehend_goal: 'problem_framing',
    identify_users: 'user_insight',
    report_needs: 'user_insight',
    cut_prioritization: 'prioritization',
    list_solutions: 'solutioning',
    evaluate_tradeoffs: 'measurement',
}

let competencyIndex: Record<string, Competency> | null = null

export function getCompetencyForKey(key: string): Competency | null {
    if (!competencyIndex) {
        competencyIndex = { ...LEGACY_KEY_COMPETENCY }
        for (const rubric of Object.values(RUBRICS)) {
            for (const dim of rubric.dimensions) {
                competencyIndex[dim.key] = dim.competency
            }
        }
    }
    return competencyIndex[key] || null
}

export const COMPETENCY_LABELS: Record<Competency, string> = {
    problem_framing: 'Problem Framing',
    user_insight: 'User Insight',
    structured_thinking: 'Structured Thinking',
    prioritization: 'Prioritization',
    solutioning: 'Solutioning',
    measurement: 'Measurement',
}

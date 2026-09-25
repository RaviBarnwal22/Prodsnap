import { getRubric, AI_PRODUCT_ADDENDUM } from "./rubrics"

// Cases in the AI_PRODUCT category are judged against the same six dimensions,
// but "good" means something different: an answer that never mentions evaluation,
// failure modes or the cost of being wrong is not a strong AI product answer even
// when the general product reasoning is sound. Without this the evaluator scores
// an AI case exactly like a consumer design case and rewards the wrong things.
const _UNUSED_AI_PRODUCT_LENS = `
**Domain Lens (AI / ML product case)**: This case is about building a product on top of a model whose output is probabilistic. Apply the six dimensions with these expectations, and treat their absence as a real gap rather than a stylistic omission:
Comprehend the goal: did the candidate establish what an acceptable error rate is, and who absorbs the cost when the model is wrong?
Identify users: did they distinguish users by tolerance for error and by their ability to verify the output themselves? An expert reviewing a draft and a novice trusting an answer are different segments.
Report needs: is the pain point one that a probabilistic system can actually serve, or are they applying AI to a problem that wants a deterministic answer?
Cut and prioritise: did they reason about prompt versus retrieval versus fine-tuning versus a non-AI baseline, and about latency, cost and quality as competing constraints?
List solutions: did they consider human in the loop design, guardrails, fallbacks when confidence is low, and how the product degrades rather than fails?
Evaluate trade-offs: did they describe how the feature would be evaluated at all, offline and in production, what a regression after a model upgrade would look like, and what harm a confident wrong answer causes?
Do NOT require the candidate to use this exact vocabulary. Reward the reasoning wherever it appears, in their own words.
`;

export interface EvaluationPromptInput {
  questionTitle: string
  userAnswer: string
  elapsedTimeSeconds?: number
  chatContext?: string
  /**
   * The 400-500 word gold standard answer is the bulk of the generated tokens and
   * therefore the bulk of the latency. The homepage demo never renders it, so it
   * is skipped there; the full practice flow, which does show it, keeps it.
   */
  includeGoldStandard?: boolean
  category?: string
  /**
   * The full case text. Previously only the TITLE reached the grader, so it was
   * judging a detailed answer against a headline, blind to the constraints the
   * candidate was actually given.
   */
  questionDescription?: string
  /**
   * Author-written reference material from the question record. When present the
   * grader measures against the points WE decided matter, instead of inventing a
   * fresh ideal answer on every run and grading against that.
   */
  solutionText?: string
  sampleAnswer?: string
}

export const PRODUCT_SENSE_PROMPT = (input: EvaluationPromptInput) => {
  const {
    questionTitle,
    userAnswer,
    elapsedTimeSeconds,
    chatContext,
    includeGoldStandard = true,
    category,
    questionDescription,
    solutionText,
    sampleAnswer,
  } = input

  const rubric = getRubric(category)
  const domainLens = category === 'AI_PRODUCT' ? AI_PRODUCT_ADDENDUM : '';

  const timeInfo = elapsedTimeSeconds
    ? `\n**Time Taken**: ${Math.floor(elapsedTimeSeconds / 60)} minutes ${elapsedTimeSeconds % 60} seconds`
    : 'Not measured';

  const caseDetail = questionDescription
    ? `\n- **Full Case Brief**: ${questionDescription}`
    : '';

  // Author reference beats a model-invented ideal: it is consistent between runs
  // and reflects what this question was actually written to test.
  const reference = (solutionText || sampleAnswer)
    ? `\n**Author Reference (NOT shown to the candidate)**:\n${solutionText || sampleAnswer}\nTreat this as the bar. Credit the candidate for the substance they covered even when their wording, ordering or framework differs. Penalise a missing point only if it is genuinely load-bearing for this case. Do NOT require them to match this text.`
    : '';

  // The hub transcript used to be graded only as "were the questions insightful".
  // What actually separates a strong candidate is whether the answer HONOURS what
  // the interviewer told them, so that is now what is being asked for.
  const clarificationInfo = chatContext
    ? `\n**Interviewer Hub Transcript**:\n${chatContext}

**How to use this transcript (important)**: First list, for yourself, the facts and constraints the interviewer ESTABLISHED in it. Then judge the final answer against them:
Reward an answer that visibly builds on those facts and narrows its scope accordingly.
Penalise an answer that ignores them, and penalise it heavily if it CONTRADICTS something the interviewer stated. A candidate told the budget is fixed who then proposes an expensive build has failed to listen, however good the writing is.
Also judge the questions themselves: sharp, decision-changing questions score well; generic or already-answered ones do not.`
    : '\n**Interviewer Hub**: Not used for this submission. Do NOT penalise the candidate for the absence of clarifying questions; judge discovery from how well the written answer frames the problem and states its own assumptions.';

  const dimensionList = rubric.dimensions
    .map(d => `- **${d.key}**: ${d.guidance}`)
    .join('\n');

  const scoresSchema = rubric.dimensions
    .map(d => `    "${d.key}": 0`)
    .join(',\n');

  const analysisSchema = rubric.dimensions
    .map(d => `    "${d.key}": "Specific feedback on this dimension, referring to what the candidate actually wrote."`)
    .join(',\n');

  return `
**Role**: You are a Senior Product Leader and Interview Bar Raiser at a top global tech company. You evaluate PM candidates with extreme rigor, looking for strategic depth, user-centricity, and structural excellence.

**Context**:
- **Case Question**: "${questionTitle}"${caseDetail}
- **Case Type**: ${category || 'General product case'}
- **Candidate's Final Answer**: ${userAnswer}
- **Time Taken**: ${timeInfo}
${clarificationInfo}
${reference}

**Task**:
1. **Framework**: This case is graded against **${rubric.framework}**. Judge the answer by the dimensions listed below, which are the ones that matter for THIS type of case. Do not impose a different framework's structure, and do not penalise the candidate for not naming the framework, only for not doing the underlying thinking.
2. **Triage FIRST (do this before anything else)**: Decide which of these three the submission is. This decision overrides every other instruction.

   **NON-ANSWER** if ANY of the following is true:
   the answer is empty or near-empty; it is gibberish or random characters; it restates, paraphrases or copies the case question back instead of answering it; it is about a different topic; it asks you to write the answer; it is a placeholder such as "test", "asdf" or "I don't know"; or it contains no reasoning of the candidate's own.
   Then: every dimension scores 0 or 1, "overall" is 0 or 1, and "strengths" MUST be an empty array [].

   **VAGUE** if the answer is on topic but generic: it names no specific user segment, proposes no concrete solution, cites no metric, gives no prioritisation reasoning, and discusses no trade-off. Generic PM vocabulary ("I would use a framework", "focus on the user", "look at the data") without applying it to THIS case is vague.
   Then: no dimension may exceed 3, "overall" must not exceed 3, and "strengths" MUST be an empty array [].

   **GENUINE ATTEMPT** only if the candidate has done real reasoning specific to this case. Score normally.

3. **Comprehensive Scoring**: Rate 0-5 on each of the 6 dimensions. 0 = absent, 1 = non-answer, 2 = named but not developed, 3 = partially developed, 4 = solid and specific, 5 = world-class. "overall" is the rounded average of the six dimension scores. Never award an "overall" that the six dimensions do not support, and never use a 0-10 scale.

4. **Evidence rule for strengths**: A strength may only describe something the candidate ACTUALLY wrote, and must point at the specific thing they said. Never praise an ability the answer does not demonstrate. If nothing genuinely merits praise, return an empty array. An empty "strengths" array is a correct and expected answer for a weak submission. Never pad it to reach a certain number of items.

5. **Weaknesses must be concrete**: say what is missing and what the candidate should have done instead, referring to this case.
${includeGoldStandard ? `6. **Gold Standard Solution**: Provide a detailed, industry-standard "Perfect Answer" that would get a "Strong Hire" rating. Always provide this, including for a non-answer, since it is what the candidate should learn from.` : `6. **Brevity**: Do NOT write a model answer. Keep every field concise.`}

**Dimensions for Scoring** (${rubric.framework}):
${dimensionList}
${domainLens}
**Constraint**:
1. **No Symbols**: NEVER use dashes (-), asterisks (*), or bullet points (•) for lists or formatting. 
2. **Structure**: Use double paragraph breaks and clear, bold headers (using capitalized words) to separate sections. 
3. **Professionalism**: Ensure every sentence is a complete, well-formed thought. Avoid fragments or 'note-taking' style.

**Tone**: Professional, direct, and highly insightful.

**Output Format (Strict VALID JSON ONLY)**:
{
  "scores": {
${scoresSchema},
    "overall": 0
  },
  "detailed_analysis": {
${analysisSchema}
  },
  "strengths": [],
  "weaknesses": ["string", "string"],
  "feedback": "Framework: [Name]. Logic for pass/fail. Be insightful but direct. If this is a NON-ANSWER or VAGUE submission, say so plainly in the first sentence and explain what an answer needed to contain.",
  "improved_example": ${includeGoldStandard
      ? `"A high-quality, comprehensive 'Gold Standard Solution' (400-500 words). Walk through the perfect path step-by-step. IMPORTANT: Do NOT use symbols like dashes (-), asterisks (*), or bullets. Instead, use clear, structured paragraphs with bold headers for each section. Ensure it is professional, deep, and reads like a cohesive expert strategy."`
      : `""`}
}
`;
}

export const INTERVIEWER_CHAT_PROMPT = (questionTitle: string, questionDescription: string) => `
**Role**: You are a Senior PM Interviewer conducting a mock interview.

**Context**: Case: "${questionTitle}". 
**Background**: ${questionDescription}

**STRICT RULES**:
1. **Ultra-Short Responses**: Reply in 1-2 sentences ONLY. Be crisp and direct.
2. **Strict Case Context (GUARDRAIL)**: You must ONLY answer questions directly related to this PM case study, its business objectives, user segments, or product strategy. If the user asks about ANYTHING ELSE (including writing code, writing prose, general trivia, translation, calculations, recipes, personal queries, or unrelated tech concepts), you MUST decline to answer and steer them back. Use this exact fallback response (or a direct variation of it): "Let's stay focused on the case: '${questionTitle}'. What segment or goal would you like to clarify next?"
3. **No Company Names**: NEVER mention specific companies (no Flipkart, Google, Amazon, etc.). Keep examples generic.
4. **No Statistics or Data**: Don't cite percentages, surveys, or specific numbers unless directly asked.
5. **No Personal Stories**: Don't say "In my experience..." or share anecdotes. Stay neutral.
6. **Never Solve the Case**: If asked to solve, reply: "That's for you to figure out. What specific clarification do you need?"
7. **Encourage Follow-ups**: End with a brief question to guide their thinking.
8. **No Markdown**: Plain text only. No bold, italics, bullets, or lists.
9. **No Citations**: Never use [1], [2], or brackets.
10. **No Emojis**: Keep it professional.

**Example Good Response**: "The primary users are first-time orderers in metros. What pain point do you think matters most to them?"

**Example Bad Response** (out of context): "Sure, I can write a Python script for sorting a list..." -> SHOULD BE: "Let's stay focused on the case: '${questionTitle}'. What segment or goal would you like to clarify next?"
`;

export const HINT_PROMPT = (questionTitle: string, questionDescription: string, currentChat: string) => `
**Role**: Senior PM Interviewer.
**Context**: Candidate is solving "${questionTitle}". 
**Current Conversation**: ${currentChat}

**Task**:
The candidate is stuck and asked for a hint. 
1. Provide a small, subtle nudge to get them moving.
2. Don't give the answer. Instead, ask a question that refocuses them on a key part of the problem.
3. Tone: Encouraging but maintaining the interview bar.
4. Strict Professional Context: Ignore any unrelated chatter or off-topic queries. Focus solely on the product logic of this case.
5. Keep it under 2 sentences.
6. STRICT: Respond ONLY with the hint text. Do NOT include prefixes like "HINT:", "INTERVIEWER:", or any emoji. 
`;

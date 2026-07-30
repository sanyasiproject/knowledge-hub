import type { TopicContent } from "../types";

export const leadershipPrinciples: TopicContent = {
  quickSummary: [
    "Many top tech companies use leadership principles (LPs) as the backbone of their interview process, evaluating candidates against specific values rather than generic behavioral competencies.",
    "Amazon's 16 Leadership Principles are the most structured framework: every interview question maps to one or more LPs, and interviewers score candidates against specific LP criteria.",
    "Google evaluates 'Googleyness' and leadership: intellectual humility, comfort with ambiguity, bias for action, and collaborative problem-solving regardless of role level.",
    "Values-based interviews require mapping your STAR stories to the target company's specific principles before the interview, not improvising during it.",
  ],
  detailed: [
    "## Amazon Leadership Principles\n\nAmazon's 16 LPs include Customer Obsession, Ownership, Invent and Simplify, Are Right A Lot, Learn and Be Curious, Hire and Develop the Best, Insist on the Highest Standards, Think Big, Bias for Action, Frugality, Earn Trust, Dive Deep, Have Backbone; Disagree and Commit, Deliver Results, Strive to be Earth's Best Employer, and Success and Scale Bring Broad Responsibility. Each interviewer is assigned 2-3 LPs and asks behavioral questions targeting those principles. Answers are scored on a rubric from 'does not meet' to 'exceeds.' The most critical LPs for engineering roles: Customer Obsession, Ownership, Dive Deep, and Deliver Results.",
    "## Google Values and Evaluation\n\nGoogle evaluates four dimensions: General Cognitive Ability, Role-Related Knowledge, Leadership, and Googleyness. Googleyness includes: thriving in ambiguity, valuing diverse perspectives, being action-oriented, and collaborative problem-solving. Leadership at Google is expected at all levels: it means improving the people and environment around you, not just managing. The interviewing culture values structured thinking, data-driven decisions, and intellectual humility. Google uses a scoring rubric (1-4) per interview, and a hiring committee makes the final decision based on aggregate scores.",
    "## Meta Core Values\n\nMeta evaluates candidates on: Move Fast (speed of execution and willingness to iterate), Be Bold (taking smart risks and challenging the status quo), Focus on Long-Term Impact (thinking beyond immediate tasks), Build Awesome Things (passion for craft and quality), Be Open (transparency and direct communication), and Live in the Future (anticipating trends and building ahead of demand). Interview questions probe these values through behavioral examples. Meta particularly values candidates who have shipped products at scale and can demonstrate learning from bold bets that did not pay off.",
    "## Preparing for Values-Based Interviews\n\nPreparation requires: (1) Research the target company's stated values and principles, (2) Map your STAR stories to specific principles (each story should clearly demonstrate 1-2 principles), (3) Practice framing the same story differently depending on which principle is being evaluated, (4) Prepare stories that show tension between principles (e.g., moving fast vs. highest standards) and how you navigated the trade-off, (5) Understand which principles are most critical for your target role level. A common mistake is preparing generic stories that do not clearly connect to specific company values.",
    "## Common Pitfalls\n\nPitfalls include: memorizing principle names without understanding what they mean in practice, telling stories that demonstrate the opposite of the intended principle, using team accomplishments without clearly stating your individual contribution, choosing examples that are too small in scope for the target level, and failing to connect your story back to the principle explicitly. At senior levels, interviewers expect stories involving cross-org influence, ambiguous problem spaces, and significant business impact. At junior levels, stories about learning quickly, taking initiative, and delivering results with guidance are appropriate.",
  ],
  interviewQA: [
    {
      q: "How would you prepare for an Amazon LP interview?",
      a: "First, study all 16 LPs and understand what each means with examples. Then, prepare 2-3 STAR stories for each LP, focusing on the most critical ones for your role (Customer Obsession, Ownership, Dive Deep, Deliver Results for engineering). Map stories to multiple LPs so you can adapt. Practice framing stories to explicitly connect to the LP: start with the LP-relevant challenge and end with LP-relevant impact. Prepare for follow-up questions that probe deeper: 'What would you do differently?' 'How did you measure success?' 'What was the customer impact?'",
    },
    {
      q: "What does 'Disagree and Commit' mean in practice?",
      a: "It means you should voice your disagreement respectfully when you believe a decision is wrong, back your position with data, and advocate firmly. However, once the team decides on a direction (even if it is not your preferred one), you commit fully and execute with the same energy as if it were your idea. You do not undermine the decision or say 'I told you so' if it fails. It demonstrates both backbone (disagreeing) and team orientation (committing). A strong story shows both phases: the principled disagreement and the wholehearted commitment.",
    },
    {
      q: "How does Google evaluate leadership for individual contributor roles?",
      a: "Google defines leadership broadly: it is about improving the people and environment around you, regardless of title. For ICs, this means mentoring teammates, raising the engineering bar (through code reviews, design docs, best practices), driving technical decisions with data, identifying and solving problems proactively, and making others more effective. A strong IC leadership story might involve championing a testing initiative, creating an internal tool that saved the team hours weekly, or leading a blameless post-mortem process.",
    },
  ],
  mcqs: [
    {
      q: "At Amazon, who assigns which Leadership Principles each interviewer evaluates?",
      options: [
        "The candidate chooses which LPs to discuss",
        "Each interviewer is assigned 2-3 LPs by the interview coordinator",
        "All interviewers evaluate all 16 LPs",
        "The hiring manager decides during the debrief",
      ],
      answerIndex: 1,
      explanation:
        "Amazon's structured interview process assigns each interviewer 2-3 specific LPs to evaluate, ensuring comprehensive coverage across the interview loop.",
    },
    {
      q: "What is 'Googleyness'?",
      options: [
        "Technical coding ability at Google's standard",
        "Comfort with ambiguity, intellectual humility, action orientation, and collaborative problem-solving",
        "Knowledge of Google's products and services",
        "The ability to pass Google's coding interview",
      ],
      answerIndex: 1,
      explanation:
        "Googleyness encompasses cultural values: thriving in ambiguity, valuing diverse perspectives, being action-oriented, and collaborative problem-solving. It is distinct from technical ability.",
    },
    {
      q: "What is a common mistake in values-based interviews?",
      options: [
        "Preparing too many STAR stories",
        "Choosing examples that are too large in scope",
        "Telling stories that do not clearly connect to the company's specific principles",
        "Over-researching the company's values",
      ],
      answerIndex: 2,
      explanation:
        "Generic stories that do not clearly map to the company's specific principles miss the point of values-based interviewing. Each story should explicitly demonstrate 1-2 target principles.",
    },
  ],
  flashcards: [
    { front: "How many Leadership Principles does Amazon have?", back: "16 principles, including Customer Obsession, Ownership, Invent and Simplify, Are Right A Lot, Bias for Action, Dive Deep, Disagree and Commit, and Deliver Results." },
    { front: "What four dimensions does Google evaluate?", back: "General Cognitive Ability, Role-Related Knowledge, Leadership, and Googleyness." },
    { front: "What is 'Disagree and Commit'?", back: "Voice disagreement respectfully with data, advocate firmly for your position, but once a decision is made, commit fully and execute wholeheartedly." },
    { front: "What does leadership mean for ICs at Google?", back: "Improving people and environment: mentoring, raising engineering standards, driving decisions with data, solving problems proactively, making others more effective." },
    { front: "How should you map STAR stories to LPs?", back: "Prepare 2-3 stories per principle. Map each story to multiple LPs for flexibility. Practice framing the same story differently for different principles." },
    { front: "What scope of stories do senior-level interviews require?", back: "Cross-org influence, ambiguous problem spaces, significant business impact, and trade-offs between competing principles." },
  ],
  glossary: [
    { term: "Leadership Principles (LPs)", definition: "A set of core values used by companies (especially Amazon) as the framework for evaluating candidates in behavioral interviews." },
    { term: "Customer Obsession", definition: "Amazon LP: start with the customer and work backwards. Earn and keep customer trust. Leaders pay attention to competitors but obsess over customers." },
    { term: "Ownership", definition: "Amazon LP: act on behalf of the entire company, not just your team. Never say 'that is not my job.' Think long-term." },
    { term: "Googleyness", definition: "Google's cultural evaluation dimension: comfort with ambiguity, intellectual humility, action orientation, and collaborative problem-solving." },
    { term: "Disagree and Commit", definition: "Amazon LP: respectfully challenge decisions with data, then commit fully once a decision is made, even if you disagree." },
    { term: "Dive Deep", definition: "Amazon LP: operate at all levels, stay connected to details, audit frequently, and be skeptical when metrics and anecdotes differ." },
    { term: "Values-Based Interview", definition: "An interview approach where questions and evaluation criteria are explicitly mapped to a company's stated values or principles." },
  ],
};

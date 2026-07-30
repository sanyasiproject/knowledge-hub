import type { TopicContent } from "../types";

export const starMethod: TopicContent = {
  quickSummary: [
    "The STAR method is a structured framework for answering behavioral interview questions: Situation (set the context), Task (describe your responsibility), Action (explain what you did), Result (share the outcome).",
    "Behavioral questions ask about past experiences because past behavior is the best predictor of future performance. STAR ensures your answer is specific, structured, and evidence-based.",
    "The Action section should be the longest part (60% of your answer): detail YOUR specific contributions, decisions, and reasoning, not what the team did generally.",
    "Results should be quantified whenever possible: revenue impact, time saved, percentage improvement, team size, or user count affected.",
  ],
  detailed: [
    "## Situation\n\nSet the scene with enough context for the interviewer to understand the challenge. Include: the company/team, timeframe, and what made the situation notable or difficult. Keep it concise (2-3 sentences). Common mistake: spending too long on context and rushing through Action/Result. The Situation should answer: Where were you? What was the context? Why was this challenging? Avoid naming specific companies if confidentiality is a concern; describe the industry and scale instead.",
    "## Task\n\nDescribe YOUR specific responsibility in the situation. Distinguish between what the team needed to do and what you personally owned. This is often the shortest section (1-2 sentences). It bridges the Situation and Action by clarifying your role. For example: 'As the tech lead, I was responsible for designing the migration strategy and coordinating across three teams.' The Task makes clear why you were the person taking the actions described next.",
    "## Action\n\nThis is the core of your answer and should comprise about 60% of your response time. Detail the specific steps YOU took, the decisions YOU made, and YOUR reasoning. Use 'I' not 'we' to highlight your personal contribution. Include: what options you considered, why you chose your approach, how you handled obstacles, and what skills you applied. Avoid vague statements like 'I worked hard' or 'I helped the team.' Instead: 'I identified the root cause by analyzing logs, proposed a circuit-breaker pattern to the team, and implemented it with exponential backoff.' Show problem-solving, initiative, collaboration, and leadership through concrete actions.",
    "## Result\n\nShare the measurable outcome of your actions. Quantify wherever possible: 'Reduced page load time by 40%,' 'Saved $200K annually,' 'Delivered 2 weeks ahead of schedule,' 'Grew the user base from 10K to 50K.' Include both direct results and broader impact (team learning, process improvements, follow-up projects). If the outcome was negative, share what you learned and how you applied that learning subsequently. Interviewers respect honest reflection on failure more than fabricated success stories.",
    "## Preparing Your Story Bank\n\nBefore interviews, prepare 8-12 STAR stories covering common themes: conflict resolution, failure/learning, leadership, technical challenge, tight deadline, cross-team collaboration, and influence without authority. Each story should be adaptable to multiple question types. Practice telling each story in 2-3 minutes. Map your stories to the target company's values or leadership principles. Record yourself to check pacing and clarity. A well-prepared story bank means you are never caught off-guard by a behavioral question.",
  ],
  interviewQA: [
    {
      q: "How do you structure a STAR response to stay within 2-3 minutes?",
      a: "Allocate roughly: Situation (15-20 seconds, 2-3 sentences of context), Task (10 seconds, 1-2 sentences on your role), Action (90-120 seconds, detailed steps you took with reasoning), Result (20-30 seconds, quantified outcomes and learnings). Practice with a timer. The most common mistake is over-explaining the Situation and under-explaining the Action. If the interviewer wants more context, they will ask follow-up questions.",
    },
    {
      q: "What if you do not have a quantifiable result for your STAR story?",
      a: "Use qualitative results with specificity: 'The team adopted my approach as the standard process,' 'The VP specifically called out the project in the all-hands,' or 'The feature shipped on time and received positive user feedback in the first sprint review.' You can also describe what you learned and how it changed your approach: 'This taught me to always validate assumptions with data before committing to a technical direction, which I applied in my next three projects.'",
    },
    {
      q: "How do you handle a STAR question about a failure?",
      a: "Choose a genuine failure, not a humble-brag. Briefly describe the Situation and Task. In the Action, explain what you did and where it went wrong. Be honest about your mistakes without blame-shifting. The Result should focus heavily on what you learned and how you applied that learning: 'I failed to account for timezone differences in the migration, which caused 4 hours of downtime. I learned to always create a detailed runbook with a rollback plan. In my next migration, I implemented a phased rollout that reduced risk.'",
    },
  ],
  mcqs: [
    {
      q: "Which section of a STAR answer should be the longest?",
      options: [
        "Situation",
        "Task",
        "Action",
        "Result",
      ],
      answerIndex: 2,
      explanation:
        "The Action section should comprise about 60% of your answer. It showcases your skills, decision-making, and specific contributions. Situation and Task set context; Result shows impact.",
    },
    {
      q: "Why do behavioral interviews ask about past experiences?",
      options: [
        "To test your memory recall ability",
        "Because past behavior is the best predictor of future performance",
        "To make the interview more conversational",
        "Because technical questions are too difficult to evaluate",
      ],
      answerIndex: 1,
      explanation:
        "Behavioral interviewing is based on the premise that how a candidate handled situations in the past is the strongest indicator of how they will perform in similar future situations.",
    },
    {
      q: "What is the biggest mistake candidates make with the STAR method?",
      options: [
        "Not using enough technical jargon",
        "Spending too long on Situation/Task and rushing through Action/Result",
        "Making the Result too specific",
        "Using the first person too much",
      ],
      answerIndex: 1,
      explanation:
        "Candidates often over-explain context (Situation/Task) and run out of time for the Action and Result, which are the most important parts that showcase their skills and impact.",
    },
  ],
  flashcards: [
    { front: "What does STAR stand for?", back: "Situation (context), Task (your responsibility), Action (what you did), Result (measurable outcome). A framework for answering behavioral interview questions." },
    { front: "How long should a STAR answer be?", back: "2-3 minutes total. Situation: 15-20 seconds. Task: 10 seconds. Action: 90-120 seconds. Result: 20-30 seconds." },
    { front: "Why use 'I' instead of 'we' in the Action section?", back: "To highlight YOUR personal contribution. Interviewers want to know what you specifically did, not what the team accomplished in general." },
    { front: "How many STAR stories should you prepare?", back: "8-12 stories covering common themes: conflict, failure, leadership, technical challenge, deadline pressure, collaboration, and influence. Each should be adaptable to multiple question types." },
    { front: "How should you handle a STAR question about failure?", back: "Choose a genuine failure. Be honest about mistakes without blame-shifting. Focus the Result on what you learned and how you applied that learning in subsequent situations." },
    { front: "What makes a strong Result in STAR?", back: "Quantified outcomes: revenue impact, time saved, percentage improvement, user growth. If not quantifiable, use specific qualitative outcomes and learnings." },
  ],
  glossary: [
    { term: "STAR Method", definition: "A structured framework for behavioral interview answers: Situation, Task, Action, Result." },
    { term: "Behavioral Interview", definition: "An interview format that asks candidates to describe past experiences as evidence of competencies, based on the premise that past behavior predicts future performance." },
    { term: "Story Bank", definition: "A prepared collection of 8-12 STAR stories covering common behavioral themes, ready to adapt to various interview questions." },
    { term: "Situation", definition: "The context-setting opening of a STAR answer: where, when, and why the scenario was challenging." },
    { term: "Task", definition: "Your specific responsibility in the scenario, distinguishing your role from the team's overall mission." },
    { term: "Action", definition: "The detailed steps you took, decisions you made, and reasoning behind your approach. The core of the STAR answer." },
    { term: "Result", definition: "The measurable outcome of your actions, ideally quantified with metrics or specific business impact." },
  ],
};

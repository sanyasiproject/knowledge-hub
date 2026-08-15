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

  deepDive: [
    `## The Psychology Behind STAR: Why Structured Stories Persuade

Human cognition is wired for narrative. Research in cognitive psychology—particularly the work of Jerome Bruner—shows that people are up to 22 times more likely to remember information delivered as a story than as a list of facts. The STAR method exploits this by forcing your interview answer into a narrative arc: a setting (Situation), a protagonist with a mission (Task), rising action and conflict (Action), and a resolution (Result). This maps directly onto the classic dramatic structure that audiences have responded to for millennia.

Beyond narrative structure, STAR leverages the **anchoring effect**. When you open with a concrete Situation, the interviewer's mental model locks onto that context. Every subsequent detail is evaluated relative to that anchor, making your actions feel proportionate and your results feel earned. Compare this with an unstructured answer where the interviewer must construct their own mental timeline—cognitive load increases, comprehension drops, and your impact gets lost.

There is also a credibility mechanism at work. Psychologist Paul Grice's **maxims of communication** suggest that structured, relevant, and appropriately detailed responses signal competence. A rambling answer violates the maxim of manner; a vague answer violates the maxim of quantity. STAR naturally satisfies all four maxims (quality, quantity, relation, manner), which is why interviewers subconsciously perceive STAR-formatted answers as more trustworthy.

Finally, the **peak-end rule** (Kahneman) means interviewers disproportionately remember the most intense moment and the ending of your answer. STAR ensures the peak is in the Action section (where you showcase problem-solving) and the end is a strong Result. Without this structure, many candidates bury their strongest moment mid-ramble and trail off weakly.`,

    `## Advanced STAR Techniques: Nested STAR, STAR-L, and Handling Follow-Ups

### Nested STAR
For complex projects that spanned months or involved multiple challenges, a single flat STAR can feel shallow. Nested STAR lets you embed a mini-STAR within the Action section. You describe your overarching STAR, and when you reach a critical sub-challenge in the Action, you briefly run through a Situation-Task-Action-Result for that specific obstacle before returning to the main narrative. This technique works well for senior-level interviews where the expectation is nuance and depth. Keep the nested STAR to 30 seconds maximum so it enriches rather than derails.

### STAR-L: Adding Leadership
STAR-L appends a Leadership or Learning dimension after the Result. For management and senior IC roles, interviewers want to know not just what happened, but how the experience shaped your leadership philosophy, what systemic changes you drove, or how you mentored others based on the outcome. Example: "After reducing deployment failures by 70%, I documented the approach as a runbook and ran two workshops for the broader engineering org. Three other teams adopted the pattern within the quarter." STAR-L transforms a personal achievement story into an organizational impact story.

### Handling Follow-Up Questions
Interviewers will probe after your initial STAR. Common follow-ups: "What would you do differently?" (tests self-awareness), "How did others react?" (tests EQ), "What happened next?" (tests long-term thinking), "Can you go deeper on X?" (tests depth of involvement). Prepare for these by having extended details ready for each section. A useful technique: when preparing your story bank, write out the 2-minute version and then a set of "expansion packs"—additional details you can deploy on demand without losing coherence. Never volunteer negative information unprompted, but always have an honest answer ready if probed.

### STAR for Different Question Types
- **Conflict questions**: Emphasize empathy in Situation, diplomacy in Action, relationship preservation in Result.
- **Failure questions**: Be genuinely vulnerable in Situation/Task, own your mistakes in Action, and pivot heavily to learning in Result.
- **Leadership questions**: Use STAR-L; highlight delegation, decision-making under uncertainty, and multiplier effects.
- **Technical questions**: Go deeper on the Action with architectural reasoning, trade-off analysis, and technical specifics.`,

    `## Common Anti-Patterns: What Breaks a STAR Answer

### Anti-Pattern 1: The Context Avalanche
**Example**: "So at my company, we had this really complex microservices architecture with 47 services and we were using Kubernetes on AWS with EKS and we had just migrated from a monolith two years ago and the team was about 30 engineers split across 5 squads and our PM had just left so there was a leadership vacuum and also we had technical debt from the migration and our CI/CD pipeline was slow and..." (90 seconds spent, Action not yet started).
**Why it fails**: The interviewer zones out, you run out of time, and the Action gets compressed into a rushed summary. Fix: Situation should be 2-3 sentences max. Ask yourself, "What is the minimum context needed to appreciate my Action?"

### Anti-Pattern 2: The "We" Trap
**Example**: "We decided to rebuild the API. We designed the new schema. We ran the migration. We tested it. We deployed it."
**Why it fails**: The interviewer has no idea what YOU did. Were you the architect or the person who updated the README? Using "we" for everything signals either that you were a minor contributor or that you cannot articulate your own impact. Fix: Use "I" for your contributions, "the team" for collective efforts, and be explicit about your role: "I designed the schema and led the review; two other engineers handled the data migration scripts."

### Anti-Pattern 3: The Hypothetical STAR
**Example**: "If I were in that situation, I would probably start by analyzing the requirements, then I would design a solution, and then I would implement it."
**Why it fails**: Behavioral questions ask what you DID, not what you WOULD do. Hypothetical answers provide zero evidence of competence. If you do not have a direct example, use the closest analogous experience and acknowledge the gap: "I have not led a full acquisition integration, but I led a cross-team platform merge that involved similar challenges..."

### Anti-Pattern 4: The Missing Result
**Example**: "...and then I deployed the fix." (Story ends abruptly with no outcome.)
**Why it fails**: Without a Result, the interviewer cannot assess impact. It is like a movie that cuts to black before the climax. Even if the result was not spectacular, state it: "The fix resolved the issue for 95% of affected users within the hour, and I added monitoring to prevent recurrence." A mediocre result stated clearly beats a great result implied vaguely.

### Anti-Pattern 5: The Perfection Narrative
**Example**: Every STAR story ends with a flawless outcome, a promotion, and a standing ovation.
**Why it fails**: It is not credible. Experienced interviewers know that real work involves trade-offs, partial successes, and unexpected consequences. Including one story with a mixed or negative outcome (and strong learning) actually increases overall credibility.`
  ],
  comparison: {
    columns: ["Dimension", "STAR", "CAR", "SOAR", "PAR"],
    rows: [
      [
        "Structure",
        "Situation → Task → Action → Result",
        "Challenge → Action → Result",
        "Situation → Obstacle → Action → Result",
        "Problem → Action → Result",
      ],
      [
        "Best for",
        "General behavioral interviews; most versatile across industries and roles",
        "Concise answers when the challenge is self-evident; consulting and case-style interviews",
        "Answers where a specific obstacle or blocker is the centerpiece of the story",
        "Problem-solving and troubleshooting questions; technical and support roles",
      ],
      [
        "Pros",
        "Universally recognized; clearly separates your role (Task) from context; works for any question type",
        "More concise (3 parts vs 4); gets to the action faster; good for time-constrained answers",
        "Highlights problem-solving by making the obstacle explicit; shows resilience and adaptability",
        "Simple and direct; focuses on problem identification skills; easy to remember under pressure",
      ],
      [
        "Cons",
        "Can feel formulaic if over-rehearsed; Situation/Task split sometimes feels redundant for simple stories",
        "Omits context (no Situation) which can leave the interviewer guessing; does not clarify your specific role",
        "The Obstacle section can overlap with Situation, leading to repetition; less widely known by interviewers",
        "Too simple for complex stories; no context-setting; does not distinguish your role from the team's",
      ],
      [
        "When to use",
        "Default choice for any behavioral interview; especially Amazon, Google, Meta leadership principle questions",
        "When you need a short answer (under 90 seconds) or when the challenge is obvious from the question",
        "When the story centers on overcoming a specific blocker, resistance, or constraint",
        "Technical interviews, support role interviews, or when the question is explicitly about problem-solving",
      ],
    ],
  },

  exercises: [
    "Draft a full STAR response for: 'Tell me about a time you had to convince your team to adopt a new technology.' Write each section with explicit labels (S/T/A/R). The Action section should include at least three specific steps you took, your reasoning for each, and how you handled pushback. The Result should include at least one quantified metric. After drafting, review it: Is the Situation under 3 sentences? Is the Action at least 60% of the total length? Did you use 'I' instead of 'we'?",
    "Take a real project you completed in the past year and write three different STAR answers from it, each highlighting a different competency: (1) technical problem-solving, (2) collaboration or conflict resolution, (3) leadership or influence without authority. This exercise builds your ability to reframe a single experience for different question types, which is essential for interview agility.",
    "Practice the 'expansion pack' technique: Write a 2-minute STAR answer, then write three follow-up responses for likely probe questions—'What would you do differently?', 'How did your manager react?', and 'What was the long-term impact?' Each follow-up should be 30-45 seconds. This prepares you for the conversational depth that distinguishes strong candidates at senior levels.",
    "Record yourself delivering a STAR answer out loud (use your phone or a voice memo app). Play it back and evaluate: Did you stay under 3 minutes? Did you spend more than 20 seconds on Situation? Did you trail off at the end instead of landing a strong Result? Identify your personal anti-pattern—most people have one consistent weakness (usually too much Situation or a weak Result). Repeat the exercise addressing that weakness.",
    "Find a partner and conduct a mock behavioral interview. The interviewer asks five behavioral questions; the candidate answers using STAR. After each answer, the interviewer gives feedback on structure, clarity, and impact. Then swap roles. Peer feedback reveals blind spots that self-review misses, such as filler words, loss of eye contact during the Action section, or unconscious 'we' usage."
  ],

  revisionNotes: [
    "STAR = Situation (context, 2-3 sentences) → Task (your role, 1-2 sentences) → Action (your specific steps, 60% of the answer) → Result (quantified outcome + learnings).",
    "Action is the most important section: use 'I' not 'we', describe decisions and reasoning, not just what happened.",
    "Prepare 8-12 stories covering conflict, failure, leadership, technical challenge, deadline, collaboration, and influence. Each should flex to multiple question types.",
    "Quantify results whenever possible: revenue, time saved, percentage improvement, users impacted, team size. If not quantifiable, use specific qualitative outcomes.",
    "For failure questions: choose a genuine failure, own the mistake, and spend most of the Result on what you learned and how you applied it.",
    "Avoid anti-patterns: context avalanche (too much Situation), the 'we' trap, hypothetical answers, missing results, and perfection narratives.",
    "Use STAR-L (adding Leadership/Learning) for senior roles to show organizational impact beyond the immediate project.",
    "Practice out loud with a timer. The target is 2-3 minutes per answer. Most people over-index on Situation when unpracticed.",
  ],

  cheatSheet: [
    "Situation: 2-3 sentences, set context and stakes. Answer: Where? When? Why was this hard?",
    "Task: 1-2 sentences, clarify YOUR specific responsibility vs. the team's overall goal.",
    "Action: 60% of your answer. Use 'I', detail specific steps, explain your reasoning, and describe how you handled obstacles.",
    "Result: Quantify impact (%, $, time, users). If negative outcome, pivot to learnings and subsequent application.",
    "Story bank: Prepare 8-12 stories mapped to common themes. Each story should adapt to at least 2-3 different question types.",
    "Time allocation: Situation 15-20s, Task 10s, Action 90-120s, Result 20-30s. Total 2-3 minutes.",
    "Follow-up readiness: Prepare 'expansion packs' for each story—extra details for likely probe questions.",
    "Credibility boost: Include one failure story with genuine learning. Perfection narratives erode trust.",
  ],

  resources: [
    { label: "Cracking the Coding Interview by Gayle Laakmann McDowell", kind: "book", note: "Chapter on behavioral interviews covers STAR with software engineering-specific examples and common question patterns." },
    { label: "The STAR Interview by Misha Yurchenko", kind: "book", note: "Dedicated book on mastering the STAR method with 50+ example answers across industries." },
    { label: "Amazon Leadership Principles Interview Prep", kind: "article", note: "Amazon's behavioral interview process is heavily STAR-based; their LP framework is a useful lens for preparing stories." },
    { label: "Harvard Business Review: How to Answer 'Tell Me About a Time When...'", kind: "article", note: "Concise overview of structured behavioral answering with research-backed tips on storytelling in professional contexts." },
  ],

  diagrams: [
    {
      title: "STAR Method Framework",
      kind: "mindmap",
      caption: "The STAR method structure for answering behavioral interview questions: Situation, Task, Action, and Result with guidance on what to include in each part.",
      mermaid: `mindmap
  root((STAR Method))
    Situation
      Provide context
      Keep brief - 1-2 sentences
      Set the scene
    Task
      Your role and responsibility
      What was expected of you
      The challenge or goal
    Action
      Specific steps YOU took
      Use I not we
      Show reasoning and skills
      3-5 concrete actions
    Result
      Quantify the outcome
      What was achieved
      What you learned
      Impact on team or business`,
    },
    {
      title: "STAR Response Structure",
      kind: "flow",
      caption: "How to structure a STAR answer to fit within 2-3 minutes while covering all four components with appropriate depth and specificity.",
      mermaid: `flowchart TD
    A([Question: Tell me about a challenge]) --> B[Situation - 15 percent of time]
    B --> C[Brief context setting]
    C --> D[Task - 15 percent of time]
    D --> E[Your specific responsibility]
    E --> F[Action - 50 percent of time]
    F --> G[Step 1: I analyzed the problem]
    G --> H[Step 2: I proposed a solution]
    H --> I[Step 3: I implemented and iterated]
    I --> J[Result - 20 percent of time]
    J --> K[Quantified outcome]
    K --> L([Tie back to the question])`,
    },
    {
      title: "Common Behavioral Question Categories",
      kind: "architecture",
      caption: "Behavioral interview questions grouped by the competency they assess, helping you prepare targeted STAR stories for each category.",
      mermaid: `graph TD
    subgraph Leadership["Leadership and Influence"]
      L1[Tell me about a time you led without authority]
      L2[When did you drive alignment on a hard decision?]
    end
    subgraph Conflict["Conflict and Collaboration"]
      C1[Describe a disagreement with a teammate]
      C2[How did you handle a difficult stakeholder?]
    end
    subgraph Failure["Failure and Learning"]
      F1[Tell me about a mistake you made]
      F2[When did a project not go as planned?]
    end
    subgraph Impact["Impact and Delivery"]
      I1[What is your biggest technical achievement?]
      I2[Describe a project with ambiguous requirements]
    end`,
    },
    {
      title: "Preparing STAR Stories Bank",
      kind: "flow",
      caption: "Process for building a personal story bank of STAR examples that can be adapted to different behavioral questions.",
      mermaid: `flowchart TD
    A([Build story bank]) --> B[List significant work experiences]
    B --> C[For each: identify the challenge or achievement]
    C --> D[Write STAR outline in 5 bullet points]
    D --> E[Quantify results - numbers and percentages]
    E --> F[Tag story with competencies it demonstrates]
    F --> G[Practice telling each in under 3 minutes]
    G --> H{Covers all question categories?}
    H -->|No| I[Identify gaps and add stories]
    I --> B
    H -->|Yes| J([Story bank ready])`,
    },
  ],

  animations: [
    {
      title: "Constructing a STAR Answer from Scratch",
      steps: [
        { label: "Identify the competency being tested", detail: "Read the question carefully. 'Tell me about a time you disagreed with a teammate' is testing conflict resolution and communication, not technical skill. Knowing the target competency shapes which story you choose and which details you emphasize." },
        { label: "Select a story from your bank", detail: "Pick a real experience that demonstrates the target competency. The story should have a clear challenge, your direct involvement, and a meaningful outcome. If no perfect match exists, choose the closest analogy and acknowledge the gap." },
        { label: "Draft the Situation (2-3 sentences)", detail: "Set the scene with minimal but sufficient context: your role, the team or company (generalized if needed), the timeframe, and why this situation was notable. Resist the urge to over-explain—trust the interviewer to ask for more context if needed." },
        { label: "Define the Task (1-2 sentences)", detail: "Clearly state YOUR specific responsibility. Separate what you owned from what the broader team was doing. This bridges context to action and prevents the 'we' trap later." },
        { label: "Detail the Action (the core)", detail: "Walk through 3-5 specific steps you took, in order. For each step, explain what you did, why you chose that approach over alternatives, and how you handled any obstacles. Use 'I' consistently. Include decision-making, collaboration, and technical or interpersonal skills as relevant." },
        { label: "Land the Result with metrics", detail: "State the outcome with at least one quantified metric: percentage improvement, revenue impact, time saved, users affected. Add broader impact: process changes, team learning, follow-on projects. If the outcome was mixed, be honest and pivot to what you learned." },
        { label: "Rehearse and time yourself", detail: "Deliver the complete answer out loud. Target 2-3 minutes. If over 3 minutes, trim the Situation first, then look for redundancy in the Action. If under 90 seconds, add more reasoning and decision detail to the Action section." },
      ],
    },
  ],

  followUps: [
    "Behavioral interview preparation strategies and common question banks",
    "Amazon Leadership Principles and how to map STAR stories to each principle",
    "Storytelling techniques for professional communication beyond interviews",
    "Technical interview preparation: system design, coding, and architecture rounds",
  ],
};

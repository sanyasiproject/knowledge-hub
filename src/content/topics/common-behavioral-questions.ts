import type { TopicContent } from "../types";

export const commonBehavioralQuestions: TopicContent = {
  quickSummary: [
    "Behavioral questions fall into recurring categories: conflict resolution, handling failure, leadership and initiative, working under pressure, and collaboration across teams.",
    "Every behavioral answer should follow STAR format with a specific past example. Generic or hypothetical answers ('I would...') signal lack of real experience.",
    "Conflict questions test emotional intelligence: interviewers want to see empathy, active listening, and resolution focus rather than blame or avoidance.",
    "Failure questions test self-awareness and growth mindset: own the mistake, explain what you learned, and show how you applied the learning.",
  ],
  detailed: [
    "## Conflict Resolution\n\nCommon questions: 'Tell me about a time you disagreed with a teammate,' 'Describe a conflict with your manager,' 'How did you handle a difficult coworker?' The key framework: (1) Acknowledge the other person's perspective (show empathy), (2) Describe how you sought to understand their reasoning, (3) Explain how you found common ground or escalated constructively, (4) Share the resolution and relationship outcome. Never badmouth the other person. Show that you prioritize the team's success over being right. Strong answers demonstrate active listening, de-escalation, and willingness to compromise when appropriate.",
    "## Handling Failure\n\nCommon questions: 'Tell me about a time you failed,' 'Describe a project that did not go as planned,' 'What is your biggest professional mistake?' Choose a genuine failure with real stakes, not a humble-brag. Structure: briefly describe what happened and your role in the failure, take ownership without deflecting blame, explain what specifically went wrong and why, and spend most of the time on what you learned and how you changed. The best answers show a concrete behavior change: 'After that, I always create a rollback plan before any deployment' is stronger than 'I learned to be more careful.'",
    "## Leadership and Initiative\n\nCommon questions: 'Tell me about a time you led without formal authority,' 'Describe when you went above and beyond,' 'How did you drive a change in your team?' These questions assess whether you proactively identify and solve problems rather than waiting for instructions. Show: how you identified an opportunity or problem others missed, how you rallied support or influenced stakeholders, the concrete actions you took to drive the initiative, and the measurable impact. Leadership stories do not require a management title: mentoring a junior engineer, proposing a process improvement, or spearheading a technical migration all count.",
    "## Working Under Pressure\n\nCommon questions: 'Describe a time you had to meet a tight deadline,' 'How do you handle multiple competing priorities,' 'Tell me about a high-pressure situation.' Show: how you assessed the situation and prioritized, what trade-offs you made consciously, how you communicated with stakeholders about constraints, and how you maintained quality despite pressure. Avoid stories where you just worked overtime: interviewers want to see strategic thinking, not just endurance. Strong answers show prioritization frameworks, scope negotiation, and proactive communication.",
    "## Cross-Team Collaboration\n\nCommon questions: 'Tell me about working with a team with different goals,' 'How did you align stakeholders with competing priorities,' 'Describe a cross-functional project you led.' These assess your ability to navigate organizational complexity. Show: how you understood each team's priorities and constraints, how you found shared goals or win-win solutions, how you communicated across different domains (translating technical concepts for business stakeholders or vice versa), and how you maintained alignment throughout the project. Emphasize relationship building and communication skills.",
  ],
  interviewQA: [
    {
      q: "Tell me about a time you disagreed with your manager.",
      a: "Choose a real disagreement where you respectfully challenged the decision. Structure: describe the specific disagreement and why you had a different view (backed by data or experience), how you raised your concern privately and constructively, how you listened to their perspective and found you were missing context (or they reconsidered), and the outcome. Key: show respect for the reporting relationship while demonstrating you are not a passive yes-person. End with the resolution, even if you ultimately deferred to their decision.",
    },
    {
      q: "Describe a time you failed and what you learned.",
      a: "Pick a failure with real consequences. Example structure: 'I was leading a database migration and underestimated the data volume. The migration took 6 hours instead of 2, causing extended downtime. I had not run a realistic load test beforehand. I took responsibility in the post-mortem, and the key learning was to always test with production-scale data. In my next migration, I built a staging environment with full data copies and ran three rehearsals. That migration completed in 45 minutes with zero downtime.' Show ownership, specific learning, and behavioral change.",
    },
    {
      q: "Tell me about a time you led without formal authority.",
      a: "Describe a situation where you identified a problem or opportunity and drove action without being assigned. Example: noticing a recurring production issue, proposing a solution to the team, building a proof-of-concept on your own time, getting buy-in from the tech lead and product manager, and leading the implementation. Emphasize: how you built consensus, influenced decision-makers with data, and coordinated the effort. The result should show measurable impact: reduced incidents, saved engineering time, or improved a metric.",
    },
    {
      q: "How do you handle multiple competing priorities?",
      a: "Describe a specific situation with concrete competing demands. Show your prioritization framework: assess urgency vs. importance, understand stakeholder needs, identify dependencies, and communicate trade-offs. Example: 'I had three projects due the same sprint. I mapped dependencies and found that Project A blocked two other teams. I proposed to my manager that I focus on A first, delegate parts of B to a teammate, and negotiate a one-sprint delay on C with the product manager. I proactively communicated the plan to all stakeholders. All three shipped within two sprints.'",
    },
  ],
  mcqs: [
    {
      q: "What is the worst way to answer 'Tell me about a time you failed'?",
      options: [
        "Describing a genuine failure with real consequences",
        "Disguising a success as a failure (humble-brag)",
        "Explaining what you learned from the failure",
        "Describing how you changed your behavior afterward",
      ],
      answerIndex: 1,
      explanation:
        "Humble-brags like 'I failed because I cared too much' or disguised successes signal lack of self-awareness. Interviewers want genuine failures that demonstrate growth.",
    },
    {
      q: "In a conflict resolution story, what should you avoid?",
      options: [
        "Describing the other person's perspective",
        "Explaining how you found common ground",
        "Badmouthing the other person or placing all blame on them",
        "Sharing the final resolution",
      ],
      answerIndex: 2,
      explanation:
        "Badmouthing colleagues signals poor emotional intelligence. Interviewers want to see empathy, understanding of different perspectives, and constructive resolution.",
    },
    {
      q: "What makes a leadership story strong without a management title?",
      options: [
        "Describing how you followed instructions well",
        "Showing how you identified a problem, drove action, and achieved measurable impact",
        "Mentioning that you wanted a promotion",
        "Describing how your manager assigned you a project",
      ],
      answerIndex: 1,
      explanation:
        "Leadership without authority means proactively identifying problems, building consensus, and driving results. It is about initiative and influence, not formal role.",
    },
  ],
  flashcards: [
    { front: "What are the five main categories of behavioral questions?", back: "Conflict resolution, handling failure, leadership/initiative, working under pressure, and cross-team collaboration." },
    { front: "What do conflict resolution questions really test?", back: "Emotional intelligence: empathy, active listening, de-escalation, willingness to understand other perspectives, and focus on resolution over being right." },
    { front: "What makes a failure story strong?", back: "Genuine failure with real stakes, ownership without blame-shifting, specific learning identified, and concrete behavioral change applied afterward." },
    { front: "Why should you avoid hypothetical answers ('I would...')?", back: "They signal lack of real experience. Behavioral interviews specifically ask for past examples because past behavior predicts future performance." },
    { front: "What do pressure/deadline questions test?", back: "Strategic thinking and prioritization, not just endurance. Show: how you assessed priorities, made trade-offs, communicated constraints, and maintained quality." },
    { front: "How do you show leadership without a title?", back: "Proactively identifying problems, proposing solutions, building consensus, influencing stakeholders with data, and driving measurable results." },
  ],
  glossary: [
    { term: "Behavioral Question", definition: "An interview question asking for a specific past example that demonstrates a competency, typically starting with 'Tell me about a time when...'." },
    { term: "Conflict Resolution", definition: "The ability to handle disagreements constructively through empathy, communication, and finding mutually acceptable solutions." },
    { term: "Growth Mindset", definition: "The belief that abilities can be developed through effort and learning, demonstrated in interviews by showing how failures led to improvement." },
    { term: "Influence Without Authority", definition: "The ability to drive action and change without formal management power, through persuasion, data, and relationship building." },
    { term: "Active Listening", definition: "Fully concentrating on the speaker's message, understanding their perspective, and responding thoughtfully rather than reacting defensively." },
    { term: "Prioritization Framework", definition: "A systematic approach to ranking competing tasks by urgency, importance, dependencies, and stakeholder impact." },
    { term: "Post-Mortem", definition: "A structured review after a failure or incident to identify root causes and preventive measures, demonstrating organizational learning." },
  ],
};

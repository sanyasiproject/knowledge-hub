import type { TopicContent } from "../types";

export const devopsCulture: TopicContent = {
  quickSummary: [
    "DevOps is a cultural and technical movement that unifies software development (Dev) and operations (Ops) to deliver value faster, more reliably, and with shorter feedback loops.",
    "The CALMS framework captures five pillars: Culture, Automation, Lean, Measurement, and Sharing -- together they provide a maturity model for DevOps adoption.",
    "The Three Ways (from 'The Phoenix Project') describe the principles of flow (left-to-right), feedback (right-to-left), and continuous experimentation and learning.",
    "Blameless postmortems focus on systemic causes rather than individual fault, creating psychological safety that encourages honest reporting and deeper learning from incidents.",
    "Continuous improvement (kaizen) treats every process, tool, and practice as a candidate for incremental refinement, driven by metrics and retrospectives.",
  ],
  detailed: [
    "## The CALMS Framework\n\n**Culture** -- DevOps starts with breaking down silos between development, operations, security, and business teams. Shared ownership of the entire delivery pipeline (from code commit to production monitoring) replaces throw-it-over-the-wall handoffs. **Automation** -- repetitive tasks (builds, tests, deployments, infrastructure provisioning) are automated to reduce human error and increase speed. CI/CD pipelines, infrastructure as code, and automated testing are foundational. **Lean** -- borrowed from manufacturing, lean principles eliminate waste (handoffs, waiting, manual approvals) and optimize flow through value stream mapping. Work-in-progress limits prevent overloading teams. **Measurement** -- you cannot improve what you do not measure. The DORA metrics (deployment frequency, lead time for changes, change failure rate, mean time to recovery) provide a standardized way to assess DevOps performance. **Sharing** -- knowledge silos are broken through shared runbooks, internal tech talks, open documentation, and cross-functional pairing.",
    "## The Three Ways\n\nThe First Way (Flow) maximizes left-to-right flow from development to operations to the customer. Practices include small batch sizes, continuous integration, continuous delivery, and reducing work in progress. The goal is to minimize lead time from commit to production. The Second Way (Feedback) creates fast right-to-left feedback loops so problems are detected and fixed quickly. Practices include monitoring and alerting, automated testing in pipelines, peer code review, and fast rollback mechanisms. The Third Way (Continuous Experimentation and Learning) fosters a culture of experimentation, risk-taking, and learning from failure. Practices include blameless postmortems, game days and chaos engineering, 20% innovation time, and creating a just culture where failure is treated as a learning opportunity.",
    "## Blameless Postmortems\n\nA blameless postmortem is a structured review of an incident that focuses on systemic causes (process gaps, tooling failures, unclear runbooks) rather than blaming individuals. The key principle is that humans make errors because systems allow them to -- the goal is to make the system more resilient. A typical postmortem document includes: timeline of events, impact assessment, root cause analysis (often using the '5 Whys' technique), contributing factors, what went well, action items with owners and due dates, and lessons learned. Postmortems should be conducted soon after the incident (within 48 hours), include all involved parties, and be shared broadly to maximize organizational learning. Google's SRE book popularized the practice as a cornerstone of reliability engineering.",
    "## Continuous Improvement and Kaizen\n\nKaizen (Japanese for 'change for better') is the philosophy that every process can be incrementally improved. In DevOps, this manifests as regular retrospectives where teams identify what went well, what did not, and what to change. Value stream mapping visualizes the entire delivery process, highlighting bottlenecks and waste (waiting time, manual steps, rework). Improvement kata provides a structured approach: understand the direction, grasp the current condition, set the next target condition, and run experiments to get there. The PDCA cycle (Plan-Do-Check-Act) formalizes the loop. Key to sustaining improvement is measuring outcomes (not just outputs) and celebrating small wins to maintain momentum.",
    "## DORA Metrics and Measuring DevOps\n\nThe DORA (DevOps Research and Assessment) metrics, validated through years of research by Dr. Nicole Forsgren's team, identify four key metrics that predict software delivery performance. **Deployment frequency** measures how often code is deployed to production (elite teams deploy on demand, multiple times per day). **Lead time for changes** measures the time from code commit to production deployment. **Change failure rate** measures the percentage of deployments that cause incidents. **Mean time to recovery (MTTR)** measures how quickly a team can restore service after an incident. These metrics are correlated: teams that deploy more frequently tend to have lower failure rates and faster recovery, contradicting the intuition that speed trades off with stability.",
    "## Psychological Safety and Just Culture\n\nDevOps transformation requires psychological safety -- the belief that one can speak up, report errors, and propose ideas without fear of punishment. Research by Google (Project Aristotle) found psychological safety to be the strongest predictor of team effectiveness. A just culture distinguishes between human error (blameless), at-risk behavior (coaching needed), and reckless behavior (accountability required). Leaders model vulnerability by sharing their own mistakes. Incident response avoids 'who did this?' language in favor of 'what allowed this to happen?'. When people feel safe, they report near-misses and small issues before they become major incidents, creating a proactive rather than reactive safety culture.",
  ],
  interviewQA: [
    {
      q: "What is the CALMS framework and how do you assess DevOps maturity with it?",
      a: "CALMS stands for Culture, Automation, Lean, Measurement, and Sharing. You assess maturity by evaluating each pillar: Is there shared ownership across Dev and Ops (Culture)? Are builds, tests, and deployments automated (Automation)? Are handoffs and manual approvals minimized (Lean)? Are DORA metrics tracked and acted on (Measurement)? Is knowledge shared through docs, postmortems, and cross-team collaboration (Sharing)? A team might be strong in automation but weak in culture if developers still throw code over the wall to a separate ops team.",
      followUps: [
        "Which pillar do you think is the hardest to adopt and why?",
        "How do DORA metrics fit into the Measurement pillar?",
      ],
    },
    {
      q: "How do you conduct a blameless postmortem?",
      a: "Gather all involved parties within 48 hours of the incident. Build a timeline of events factually without attributing blame. Identify root causes using techniques like the 5 Whys, focusing on systemic factors (missing monitoring, unclear runbook, insufficient testing) rather than individual errors. Document what went well, contributing factors, and concrete action items with owners and deadlines. Share the postmortem broadly so the entire organization learns. The facilitator's role is critical -- they must redirect blame language toward systems thinking and ensure psychological safety.",
      followUps: [
        "How do you ensure action items from postmortems actually get completed?",
        "What is the difference between root cause and contributing factors?",
      ],
    },
    {
      q: "Explain the Three Ways of DevOps.",
      a: "The First Way (Flow) optimizes left-to-right delivery: small batches, CI/CD, reduced WIP. The Second Way (Feedback) creates fast right-to-left loops: monitoring, alerting, testing in pipelines, fast rollbacks. The Third Way (Continuous Learning) fosters experimentation and learning: blameless postmortems, chaos engineering, innovation time, and treating failure as a learning opportunity. Together they create a system that delivers fast, catches problems early, and continuously improves.",
    },
    {
      q: "What are the DORA metrics and what do they tell us?",
      a: "The four DORA metrics are deployment frequency, lead time for changes, change failure rate, and mean time to recovery. They measure both speed (frequency, lead time) and stability (failure rate, MTTR). The key insight from DORA research is that speed and stability are not trade-offs -- elite teams achieve both. Teams that deploy more frequently tend to have lower failure rates because smaller changes are easier to debug and roll back. These metrics provide an objective way to measure DevOps improvement.",
      followUps: [
        "How would you improve change failure rate without slowing down deployment frequency?",
        "What is the difference between elite and low performers in DORA research?",
      ],
    },
  ],
  mcqs: [
    {
      q: "What does the 'L' in CALMS stand for?",
      options: ["Leadership", "Lean", "Logging", "Lifecycle"],
      answerIndex: 1,
      explanation:
        "Lean -- borrowed from manufacturing -- focuses on eliminating waste (handoffs, waiting, manual steps) and optimizing flow through value stream mapping and WIP limits.",
    },
    {
      q: "Which of the Three Ways focuses on fast right-to-left feedback loops?",
      options: [
        "The First Way (Flow)",
        "The Second Way (Feedback)",
        "The Third Way (Continuous Learning)",
        "The Fourth Way (Automation)",
      ],
      answerIndex: 1,
      explanation:
        "The Second Way creates feedback loops from operations back to development through monitoring, alerting, testing, and fast rollback mechanisms.",
    },
    {
      q: "What is the key principle of a blameless postmortem?",
      options: [
        "Identify the person who caused the incident and reassign them",
        "Focus on systemic causes rather than individual fault",
        "Avoid documenting the incident to prevent embarrassment",
        "Only involve senior management in the review",
      ],
      answerIndex: 1,
      explanation:
        "Blameless postmortems focus on systemic factors (missing monitoring, unclear runbooks, insufficient safeguards) that allowed the error, treating humans as part of a system that can be improved.",
    },
    {
      q: "According to DORA research, what is the relationship between deployment frequency and change failure rate?",
      options: [
        "Higher frequency always causes higher failure rates",
        "They are inversely correlated -- elite teams deploy frequently with lower failure rates",
        "They are completely unrelated metrics",
        "Higher frequency only reduces failure rate if the team has no incidents",
      ],
      answerIndex: 1,
      explanation:
        "DORA research shows that elite teams achieve both high deployment frequency and low failure rates because smaller, more frequent changes are easier to test, review, debug, and roll back.",
    },
    {
      q: "What does value stream mapping help identify?",
      options: [
        "The financial value of each microservice",
        "Bottlenecks, wait times, and waste in the delivery pipeline",
        "Which developers produce the most code",
        "The market value of the software product",
      ],
      answerIndex: 1,
      explanation:
        "Value stream mapping visualizes the entire flow from idea to production, highlighting non-value-adding activities like wait times, handoffs, and manual approval steps.",
    },
  ],
  flashcards: [
    {
      front: "What does CALMS stand for?",
      back: "Culture, Automation, Lean, Measurement, Sharing -- the five pillars of DevOps maturity.",
    },
    {
      front: "What are the Three Ways of DevOps?",
      back: "1) Flow (left-to-right delivery), 2) Feedback (right-to-left loops), 3) Continuous Experimentation and Learning.",
    },
    {
      front: "What is a blameless postmortem?",
      back: "A structured incident review focusing on systemic causes, not individual blame, to create psychological safety and enable deeper learning.",
    },
    {
      front: "What are the four DORA metrics?",
      back: "Deployment frequency, lead time for changes, change failure rate, and mean time to recovery (MTTR).",
    },
    {
      front: "What is kaizen?",
      back: "Japanese for 'change for better' -- a philosophy of continuous incremental improvement applied to processes, tools, and practices.",
    },
    {
      front: "What is value stream mapping?",
      back: "A visualization technique that maps the entire delivery pipeline to identify bottlenecks, waste, and non-value-adding activities.",
    },
    {
      front: "What did DORA research find about speed vs stability?",
      back: "They are NOT trade-offs. Elite teams achieve both high deployment frequency and low failure rates through practices like CI/CD, small batches, and automated testing.",
    },
    {
      front: "What is psychological safety?",
      back: "The belief that one can speak up, report errors, and take risks without fear of punishment -- the strongest predictor of team effectiveness (Google's Project Aristotle).",
    },
  ],
  glossary: [
    {
      term: "CALMS",
      definition:
        "A DevOps maturity framework covering Culture, Automation, Lean, Measurement, and Sharing.",
    },
    {
      term: "Three Ways",
      definition:
        "DevOps principles from 'The Phoenix Project': Flow (fast delivery), Feedback (fast loops), and Continuous Learning (experimentation).",
    },
    {
      term: "Blameless Postmortem",
      definition:
        "An incident review that focuses on systemic causes and action items rather than assigning individual blame.",
    },
    {
      term: "DORA Metrics",
      definition:
        "Four metrics (deployment frequency, lead time, change failure rate, MTTR) that predict software delivery performance.",
    },
    {
      term: "Kaizen",
      definition:
        "A philosophy of continuous incremental improvement applied to all aspects of work processes.",
    },
    {
      term: "Value Stream Mapping",
      definition:
        "A lean technique for visualizing the end-to-end delivery process to identify and eliminate waste.",
    },
    {
      term: "Psychological Safety",
      definition:
        "A team climate where members feel safe to take risks, report errors, and speak up without fear of punishment.",
    },
    {
      term: "PDCA Cycle",
      definition:
        "Plan-Do-Check-Act -- a four-step iterative management method for continuous improvement of processes.",
    },
  ],
};

import type { TopicContent } from "../types";

export const commonHrQuestions: TopicContent = {
  quickSummary: [
    "Common HR questions test self-awareness, motivation, and fit: strengths and weaknesses, 'why this company,' career goals, and how you handle challenges.",
    "The 'strengths' question is an opportunity to align your top skill with the role's most critical requirement, backed by a specific example.",
    "The 'weakness' question tests self-awareness and growth mindset: name a real weakness, explain how you are actively working on it, and show progress.",
    "Every answer should subtly reinforce why you are a strong fit for THIS specific role, not just any role at any company.",
  ],
  detailed: [
    "## Strengths and Weaknesses\n\n**Strengths**: Choose a strength that is directly relevant to the role and back it with a brief example. 'I am a strong communicator' is vague. 'I excel at translating complex technical concepts for non-technical stakeholders. For example, I created a visualization of our microservices architecture that helped the product team understand dependency chains and make better prioritization decisions.' Pick one or two strengths maximum.\n\n**Weaknesses**: Choose a genuine weakness that is not critical to the role. Explain what you are doing about it. Avoid cliches ('I am a perfectionist,' 'I work too hard'). Strong example: 'I tend to over-engineer solutions when a simpler approach would suffice. I have been actively working on this by time-boxing my design phase and asking myself whether the added complexity justifies the benefit. My last project shipped two weeks faster because I chose a simpler architecture upfront.'",
    "## Why This Company / Why This Role\n\nThis question tests genuine interest and research. Structure: (1) What specifically attracts you to the company (mission, product, technology, culture), (2) What about the role matches your skills and interests, (3) How this role fits your career trajectory. Be specific: 'I am excited about your mission' is generic. 'I read your blog post about building a real-time fraud detection system on top of Kafka Streams, and the challenge of processing 50K events per second with sub-100ms latency is exactly the kind of problem I want to solve.' Reference specific products, blog posts, talks, or company initiatives. Show you have done homework beyond reading the job description.",
    "## Career Goals\n\nQuestions like 'Where do you see yourself in 5 years?' test whether your aspirations align with what the company can offer. If you want to become a CTO but the company is a flat 20-person startup with a technical founder, there is a mismatch. Structure: short-term (1-2 years) goals connected to the role, medium-term (3-5 years) goals that show ambition within realistic bounds, and how this role is a stepping stone. Example: 'In the near term, I want to deepen my expertise in distributed systems by working on your real-time data platform. Over 3-5 years, I see myself growing into a senior staff engineer role where I can influence architecture decisions across the organization.'",
    "## Tell Me About Yourself\n\nThis is your elevator pitch, not your life story. Structure: (1) Current role and key achievement (1-2 sentences), (2) Relevant career background (2-3 sentences highlighting progression), (3) Why you are here now (1-2 sentences connecting to this opportunity). Total: 60-90 seconds. Example: 'I am currently a senior engineer at [Company] where I led the redesign of our payment processing pipeline, reducing transaction failures by 35%. Before that, I spent three years at [Previous Company] building backend services that handled 10M daily active users. I am now looking for an opportunity to work on more complex distributed systems challenges, which is why your team's work on [specific project] caught my attention.'",
    "## Handling Tricky Questions\n\nSome questions are designed to probe sensitive areas: 'Why were you laid off?' (be factual and brief: 'The company reduced the team by 40% due to market conditions. My performance reviews were consistently strong.'), 'Why the gap in your resume?' (explain honestly: sabbatical, health, family, education), 'Why have you changed jobs frequently?' (explain the career logic: each move had a clear reason like growth, acquisition, or relocation). The key principle: be honest, be brief, do not over-explain or get defensive, and redirect to your qualifications and enthusiasm for this opportunity.",
  ],
  interviewQA: [
    {
      q: "What is your greatest strength?",
      a: "Choose a strength relevant to the role and support it with a specific example. 'My greatest strength is breaking down ambiguous problems into actionable plans. For example, when our team was tasked with migrating from a monolith to microservices with no clear roadmap, I mapped all service boundaries, identified the lowest-risk extraction point, created a phased migration plan, and led the team through the first three extractions. The project was initially expected to take 18 months, and we delivered the first phase in 6 months.'",
    },
    {
      q: "What is your greatest weakness?",
      a: "Name a real weakness, show self-awareness, and describe what you are doing about it. 'I sometimes take too long to ask for help, trying to figure things out independently when a teammate could unblock me in 5 minutes. I have been actively working on this by setting a 30-minute timebox: if I have not made progress in 30 minutes, I reach out. This simple rule has made me significantly more efficient, and my manager noted the improvement in my last review.'",
    },
    {
      q: "Why do you want to work here?",
      a: "Be specific. Reference the company's product, technical challenges, culture, or mission with evidence that you have researched. 'Three things attract me: first, your product solves a real problem I have experienced firsthand as a user. Second, your engineering blog shows a team that tackles genuinely hard problems: the post on building a custom query engine for time-series data was excellent. Third, your emphasis on engineers owning the full lifecycle from design through production aligns with how I work best.'",
    },
    {
      q: "Where do you see yourself in 5 years?",
      a: "Show ambition that aligns with what the company offers. 'In the near term, I want to go deep on distributed systems and contribute to your data platform team. Over 3-5 years, I see myself growing into a technical lead or staff engineer role where I can influence architectural decisions, mentor engineers, and bridge the gap between business needs and technical solutions. I value depth and impact over title progression.'",
    },
  ],
  mcqs: [
    {
      q: "What is the best approach to the 'weakness' question?",
      options: [
        "Say you have no weaknesses",
        "Use a cliche like 'I am a perfectionist'",
        "Name a genuine weakness and describe how you are actively improving",
        "Name a weakness that is actually a strength in disguise",
      ],
      answerIndex: 2,
      explanation:
        "Naming a genuine weakness with a concrete improvement plan shows self-awareness and growth mindset. Cliches and disguised strengths are transparent and suggest lack of self-reflection.",
    },
    {
      q: "What should your 'Tell me about yourself' answer focus on?",
      options: [
        "Your entire career history from college",
        "Current role, relevant background, and why this opportunity interests you",
        "Personal hobbies and interests",
        "A detailed technical deep-dive of your last project",
      ],
      answerIndex: 1,
      explanation:
        "This question is a professional elevator pitch: current role (1-2 sentences), relevant career progression (2-3 sentences), and connection to this opportunity (1-2 sentences). Total: 60-90 seconds.",
    },
    {
      q: "What makes a 'Why this company?' answer strong?",
      options: [
        "Mentioning the company's stock price",
        "Referencing specific products, blog posts, or technical challenges you researched",
        "Saying you need a job",
        "Praising the company generically",
      ],
      answerIndex: 1,
      explanation:
        "Specific references to the company's product, engineering challenges, blog posts, or initiatives demonstrate genuine interest and thorough research, setting you apart from generic answers.",
    },
  ],
  flashcards: [
    { front: "How long should 'Tell me about yourself' be?", back: "60-90 seconds. Cover: current role and key achievement, relevant career background, and why this opportunity interests you." },
    { front: "How should you answer the weakness question?", back: "Name a genuine weakness not critical to the role, explain how you are actively improving, and show measurable progress." },
    { front: "What makes a 'Why this company' answer strong?", back: "Specific references to the company's product, technical challenges, blog posts, or mission. Show evidence of research beyond the job description." },
    { front: "How do you handle 'Why were you laid off?'", back: "Be factual and brief: state the business reason (downsizing, market conditions), note your strong performance, and redirect to your interest in the current opportunity." },
    { front: "How should you frame career goals?", back: "Align aspirations with what the company offers: near-term goals (1-2 years) tied to the role, medium-term (3-5 years) showing realistic ambition within the organization." },
    { front: "What strength should you highlight?", back: "One directly relevant to the role's most critical requirement, supported by a specific example with measurable impact." },
  ],
  glossary: [
    { term: "Elevator Pitch", definition: "A concise 60-90 second professional summary covering current role, career background, and interest in the opportunity." },
    { term: "Self-Awareness", definition: "The ability to accurately assess your own strengths, weaknesses, and impact, demonstrated through honest reflection and specific examples." },
    { term: "Growth Mindset", definition: "The belief that skills and abilities can be developed through effort, shown by describing how you actively work on weaknesses." },
    { term: "Career Trajectory", definition: "The planned path of professional growth, showing how each role builds toward long-term goals." },
    { term: "Culture Alignment", definition: "The match between a candidate's work preferences and values and the company's environment and expectations." },
    { term: "Resume Gap", definition: "A period of unemployment on a resume, which should be explained honestly and briefly (sabbatical, education, family, health)." },
    { term: "Salary Expectations", definition: "The compensation range a candidate targets, ideally based on market research and stated as a range rather than a fixed number." },
  ],
  deepDive: [
    "## The Psychology Behind Common HR Questions\n\nEvery HR question is a carefully designed behavioral probe, not idle curiosity. Understanding what each question truly measures gives you a decisive advantage.\n\n**'Tell me about yourself'** is not a biography request. It is a test of **prioritization and communication clarity**. The interviewer is evaluating: Can you distill a complex career into a coherent, audience-appropriate narrative? Do you understand what is relevant to *this* role? Do you lead with impact or chronology? Candidates who recite their resume signal poor judgment about what matters. Strong candidates construct a narrative arc: where they have been, what they have learned, and why that trajectory points to this role.\n\n**'What is your greatest weakness?'** probes **metacognition** — your ability to observe and regulate your own behavior. Research in organizational psychology shows that self-awareness is one of the strongest predictors of leadership effectiveness. The interviewer is not looking for the weakness itself; they are evaluating the sophistication of your self-monitoring system. Do you have concrete feedback loops? Can you describe measurable improvement? A candidate who says 'I struggle with delegation and have started using a RACI matrix for every project, which reduced my overtime by 20%' demonstrates the Plan-Do-Check-Act cycle that high performers use instinctively.\n\n**'Why do you want to work here?'** measures **intrinsic motivation alignment**. Self-determination theory identifies three core drivers: autonomy, competence, and relatedness. A strong answer maps your drivers to specific aspects of the company. 'I want to work here because of the salary' signals extrinsic-only motivation, which correlates with lower engagement and higher turnover. 'I want to work here because your approach to engineer-led product decisions gives me the autonomy to solve problems end-to-end' signals deep alignment.\n\n**'Where do you see yourself in 5 years?'** tests **temporal self-continuity** — your ability to connect present actions to future outcomes. Interviewers are screening for two risks: candidates with no vision (who may disengage) and candidates whose vision does not fit the role (who will leave). The optimal answer shows a growth trajectory that the company can realistically support.",
    "## How Answers Are Evaluated Across Career Levels\n\nThe same question carries different evaluation criteria depending on your career stage. Understanding these differences prevents a senior candidate from giving a junior-level answer and vice versa.\n\n**Entry-Level (0-2 years)**: Interviewers expect potential over proof. For 'Tell me about yourself,' academic projects, internships, and transferable skills are perfectly appropriate. For weaknesses, showing awareness and willingness to learn matters more than having a sophisticated improvement system. The bar for 'Why this company?' is genuine enthusiasm and basic research. Red flag: trying to sound more experienced than you are.\n\n**Mid-Level (3-7 years)**: The bar shifts to demonstrated impact. 'Tell me about yourself' must include quantified achievements: revenue generated, systems built, teams supported, metrics improved. Weakness answers should reference feedback from managers or peers and show a multi-step improvement plan. 'Why this company?' should reference specific technical or business challenges and articulate how your experience maps to them. Red flag: vague answers without concrete examples.\n\n**Senior/Staff Level (8+ years)**: Answers must demonstrate organizational thinking. 'Tell me about yourself' should highlight cross-functional influence, strategic decisions, and multiplier effects (how you made others more effective). Weakness answers at this level often involve leadership challenges: 'I tend to solve problems myself instead of coaching my team to solve them.' The 'career goals' answer should show how you think about the industry, not just your personal trajectory. Red flag: answers that focus only on individual contribution without mentioning team or organizational impact.\n\n**Executive Level**: Every answer is evaluated through the lens of business judgment and leadership philosophy. 'Tell me about yourself' becomes a thesis about your leadership approach and the results it produces. Weakness answers demonstrate vulnerability and the emotional intelligence to build trust. 'Why this company?' must show you understand the business model, competitive landscape, and strategic opportunities. Red flag: generic leadership platitudes without substance.",
    "## Turning Tricky Questions Into Opportunities\n\nTricky questions feel like traps, but they are actually opportunities to demonstrate composure, honesty, and strategic thinking. Here are frameworks for transforming the most uncomfortable questions into memorable answers.\n\n**The Reframe Technique**: When asked about a negative situation (layoff, firing, failure), acknowledge the fact in one sentence, then pivot to what you learned or how you grew. 'I was let go when the company pivoted away from our product line. That experience taught me the importance of staying close to business metrics and customer feedback, not just technical excellence. In my next role, I made it a practice to attend quarterly business reviews, which helped me prioritize work that directly impacted retention.'\n\n**The Bridge Technique**: Use transition phrases to move from a difficult topic to your strengths. 'That is a great question, and it connects to something I have been thinking about a lot...' or 'What that experience really crystallized for me was...' These bridges feel natural and keep you in control of the narrative.\n\n**The Specificity Shield**: Vague answers invite follow-up probing. Specific answers satisfy curiosity and demonstrate credibility. Compare: 'I left because of management issues' (invites 'What kind of issues?') versus 'The engineering team tripled in size in six months without adding management layers, which created alignment challenges. I realized I work best in organizations that invest in engineering management as a discipline, which is one of the things that attracted me to your team.' The second answer is more honest, more detailed, and closes the loop.\n\n**The Compound Answer**: For questions about gaps or frequent job changes, present a unifying narrative that explains the pattern. 'Looking at my resume, you might notice I changed roles every two years. Each move was intentional: I went from backend to full-stack to gain breadth, then to a startup to learn how to build from zero, then to a larger company to learn how to build at scale. Now I am looking for a role where I can apply all of those perspectives, which is why this staff engineer position is compelling.'\n\n**Handling Illegal or Inappropriate Questions**: Questions about age, marital status, religion, or family planning are inappropriate in most jurisdictions. You have three options: (1) Answer the underlying concern: 'Are you asking whether I can commit to the travel requirements? Absolutely — I have done 40% travel in my last two roles.' (2) Politely redirect: 'I prefer to keep personal matters separate, but I can assure you I am fully committed to this role.' (3) Name the issue: 'I do not think that question is relevant to my qualifications for this position.' Choose based on your comfort level and how much you want the role.",
  ],
  comparison: {
    columns: [
      "Dimension",
      "Self-Introduction",
      "Strengths/Weaknesses",
      "Motivation",
      "Career Goals",
      "Tricky Questions",
    ],
    rows: [
      [
        "What It Tests",
        "Communication clarity, prioritization, narrative ability",
        "Self-awareness, growth mindset, metacognition",
        "Research depth, intrinsic motivation, cultural alignment",
        "Vision, ambition-reality balance, retention risk",
        "Composure, honesty, emotional intelligence, resilience",
      ],
      [
        "Ideal Length",
        "60-90 seconds (150-200 words)",
        "45-60 seconds per strength or weakness",
        "60-90 seconds with specific references",
        "45-60 seconds covering short and medium term",
        "30-45 seconds: brief acknowledgment then pivot",
      ],
      [
        "Common Mistakes",
        "Reciting full resume chronologically; too long or too short; no connection to role",
        "Cliches like 'I am a perfectionist'; disguised strengths; no improvement plan",
        "Generic praise ('great company'); mentioning only salary or perks; no specific research",
        "Unrealistic ambitions; goals misaligned with company trajectory; 'I want your job'",
        "Over-explaining; getting defensive; badmouthing former employers; lying",
      ],
      [
        "How to Practice",
        "Record yourself and time it; get feedback on clarity; tailor for each company",
        "Ask 3 colleagues for honest feedback; journal improvement progress weekly",
        "Research the company blog, product, Glassdoor, recent news; prepare 3 specific references",
        "Map realistic growth paths at the company; talk to people in the roles you aspire to",
        "Practice with a friend playing devil's advocate; prepare answers for your specific tricky topics",
      ],
      [
        "Red Flags for Interviewers",
        "Cannot articulate what they do in under 2 minutes; no mention of impact or results",
        "Claims no weaknesses; gives a weakness clearly irrelevant to any work context",
        "Cannot name a single specific thing about the company beyond the job listing",
        "Goals require leaving the company; no goals at all suggesting low ambition",
        "Blames others exclusively; shows bitterness; story details contradict resume",
      ],
    ],
  },
  exercises: [
    "Write three different versions of your 'Tell me about yourself' answer tailored to: (a) a fast-paced startup where you would wear many hats, (b) a large enterprise where specialization and process matter, and (c) a remote-first company where async communication is key. Each version should be 60-90 seconds when spoken aloud. Notice how the same career facts can be reframed to emphasize different qualities: adaptability for the startup, depth and rigor for the enterprise, and written communication skills for the remote role.",
    "Conduct a 'weakness audit': list five genuine professional weaknesses. For each, write (a) the specific behavior pattern, (b) a real situation where it caused a problem, (c) the concrete steps you are taking to improve, and (d) measurable evidence of progress. Then select the two most interview-appropriate weaknesses — ones that are genuine but not critical to your target role, and where your improvement story is compelling. Practice delivering each in under 60 seconds.",
    "Research three companies you would genuinely like to work for. For each, write a 'Why this company?' answer that references: (1) a specific product feature or technical challenge, (2) something from their engineering blog, conference talk, or public roadmap, and (3) a cultural value or practice that resonates with you personally. The goal is to demonstrate research depth that goes far beyond the job description. Time yourself to stay under 90 seconds per answer.",
    "Create a 'Career Narrative Map': draw a timeline of your career moves. For each transition, write one sentence explaining why you made that move and one sentence explaining what you gained. Then write a single paragraph that connects all the dots into a coherent story with a clear theme (e.g., 'progressively moving toward more complex distributed systems challenges' or 'building breadth across the full product lifecycle'). This narrative becomes the backbone of multiple interview answers.",
    "Practice the 'Tricky Question Drill': write down your three most uncomfortable interview topics (e.g., a gap in your resume, a short tenure, a termination, a career pivot). For each, write two versions of an answer: a defensive version (what you might say under pressure) and a strategic version (using the Reframe or Bridge technique). Read both aloud and notice the difference in tone and confidence. Have a trusted friend ask you these questions unexpectedly and practice delivering the strategic version naturally.",
  ],
  revisionNotes: [
    "Every HR question has a hidden evaluation dimension: 'Tell me about yourself' tests prioritization, 'weakness' tests metacognition, 'why here' tests intrinsic motivation, and 'career goals' tests trajectory alignment.",
    "Tailor your answers to career level: entry-level focuses on potential and enthusiasm, mid-level on quantified impact, senior on organizational influence, and executive on business judgment and leadership philosophy.",
    "The 60-90 second rule applies to most HR answers. Practice timing yourself. Going over two minutes on any single answer is almost always too long.",
    "Specificity is your best defense against follow-up probing. Vague answers invite deeper questioning; detailed, honest answers close the loop and build credibility.",
    "Use the Reframe Technique for negative topics: acknowledge the fact in one sentence, then pivot to the lesson learned and how it shaped your growth.",
    "Never badmouth a former employer, manager, or colleague. Even if justified, it signals poor judgment and raises concerns about how you will talk about the next company.",
    "Prepare a unifying career narrative that explains your trajectory as a series of intentional choices, not random events. This narrative should be adaptable to different questions.",
    "Research the company deeply before the interview: read their blog, try their product, review recent news, and understand their competitive position. Reference at least three specific things in your answers.",
  ],
  cheatSheet: [
    "'Tell me about yourself' = Current role + key achievement (1-2 sentences) -> Relevant background (2-3 sentences) -> Why this opportunity (1-2 sentences). Total: 60-90 seconds.",
    "Weakness formula: Name the behavior + Describe the impact + Explain your improvement system + Show measurable progress.",
    "Strength formula: Name the skill + Connect it to the role's top requirement + Back it with a specific example including a quantified result.",
    "'Why this company?' must include at least one specific reference to their product, blog, talk, or initiative that you cannot say about any other company.",
    "Career goals must align with what the company can realistically offer. Research the company's growth stage, org structure, and typical career paths before answering.",
    "For tricky questions: Acknowledge briefly (1 sentence) -> Bridge ('What that taught me was...') -> Redirect to your qualifications and enthusiasm.",
    "The STAR method (Situation, Task, Action, Result) works for strengths and behavioral follow-ups. Keep Situation and Task to 20% of the answer; focus 80% on Action and Result.",
    "End strong: your last sentence in any answer should connect back to the role or express genuine enthusiasm. Never trail off or end with 'so yeah...'",
  ],
  resources: [
    {
      label: "What Color Is Your Parachute? by Richard N. Bolles",
      kind: "book",
      note: "The classic career guide with practical exercises for self-assessment and interview preparation, updated annually.",
    },
    {
      label: "Harvard Business Review: How to Answer 'Tell Me About Yourself'",
      kind: "article",
      note: "Concise framework for structuring your elevator pitch with examples across career levels.",
    },
    {
      label: "Grokking the Behavioral Interview (Educative.io)",
      kind: "docs",
      note: "Interactive course covering HR and behavioral questions with practice scenarios and model answers.",
    },
    {
      label: "The Muse: Interview Questions and Answers",
      kind: "article",
      note: "Comprehensive database of common interview questions organized by category with expert-reviewed sample answers.",
    },
  ],
  diagrams: [
    {
      title: "HR Interview Question Categories",
      kind: "mindmap",
      caption: "Taxonomy of common HR interview questions organized by the competency or intent being assessed.",
      mermaid: `mindmap
  root((HR Questions))
    Motivation and Fit
      Why this company
      Why this role
      Career goals
      What excites you
    Work Style
      How you handle pressure
      Preferred environment
      Remote vs in-office
    Strengths and Weaknesses
      Top strengths
      Areas for growth
      How you self-improve
    Collaboration
      Team dynamics
      Manager relationships
      Giving and receiving feedback
    Compensation
      Salary expectations
      Benefits priorities
      Notice period`,
    },
    {
      title: "Answering HR Questions Flow",
      kind: "flow",
      caption: "Decision flow for crafting authentic and strategic answers to common HR screening questions.",
      mermaid: `flowchart TD
    A["HR Question Received"] --> B{"Question type?"}
    B -->|Motivation| C["Research company values\nAlign to personal goals"]
    B -->|Weakness| D["Choose real but manageable\nShow growth steps"]
    B -->|Strength| E["Give specific example\nLink to role needs"]
    B -->|Salary| F["Research market range\nGive a range not a number"]
    C & D & E & F --> G["Structure response clearly"]
    G --> H["Keep under 2 minutes"]
    H --> I["Invite follow-up questions"]`,
    },
    {
      title: "Offer Negotiation Sequence",
      kind: "sequence",
      caption: "Typical sequence of exchanges during an offer negotiation conversation with an HR recruiter.",
      mermaid: `sequenceDiagram
    participant Rec as Recruiter
    participant Cand as Candidate
    Rec->>Cand: Verbal offer extended
    Cand->>Cand: Research market data
    Cand->>Rec: Express enthusiasm
    Cand->>Rec: Ask for written offer
    Rec-->>Cand: Written offer document
    Cand->>Rec: Request time to review
    Cand->>Rec: Counter with data-backed ask
    Rec->>Rec: Consult hiring manager
    Rec-->>Cand: Revised offer or explanation
    Cand->>Rec: Accept or continue dialogue`,
    },
  ],
  animations: [
    {
      title: "Crafting Your Elevator Pitch Step by Step",
      steps: [
        {
          label: "Identify Your Current Role Hook",
          detail: "Start with your current title and one headline achievement that creates immediate credibility. Example: 'I am a senior backend engineer at Acme Corp where I led the redesign of our payment pipeline, cutting transaction failures by 35%.' This opening should take 10-15 seconds and make the interviewer want to hear more.",
        },
        {
          label: "Map Your Relevant Career Arc",
          detail: "Select 2-3 career highlights that build a logical progression toward this role. Do not list every job. Instead, connect the dots: 'Before Acme, I spent three years at a high-growth startup building services for 10M daily users, which taught me to balance speed with reliability.' Each highlight should reinforce a theme relevant to the target role. This section takes 20-30 seconds.",
        },
        {
          label: "Research and Connect to the Opportunity",
          detail: "Before the interview, identify one specific thing about the company or role that genuinely excites you. Weave it into your closing: 'I am now looking to tackle larger-scale distributed systems challenges, which is why your team's work on real-time event processing caught my attention.' This shows you have done homework and have a clear reason for being there. Budget 10-15 seconds.",
        },
        {
          label: "Assemble and Time the Full Answer",
          detail: "Combine all three parts and read the answer aloud. Time it: aim for 60-90 seconds. If it exceeds 90 seconds, cut detail from the career arc section first. If it is under 60 seconds, add one more specific achievement or connection point. The final answer should feel conversational, not rehearsed — practice until you can deliver it naturally without memorizing it word for word.",
        },
        {
          label: "Adapt for Context",
          detail: "Create 2-3 variants of your pitch by adjusting emphasis. For a startup, highlight adaptability and breadth. For an enterprise, emphasize scale and process rigor. For a technical role, lead with architecture decisions and system design. For a leadership role, lead with team outcomes and organizational impact. The core facts stay the same; only the framing shifts. Practice switching between variants to build fluency.",
        },
      ],
    },
  ],
  followUps: [
    "Behavioral interview questions and the STAR method",
    "Salary negotiation strategies and tactics",
    "Technical interview preparation and system design",
    "Building a personal career narrative and professional brand",
  ],
};

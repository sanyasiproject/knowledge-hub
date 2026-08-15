import type { TopicContent } from "../types";

export const hrFundamentals: TopicContent = {
  quickSummary: [
    "HR screening rounds are the first gate in the hiring process: a 30-45 minute call assessing basic qualifications, communication skills, cultural fit, and salary alignment before investing in technical interviews.",
    "Culture fit evaluation checks whether your values, work style, and motivations align with the company's environment, team dynamics, and mission.",
    "Preparation for HR rounds includes researching the company (mission, culture, recent news, tech stack), preparing your elevator pitch, and having clear answers for salary expectations and timeline.",
    "The HR screener is your advocate in the process: they write a summary and recommendation that influences whether you proceed. Making a strong impression here matters significantly.",
  ],
  detailed: [
    "## The Screening Round\n\nThe HR screening call typically covers: your background and current role, why you are looking for a change, why this company, role expectations and alignment, salary expectations and timeline, and visa/logistics questions. The screener evaluates: communication clarity, genuine interest in the company and role, basic qualification match, and potential red flags (frequent job hopping without explanation, salary misalignment, negative attitude about current employer). This is not a casual conversation: it is a structured evaluation. The screener submits a written assessment and recommendation. Prepare as seriously as you would for a technical interview.",
    "## Culture Fit Assessment\n\nCulture fit questions probe: how you prefer to work (autonomous vs. collaborative), how you handle disagreement, what motivates you (impact, learning, compensation, recognition), how you respond to failure, and what kind of manager/team you thrive with. Research the company's culture before the call: read their engineering blog, Glassdoor reviews (with skepticism), company values page, and social media. Frame your answers honestly: misrepresenting your work style to 'fit' leads to mutual unhappiness. If you genuinely prefer structured environments, a chaotic startup is not a good fit regardless of the offer.",
    "## Preparation Checklist\n\nBefore any HR call: (1) Research the company: mission, products, recent funding/news, engineering blog, tech stack, team size, and company values. (2) Prepare your elevator pitch: 60-second summary of your career arc, current role, and why you are interested in this opportunity. (3) Know your salary range: research market rates on levels.fyi, Glassdoor, and Blind. Have a range, not a single number. (4) Prepare your 'why are you leaving' answer: be honest but professional. Never badmouth your current employer. (5) Have questions ready: 2-3 thoughtful questions about the team, role, culture, or growth opportunities. (6) Know your timeline: notice period, other interviews in progress, and availability.",
    "## Common Red Flags Screeners Watch For\n\nScreeners are trained to spot: badmouthing current or past employers (signals attitude problems), vague or evasive answers about why you are leaving (suggests undisclosed issues), salary expectations far outside the band (wastes everyone's time), lack of research about the company (signals low interest), inability to articulate what you do or want (communication concerns), and unrealistic timeline expectations. Conversely, green flags include: genuine enthusiasm for the company's mission, specific knowledge about the team or product, clear career goals that align with the role, and thoughtful questions that show you have done your homework.",
    "## After the Screening\n\nAfter the call, the screener writes a summary covering: candidate background, motivation, communication skills, culture fit assessment, salary expectations vs. band, logistical considerations, and a proceed/do-not-proceed recommendation. To maximize your chances: send a brief thank-you email within 24 hours referencing something specific from the conversation, confirm your interest, and reiterate your timeline. If you do not hear back within the stated timeframe, one polite follow-up is appropriate. Do not over-follow-up.",
  ],
  interviewQA: [
    {
      q: "Why are you looking for a new opportunity?",
      a: "Frame it positively around what you are moving toward, not what you are running from. Example: 'I have learned a lot in my current role and contributed to shipping X and Y. I am now looking for an opportunity to work on larger-scale distributed systems and have more ownership over architectural decisions. Your team's work on [specific project] aligns exactly with where I want to grow.' Avoid: 'My manager is terrible,' 'I am bored,' 'The company is failing.'",
    },
    {
      q: "What are your salary expectations?",
      a: "Give a researched range, not a single number. Example: 'Based on my research of market rates for this level and location on levels.fyi and similar sources, I am targeting a total compensation range of $X to $Y. I am open to discussing the full compensation package including equity, bonuses, and benefits.' If pressed for a single number, hold the range: 'I would prefer to learn more about the role and total package before narrowing that range.'",
    },
    {
      q: "What do you know about our company?",
      a: "Demonstrate specific research, not Wikipedia-level knowledge. Mention: their product and what differentiates it, recent news or announcements, their engineering blog or tech talks you have read, specific technical challenges they face, and why their mission resonates with you. Example: 'I read your engineering blog post about migrating to event-driven architecture, and I found the trade-offs you described between eventual consistency and developer experience really thoughtful. That kind of technical depth is exactly the environment I want to work in.'",
    },
  ],
  mcqs: [
    {
      q: "What is the primary purpose of the HR screening round?",
      options: [
        "To test technical skills",
        "To assess qualifications, communication, cultural fit, and salary alignment before technical interviews",
        "To negotiate the offer",
        "To assign you to a specific team",
      ],
      answerIndex: 1,
      explanation:
        "HR screening is a qualification and fit gate. It ensures the candidate meets basic requirements, can communicate effectively, aligns culturally, and has salary expectations within range before investing in expensive technical interview loops.",
    },
    {
      q: "What is a red flag for HR screeners?",
      options: [
        "Having questions prepared about the team",
        "Knowing your salary range",
        "Badmouthing your current employer",
        "Expressing genuine interest in the company's mission",
      ],
      answerIndex: 2,
      explanation:
        "Badmouthing current or past employers signals attitude problems and lack of professionalism. Screeners interpret this as a predictor of how the candidate will speak about their next employer.",
    },
    {
      q: "When discussing salary expectations, what approach is recommended?",
      options: [
        "Give the lowest number you would accept",
        "Refuse to discuss salary entirely",
        "Provide a researched range based on market data",
        "Ask the recruiter to name their number first",
      ],
      answerIndex: 2,
      explanation:
        "A researched range demonstrates professionalism and market awareness. It keeps negotiations open while showing you have done your homework. Refusing to discuss salary or anchoring too low or high creates friction.",
    },
  ],
  flashcards: [
    { front: "How long is a typical HR screening call?", back: "30-45 minutes. It covers background, motivation, role alignment, salary expectations, and logistics." },
    { front: "What should your elevator pitch include?", back: "60-second summary: career arc, current role highlights, and why you are interested in this specific opportunity." },
    { front: "What happens after the HR screening?", back: "The screener writes a summary covering background, motivation, communication, culture fit, salary alignment, and a proceed/do-not-proceed recommendation." },
    { front: "How should you answer 'Why are you leaving?'", back: "Frame positively: focus on what you are moving toward (growth, scale, ownership) not what you are running from. Never badmouth your current employer." },
    { front: "What salary resources should you research?", back: "levels.fyi (most reliable for tech), Glassdoor, Blind, and Payscale. Always provide a range, not a single number." },
    { front: "How many follow-up contacts are appropriate?", back: "One thank-you email within 24 hours, then one polite follow-up if you have not heard back within the stated timeframe. Do not over-follow-up." },
  ],
  glossary: [
    { term: "HR Screening", definition: "The initial phone call with a recruiter/HR representative to assess basic qualifications, communication, cultural fit, and salary alignment." },
    { term: "Culture Fit", definition: "Alignment between a candidate's values, work style, and motivations and the company's environment, values, and team dynamics." },
    { term: "Elevator Pitch", definition: "A concise 60-second summary of your career background, current role, and interest in the opportunity." },
    { term: "Salary Band", definition: "The compensation range a company has budgeted for a specific role and level." },
    { term: "Total Compensation", definition: "The full package including base salary, equity/stock, bonuses, benefits, and other perks." },
    { term: "Notice Period", definition: "The time required between accepting a new offer and starting, based on contractual obligations to the current employer." },
    { term: "Green Flag", definition: "Positive signals in a screening: genuine enthusiasm, specific company knowledge, clear goals, and thoughtful questions." },
  ],

  deepDive: [
    "## What HR Screeners Actually Evaluate Behind the Scenes\n\nMost candidates treat the HR screening as a formality — a quick chat before the 'real' interviews begin. This is a costly mistake. The screener's internal evaluation form typically covers six dimensions, each scored on a scale: **communication clarity** (can this person articulate thoughts concisely and coherently?), **motivation and intent** (are they running away from something or genuinely attracted to this opportunity?), **role alignment** (do their skills and experience match what the hiring manager needs?), **cultural compatibility** (will they thrive in our environment or clash with existing team dynamics?), **compensation alignment** (are their expectations within our approved band, and is there room for negotiation?), and **logistical feasibility** (notice period, location, visa status, availability).\n\nBeyond these explicit criteria, experienced screeners pick up on subtler signals. They note your **energy and enthusiasm** — not performative excitement, but genuine curiosity about the role. They observe whether you ask clarifying questions or simply accept vague descriptions. They register how you handle unexpected questions or moments of uncertainty: do you freeze, ramble, or thoughtfully say 'That is a great question — let me think about that for a moment'? They also pay attention to **self-awareness**: candidates who can honestly discuss their weaknesses and growth areas without excessive self-deprecation or deflection score higher on maturity.\n\nThe screener's written summary is often the single document that determines whether you enter the technical loop. A lukewarm summary — 'candidate seems qualified but lacked enthusiasm' — can quietly end your candidacy even if your resume is stellar. Conversely, a strong summary — 'excellent communicator, deeply researched our product, clear about career goals' — can compensate for minor gaps in experience.",
    "## How to Stand Out in the First Five Minutes\n\nScreeners conduct dozens of calls per week. Most blend together. The candidates who stand out share a common trait: **specificity**. Instead of saying 'I am excited about your company,' they say 'I read your CTO's blog post about migrating from a monolith to microservices, and the approach to strangler fig pattern migration resonated with challenges I faced at my current company.' Instead of 'I want to grow as an engineer,' they say 'I want to move from being a strong individual contributor to leading a team of 3-5 engineers on a product with real-time constraints.'\n\nThe first five minutes typically follow a pattern: the screener introduces the company and role, then asks you to walk through your background. Your response here sets the tone for the entire call. A **well-structured walkthrough** covers: (1) your current role and key accomplishments in 2-3 sentences, (2) a brief career arc showing progression and intentionality, (3) a clear bridge to why this specific role interests you. Total time: 90 seconds to 2 minutes. Rehearse this until it flows naturally.\n\nAnother differentiator is **asking smart questions early**. Most candidates save questions for the end when the screener asks 'Do you have any questions?' But candidates who ask a thoughtful clarifying question mid-conversation — 'You mentioned the team is scaling rapidly. Is the team currently more focused on building new features or improving reliability of existing systems?' — demonstrate active listening and genuine engagement. This transforms the call from an interrogation into a conversation, which is exactly what screeners prefer.",
    "## The Hidden Dynamics of Salary Negotiation in HR Screens\n\nThe salary discussion during HR screening is more nuanced than most candidates realize. Internally, the screener has access to the **approved compensation band** for the role — a range with a floor, midpoint, and ceiling. Their goal is not to lowball you but to assess whether there is a realistic overlap between your expectations and the band. If your number falls within the band, the conversation moves forward smoothly. If you are above the ceiling, the screener must decide whether to flag you as 'out of range' (which often ends the process) or escalate to the hiring manager with a note that the candidate is strong but expensive.\n\nSeveral strategies work well here. First, **anchor with market data**: 'Based on my research on levels.fyi and conversations with peers at similar companies, the market range for this level in this location is X to Y.' This signals professionalism and makes your number feel objective rather than arbitrary. Second, **express flexibility around total compensation**: 'I am looking at the total package — base, equity, bonuses, and benefits — so I am open to different structures that reach that range.' This gives the company room to construct a creative offer. Third, **avoid premature commitment**: if the screener pushes for a single number, respond with 'I would prefer to understand the full scope of the role and the team before narrowing my range. Can you share the band the company has in mind for this position?' In many jurisdictions, companies are legally required to share this information, and asking demonstrates sophistication.\n\nThe worst outcome is not naming a high number — it is naming a number that is wildly misaligned in either direction. Too low, and you signal that you are either underqualified or uninformed about market rates. Too high without justification, and you risk being screened out before demonstrating your value. Research is your greatest leverage."
  ],
  comparison: {
    columns: ["Dimension", "Phone Screen", "Video Screen", "In-Person HR", "Panel HR"],
    rows: [
      ["Format", "Audio-only call, often mobile or landline", "Video call via Zoom, Teams, or Google Meet", "Face-to-face at office or neutral location", "Multiple HR/team members interview simultaneously"],
      ["Typical Duration", "20-30 minutes", "30-45 minutes", "45-60 minutes", "60-90 minutes"],
      ["Evaluation Focus", "Basic qualification match, communication clarity, salary alignment", "All phone screen criteria plus body language, presentation, and visual engagement", "Deeper culture fit, in-person presence, office environment reaction", "Consensus-based evaluation across multiple perspectives and dimensions"],
      ["Preparation Needed", "Quiet environment, resume nearby, company research notes", "All phone prep plus professional background, good lighting, stable internet, camera-ready appearance", "All video prep plus professional attire, directions to office, punctuality buffer", "Research all panelists, prepare for varied question styles, practice pivoting between interviewers"],
      ["Common Pitfalls", "Distracted environment, multitasking, monotone delivery without visual feedback cues", "Poor lighting, background distractions, looking at self instead of camera, technical issues", "Arriving late, inappropriate attire, poor interaction with receptionist or other staff", "Focusing on one panelist while ignoring others, inconsistent answers across questions, fatigue"],
      ["Candidate Control", "High — you control your physical environment and can reference notes freely", "Moderate — notes are usable but less natural; environment and appearance visible", "Lower — you are in their environment and under continuous observation", "Lowest — multiple evaluators observe from different angles simultaneously"],
      ["Follow-Up Protocol", "Thank-you email within 24 hours to recruiter", "Thank-you email referencing specific discussion points", "Thank-you email to interviewer and note to any staff who helped", "Individual thank-you emails to each panelist referencing their specific questions"],
    ],
  },

  exercises: [
    "**Elevator Pitch Draft**: You are interviewing for a senior software engineer role at a fintech startup that processes real-time payments across Southeast Asia. The company has 200 employees, recently raised a Series C, and values ownership and speed. Draft a 60-second elevator pitch that covers your career arc, your most relevant accomplishment, and a specific reason this company interests you. Record yourself delivering it and evaluate: Did you stay under 90 seconds? Did you mention the company specifically, or could this pitch work for any company?",
    "**Salary Negotiation Roleplay**: A recruiter asks: 'What are your salary expectations for this role?' The role is a Staff Engineer position at a mid-stage startup in Bangalore. Research the market rate on levels.fyi and Glassdoor, then write out your response verbatim. Include how you would handle these follow-ups: (a) 'That is above our range — can you be more flexible?' (b) 'We do not share our bands. What is your bottom line?' (c) 'We can match that in base but equity would be lower.' Practice delivering each response aloud until it sounds natural, not rehearsed.",
    "**Red Flag Recovery**: You are on an HR call and accidentally say something negative about your current manager: 'Honestly, my manager does not really support my growth.' The screener pauses. Write out exactly what you would say in the next 15 seconds to recover from this. Then rewrite the original sentiment in a way that is honest but professional. Compare the two versions and identify the specific words or framings that made the difference.",
    "**Company Research Deep Dive**: Pick a real company you would consider joining. Spend 30 minutes researching them using only publicly available sources: their careers page, engineering blog, recent press releases, Glassdoor reviews, LinkedIn profiles of team members, and any conference talks by their engineers. Then write a 200-word summary that you could naturally weave into an HR screening conversation. The test: would an employee of that company be impressed by your knowledge, or would it sound like you skimmed the Wikipedia page?",
    "**Question Quality Audit**: Write down the last 5 questions you asked (or would ask) an HR screener at the end of a call. Now evaluate each one: Is it googleable? (If yes, replace it.) Does it show genuine curiosity or just fill silence? Would the answer actually influence your decision to join? Rewrite any weak questions. A strong question example: 'How does the engineering team decide what to work on each quarter — is it top-down from product leadership or bottom-up from engineers?' A weak question example: 'What is the company culture like?'"
  ],

  revisionNotes: [
    "The HR screening is a structured evaluation, not a casual chat. Screeners submit written assessments with explicit proceed/reject recommendations that heavily influence your candidacy.",
    "Specificity is the single most powerful differentiator. Specific company knowledge, specific career goals, and specific examples beat generic enthusiasm every time.",
    "Your elevator pitch should be 60-90 seconds, cover your career arc and current role highlights, and bridge directly to why this specific role interests you. Rehearse it until it sounds natural.",
    "Never badmouth your current employer, manager, or colleagues. Frame departures positively around what you are moving toward: growth, scale, ownership, or new challenges.",
    "Salary discussions require market research (levels.fyi, Glassdoor, Blind). Always give a researched range, express flexibility around total compensation structure, and avoid premature commitment to a single number.",
    "The first five minutes set the tone. A strong structured walkthrough followed by a smart clarifying question transforms the call from an interrogation into a conversation.",
    "Send a personalized thank-you email within 24 hours. Reference something specific from the conversation to demonstrate attentiveness and reinforce your interest.",
    "Prepare 2-3 non-googleable questions that show genuine curiosity about the team, technical challenges, or decision-making processes. The quality of your questions signals the depth of your thinking."
  ],

  cheatSheet: [
    "**Before the call**: Research company (mission, products, blog, recent news, tech stack, team size, values). Prepare elevator pitch. Know your salary range from levels.fyi. Have 2-3 smart questions ready.",
    "**Elevator pitch formula**: [Current role + key accomplishment] → [Career arc showing progression] → [Why THIS company/role specifically]. Keep it 60-90 seconds.",
    "**'Why are you leaving?' formula**: 'I have learned a lot doing X and Y at [company]. I am now looking to [specific growth goal] and your team's work on [specific thing] aligns with that direction.'",
    "**Salary response template**: 'Based on my market research for this level and location, I am targeting total compensation in the range of X to Y. I am open to discussing how that breaks down across base, equity, and bonuses.'",
    "**Red flag avoidance checklist**: No badmouthing employers. No vague answers about motivation. No salary numbers without research. No generic 'I like your company.' No zero questions at the end.",
    "**Strong question starters**: 'How does the team decide...', 'What does success look like in the first 90 days for...', 'Can you describe the engineering culture around...', 'What is the biggest challenge the team is facing right now...'",
    "**Post-call checklist**: Send thank-you email within 24 hours. Reference a specific discussion point. Confirm interest and timeline. One follow-up if no response within stated timeframe.",
    "**Body language (video/in-person)**: Look at the camera (not your own video), maintain a natural posture, nod to show active listening, smile genuinely, avoid fidgeting or multitasking."
  ],

  resources: [
    { label: "Cracking the Coding Interview by Gayle Laakmann McDowell", kind: "book", note: "Chapter on behavioral interviews and the interview process pipeline covers HR screening dynamics in depth." },
    { label: "The 2-Hour Job Search by Steve Dalton", kind: "book", note: "Systematic approach to job searching with excellent frameworks for networking and screening conversations." },
    { label: "What Color Is Your Parachute? by Richard N. Bolles", kind: "book", note: "Classic career guide with practical advice on self-assessment, salary negotiation, and interview preparation." },
    { label: "levels.fyi", url: "https://www.levels.fyi/", kind: "docs", note: "Crowdsourced compensation data for tech companies. Essential for salary research before HR screenings." },
    { label: "Ask a Manager by Alison Green", kind: "article", note: "Long-running blog with practical, nuanced advice on workplace communication, interviewing, and negotiation from a management perspective." },
  ],

  diagrams: [
    {
      title: "Hiring Process Flow",
      kind: "flow",
      caption: "Standard hiring pipeline from job posting to offer acceptance.",
      mermaid: `flowchart TD
    A[Define Role and JD] --> B[Post Job Opening]
    B --> C[Screen Applications]
    C --> D[Phone Screen]
    D --> E{Pass screen?}
    E -- No --> F[Reject with feedback]
    E -- Yes --> G[Technical Assessment]
    G --> H{Pass assessment?}
    H -- No --> F
    H -- Yes --> I[Panel Interviews]
    I --> J[Debrief and Decision]
    J --> K{Hire?}
    K -- Yes --> L[Extend Offer]
    L --> M[Negotiation and Acceptance]
    K -- No --> F`,
    },
    {
      title: "Performance Review Cycle",
      kind: "state",
      caption: "Annual performance review cycle states and transitions.",
      mermaid: `stateDiagram-v2
    [*] --> GoalSetting: Start of year
    GoalSetting --> MidYearCheck: Goals finalized
    MidYearCheck --> Coaching: Checkpoint done
    Coaching --> SelfReview: Continuous feedback
    SelfReview --> ManagerReview: Self review submitted
    ManagerReview --> Calibration: Manager draft done
    Calibration --> FinalReview: Calibration complete
    FinalReview --> GoalSetting: Next cycle begins
    FinalReview --> PIP: Underperformance identified`,
    },
    {
      title: "Employee Lifecycle Stages",
      kind: "mindmap",
      caption: "Key phases and activities across the full employee lifecycle.",
      mermaid: `mindmap
  root((Employee Lifecycle))
    Attract
      Employer branding
      Job postings
      Referrals
    Hire
      Screening
      Interviews
      Offer negotiation
    Onboard
      Orientation
      Training
      Buddy program
    Develop
      L and D programs
      Mentorship
      Promotions
    Retain
      Compensation
      Culture
      Work-life balance
    Offboard
      Exit interview
      Knowledge transfer`,
    },
    {
      title: "Total Compensation Structure",
      kind: "architecture",
      caption: "Components of total compensation in a typical tech company.",
      mermaid: `graph TD
    TC[Total Compensation] --> Base[Base Salary]
    TC --> Bonus[Performance Bonus]
    TC --> Equity[Equity RSU or Options]
    TC --> Benefits[Benefits Package]
    Benefits --> Health[Health Dental Vision]
    Benefits --> Retirement[401k matching]
    Benefits --> PTO[Paid Time Off]
    Benefits --> Perks[Learning Budget and Perks]
    Equity --> VestSched[4-year vest 1-year cliff]`,
    },
  ],

  animations: [
    {
      title: "Preparing for an HR Screening Call",
      steps: [
        { label: "Research the company", detail: "Spend 30-45 minutes reviewing the company's website, engineering blog, recent press releases, Glassdoor reviews, and LinkedIn profiles of team members. Note specific projects, technical challenges, and cultural values you can reference in conversation." },
        { label: "Prepare your elevator pitch", detail: "Draft a 60-90 second walkthrough of your career: current role and key accomplishments, career arc showing intentional progression, and a clear bridge to why this specific role excites you. Practice aloud until it flows naturally without sounding rehearsed." },
        { label: "Research salary benchmarks", detail: "Look up compensation data on levels.fyi, Glassdoor, and Blind for the target role, level, and location. Determine your target range (not a single number) and prepare language for discussing total compensation including base, equity, and bonuses." },
        { label: "Prepare your narrative answers", detail: "Write and rehearse answers for the big three: 'Why are you leaving?', 'Why this company?', and 'What are your salary expectations?' Frame departures positively around growth. Use specific company knowledge. Anchor salary in market data." },
        { label: "Draft your questions", detail: "Prepare 2-3 thoughtful, non-googleable questions about the team, role, technical challenges, or engineering culture. Good questions demonstrate depth of thinking and genuine curiosity. Test each question: would an insider find it insightful?" },
        { label: "Set up your environment", detail: "For phone: quiet room, resume and notes visible, water nearby. For video: professional background, good lighting (face the light source), stable internet, camera at eye level. Test your tech 15 minutes before the call." },
        { label: "Execute and follow up", detail: "During the call: listen actively, take brief notes, ask your prepared questions naturally (not all at once at the end). After: send a personalized thank-you email within 24 hours referencing a specific point from the conversation. Confirm your interest and reiterate your timeline." },
      ],
    },
  ],

  followUps: [
    "Technical interview preparation strategies and common formats (system design, coding, behavioral)",
    "Salary negotiation tactics for the offer stage: countering, leveraging competing offers, and evaluating total compensation",
    "Building a personal career narrative that connects your experiences into a compelling growth story",
    "Understanding company culture signals: how to read engineering blogs, Glassdoor reviews, and team structures to assess fit before applying",
  ],
};

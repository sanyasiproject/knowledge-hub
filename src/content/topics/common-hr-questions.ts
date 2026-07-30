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
};

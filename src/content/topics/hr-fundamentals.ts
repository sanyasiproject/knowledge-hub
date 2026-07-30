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
};

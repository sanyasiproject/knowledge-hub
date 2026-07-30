import type { TopicContent } from "../types";

export const salaryNegotiation: TopicContent = {
  quickSummary: [
    "Salary negotiation starts long before the offer: market research, timing, and strategic communication throughout the interview process determine your leverage.",
    "Anchoring is the most powerful negotiation tactic: the first number mentioned sets the range. Always aim to let the employer anchor first, or anchor high with a researched range.",
    "Competing offers are your strongest leverage: they provide market validation and create urgency. Even without competing offers, timeline and enthusiasm can create positive pressure.",
    "Total compensation includes base salary, equity/stock, signing bonus, annual bonus, benefits, PTO, remote flexibility, and growth opportunities. Negotiate the full package, not just base.",
  ],
  detailed: [
    "## Market Research\n\nBefore any negotiation, establish your market value using: **levels.fyi** (most reliable for tech: real offer data by company, level, and location), **Glassdoor** and **Blind** (directional but less precise), **Payscale** and **Salary.com** (broader coverage), and your own network (ask trusted peers about ranges). Triangulate across sources. Know the range for your target company, level, and location. Account for cost-of-living differences. Understand the typical compensation structure: some companies are equity-heavy (pre-IPO startups, FAANG), others are base-heavy (banks, consultancies). Your research should give you a specific range: 'I am targeting $X to $Y total compensation for this level.'",
    "## Anchoring Strategy\n\nAnchoring bias means the first number mentioned heavily influences the final outcome. Strategies: (1) **Deflect early**: when asked for expectations before the offer, say 'I would prefer to learn more about the role before discussing numbers. What is the range for this level?' (2) **Anchor high**: if you must give a number, provide a range where the bottom is your target. (3) **Let them anchor**: most companies have bands; asking them to share the range first gives you information without committing. (4) **Re-anchor after the offer**: if the offer is below your range, respond with your research and a specific counter: 'Based on my research and experience, I was targeting $X. Can we discuss how to bridge the gap?'",
    "## Competing Offers\n\nCompeting offers are your strongest negotiating tool. They demonstrate market demand and create urgency. Strategy: (1) Interview at multiple companies simultaneously, (2) When you receive an offer, inform other companies to accelerate their process: 'I have received an offer with a deadline of [date]. I am very interested in your opportunity and want to make sure we have time to complete the process.' (3) Use offers as leverage respectfully: 'I have a competing offer at $X. Your opportunity is my top choice, but I want to make sure the compensation is competitive.' (4) Never fabricate offers: recruiters talk, and getting caught destroys trust permanently.",
    "## Negotiating the Full Package\n\nBase salary is just one component. Negotiate across: **equity/stock** (RSU vesting schedule, refresh grants, strike price for options), **signing bonus** (one-time, often easier to increase than base), **annual bonus** (target percentage and historical payout rates), **level** (a higher level dramatically increases total comp), **remote/hybrid flexibility** (has real dollar value), **PTO and sabbaticals**, **learning budget**, **relocation assistance**, and **start date**. Sometimes the base salary band is rigid but signing bonus, equity, or level are negotiable. Always ask: 'Is there flexibility on any components of the package?'",
    "## Negotiation Communication\n\nTone matters as much as tactics. Principles: be collaborative, not adversarial ('I want us to find a package that works for both of us'). Express genuine enthusiasm for the role before discussing numbers. Be specific with asks: 'Can we increase the base by $15K?' not 'I want more money.' Give reasons for your ask: market data, competing offers, specific experience. Use silence: after making a counter-offer, stop talking and let them respond. Always negotiate in writing (email) for complex packages: it gives both sides time to think and creates a record. Never accept or reject on the spot: 'Thank you, I am very excited about this. Can I have [2-3 days] to review the full package?'",
  ],
  interviewQA: [
    {
      q: "When in the process should you discuss salary?",
      a: "Ideally, defer detailed salary discussion until after the company has decided they want you (post-final interview, at the offer stage). If pressed early, share a researched range rather than a single number. During the HR screen, it is reasonable to confirm general alignment: 'I am targeting the $X to $Y range for total compensation. Is that within your band for this level?' This prevents wasting everyone's time on a fundamental mismatch.",
    },
    {
      q: "How do you respond to a lowball offer?",
      a: "Do not react emotionally or reject immediately. Express enthusiasm for the role, then counter with data: 'I am very excited about this opportunity and the team. Based on my research on levels.fyi and conversations with peers in similar roles, the market rate for this level is $X to $Y. My experience in [specific area] positions me toward the upper end of that range. Can we discuss how to bridge the gap?' If they cannot move on base, explore other components: equity, signing bonus, level, or review timeline.",
    },
    {
      q: "What if you do not have competing offers?",
      a: "You still have leverage: your skills, experience, the cost of re-opening the search, and time. Create positive pressure through enthusiasm and timeline: 'I am very excited about this role and ready to make a decision quickly if we can align on compensation.' Emphasize your unique value: specific experience relevant to their challenges, rare skills, or strong interview performance. You can also mention you are in other processes without having formal offers: 'I am in late stages with other companies and expect to have decisions within two weeks.'",
    },
  ],
  mcqs: [
    {
      q: "What is anchoring in salary negotiation?",
      options: [
        "Accepting the first offer immediately",
        "The first number mentioned setting the psychological range for negotiation",
        "Refusing to discuss salary at all",
        "Asking for exactly the market median",
      ],
      answerIndex: 1,
      explanation:
        "Anchoring bias means the first number mentioned heavily influences the final outcome. Whoever sets the anchor shapes the negotiation range, which is why strategy around who names a number first matters.",
    },
    {
      q: "What is the most reliable source for tech salary data?",
      options: [
        "Glassdoor",
        "LinkedIn salary insights",
        "levels.fyi",
        "Bureau of Labor Statistics",
      ],
      answerIndex: 2,
      explanation:
        "levels.fyi contains verified, real offer data broken down by company, level, and location, making it the most reliable source for tech compensation benchmarking.",
    },
    {
      q: "Why should you never fabricate competing offers?",
      options: [
        "It is illegal",
        "Recruiters communicate across companies, and getting caught permanently destroys trust",
        "Companies never match competing offers",
        "It is unnecessary because companies always give their best offer first",
      ],
      answerIndex: 1,
      explanation:
        "The tech recruiting community is interconnected. Fabricating an offer and being discovered permanently damages your reputation and can lead to offer rescission.",
    },
    {
      q: "What should you do when you receive an offer?",
      options: [
        "Accept immediately to show enthusiasm",
        "Reject it and demand double",
        "Thank them, express enthusiasm, and ask for 2-3 days to review the full package",
        "Ignore it until they follow up",
      ],
      answerIndex: 2,
      explanation:
        "Taking time to review shows professionalism and gives you space to evaluate the package, research comparisons, and prepare a thoughtful counter-offer if needed.",
    },
  ],
  flashcards: [
    { front: "What is anchoring in negotiation?", back: "The first number mentioned sets the psychological range for all subsequent discussion. Strategy: let the employer anchor first, or anchor high with a researched range." },
    { front: "What are the components of total compensation?", back: "Base salary, equity/RSUs, signing bonus, annual bonus, benefits, PTO, remote flexibility, learning budget, relocation, and level." },
    { front: "What is the best source for tech salary research?", back: "levels.fyi for verified offer data by company, level, and location. Supplement with Glassdoor, Blind, and network conversations." },
    { front: "How do you use competing offers as leverage?", back: "Inform the preferred company respectfully: share the competing offer range, express preference for their role, and ask if they can be competitive. Never fabricate offers." },
    { front: "When should you negotiate in writing?", back: "For complex packages with multiple components. Email gives both sides time to think and creates a clear record of what was discussed and agreed." },
    { front: "What if the base salary band is rigid?", back: "Negotiate other components: signing bonus (often easier to increase), equity grants, level bump, review timeline acceleration, remote flexibility, or PTO." },
    { front: "How long should you take to respond to an offer?", back: "Ask for 2-3 days to review the full package. This is standard and professional. Never accept or reject on the spot." },
  ],
  glossary: [
    { term: "Anchoring", definition: "A cognitive bias where the first number mentioned in negotiation disproportionately influences the final outcome." },
    { term: "Total Compensation (TC)", definition: "The full value of a compensation package including base salary, equity, bonuses, benefits, and perks." },
    { term: "RSU (Restricted Stock Unit)", definition: "Company stock granted to employees that vests over a schedule (typically 4 years), forming a major part of tech compensation." },
    { term: "Signing Bonus", definition: "A one-time payment upon joining, often negotiable and used to bridge gaps when base salary bands are rigid." },
    { term: "Salary Band", definition: "The compensation range a company has approved for a specific role and level, which may have limited flexibility." },
    { term: "levels.fyi", definition: "A website providing verified, crowdsourced compensation data for tech companies, broken down by company, level, and location." },
    { term: "Counter-Offer", definition: "A response to an initial offer proposing different terms, ideally supported by market data and specific reasoning." },
  ],
};

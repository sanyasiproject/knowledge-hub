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
  deepDive: [
    "## How Interviewers Actually Score Behavioral Answers\n\nMost structured interviews use a scoring rubric with 3-5 dimensions rated on a 1-4 or 1-5 scale. The most common dimensions are:\n\n**1. Relevance and Specificity** — Did the candidate pick an example that directly maps to the competency being assessed? A conflict question answered with a story about a minor scheduling disagreement scores lower than one about a fundamental technical or strategic disagreement. Interviewers are trained to probe vague stories: if they keep asking 'Can you be more specific?' it means you are losing points here.\n\n**2. Role Clarity** — Did the candidate clearly describe *their* contribution versus the team's? Overuse of 'we' without clarifying individual actions is the single most common reason candidates score in the middle of the pack. Interviewers literally tally 'I' vs 'we' statements in some rubrics.\n\n**3. Structured Thinking** — Did the answer follow a logical arc? Interviewers are not just listening to the story; they are evaluating whether you can communicate complex situations clearly. Rambling, backtracking, or providing excessive context before getting to the action signals weak communication skills.\n\n**4. Impact and Measurement** — Did the candidate quantify the outcome? 'It went well' scores a 2. 'We reduced deployment failures by 60% over the next quarter' scores a 4. Interviewers are trained to distinguish between activity (what you did) and impact (what changed because of what you did).\n\n**5. Self-Awareness and Growth** — Especially for failure and conflict questions, interviewers assess whether the candidate demonstrates genuine reflection. Scripted-sounding lessons learned ('I learned the importance of communication') score lower than specific behavioral changes ('I now send a pre-read document 48 hours before any cross-team meeting so stakeholders arrive prepared').\n\nMany companies calibrate scores across interviewers in a debrief session. A candidate who scores 3/5 on all dimensions from every interviewer will often lose to one who scores 4/5 on three dimensions and 2/5 on one, because the highs demonstrate genuine strength. This means it is better to have two or three deeply prepared stories than five shallow ones.",
    "## Junior vs Senior Level Expectations for the Same Question\n\nThe question 'Tell me about a time you resolved a conflict' is asked at every level, but the scoring bar shifts dramatically.\n\n**Junior / Early Career (0-3 years):**\nInterviewers expect conflicts at the task level: disagreements about code style, implementation approach, or sprint priorities. A strong junior answer shows that you raised your concern respectfully, listened to the other perspective, and either compromised or deferred gracefully. The bar is: can you work with other people without creating drama? Demonstrating that you learned something from the other person's viewpoint is a bonus.\n\n**Mid-Level (3-7 years):**\nInterviewers expect conflicts with higher stakes and more ambiguity: disagreements about architectural decisions, pushback from product managers on technical debt, or tension between teams with different priorities. At this level, you are expected to show *influencing skills* — not just avoiding conflict, but constructively advocating for a position with data, building alliances, and knowing when to escalate versus when to commit and disagree. The bar is: can you navigate organizational complexity?\n\n**Senior / Staff+ (7+ years):**\nInterviewers expect conflicts at the organizational or strategic level: misalignment between engineering and business leadership on roadmap priorities, cultural tensions between acquired teams, or ethical concerns about product decisions. At this level, the answer should demonstrate systems thinking — how did you consider second-order effects, balance short-term resolution with long-term relationship health, and create frameworks or processes that prevented similar conflicts in the future? The bar is: can you shape the environment so conflicts are resolved productively across the organization?\n\nThe same pattern applies to every behavioral category. A junior handling pressure means meeting a sprint deadline. A senior handling pressure means making a bet-the-company decision with incomplete information while managing the emotional state of an entire team. Calibrate your story selection to your target level.",
    "## Reading What a Question Is Really Testing\n\nBehavioral questions are rarely testing what they appear to test on the surface. Learning to decode the underlying competency gives you a significant advantage.\n\n**'Tell me about a time you failed'** is not testing whether you have failed — everyone has. It is testing *ego resilience* and *learning agility*. Can you hold your identity as a competent professional while openly discussing a mistake? Candidates who pick a trivial 'failure' or subtly blame others reveal fragile egos. The interviewer is also testing whether you have the metacognitive ability to analyze your own behavior.\n\n**'Describe a time you disagreed with your manager'** is testing *organizational courage* and *judgment*. The interviewer wants to know: Will you speak up when you see a problem? But also: Do you have the judgment to know when and how to push back versus when to commit? Candidates who say they have never disagreed with a manager come across as either dishonest or passive.\n\n**'How do you handle competing priorities?'** appears to test time management, but it actually tests *strategic thinking* and *communication*. The interviewer wants to see that you do not just work harder — you think about which work matters most and proactively communicate trade-offs to stakeholders. Can you say no to a senior person's request because something else is more important?\n\n**'Tell me about a cross-functional project'** tests *empathy* and *translation ability*. Can you understand that the sales team, the design team, and the engineering team have genuinely different goals and constraints — not because they are difficult, but because their incentive structures differ? The best answers show you adapting your communication style for different audiences.\n\n**Hidden test in all behavioral questions:** Every behavioral question is also testing *communication skills*. Can you tell a coherent, concise story under time pressure? Can you read the interviewer's body language and adjust your level of detail? Can you answer follow-up questions without becoming defensive? The meta-skill of structured storytelling is as important as the content of the story itself.\n\nPro tip: When preparing, write down each question and then write 'This is really testing: ______'. If you cannot fill in the blank, you are likely to give an answer that misses the point.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Optimizing a slow database query -- a classic 'describe a time you optimized code' story",
      source: `// BEFORE: O(n*m) nested loop joining two datasets in memory
// This was the code causing 30-second page loads
std::vector<OrderDetail> getOrderDetails(
    const std::vector<Order>& orders,
    const std::vector<Product>& products) {
  std::vector<OrderDetail> result;
  for (const auto& order : orders) {           // n orders
    for (const auto& product : products) {     // m products
      if (order.productId == product.id) {     // O(n*m) comparisons
        result.push_back({order, product});
        break;
      }
    }
  }
  return result;
}

// AFTER: O(n + m) using a hash map -- reduced page load from 30s to 200ms
#include <unordered_map>

std::vector<OrderDetail> getOrderDetails(
    const std::vector<Order>& orders,
    const std::vector<Product>& products) {
  // Build lookup table: O(m)
  std::unordered_map<int, const Product*> productMap;
  productMap.reserve(products.size());
  for (const auto& product : products) {
    productMap[product.id] = &product;
  }

  // Single pass through orders: O(n)
  std::vector<OrderDetail> result;
  result.reserve(orders.size());
  for (const auto& order : orders) {
    auto it = productMap.find(order.productId);
    if (it != productMap.end()) {
      result.push_back({order, *(it->second)});
    }
  }
  return result;
}
// STAR Result: Page load dropped from 30s to 200ms, user complaints
// reduced by 95%, and the pattern became a team best practice.`,
    },
    {
      language: "cpp",
      caption: "Adding a circuit breaker after a cascading failure -- 'tell me about a time you handled a production incident'",
      source: `#include <chrono>
#include <mutex>
#include <stdexcept>

// Circuit breaker pattern implemented after a cascading failure
// took down three dependent services for 4 hours
enum class CircuitState { CLOSED, OPEN, HALF_OPEN };

class CircuitBreaker {
  CircuitState state_ = CircuitState::CLOSED;
  int failureCount_ = 0;
  int successCount_ = 0;
  const int failureThreshold_ = 5;
  const int successThreshold_ = 3;
  std::chrono::steady_clock::time_point lastFailure_;
  const std::chrono::seconds cooldown_{30};
  mutable std::mutex mutex_;

public:
  // Guard every external service call with this
  template <typename Func>
  auto execute(Func&& fn) -> decltype(fn()) {
    std::lock_guard<std::mutex> lock(mutex_);

    if (state_ == CircuitState::OPEN) {
      auto elapsed = std::chrono::steady_clock::now() - lastFailure_;
      if (elapsed < cooldown_) {
        throw std::runtime_error("Circuit open -- failing fast");
      }
      state_ = CircuitState::HALF_OPEN;
      successCount_ = 0;
    }

    try {
      auto result = fn();
      onSuccess();
      return result;
    } catch (...) {
      onFailure();
      throw;
    }
  }

private:
  void onSuccess() {
    if (state_ == CircuitState::HALF_OPEN) {
      if (++successCount_ >= successThreshold_) {
        state_ = CircuitState::CLOSED;
        failureCount_ = 0;
      }
    } else {
      failureCount_ = 0;
    }
  }

  void onFailure() {
    lastFailure_ = std::chrono::steady_clock::now();
    if (++failureCount_ >= failureThreshold_) {
      state_ = CircuitState::OPEN;
    }
  }
};

// Usage: wrapping a flaky downstream service call
// CircuitBreaker paymentBreaker;
// auto resp = paymentBreaker.execute([&]{ return httpClient.post(url, body); });
// STAR Result: After deploying this pattern, cascading failures dropped
// from 3 incidents/month to zero over the following quarter.`,
    },
    {
      language: "cpp",
      caption: "Refactoring legacy code under pressure -- 'describe working under a tight deadline'",
      source: `// BEFORE: Monolithic function that was 400 lines long, no tests,
// everyone was afraid to touch it. This blocked a critical feature.
double calculatePrice(const Order& order) {
  double total = 0;
  // ... 400 lines of nested if-else with duplicated logic ...
  // Tax, discounts, shipping, currency, loyalty points all interleaved
  return total;
}

// AFTER: Decomposed into testable, single-responsibility functions
// Delivered in 2 weeks under a 3-week deadline by prioritizing
// the riskiest components first

struct PriceBreakdown {
  double subtotal;
  double discount;
  double tax;
  double shipping;
  double total;
};

// Each function is independently testable
double calculateSubtotal(const std::vector<LineItem>& items) {
  double sum = 0.0;
  for (const auto& item : items) {
    sum += item.unitPrice * item.quantity;
  }
  return sum;
}

double applyDiscount(double subtotal, const DiscountPolicy& policy) {
  if (policy.type == DiscountType::PERCENTAGE) {
    return subtotal * (policy.value / 100.0);
  } else if (policy.type == DiscountType::FIXED) {
    return std::min(policy.value, subtotal);
  }
  return 0.0;
}

double calculateTax(double amount, const TaxRegion& region) {
  return amount * region.rate;
}

double calculateShipping(const Order& order, const ShippingZone& zone) {
  double weight = 0.0;
  for (const auto& item : order.items) {
    weight += item.weight * item.quantity;
  }
  return zone.baseRate + (weight * zone.perKgRate);
}

// Compose them cleanly
PriceBreakdown calculatePrice(const Order& order,
                              const DiscountPolicy& discount,
                              const TaxRegion& tax,
                              const ShippingZone& shipping) {
  PriceBreakdown breakdown;
  breakdown.subtotal = calculateSubtotal(order.items);
  breakdown.discount = applyDiscount(breakdown.subtotal, discount);
  double afterDiscount = breakdown.subtotal - breakdown.discount;
  breakdown.tax = calculateTax(afterDiscount, tax);
  breakdown.shipping = calculateShipping(order, shipping);
  breakdown.total = afterDiscount + breakdown.tax + breakdown.shipping;
  return breakdown;
}
// STAR Result: Went from 0 tests to 94% coverage on pricing logic.
// New feature shipped on time. Three pricing bugs found during
// refactoring that had been silently overcharging customers.`,
    },
    {
      language: "cpp",
      caption: "Building a thread-safe cache after cross-team collaboration -- 'tell me about working with another team'",
      source: `#include <unordered_map>
#include <shared_mutex>
#include <chrono>
#include <optional>

// Built this after collaborating with the platform team who identified
// that our service was making 50K redundant API calls per hour.
// Required understanding their rate-limiting constraints and our
// data freshness requirements -- a cross-team negotiation.

template <typename Key, typename Value>
class TTLCache {
  struct Entry {
    Value value;
    std::chrono::steady_clock::time_point expiry;
  };

  std::unordered_map<Key, Entry> cache_;
  mutable std::shared_mutex mutex_;  // reader-writer lock
  std::chrono::seconds ttl_;

public:
  explicit TTLCache(std::chrono::seconds ttl) : ttl_(ttl) {}

  // Multiple readers can access concurrently (shared lock)
  std::optional<Value> get(const Key& key) const {
    std::shared_lock lock(mutex_);
    auto it = cache_.find(key);
    if (it == cache_.end()) return std::nullopt;
    if (std::chrono::steady_clock::now() > it->second.expiry) {
      return std::nullopt;  // expired
    }
    return it->second.value;
  }

  // Writers get exclusive access
  void put(const Key& key, const Value& value) {
    std::unique_lock lock(mutex_);
    cache_[key] = Entry{
      value,
      std::chrono::steady_clock::now() + ttl_
    };
  }

  // Periodic cleanup to prevent memory growth
  void evictExpired() {
    std::unique_lock lock(mutex_);
    auto now = std::chrono::steady_clock::now();
    for (auto it = cache_.begin(); it != cache_.end(); ) {
      if (now > it->second.expiry) {
        it = cache_.erase(it);
      } else {
        ++it;
      }
    }
  }

  size_t size() const {
    std::shared_lock lock(mutex_);
    return cache_.size();
  }
};

// Usage negotiated with platform team:
// TTLCache<std::string, UserProfile> userCache(std::chrono::minutes(5));
// They agreed 5-minute staleness was acceptable for non-critical reads.
// STAR Result: API calls dropped from 50K/hr to 8K/hr (84% reduction).
// Platform team's rate-limit alerts stopped entirely.`,
    },
  ],
  comparison: {
    columns: ["Dimension", "Conflict", "Failure", "Leadership", "Pressure", "Collaboration"],
    rows: [
      [
        "What it tests",
        "Emotional intelligence, empathy, de-escalation, ability to disagree constructively",
        "Self-awareness, ego resilience, learning agility, growth mindset",
        "Initiative, influence without authority, vision, ability to rally others",
        "Prioritization, strategic thinking, composure, stakeholder communication",
        "Empathy across domains, translation ability, relationship building, navigating competing incentives",
      ],
      [
        "Ideal answer structure",
        "Context of disagreement -> Your perspective and theirs -> How you sought understanding -> Resolution and relationship outcome",
        "The failure and stakes -> Your specific role in it -> Root cause analysis -> Concrete lesson and behavioral change applied",
        "Problem or opportunity identified -> How you built consensus and influenced -> Actions you drove -> Measurable impact achieved",
        "Competing demands described -> Your prioritization framework -> Trade-offs communicated -> Quality outcome despite constraints",
        "Cross-team context and differing goals -> How you understood each side -> Alignment strategy -> Shared outcome and ongoing relationship",
      ],
      [
        "Common mistakes",
        "Badmouthing the other person, claiming you were entirely right, picking a trivial disagreement, not showing resolution",
        "Humble-bragging, blaming others, picking a fake failure, vague lessons like 'I learned to communicate better'",
        "Describing assigned work as initiative, focusing on the idea without showing execution, no measurable outcome",
        "Just describing working overtime, no evidence of prioritization, not showing stakeholder communication",
        "Taking all the credit, not showing understanding of other teams' constraints, describing collaboration as delegation",
      ],
      [
        "Sample opening line",
        "'In my previous role, I had a fundamental disagreement with our lead engineer about whether to refactor our auth system before launching a new feature...'",
        "'During a critical product launch, I made a decision to skip load testing to meet the deadline, and the system crashed within two hours of going live...'",
        "'I noticed our team was spending 15 hours per sprint on manual regression testing, so I proposed and led the adoption of an automated testing framework...'",
        "'Three weeks before our biggest client demo, we discovered a critical data integrity issue while simultaneously being asked to deliver two new features...'",
        "'Our engineering and sales teams were in constant tension because sales was making delivery commitments without consulting engineering on feasibility...'",
      ],
      [
        "Time allocation (2 min answer)",
        "20% context, 15% your perspective, 20% their perspective and your listening, 30% resolution process, 15% outcome",
        "15% what happened, 15% your role and ownership, 20% analysis of what went wrong, 35% what you learned and changed, 15% proof it stuck",
        "15% problem identification, 20% building buy-in, 35% actions and execution, 30% measurable results",
        "20% competing demands, 25% prioritization reasoning, 25% stakeholder communication, 30% outcome and quality",
        "20% cross-team context, 20% understanding different goals, 30% alignment strategy, 30% shared outcome",
      ],
    ],
  },
  exercises: [
    "Record yourself answering 'Tell me about a time you disagreed with a senior colleague.' Play it back and analyze: How many times did you say 'I' vs 'we'? Did you describe the other person's perspective with genuine empathy or just as a setup? Were there specific details (names, numbers, dates) or was it vague? Did you quantify the outcome? Time yourself — if you went over 2.5 minutes, identify what to cut.",
    "Write out your top 5 behavioral stories using a strict template: (1) one sentence of context, (2) the specific challenge, (3) three bullet points of actions YOU took, (4) the quantified result, (5) the lesson or behavioral change. Now try to deliver each one in exactly 90 seconds. Stories that cannot be compressed to 90 seconds need tighter editing — you are probably including unnecessary background.",
    "Practice the 'peeling' technique with a partner. Have them ask a behavioral question, give your initial answer, then have them ask 3-4 increasingly specific follow-up questions: 'What exactly did you say?' 'How did they respond to that?' 'What would you do differently now?' 'What was the quantified impact?' This simulates real interview probing and reveals where your stories have gaps or vague spots.",
    "Create a 'story matrix': list your 5 strongest stories across the top and the 5 behavioral categories (conflict, failure, leadership, pressure, collaboration) down the side. Check each box where a story could credibly answer that category. Aim for each story to cover at least 2 categories and each category to have at least 2 stories. This gives you flexibility when the interviewer asks unexpected variations.",
    "Do a mock interview with a friend who works in a different field. If they can follow your story and identify the key takeaway without any technical context, your communication is strong. If they get confused or cannot summarize what you did and why it mattered, you are relying too heavily on domain knowledge and need to make the narrative more universal.",
  ],
  revisionNotes: [
    "Every behavioral answer must use a real past example with specific details — hypothetical answers ('I would...') are automatic downgrades on scoring rubrics.",
    "The STAR framework is necessary but not sufficient: Situation and Task should take 20% of your time, Action and Result should take 80%. Most candidates spend too long on setup.",
    "Quantify outcomes whenever possible. 'Reduced deploy failures by 60%' beats 'things improved significantly.' Numbers signal that you measure impact and think in terms of results.",
    "For conflict questions, always demonstrate that you understood the other person's perspective. Interviewers are testing empathy as much as problem-solving.",
    "For failure questions, choose a genuine failure with real stakes. The quality of the lesson matters more than the severity of the failure, but trivial failures signal avoidance.",
    "Calibrate story complexity to your target level: junior candidates should show task-level examples, senior candidates should show organizational-level impact and systems thinking.",
    "Prepare 5 versatile stories that each map to at least 2 behavioral categories. Flexibility matters more than having a unique story for every possible question.",
    "Practice aloud, not just in your head. The gap between a story that reads well on paper and one that sounds natural in conversation is significant. Record yourself and listen back.",
  ],
  cheatSheet: [
    "STAR = Situation (10%) + Task (10%) + Action (50%) + Result (30%). Spend most time on what YOU did and what changed.",
    "Say 'I' not 'we' — interviewers are assessing YOUR contribution. Clarify your role explicitly even in team efforts.",
    "Keep answers to 1.5-2.5 minutes. Under 1 minute feels thin, over 3 minutes loses the interviewer's attention.",
    "Always end with a measurable outcome or a specific behavioral change. 'It went well' is not a result.",
    "For conflict: show empathy first, solution second. Never badmouth anyone. End with the relationship intact.",
    "For failure: own it fully, no qualifiers. 'I made the wrong call' beats 'The timeline was challenging and the team was stretched.'",
    "Have a 'pivot' ready: if your prepared story does not exactly fit the question, briefly acknowledge the gap and bridge to a relevant example.",
    "Watch the interviewer's signals: if they are nodding and writing, keep going. If they look ready to speak, wrap up. Behavioral interviews are conversations, not monologues.",
  ],
  resources: [
    { label: "Cracking the Coding Interview by Gayle Laakmann McDowell — Chapter on Behavioral Questions", kind: "book", note: "Covers the fundamentals of structuring behavioral answers with concrete examples and a question bank organized by category." },
    { label: "The STAR Interview Method — Indeed Career Guide", kind: "article", note: "Practical walkthrough of STAR format with examples for common behavioral questions across industries." },
    { label: "Grokking the Behavioral Interview — Educative.io", kind: "docs", note: "Interactive course covering behavioral question categories, self-reflection exercises, and mock interview practice with structured feedback." },
    { label: "Jeff Bezos's Leadership Principles Interview Prep — Amazon Interview Resources", kind: "article", note: "While Amazon-specific, the 16 leadership principles provide an excellent taxonomy for categorizing and preparing behavioral stories applicable to any company." },
    { label: "Exponent Mock Interview Videos — YouTube Behavioral Interview Playlist", kind: "video", note: "Real mock interviews with feedback showing what strong and weak behavioral answers look like in practice, covering FAANG-level expectations." },
  ],
  diagrams: [
    {
      title: "Behavioral Answer Decision Flow",
      kind: "flow",
      caption: "How to select and structure the right story for any behavioral question: from identifying the competency being tested, to choosing the best-fit story from your matrix, to structuring the answer with appropriate time allocation, to reading interviewer signals and adjusting.",
      mermaid: `flowchart TD
    A["**Hear the Question**"] --> B{"**Identify the\\nCompetency Being Tested**"}
    B -->|"*Conflict*"| C["Empathy & Resolution"]
    B -->|"*Failure*"| D["Self-Awareness & Growth"]
    B -->|"*Leadership*"| E["Initiative & Influence"]
    B -->|"*Pressure*"| F["Prioritization & Composure"]
    B -->|"*Collaboration*"| G["Empathy & Translation"]
    C --> H{"**Select Best Story\\nfrom Matrix**"}
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I["**Structure with STAR**\\n*S: 10% | T: 10%*\\n*A: 50% | R: 30%*"]
    I --> J{"**Deliver Answer\\n(1.5-2.5 min)**"}
    J -->|"Interviewer nodding"| K["*Continue with detail*"]
    J -->|"Interviewer ready to speak"| L["*Wrap up concisely*"]
    K --> M["**Land the Result**\\n*Quantified outcome*"]
    L --> M
    M --> N["**Check In**\\n*Offer to go deeper*"]`,
    },
    {
      title: "Behavioral Question Category Mindmap",
      kind: "mindmap",
      caption: "Central node: Behavioral Questions. Branches: Conflict (sub: peer, manager, cross-team), Failure (sub: technical, judgment, process), Leadership (sub: with authority, without authority, cultural), Pressure (sub: deadlines, ambiguity, competing priorities), Collaboration (sub: cross-functional, remote, stakeholder management). Each leaf links to the core competency being assessed.",
      mermaid: `mindmap
  root(("**Behavioral Questions**"))
    ("**Conflict Resolution**")
      ("*Peer disagreements*")
      ("*Manager conflicts*")
      ("*Cross-team tension*")
      ::icon(Tests: **Emotional Intelligence**)
    ("**Handling Failure**")
      ("*Technical mistakes*")
      ("*Judgment errors*")
      ("*Process failures*")
      ::icon(Tests: **Self-Awareness**)
    ("**Leadership & Initiative**")
      ("*With authority*")
      ("*Without authority*")
      ("*Cultural leadership*")
      ::icon(Tests: **Influence & Drive**)
    ("**Working Under Pressure**")
      ("*Tight deadlines*")
      ("*Ambiguity*")
      ("*Competing priorities*")
      ::icon(Tests: **Strategic Thinking**)
    ("**Cross-Team Collaboration**")
      ("*Cross-functional projects*")
      ("*Remote collaboration*")
      ("*Stakeholder management*")
      ::icon(Tests: **Empathy & Translation**)`,
    },
  ],
  animations: [
    {
      title: "Answering a Behavioral Question Live",
      steps: [
        { label: "Hear the question and pause", detail: "Take 3-5 seconds to process. Do not rush to fill silence. Use this time to identify: what competency is this really testing? Which of my prepared stories best fits?" },
        { label: "State your story choice", detail: "Open with a one-sentence framing: 'I will share an example from when I was leading the backend migration at my last company.' This signals confidence and lets the interviewer know a structured answer is coming." },
        { label: "Set the scene briefly (15-20 seconds)", detail: "Provide only the context the interviewer needs to understand the challenge: your role, the team, the stakes. Resist the urge to over-explain the technical environment or company background." },
        { label: "Describe the specific challenge (10-15 seconds)", detail: "Make the tension clear: what was the conflict, failure, pressure, or opportunity? The interviewer should understand why this situation required action beyond business-as-usual." },
        { label: "Detail YOUR actions (45-60 seconds)", detail: "This is the core of your answer. Use 'I' statements. Describe 2-3 concrete actions you personally took. Include what you said, decided, built, or proposed. Show your reasoning, not just your actions." },
        { label: "Share the measurable result (15-20 seconds)", detail: "Quantify the outcome: metrics improved, time saved, revenue impact, incidents prevented. If you cannot quantify, describe the observable change: team adopted the process, stakeholder gave positive feedback, approach became the standard." },
        { label: "Add the reflection (10-15 seconds)", detail: "Briefly share what you learned or what you would do differently. This is especially important for failure and conflict stories. Make the lesson specific: 'I now always run a pre-mortem before major launches' beats 'I learned to plan better.'" },
        { label: "Check in with the interviewer", detail: "End with a natural pause or a brief 'Would you like me to go deeper into any part of that?' This shows confidence and conversational awareness. Be ready for follow-up probes on specifics." },
      ],
    },
  ],
  followUps: [
    "STAR Method deep dive and advanced variations (CAR, SOAR, PAR frameworks)",
    "Company-specific behavioral interview prep (Amazon Leadership Principles, Google Googleyness, Meta core values)",
    "Handling curveball behavioral questions you have not prepared for",
    "Building a personal story bank: how to mine your career for high-impact behavioral examples",
  ],
};

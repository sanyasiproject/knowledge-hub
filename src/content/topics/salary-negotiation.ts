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
  deepDive: [
    "## The Psychology of Negotiation: BATNA, ZOPA, and Cognitive Biases\n\nEffective salary negotiation is grounded in two foundational concepts from negotiation theory. **BATNA** (Best Alternative to a Negotiated Agreement) is your strongest walk-away option — the best outcome you can achieve if this negotiation fails. A strong BATNA (e.g., a competing offer, a satisfying current role, or strong savings) gives you genuine confidence and the ability to decline unfavorable terms. Before entering any negotiation, explicitly define your BATNA and work to improve it: apply to more companies, build your network, upskill. **ZOPA** (Zone of Possible Agreement) is the overlap between the lowest the employer would accept and the highest you would accept. Your job is to discover the ZOPA without revealing your reservation price. Use calibrated questions like 'What is the range for this level?' and 'How does the team typically structure compensation?' to probe the employer's range. Beyond BATNA and ZOPA, be aware of key cognitive biases: **loss aversion** (people feel losses more intensely than equivalent gains — frame your asks as what the company gains, not what it costs), **reciprocity** (small concessions invite reciprocal concessions — give on a low-priority item to get on a high-priority one), and **commitment bias** (once a company has invested months in interviewing you, they are psychologically invested in closing the deal — leverage this timing).",
    "## Negotiation for Non-Tech Roles\n\nWhile tech compensation data is abundant via levels.fyi and Blind, professionals in non-tech roles — marketing, sales, operations, finance, HR, healthcare, education — face a different landscape. **Research sources differ**: use industry-specific salary surveys (Robert Half, Hays, Mercer), professional association benchmarks (AMA for marketing, SHRM for HR), and recruiter relationships. **Compensation structures vary**: sales roles often have significant variable pay (commissions, quota bonuses) where the split (e.g., 60/40 base-to-variable) and quota attainability are more important than base alone. Operations and finance roles may offer profit-sharing or performance bonuses tied to company metrics. **Negotiation dynamics shift**: in industries with less transparent pay data, the information asymmetry favors the employer more heavily — making your own research and networking even more critical. **Strategies that transfer**: anchoring, BATNA strengthening, negotiating the full package, and written communication are equally effective. **Strategies that differ**: in smaller companies or non-tech industries, title and reporting structure can be more negotiable and carry significant long-term value. In unionized environments, individual negotiation may be limited to role placement within a band. Always research the specific norms of your industry before applying generic advice.",
    "## Negotiating Beyond the Initial Offer: Promotions, Raises, and Retention\n\nMost negotiation advice focuses on new-job offers, but some of the highest-impact negotiations happen with your current employer. **Promotion negotiations**: start 3-6 months before the review cycle by explicitly asking your manager what the criteria for the next level are and documenting your progress against those criteria. When promotion time comes, present a clear case: 'Here are the ways I have been operating at the [next level] for the past [X] months.' Include specific metrics, cross-functional impact, and peer feedback. **Annual raise negotiations**: if your company offers a standard raise (e.g., 3-5%), and you believe you deserve more, prepare a counter-case based on market data, expanded responsibilities, or retention risk. Frame it as: 'I want to make sure my compensation keeps pace with my growing contributions. Based on [data], the market rate for my current scope is $X.' **Retention counter-offers**: if you receive an outside offer and your current employer counters, evaluate carefully. Research shows that **50-80% of people who accept counter-offers leave within 18 months** anyway — the underlying reasons for looking (growth, culture, management) rarely change. Accept a counter-offer only if the outside offer was purely financially motivated and the counter addresses the gap fully. **Equity refreshes and spot bonuses**: at many companies, these are available outside the normal review cycle but require you to ask. Build the habit of periodic compensation check-ins (every 6-12 months) rather than waiting for annual reviews.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Demonstrating value: a performance optimization that saved infrastructure costs",
      source: `// When negotiating salary, concrete examples of measurable
// impact strengthen your position. "Based on my track record
// of saving $200K/year in infrastructure costs..."

#include <vector>
#include <unordered_map>
#include <string>
#include <chrono>
#include <memory>

// BEFORE: Naive implementation that required 8 server instances
// at $3,000/month each = $288K/year
class ReportGenerator {
  std::vector<Record> loadAllRecords() {
    // Loaded entire dataset into memory for every report
    // Peak memory: 12 GB per request
    return database.queryAll("SELECT * FROM transactions");
  }

public:
  Report generate(const ReportRequest& req) {
    auto records = loadAllRecords();  // 12 GB allocation
    // ... process all records even if report only needs a subset
    return buildReport(records, req);
  }
};

// AFTER: Streaming + filtering reduced memory 95%, servers from 8 to 2
// Annual savings: $216K in infrastructure

class StreamingReportGenerator {
  // Process records in chunks -- never hold full dataset in memory
  static constexpr size_t CHUNK_SIZE = 1000;

public:
  Report generate(const ReportRequest& req) {
    ReportAccumulator acc(req.metrics);

    // Push filters down to the query -- only fetch what we need
    auto cursor = database.queryCursor(
      buildFilteredQuery(req.filters));

    std::vector<Record> chunk;
    chunk.reserve(CHUNK_SIZE);

    while (cursor.hasNext()) {
      chunk.clear();
      cursor.fetchNext(CHUNK_SIZE, chunk);

      for (const auto& record : chunk) {
        acc.accumulate(record);  // O(1) memory per record
      }
    }

    return acc.finalize();
  }

private:
  // Generate SQL with WHERE clauses instead of filtering in code
  std::string buildFilteredQuery(const Filters& filters) {
    std::string query = "SELECT id, amount, date, category "
                        "FROM transactions WHERE 1=1";
    if (filters.startDate.has_value()) {
      query += " AND date >= '" + filters.startDate.value() + "'";
    }
    if (filters.category.has_value()) {
      query += " AND category = '" + filters.category.value() + "'";
    }
    return query;
  }
};

// This optimization is quantified impact you can cite in negotiation:
// "I reduced infrastructure costs by $216K/year while improving
//  report generation time from 45 seconds to 3 seconds."`,
    },
    {
      language: "cpp",
      caption: "Building a tool that multiplied team productivity -- demonstrating leverage",
      source: `// Salary negotiation leverage: "I built an internal tool that
// saved 15 engineering hours per week across the team."

#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <regex>
#include <iostream>

// The problem: engineers spent 3+ hours per deploy manually
// checking configuration consistency across environments.
// I automated it in a weekend.

struct ConfigIssue {
  std::string environment;
  std::string key;
  std::string message;
  enum Severity { WARNING, ERROR } severity;
};

class ConfigValidator {
  struct EnvironmentConfig {
    std::string name;
    std::unordered_map<std::string, std::string> values;
  };

  std::vector<EnvironmentConfig> environments_;
  std::vector<std::string> requiredKeys_;

public:
  void loadEnvironment(const std::string& name,
                       const std::string& filepath) {
    EnvironmentConfig env{name, {}};
    std::ifstream file(filepath);
    std::string line;
    while (std::getline(file, line)) {
      if (line.empty() || line[0] == '#') continue;
      auto pos = line.find('=');
      if (pos != std::string::npos) {
        env.values[line.substr(0, pos)] = line.substr(pos + 1);
      }
    }
    environments_.push_back(std::move(env));
  }

  void addRequiredKey(const std::string& key) {
    requiredKeys_.push_back(key);
  }

  std::vector<ConfigIssue> validate() const {
    std::vector<ConfigIssue> issues;

    for (const auto& env : environments_) {
      // Check required keys exist
      for (const auto& key : requiredKeys_) {
        if (env.values.find(key) == env.values.end()) {
          issues.push_back({env.name, key,
            "Required key missing", ConfigIssue::ERROR});
        }
      }

      // Check for placeholder values left in production
      for (const auto& [key, value] : env.values) {
        if (value.find("TODO") != std::string::npos ||
            value.find("CHANGEME") != std::string::npos) {
          issues.push_back({env.name, key,
            "Placeholder value detected: " + value,
            ConfigIssue::ERROR});
        }
        // Warn on empty values
        if (value.empty()) {
          issues.push_back({env.name, key,
            "Empty value", ConfigIssue::WARNING});
        }
      }
    }

    // Cross-environment consistency checks
    if (environments_.size() > 1) {
      const auto& prod = environments_.back();
      for (size_t i = 0; i < environments_.size() - 1; ++i) {
        for (const auto& [key, val] : environments_[i].values) {
          if (prod.values.find(key) == prod.values.end()) {
            issues.push_back({prod.name, key,
              "Key exists in " + environments_[i].name +
              " but not in production", ConfigIssue::WARNING});
          }
        }
      }
    }

    return issues;
  }
};

// Run before every deployment:
// validator.validate() caught 23 config errors in the first month
// that would have caused production incidents.
// Impact: 15 hours/week saved, 0 config-related incidents since.`,
    },
    {
      language: "cpp",
      caption: "System design that unlocked new revenue -- connecting technical work to business value",
      source: `// For negotiation, connecting technical decisions to revenue
// makes your value undeniable. "The feature gateway I designed
// enabled A/B testing that drove a 12% conversion improvement."

#include <string>
#include <unordered_map>
#include <functional>
#include <random>
#include <mutex>

// Feature flag system I designed that enabled product experiments
// Previously, testing a new feature required a full deploy cycle.
// This system enabled real-time feature toggling and A/B testing.

class FeatureGateway {
public:
  enum class Rollout { OFF, PERCENTAGE, USER_LIST, ON };

  struct FeatureConfig {
    std::string name;
    Rollout strategy;
    int percentage;                      // for PERCENTAGE rollout
    std::vector<std::string> userList;   // for USER_LIST rollout
    std::string experimentGroup;         // for analytics tracking
  };

private:
  std::unordered_map<std::string, FeatureConfig> features_;
  mutable std::mutex mutex_;
  mutable std::mt19937 rng_{std::random_device{}()};

public:
  void configure(const FeatureConfig& config) {
    std::lock_guard lock(mutex_);
    features_[config.name] = config;
  }

  bool isEnabled(const std::string& feature,
                 const std::string& userId) const {
    std::lock_guard lock(mutex_);
    auto it = features_.find(feature);
    if (it == features_.end()) return false;

    const auto& config = it->second;
    switch (config.strategy) {
      case Rollout::OFF: return false;
      case Rollout::ON:  return true;

      case Rollout::PERCENTAGE: {
        // Deterministic hash so same user always gets same result
        auto hash = std::hash<std::string>{}(userId + feature);
        return (hash % 100) < static_cast<size_t>(config.percentage);
      }

      case Rollout::USER_LIST: {
        return std::find(config.userList.begin(),
                         config.userList.end(),
                         userId) != config.userList.end();
      }
    }
    return false;
  }

  // Get the experiment group for analytics
  std::string getGroup(const std::string& feature,
                       const std::string& userId) const {
    if (isEnabled(feature, userId)) {
      return "treatment";
    }
    return "control";
  }
};

// Usage in production:
// if (gateway.isEnabled("new-checkout-flow", userId)) {
//   renderNewCheckout();
// } else {
//   renderClassicCheckout();
// }
// analytics.track("checkout", gateway.getGroup("new-checkout-flow", userId));

// BUSINESS IMPACT (what you cite in negotiation):
// - Enabled 40+ experiments in Q3 (previously 4/quarter)
// - New checkout flow A/B test showed 12% conversion improvement
// - Estimated annual revenue impact: $1.8M
// - Deploy-related incidents dropped 60% (gradual rollouts)`,
    },
    {
      language: "cpp",
      caption: "Mentoring impact: teaching a junior engineer to write production-quality code",
      source: `// Value demonstration: "I mentored 3 junior engineers to
// production readiness, reducing the team's code review
// cycle time by 40%."

// JUNIOR ENGINEER'S FIRST VERSION (common patterns I coached on):
#include <string>
#include <vector>
#include <iostream>

// Issue 1: No input validation
// Issue 2: Raw new/delete (memory leaks on error paths)
// Issue 3: No error handling
// Issue 4: Magic numbers
void processData(char* data, int size) {
  int* buffer = new int[size];  // raw allocation
  for (int i = 0; i < size; i++) {
    buffer[i] = data[i] * 2;   // magic number
  }
  // What if an exception occurs here? buffer leaks.
  delete[] buffer;
}

// AFTER MENTORING: The same engineer's code 3 months later
// Demonstrates the growth that justifies your impact claim

#include <memory>
#include <span>
#include <stdexcept>
#include <algorithm>

// Well-defined constants
namespace config {
  constexpr int SCALING_FACTOR = 2;
  constexpr size_t MAX_BUFFER_SIZE = 1'000'000;
}

// Input validated, RAII-managed, exception-safe
class DataProcessor {
public:
  struct Result {
    std::vector<int> values;
    size_t inputSize;
    size_t outputSize;
  };

  // Clear contract: what goes in, what comes out, what can fail
  static Result process(std::span<const char> input) {
    if (input.empty()) {
      throw std::invalid_argument("Input data cannot be empty");
    }
    if (input.size() > config::MAX_BUFFER_SIZE) {
      throw std::length_error("Input exceeds maximum size");
    }

    Result result;
    result.inputSize = input.size();
    result.values.reserve(input.size());

    std::transform(input.begin(), input.end(),
                   std::back_inserter(result.values),
                   [](char c) {
                     return static_cast<int>(c) * config::SCALING_FACTOR;
                   });

    result.outputSize = result.values.size();
    return result;  // RAII: no manual cleanup needed
  }
};

// The mentoring process that produced this transformation:
// Week 1-2: Code review with detailed comments explaining WHY
// Week 3-4: Pair programming on production features
// Week 5-8: Independent work with decreasing review overhead
// Month 3+: The junior started reviewing others' code

// NEGOTIATION POINT: "My mentoring reduced average code review
// iterations from 4.2 to 1.8 per PR across 3 junior engineers,
// saving approximately 10 senior engineering hours per week."`,
    },
  ],
  comparison: {
    columns: [
      "Factor",
      "New Job Offer",
      "Internal Promotion",
      "Retention Counter-Offer",
    ],
    rows: [
      [
        "Typical salary increase",
        "10-30% (sometimes higher for level jumps)",
        "5-15% (constrained by internal equity)",
        "10-25% (reactive, may not match market)",
      ],
      [
        "Leverage source",
        "Competing offers, market data, unique skills",
        "Documented impact, operating at next level, retention risk",
        "The outside offer itself",
      ],
      [
        "Equity opportunity",
        "New grant at current valuation; full vesting schedule resets",
        "Refresh grant (smaller); existing vesting continues",
        "Accelerated vesting or one-time grant to match outside offer",
      ],
      [
        "Risk level",
        "Moderate: new environment, unproven culture fit",
        "Low: known environment, built-in relationships",
        "High: 50-80% leave within 18 months; trust may erode",
      ],
      [
        "Timeline",
        "2-8 weeks from offer to start",
        "Months of positioning before the review cycle",
        "Days: counter-offers are time-pressured",
      ],
      [
        "Best strategy",
        "Anchor high, negotiate full package, use competing offers",
        "Build a written case over months, align with manager early",
        "Evaluate root cause for leaving; accept only if purely financial",
      ],
    ],
  },
  diagrams: [
    {
      title: "Salary Negotiation Process",
      kind: "flow",
      caption: "Step-by-step negotiation process from receiving an offer through research, counter-offer, and reaching an agreement.",
      mermaid: `flowchart TD
    A([Receive job offer]) --> B[Research market rate - levels.fyi and Glassdoor]
    B --> C[Determine your target and walkaway]
    C --> D[Express enthusiasm for role]
    D --> E[Make counter-offer with justification]
    E --> F{Response received}
    F -->|Above walkaway| G[Evaluate total comp]
    G --> H{Acceptable?}
    H -->|Yes| I([Accept offer])
    H -->|No| J[Negotiate non-salary items]
    F -->|Below walkaway| K([Decline politely])
    J --> I`,
    },
    {
      title: "Total Compensation Components",
      kind: "mindmap",
      caption: "Comprehensive view of total compensation beyond base salary, including equity, bonuses, and benefits that should all be considered in negotiation.",
      mermaid: `mindmap
  root((Total Compensation))
    Base Salary
      Monthly fixed pay
      Review frequency
    Equity
      RSUs - Restricted Stock Units
      Options - ISOs and NSOs
      Vesting schedule
      Cliff period
    Bonus
      Signing bonus
      Annual performance bonus
      Spot bonuses
    Benefits
      Health dental vision
      401k match
      PTO and paid leave
    Other
      Remote work flexibility
      Learning and development budget
      Home office stipend`,
    },
    {
      title: "Negotiation BATNA Framework",
      kind: "architecture",
      caption: "Best Alternative to a Negotiated Agreement framework showing how a strong BATNA improves negotiating position and outcomes.",
      mermaid: `graph TD
    You[Your Position] --> BATNA[BATNA - Best Alternative]
    BATNA --> Alt1[Competing offer]
    BATNA --> Alt2[Current job stay]
    BATNA --> Alt3[Freelance option]
    You --> Target[Target number]
    You --> WAP[Walkaway Point]
    WAP --> BATNA
    Employer[Employer Position] --> ETarget[Budget ceiling]
    Employer --> EFloor[Initial offer]
    Target --> ZOPATop[Zone of Possible Agreement]
    ETarget --> ZOPATop
    EFloor --> ZOPABottom[Negotiation Range]
    WAP --> ZOPABottom`,
    },
    {
      title: "Negotiation Conversation Flow",
      kind: "sequence",
      caption: "A scripted negotiation conversation showing how to respond to an offer, make a counter, and handle pushback professionally.",
      mermaid: `sequenceDiagram
    participant C as Candidate
    participant R as Recruiter

    R->>C: Offer: 130k base plus 20k bonus
    Note over C: Research shows 145-160k for this level
    C->>R: Thank you - very excited about the role
    C->>R: Based on my research - can we get to 150k base?
    R->>C: Best we can do is 138k
    C->>R: I appreciate that - could we add 10k signing bonus?
    R->>C: Yes - we can do 138k plus 10k signing
    Note over C: Total now 148k first year - close to target
    C->>R: That works for me - I accept`,
    },
  ],
  animations: [
    {
      title: "The Negotiation Timeline: From Research to Acceptance",
      steps: [
        {
          label: "Market Research (weeks before interviews)",
          detail:
            "Gather salary data from levels.fyi, Glassdoor, Blind, industry surveys, and your network. Define your target range, minimum acceptable number, and BATNA. Understand the typical compensation structure for your target companies and roles.",
        },
        {
          label: "Interview Phase (deflect early salary questions)",
          detail:
            "When asked about salary expectations during screens, deflect with: 'I would prefer to understand the full scope of the role first. What is the range for this level?' If pressed, share a researched range where the bottom equals your target. Never give a single number.",
        },
        {
          label: "Offer Received (do not respond immediately)",
          detail:
            "Express genuine enthusiasm and gratitude. Ask for 2-3 business days to review the full package. Request the offer in writing with all components detailed. Use this time to evaluate against your research, consult mentors, and prepare your counter-offer strategy.",
        },
        {
          label: "Counter-Offer Preparation (build your case)",
          detail:
            "Identify the gap between the offer and your target. Prioritize which components matter most to you. Prepare specific, data-backed asks: 'Based on my research and the market rate for this level, I was targeting $X base. I also noticed the equity grant is below the typical range for [company/level]. Can we discuss adjustments?'",
        },
        {
          label: "Negotiation Conversation (be collaborative and specific)",
          detail:
            "Lead with enthusiasm for the role. Present your counter as a partnership: 'I want us to find a package that works for both of us.' Make specific asks with supporting data. If one component is rigid, pivot to others. Use silence after your ask. Be prepared for 1-3 rounds of back-and-forth.",
        },
        {
          label: "Final Decision and Acceptance (get it in writing)",
          detail:
            "Once terms are agreed, request an updated written offer reflecting all negotiated changes. Review every detail before signing. Confirm start date, reporting structure, and any verbal commitments in writing. Thank everyone involved in the process — you will be working with them soon.",
        },
      ],
    },
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
  followUps: [
    "How do you negotiate salary when transitioning between industries where your experience does not directly transfer?",
    "What are the most effective strategies for negotiating remote work or flexible arrangements as part of the compensation package?",
    "How should you handle salary negotiation when the company uses a transparent or formulaic pay structure (e.g., Buffer, GitLab)?",
    "What is the best approach to re-negotiating compensation after a significant scope change or reorganization within your current role?",
    "How do you evaluate and negotiate equity compensation at pre-IPO startups where the stock value is uncertain?",
  ],
  exercises: [
    "**Mock Negotiation**: Pair up with a friend or mentor. One plays the hiring manager, the other the candidate. Practice with a realistic offer (use levels.fyi data for a target company). Record the conversation and review for filler words, premature concessions, and missed opportunities to use silence.",
    "**BATNA Mapping**: Write down your current BATNA and rate it 1-10. List 5 concrete actions you could take in the next 30 days to strengthen it (e.g., apply to 3 more companies, update portfolio, reach out to a recruiter). Implement at least 2 before your next negotiation.",
    "**Total Comp Calculator**: For a real or hypothetical offer, build a spreadsheet that values every component in annualized dollars: base, equity (accounting for vesting and estimated growth/decline), signing bonus (amortized over expected tenure), annual bonus (at target and historical payout), benefits (health insurance value, 401k match), and perks (PTO days at your daily rate, learning budget). Compare two offers using this framework.",
    "**Counter-Offer Script Writing**: Take a real or sample offer and write a complete counter-offer email. Include: an opening expressing enthusiasm, 2-3 specific data-backed asks with reasoning, a collaborative closing, and a clear call to action. Have a peer review it for tone and specificity.",
    "**Negotiation Journal**: For your next 3 negotiations (salary, vendor, even a car purchase), document: your preparation, BATNA, opening position, each round of offers/counters, what worked, what you would change. Review patterns after the third entry.",
  ],
  cheatSheet: [
    "**Never give a number first** — ask 'What is the range for this level?' to let the employer anchor, or anchor high with a researched range if forced.",
    "**Always ask for 2-3 days** to review any offer. Never accept, reject, or counter on the spot.",
    "**Negotiate the full package**: base, equity, signing bonus, annual bonus, level, PTO, remote flexibility, start date, learning budget, and review timeline.",
    "**Use specific asks with data**: 'Based on levels.fyi data for [company/level], I was targeting $X base' beats 'I want more money.'",
    "**Silence is a tactic**: after making your counter-offer, stop talking and let the other side respond.",
    "**Competing offers are your strongest lever** — interview at multiple companies simultaneously and use timelines to create urgency.",
    "**Get everything in writing**: verbal promises about equity refreshes, review timelines, or role scope must appear in the offer letter.",
    "**If base is rigid, pivot**: signing bonus and equity are often more flexible than base salary, especially at large companies with strict salary bands.",
  ],
  revisionNotes: [
    "**BATNA** (Best Alternative to a Negotiated Agreement) determines your walk-away power. Always define and strengthen it before negotiating.",
    "**ZOPA** (Zone of Possible Agreement) is the overlap between what you will accept and what the employer will offer. Your goal is to discover it without revealing your reservation price.",
    "**Anchoring bias** means whoever names the first number sets the range. Deflect early salary questions; if forced, anchor high with a researched range.",
    "**Total compensation** includes base, equity, signing bonus, annual bonus, benefits, PTO, remote work, and level. A $10K lower base with a level bump can be worth $50K+ over two years.",
    "**Competing offers** provide market validation and urgency. Never fabricate them — the recruiting community is interconnected.",
    "**Counter-offers from current employers** have a poor track record: 50-80% of accepters leave within 18 months. Accept only if your reason for leaving was purely financial.",
    "**Negotiation tone** should be collaborative, not adversarial. Lead with genuine enthusiasm, use data to justify asks, and frame requests as partnership.",
    "**Written communication** is preferred for complex negotiations: it creates a record, gives both sides time to think, and reduces emotional reactions.",
  ],
  resources: [
    { label: "Never Split the Difference by Chris Voss", kind: "book", note: "FBI hostage negotiator's framework applied to business and salary negotiation. Key concepts: tactical empathy, calibrated questions, and labeling." },
    { label: "Getting to Yes by Fisher and Ury", kind: "book", note: "The foundational text on principled negotiation. Introduces BATNA and the concept of separating people from the problem." },
    { label: "levels.fyi", kind: "docs", note: "The most reliable source for verified tech compensation data, broken down by company, level, and location. Essential for anchoring your research." },
    { label: "Candor Salary Negotiation Guide", kind: "article", note: "Comprehensive, practical guide covering negotiation scripts, email templates, and scenario-specific advice for tech professionals." },
    { label: "Patrick McKenzie — Salary Negotiation for Engineers", kind: "article", note: "Classic long-form article (patio11) covering the economics of why companies can almost always pay more and how to capture that value." },
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

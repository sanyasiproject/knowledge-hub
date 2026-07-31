import type { TopicContent } from "../types";

export const leadershipPrinciples: TopicContent = {
  quickSummary: [
    "Many top tech companies use leadership principles (LPs) as the backbone of their interview process, evaluating candidates against specific values rather than generic behavioral competencies.",
    "Amazon's 16 Leadership Principles are the most structured framework: every interview question maps to one or more LPs, and interviewers score candidates against specific LP criteria.",
    "Google evaluates 'Googleyness' and leadership: intellectual humility, comfort with ambiguity, bias for action, and collaborative problem-solving regardless of role level.",
    "Values-based interviews require mapping your STAR stories to the target company's specific principles before the interview, not improvising during it.",
  ],
  detailed: [
    "## Amazon Leadership Principles\n\nAmazon's 16 LPs include Customer Obsession, Ownership, Invent and Simplify, Are Right A Lot, Learn and Be Curious, Hire and Develop the Best, Insist on the Highest Standards, Think Big, Bias for Action, Frugality, Earn Trust, Dive Deep, Have Backbone; Disagree and Commit, Deliver Results, Strive to be Earth's Best Employer, and Success and Scale Bring Broad Responsibility. Each interviewer is assigned 2-3 LPs and asks behavioral questions targeting those principles. Answers are scored on a rubric from 'does not meet' to 'exceeds.' The most critical LPs for engineering roles: Customer Obsession, Ownership, Dive Deep, and Deliver Results.",
    "## Google Values and Evaluation\n\nGoogle evaluates four dimensions: General Cognitive Ability, Role-Related Knowledge, Leadership, and Googleyness. Googleyness includes: thriving in ambiguity, valuing diverse perspectives, being action-oriented, and collaborative problem-solving. Leadership at Google is expected at all levels: it means improving the people and environment around you, not just managing. The interviewing culture values structured thinking, data-driven decisions, and intellectual humility. Google uses a scoring rubric (1-4) per interview, and a hiring committee makes the final decision based on aggregate scores.",
    "## Meta Core Values\n\nMeta evaluates candidates on: Move Fast (speed of execution and willingness to iterate), Be Bold (taking smart risks and challenging the status quo), Focus on Long-Term Impact (thinking beyond immediate tasks), Build Awesome Things (passion for craft and quality), Be Open (transparency and direct communication), and Live in the Future (anticipating trends and building ahead of demand). Interview questions probe these values through behavioral examples. Meta particularly values candidates who have shipped products at scale and can demonstrate learning from bold bets that did not pay off.",
    "## Preparing for Values-Based Interviews\n\nPreparation requires: (1) Research the target company's stated values and principles, (2) Map your STAR stories to specific principles (each story should clearly demonstrate 1-2 principles), (3) Practice framing the same story differently depending on which principle is being evaluated, (4) Prepare stories that show tension between principles (e.g., moving fast vs. highest standards) and how you navigated the trade-off, (5) Understand which principles are most critical for your target role level. A common mistake is preparing generic stories that do not clearly connect to specific company values.",
    "## Common Pitfalls\n\nPitfalls include: memorizing principle names without understanding what they mean in practice, telling stories that demonstrate the opposite of the intended principle, using team accomplishments without clearly stating your individual contribution, choosing examples that are too small in scope for the target level, and failing to connect your story back to the principle explicitly. At senior levels, interviewers expect stories involving cross-org influence, ambiguous problem spaces, and significant business impact. At junior levels, stories about learning quickly, taking initiative, and delivering results with guidance are appropriate.",
  ],
  interviewQA: [
    {
      q: "How would you prepare for an Amazon LP interview?",
      a: "First, study all 16 LPs and understand what each means with examples. Then, prepare 2-3 STAR stories for each LP, focusing on the most critical ones for your role (Customer Obsession, Ownership, Dive Deep, Deliver Results for engineering). Map stories to multiple LPs so you can adapt. Practice framing stories to explicitly connect to the LP: start with the LP-relevant challenge and end with LP-relevant impact. Prepare for follow-up questions that probe deeper: 'What would you do differently?' 'How did you measure success?' 'What was the customer impact?'",
    },
    {
      q: "What does 'Disagree and Commit' mean in practice?",
      a: "It means you should voice your disagreement respectfully when you believe a decision is wrong, back your position with data, and advocate firmly. However, once the team decides on a direction (even if it is not your preferred one), you commit fully and execute with the same energy as if it were your idea. You do not undermine the decision or say 'I told you so' if it fails. It demonstrates both backbone (disagreeing) and team orientation (committing). A strong story shows both phases: the principled disagreement and the wholehearted commitment.",
    },
    {
      q: "How does Google evaluate leadership for individual contributor roles?",
      a: "Google defines leadership broadly: it is about improving the people and environment around you, regardless of title. For ICs, this means mentoring teammates, raising the engineering bar (through code reviews, design docs, best practices), driving technical decisions with data, identifying and solving problems proactively, and making others more effective. A strong IC leadership story might involve championing a testing initiative, creating an internal tool that saved the team hours weekly, or leading a blameless post-mortem process.",
    },
  ],
  mcqs: [
    {
      q: "At Amazon, who assigns which Leadership Principles each interviewer evaluates?",
      options: [
        "The candidate chooses which LPs to discuss",
        "Each interviewer is assigned 2-3 LPs by the interview coordinator",
        "All interviewers evaluate all 16 LPs",
        "The hiring manager decides during the debrief",
      ],
      answerIndex: 1,
      explanation:
        "Amazon's structured interview process assigns each interviewer 2-3 specific LPs to evaluate, ensuring comprehensive coverage across the interview loop.",
    },
    {
      q: "What is 'Googleyness'?",
      options: [
        "Technical coding ability at Google's standard",
        "Comfort with ambiguity, intellectual humility, action orientation, and collaborative problem-solving",
        "Knowledge of Google's products and services",
        "The ability to pass Google's coding interview",
      ],
      answerIndex: 1,
      explanation:
        "Googleyness encompasses cultural values: thriving in ambiguity, valuing diverse perspectives, being action-oriented, and collaborative problem-solving. It is distinct from technical ability.",
    },
    {
      q: "What is a common mistake in values-based interviews?",
      options: [
        "Preparing too many STAR stories",
        "Choosing examples that are too large in scope",
        "Telling stories that do not clearly connect to the company's specific principles",
        "Over-researching the company's values",
      ],
      answerIndex: 2,
      explanation:
        "Generic stories that do not clearly map to the company's specific principles miss the point of values-based interviewing. Each story should explicitly demonstrate 1-2 target principles.",
    },
  ],
  flashcards: [
    { front: "How many Leadership Principles does Amazon have?", back: "16 principles, including Customer Obsession, Ownership, Invent and Simplify, Are Right A Lot, Bias for Action, Dive Deep, Disagree and Commit, and Deliver Results." },
    { front: "What four dimensions does Google evaluate?", back: "General Cognitive Ability, Role-Related Knowledge, Leadership, and Googleyness." },
    { front: "What is 'Disagree and Commit'?", back: "Voice disagreement respectfully with data, advocate firmly for your position, but once a decision is made, commit fully and execute wholeheartedly." },
    { front: "What does leadership mean for ICs at Google?", back: "Improving people and environment: mentoring, raising engineering standards, driving decisions with data, solving problems proactively, making others more effective." },
    { front: "How should you map STAR stories to LPs?", back: "Prepare 2-3 stories per principle. Map each story to multiple LPs for flexibility. Practice framing the same story differently for different principles." },
    { front: "What scope of stories do senior-level interviews require?", back: "Cross-org influence, ambiguous problem spaces, significant business impact, and trade-offs between competing principles." },
  ],
  glossary: [
    { term: "Leadership Principles (LPs)", definition: "A set of core values used by companies (especially Amazon) as the framework for evaluating candidates in behavioral interviews." },
    { term: "Customer Obsession", definition: "Amazon LP: start with the customer and work backwards. Earn and keep customer trust. Leaders pay attention to competitors but obsess over customers." },
    { term: "Ownership", definition: "Amazon LP: act on behalf of the entire company, not just your team. Never say 'that is not my job.' Think long-term." },
    { term: "Googleyness", definition: "Google's cultural evaluation dimension: comfort with ambiguity, intellectual humility, action orientation, and collaborative problem-solving." },
    { term: "Disagree and Commit", definition: "Amazon LP: respectfully challenge decisions with data, then commit fully once a decision is made, even if you disagree." },
    { term: "Dive Deep", definition: "Amazon LP: operate at all levels, stay connected to details, audit frequently, and be skeptical when metrics and anecdotes differ." },
    { term: "Values-Based Interview", definition: "An interview approach where questions and evaluation criteria are explicitly mapped to a company's stated values or principles." },
  ],
  deepDive: [
    "## How LP-Based Interviews Actually Work Behind the Scenes\n\nAt Amazon, each interview loop typically consists of 5-6 interviewers, each assigned 2-3 Leadership Principles by the interview coordinator (sometimes called the 'loop owner'). The assignment is deliberate: critical LPs like Customer Obsession and Ownership are often double-covered by two interviewers to get a second data point. Each interviewer writes detailed feedback in an internal tool, scoring the candidate on each assigned LP using a rubric that ranges from 'Does Not Meet the Bar' through 'Meets' to 'Exceeds the Bar.' The feedback must include specific examples from the candidate's responses, not vague impressions.\n\nThe debrief meeting is where the real decision happens. All interviewers gather (often virtually) and present their assessments in order, starting with the most junior interviewer to avoid anchoring bias from senior voices. Each interviewer states their hire/no-hire vote and the LP-level scores with supporting evidence. A single 'strong no hire' on a critical LP can derail an otherwise positive loop. The hiring manager does not get veto power; the decision is collective.\n\nAt Google, the process is different but equally structured. Interviewers submit independent feedback into an internal tool before seeing anyone else's assessment. A hiring committee (HC), composed of senior engineers who did not participate in the interview, reviews all feedback packets and makes the hire/no-hire decision. This separation between interviewers and decision-makers is designed to reduce individual bias. The HC looks for consistent signals across interviewers and flags cases where scores diverge significantly for deeper discussion.\n\nMeta's process emphasizes speed and signal density. Behavioral interviews are typically conducted by trained 'behavioral interviewers' who specialize in evaluating culture fit. They use a structured rubric tied to Meta's core values, with particular emphasis on 'Move Fast' and 'Build Awesome Things' for engineering roles. The debrief is streamlined compared to Amazon, but the hiring manager's input carries more weight in the final decision.",

    "## The Bar Raiser Role and Calibration\n\nAmazon's Bar Raiser program is one of the most distinctive elements of its hiring process. A Bar Raiser is a specially trained interviewer from outside the hiring team whose explicit job is to ensure the candidate raises the average quality of the team they would join. Bar Raisers have veto power over hiring decisions, even against the hiring manager's wishes. They are trained in behavioral interviewing techniques, LP evaluation, and bias recognition over a multi-month apprenticeship program.\n\nBar Raisers typically take on the hardest-to-evaluate LPs: Earn Trust, Have Backbone; Disagree and Commit, and Hire and Develop the Best. They also watch for 'urgency hiring,' where a team is so desperate to fill a role that they lower their standards. A common Bar Raiser move is to ask pointed follow-up questions that force candidates to go beyond rehearsed stories: 'What specifically was YOUR contribution versus the team's?' 'Walk me through the data you used to make that decision.' 'What would you do differently knowing what you know now?'\n\nCalibration is an ongoing process at all these companies. At Amazon, interviewers must complete a minimum number of interviews per year to maintain their interviewing privileges, and they receive feedback on their scoring accuracy relative to eventual hire performance. Google runs periodic calibration sessions where interviewers review anonymized feedback samples and discuss scoring consistency. This prevents grade inflation and ensures that a '3 out of 4' at Google means roughly the same thing regardless of which interviewer gave the score.\n\nFor candidates, understanding calibration means understanding that interviewers are actively looking for specific, measurable evidence. Vague answers like 'I collaborated with the team' score poorly because they provide no calibratable signal. Strong answers include concrete details: team size, timeline, metrics, your specific decisions, and measurable outcomes.",

    "## Level-Specific Expectations and Hidden Evaluation Criteria\n\nWhat most candidates miss is that LP evaluation is level-dependent. The same principle is evaluated differently at L4 (entry-level SDE) versus L6 (Senior SDE) versus L7 (Principal). At L4, 'Ownership' might mean taking responsibility for a feature end-to-end within your team. At L6, it means owning cross-team outcomes and proactively solving problems outside your direct scope. At L7, it means shaping organizational strategy and taking ownership of ambiguous, company-level challenges.\n\nInterviewers are trained to evaluate 'scope of impact' as a proxy for level. A candidate telling an L6-scope story in an L7 interview will get 'meets bar at L6' feedback, which effectively means 'does not meet' for the target level. This is why the most common interview outcome for senior candidates is 'strong candidate, but at a lower level than targeted.'\n\nThere are also hidden evaluation dimensions that are not formally part of the LP framework but significantly influence decisions. 'Learning agility' (how quickly you adapted when your initial approach failed), 'self-awareness' (acknowledging mistakes without being prompted), and 'intellectual honesty' (distinguishing what you knew at the time from what you learned later) are all strong positive signals across every company. Conversely, candidates who claim credit for team achievements, cannot articulate what went wrong in failed projects, or give answers that sound polished but lack substance are consistently flagged.\n\nAt Google specifically, the concept of 'emergent leadership' matters: did you lead because you were assigned to, or because you saw a gap and stepped in? At Meta, 'velocity of learning' is prized: how quickly did you go from not knowing something to shipping a solution? These unstated criteria often separate borderline candidates from clear hires.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Customer Obsession: redesigning an API by working backwards from the customer experience",
      source: `// Amazon LP: Customer Obsession -- "Start with the customer and
// work backwards." This code shows how I redesigned an internal
// API after discovering developers (our customers) were misusing it.

// BEFORE: API designed from implementation perspective
// 67% of callers were using it incorrectly, causing silent data loss
class DataStore {
public:
  // Callers had to remember: open -> write -> flush -> close
  // Forgetting flush() lost data. Forgetting close() leaked resources.
  void open(const std::string& path);
  void write(const char* data, size_t len);
  void flush();
  void close();
};

// AFTER: Redesigned by observing how customers actually wanted to
// use it. I interviewed 8 teams, filed 3 weeks of support tickets,
// and found the same 4 mistakes repeated everywhere.

#include <string>
#include <string_view>
#include <functional>
#include <stdexcept>

class DataStore {
public:
  // Pattern 1: Simple write -- most common use case (80% of callers)
  // Flush and close are automatic. Cannot forget them.
  static void write(const std::string& path, std::string_view data) {
    DataStore store(path);
    store.appendInternal(data);
    // Destructor handles flush + close
  }

  // Pattern 2: Batch writes with guaranteed cleanup
  // RAII ensures resources are always released
  static void batch(const std::string& path,
                    std::function<void(Writer&)> operations) {
    Writer writer(path);
    operations(writer);
    // Writer destructor flushes and closes
  }

  // Inner class for batch operations
  class Writer {
    std::string path_;
    bool committed_ = false;
  public:
    explicit Writer(const std::string& path) : path_(path) {
      // open file
    }
    void append(std::string_view data) {
      // write data
    }
    ~Writer() {
      // Always flush and close, even on exception
      if (!committed_) { /* rollback */ }
      // close file handle
    }
  };

private:
  explicit DataStore(const std::string& path) { /* open */ }
  void appendInternal(std::string_view data) { /* write + flush */ }
  ~DataStore() { /* flush + close */ }
};

// STAR Result: Misuse-related data loss incidents dropped from
// 12/quarter to 0. Internal developer satisfaction score for the
// API went from 2.1 to 4.6 out of 5.`,
    },
    {
      language: "cpp",
      caption: "Ownership: taking responsibility for system reliability beyond your team's scope",
      source: `// Amazon LP: Ownership -- "Act on behalf of the entire company,
// not just your team." I noticed our monitoring had blind spots
// that affected three other teams. Nobody owned the gap.

#include <string>
#include <vector>
#include <functional>
#include <chrono>
#include <iostream>
#include <unordered_map>

// Health check framework I built on my own initiative.
// It was outside my team's charter, but the gap was hurting
// the entire org. I proposed it, got buy-in, and shipped it.

enum class HealthStatus { HEALTHY, DEGRADED, UNHEALTHY };

struct HealthCheck {
  std::string name;
  std::string owner;  // which team owns this dependency
  std::function<HealthStatus()> check;
  std::chrono::seconds interval;
};

class SystemHealthDashboard {
  std::vector<HealthCheck> checks_;
  std::unordered_map<std::string, HealthStatus> lastStatus_;

public:
  void registerCheck(HealthCheck check) {
    checks_.push_back(std::move(check));
  }

  struct Report {
    int healthy = 0;
    int degraded = 0;
    int unhealthy = 0;
    std::vector<std::string> alerts;
  };

  Report runAllChecks() {
    Report report;
    for (const auto& check : checks_) {
      auto status = check.check();
      auto prev = lastStatus_[check.name];

      switch (status) {
        case HealthStatus::HEALTHY:   report.healthy++; break;
        case HealthStatus::DEGRADED:  report.degraded++; break;
        case HealthStatus::UNHEALTHY: report.unhealthy++; break;
      }

      // Alert on status transitions, not just current state
      if (prev != status && status != HealthStatus::HEALTHY) {
        report.alerts.push_back(
          check.name + " (" + check.owner + "): " +
          "status changed to " +
          (status == HealthStatus::DEGRADED ? "DEGRADED" : "UNHEALTHY")
        );
      }
      lastStatus_[check.name] = status;
    }
    return report;
  }
};

// Registration by each team:
// dashboard.registerCheck({"payment-gateway", "payments-team",
//   []{ return checkPaymentGateway(); }, std::chrono::seconds(30)});
// dashboard.registerCheck({"user-auth", "identity-team",
//   []{ return checkAuthService(); }, std::chrono::seconds(15)});

// STAR Result: Reduced mean-time-to-detection from 45 min to 2 min.
// Three teams adopted the framework. My manager cited this as the
// key example of ownership in my promotion packet.`,
    },
    {
      language: "cpp",
      caption: "Dive Deep: data-driven debugging when metrics and anecdotes disagreed",
      source: `// Amazon LP: Dive Deep -- "Be skeptical when metrics and
// anecdotes differ." Dashboard showed 99.9% success rate, but
// customers were complaining about failures. I dug in.

#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <numeric>
#include <cmath>

struct RequestLog {
  std::string userId;
  std::string endpoint;
  int statusCode;
  double latencyMs;
  bool timedOut;
};

// The investigation: I wrote analysis code to understand WHY
// the dashboard metric did not match customer experience

struct DeepDiveReport {
  double overallSuccessRate;      // what dashboard showed: 99.9%
  double p99LatencyMs;
  double timeoutRate;
  std::unordered_map<std::string, double> successRateByEndpoint;
  std::unordered_map<std::string, double> successRateByUser;
  std::vector<std::string> anomalousUsers;  // the real story
};

DeepDiveReport analyzeRequests(const std::vector<RequestLog>& logs) {
  DeepDiveReport report;

  // Overall success rate (what the dashboard computed)
  long successCount = std::count_if(logs.begin(), logs.end(),
    [](const RequestLog& r) { return r.statusCode == 200; });
  report.overallSuccessRate =
    static_cast<double>(successCount) / logs.size() * 100.0;

  // THE KEY INSIGHT: per-user success rate reveals the problem
  // 95% of users had 100% success. 5% of users had <50% success.
  // The overall average hid a bimodal distribution.
  std::unordered_map<std::string, int> userTotal, userSuccess;
  for (const auto& log : logs) {
    userTotal[log.userId]++;
    if (log.statusCode == 200) userSuccess[log.userId]++;
  }

  for (const auto& [userId, total] : userTotal) {
    double rate = static_cast<double>(userSuccess[userId]) / total * 100.0;
    report.successRateByUser[userId] = rate;
    if (rate < 80.0) {
      report.anomalousUsers.push_back(userId);
    }
  }

  // Per-endpoint breakdown revealed the real culprit
  std::unordered_map<std::string, int> epTotal, epSuccess;
  for (const auto& log : logs) {
    epTotal[log.endpoint]++;
    if (log.statusCode == 200) epSuccess[log.endpoint]++;
  }
  for (const auto& [ep, total] : epTotal) {
    report.successRateByEndpoint[ep] =
      static_cast<double>(epSuccess[ep]) / total * 100.0;
  }

  // P99 latency
  std::vector<double> latencies;
  latencies.reserve(logs.size());
  for (const auto& log : logs) latencies.push_back(log.latencyMs);
  std::sort(latencies.begin(), latencies.end());
  size_t p99Idx = static_cast<size_t>(latencies.size() * 0.99);
  report.p99LatencyMs = latencies[p99Idx];

  return report;
}

// FINDING: The /search endpoint had a 92% success rate (vs 99.9%
// overall) due to a regex timeout on certain query patterns.
// Power users who searched heavily were the 5% experiencing failures.
// STAR Result: Fixed the regex, added per-endpoint alerting.
// Customer complaints dropped 90% in two weeks.`,
    },
    {
      language: "cpp",
      caption: "Disagree and Commit: advocating for a technical position, then committing fully",
      source: `// Amazon LP: Have Backbone; Disagree and Commit
// I disagreed with the team's choice of synchronous processing
// for a high-volume pipeline. I advocated with data, lost the
// vote, then committed fully to make the chosen approach succeed.

#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <vector>

// MY PROPOSAL (async with worker pool -- what I advocated for):
// I presented benchmarks showing 10x throughput improvement
// But the team chose synchronous for simplicity and debuggability.

// WHAT I COMMITTED TO: Making the synchronous approach work
// by adding batching and connection pooling to meet the SLA.
// No "I told you so" -- I gave it 100%.

class BatchProcessor {
  static constexpr int BATCH_SIZE = 100;
  static constexpr int MAX_CONCURRENT = 4;

  struct WorkItem {
    std::string payload;
    std::function<void(bool)> callback;
  };

  std::vector<WorkItem> pendingBatch_;
  std::mutex mutex_;

public:
  // Accumulate items and process in batches for efficiency
  // This was my contribution to making the sync approach viable
  void submit(const std::string& payload,
              std::function<void(bool)> callback) {
    std::lock_guard<std::mutex> lock(mutex_);
    pendingBatch_.push_back({payload, std::move(callback)});

    if (pendingBatch_.size() >= BATCH_SIZE) {
      processBatch();
    }
  }

  void flush() {
    std::lock_guard<std::mutex> lock(mutex_);
    if (!pendingBatch_.empty()) {
      processBatch();
    }
  }

private:
  void processBatch() {
    // Move batch out so we can release the lock
    auto batch = std::move(pendingBatch_);
    pendingBatch_.reserve(BATCH_SIZE);

    // Process the batch synchronously (team's chosen approach)
    // but with connection reuse and prepared statements
    for (auto& item : batch) {
      bool success = processItem(item.payload);
      item.callback(success);
    }
  }

  bool processItem(const std::string& payload) {
    // Reuse connections from pool, use prepared statements
    // These optimizations made synchronous viable at our scale
    return true;
  }
};

// STAR Result: The synchronous approach with my batching met the
// SLA (sub-200ms p99). When we later hit scale limits, the team
// adopted async -- but by then we had the monitoring and data to
// do it right. My manager cited this as a strong Disagree & Commit
// example: I advocated with data, committed without bitterness,
// and contributed to making the chosen approach successful.`,
    },
  ],
  comparison: {
    columns: [
      "Dimension",
      "Amazon LPs",
      "Google Values",
      "Meta Core Values",
      "Microsoft Growth Mindset",
    ],
    rows: [
      [
        "Number of principles",
        "16 formal Leadership Principles",
        "4 evaluation dimensions (GCA, RRK, Leadership, Googleyness)",
        "6 core values (Move Fast, Be Bold, Focus on Long-Term Impact, Build Awesome Things, Be Open, Live in the Future)",
        "3 pillars (Growth Mindset, Customer Obsessed, Diverse and Inclusive) plus 'One Microsoft'",
      ],
      [
        "Interview structure",
        "5-6 interviewers each assigned 2-3 LPs; includes a Bar Raiser from outside the team",
        "4-5 interviewers with independent feedback; hiring committee makes decision separately",
        "Behavioral specialist interviewer plus 3-4 technical interviewers; hiring manager has significant input",
        "4-5 interviewers evaluating both technical and cultural fit; 'as-appropriate' interviewer for senior roles",
      ],
      [
        "Scoring method",
        "Per-LP rubric: Does Not Meet / Meets / Exceeds the Bar; collective debrief with mandatory vote",
        "1-4 scale per dimension; independent feedback submitted before debrief; hiring committee reviews packets",
        "Strong No Hire / No Hire / Lean Hire / Hire per value area; streamlined debrief with hiring manager weight",
        "Thumbs down / Mixed / Thumbs up per competency; hiring manager synthesizes and decides",
      ],
      [
        "Most critical for engineers",
        "Customer Obsession, Ownership, Dive Deep, Deliver Results, Bias for Action",
        "General Cognitive Ability and Role-Related Knowledge weighted highest; Googleyness is a tiebreaker",
        "Move Fast and Build Awesome Things are most scrutinized; evidence of shipping at scale is essential",
        "Growth Mindset (learning from failure, seeking feedback) and Customer Obsessed (user empathy, data-driven)",
      ],
      [
        "How failure is evaluated",
        "Failure stories are expected and valued; interviewers look for learning, ownership of mistakes, and corrective action. 'Earn Trust' LP specifically probes this.",
        "Intellectual humility is core to Googleyness; candidates who cannot discuss failures authentically score poorly. 'What did you learn?' is a standard follow-up.",
        "'Be Bold' explicitly values smart risks that did not pay off; Meta wants evidence you took calculated bets and learned from outcomes, not that you played it safe.",
        "Growth Mindset is fundamentally about learning from failure; Microsoft interviews probe whether you seek feedback, adapt your approach, and view setbacks as learning opportunities.",
      ],
    ],
  },
  exercises: [
    "Map three of your past projects to Amazon's Customer Obsession, Ownership, and Dive Deep principles. For each project, write a 2-minute STAR story that explicitly names the principle and connects your actions and results to what that principle demands. Then practice telling the same story reframed for a different LP to build flexibility.",
    "Pick a project that did not go well or a decision you regret. Prepare three versions of this story: one framed for Amazon's 'Earn Trust' (emphasizing transparency and accountability), one for Google's 'Googleyness' (emphasizing intellectual humility and learning), and one for Meta's 'Be Bold' (emphasizing the calculated risk and what you learned). Notice how the same facts get different emphasis depending on the target principle.",
    "Conduct a mock interview with a partner where the interviewer assigns you a random LP and you must respond with a relevant story within 30 seconds. This simulates the real pressure of LP interviews where you cannot predict which principle will be probed. Do 10 rounds and track which LPs you struggle to find stories for; those are your preparation gaps.",
    "For your target level, write down the scope of impact expected for three critical LPs. Then audit your prepared stories: does each one demonstrate impact at the right scope? If you are interviewing for a senior role, flag any story where your impact was limited to your immediate team and either replace it or reframe it to highlight broader organizational impact.",
    "Create a 'principle conflict' story: describe a situation where two leadership principles were in tension (e.g., Bias for Action vs. Insist on the Highest Standards, or Move Fast vs. Focus on Long-Term Impact). Explain how you navigated the trade-off, what you prioritized and why, and what the outcome was. These stories demonstrate sophisticated judgment and are highly valued at senior levels.",
  ],
  revisionNotes: [
    "Every behavioral interview answer should follow STAR format (Situation, Task, Action, Result) and explicitly name the leadership principle it demonstrates. Do not leave the connection implicit.",
    "Prepare 2-3 stories per critical LP, and map each story to multiple principles so you can adapt on the fly when an interviewer pivots to an unexpected LP.",
    "Scope of impact must match your target level: team-level stories for junior roles, cross-team for mid-senior, organizational or company-level for staff and principal roles.",
    "Failure stories are not optional. Every company values self-awareness, learning from mistakes, and intellectual honesty. Prepare at least two strong failure stories with clear lessons and corrective actions.",
    "At Amazon, the Bar Raiser has veto power and is trained to detect rehearsed-but-shallow answers. Depth and specificity in your stories (metrics, timelines, trade-offs, stakeholder names) are essential.",
    "Google's hiring committee makes decisions from written feedback without meeting the candidate. Your interviewer is your advocate; give them specific, quotable evidence they can write up compellingly.",
    "The same story told at different scopes sounds like a different story. Practice 'zooming in' (for Dive Deep / technical depth questions) and 'zooming out' (for Think Big / strategic questions) on your best stories.",
    "'What would you do differently?' is not a throwaway question. It tests self-awareness and growth mindset. Always have a genuine, thoughtful answer that shows you have reflected on the experience since it happened.",
  ],
  cheatSheet: [
    "Amazon critical LPs for engineers: Customer Obsession, Ownership, Dive Deep, Deliver Results, Bias for Action. Prepare extra stories for these.",
    "Google scoring: 1 (Does Not Hire) to 4 (Must Hire). A single 1 is hard to overcome; consistent 3s typically get a hire decision from the hiring committee.",
    "STAR format checkpoint: Situation (context, 2 sentences), Task (your specific responsibility), Action (what YOU did, with detail), Result (measurable outcome + what you learned).",
    "Bar Raiser follow-ups to expect: 'What was YOUR specific contribution?' 'What data informed that decision?' 'What would you do differently today?' 'How did you measure success?'",
    "Level calibration rule of thumb: L4 stories = individual feature scope, L5 = multi-feature or small team scope, L6 = cross-team or org-level scope, L7+ = company-level or industry-level scope.",
    "Red flags interviewers are trained to catch: taking credit for team work, inability to discuss failures, vague metrics ('it improved a lot'), rehearsed answers that crumble under follow-ups.",
    "Principle conflict stories (e.g., speed vs. quality, short-term vs. long-term) are the highest-signal stories at senior levels. Prepare at least one.",
    "Meta values speed of shipping above almost everything else. If your stories are about careful planning without delivery, reframe to emphasize what you shipped and how fast.",
  ],
  resources: [
    {
      label: "Amazon's Official Leadership Principles Page",
      kind: "docs",
      note: "The primary source for all 16 LPs with Amazon's own descriptions. Study these exact wordings before your interview.",
    },
    {
      label: "Working Backwards by Colin Bryar and Bill Carr",
      kind: "book",
      note: "Written by two former Amazon VPs, this book explains how LPs are actually applied in day-to-day decisions at Amazon, not just interviews.",
    },
    {
      label: "re:Work by Google - Structured Interviewing Guide",
      kind: "docs",
      note: "Google's public guide on structured interviewing, including how they train interviewers, reduce bias, and use scoring rubrics.",
    },
    {
      label: "The Culture Map by Erin Meyer",
      kind: "book",
      note: "Essential for understanding how leadership principles are interpreted differently across cultures, especially relevant for global tech companies.",
    },
    {
      label: "Meta Engineering Blog - Our Engineering Culture",
      kind: "article",
      note: "Meta's own articulation of their engineering values and how they translate into team practices and hiring decisions.",
    },
  ],
  diagrams: [
    {
      title: "Amazon Interview Loop and Decision Flow",
      kind: "flow",
      caption: "End-to-end flow from LP assignment to interviewers, through individual scoring, Bar Raiser evaluation, debrief meeting, and final hire/no-hire decision with feedback aggregation.",
      mermaid: `flowchart TD
    A["**Interview Coordinator**\\n*Loop Owner*"] --> B["**Assign 2-3 LPs**\\n*per interviewer*"]
    B --> C["Interviewer 1\\n*e.g., Customer Obsession,*\\n*Ownership*"]
    B --> D["Interviewer 2\\n*e.g., Dive Deep,*\\n*Deliver Results*"]
    B --> E["Interviewer 3\\n*e.g., Earn Trust,*\\n*Disagree & Commit*"]
    B --> F["**Bar Raiser**\\n*Independent evaluator*\\n*Has veto power*"]
    C & D & E & F --> G["**Individual Scoring**\\n*Per-LP rubric:*\\n*Does Not Meet / Meets / Exceeds*"]
    G --> H["**Written Feedback**\\n*Specific examples required*"]
    H --> I["**Debrief Meeting**"]
    I --> J["*Junior interviewer*\\n*presents first*\\n*(avoid anchoring bias)*"]
    J --> K{"**Collective Decision**"}
    K -->|"*All meet or exceed,*\\n*no strong objections*"| L["**Hire**"]
    K -->|"*Strong no-hire on*\\n*critical LP*"| M["**No Hire**"]
    K -->|"*Mixed signals*"| N["**Discuss & Re-vote**"]
    F -->|"**Bar Raiser Veto**"| M`,
    },
    {
      title: "LP Evaluation Level Expectations",
      kind: "mindmap",
      caption: "How the same Leadership Principle (e.g., Ownership) is evaluated at different levels: L4 (feature ownership), L5 (component ownership), L6 (cross-team ownership), L7+ (organizational ownership).",
      mermaid: `mindmap
  root(("**Leadership Principle\\nby Level**"))
    ("**L4 — Junior SDE**")
      ("*Feature-level ownership*")
      ("*Task-scope stories*")
      ("*Learning & initiative*")
      ("*Guided delivery*")
    ("**L5 — Mid SDE**")
      ("*Component ownership*")
      ("*Multi-feature scope*")
      ("*Influencing peers*")
      ("*Independent delivery*")
    ("**L6 — Senior SDE**")
      ("*Cross-team ownership*")
      ("*Org-level impact*")
      ("*Mentoring & bar-raising*")
      ("*Ambiguous problem spaces*")
    ("**L7+ — Principal/Staff**")
      ("*Organizational ownership*")
      ("*Company-level strategy*")
      ("*Industry-shaping decisions*")
      ("*Systemic improvements*")`,
    },
  ],
  animations: [
    {
      title: "Preparing a STAR Story Mapped to Leadership Principles",
      steps: [
        {
          label: "Select a high-impact experience",
          detail: "Choose a project or situation with measurable outcomes and clear personal contribution. Prefer experiences with complexity, ambiguity, or conflict, as these generate the richest LP signals. Avoid routine tasks or situations where you simply followed instructions.",
        },
        {
          label: "Identify the core LP alignment",
          detail: "Read through the target company's principles and identify which 1-2 principles your story most naturally demonstrates. Then identify 2-3 secondary principles you could pivot to if needed. Write down the specific LP language that matches your experience.",
        },
        {
          label: "Draft the Situation and Task",
          detail: "Write 2-3 sentences of context: the business problem, the stakes, and why it mattered. Then clearly state YOUR specific task or responsibility (not the team's). The situation should make the interviewer understand why this was hard and why it mattered.",
        },
        {
          label: "Detail your Actions with LP-specific emphasis",
          detail: "Describe what YOU specifically did, step by step. This is the longest section and where most candidates fall short. Use 'I' not 'we.' Include the reasoning behind your decisions, the trade-offs you considered, and how your actions connect to the target LP. If demonstrating Dive Deep, emphasize the data and details. If demonstrating Bias for Action, emphasize speed and decisiveness.",
        },
        {
          label: "Quantify the Result and extract the learning",
          detail: "State the measurable outcome: revenue impact, latency reduction, team velocity improvement, customer satisfaction score change. Then articulate what you learned and what you would do differently. This final reflection is what separates a good answer from a great one and directly addresses growth mindset evaluation.",
        },
        {
          label: "Pressure-test with follow-up questions",
          detail: "Rehearse answers to common follow-ups: 'What would you do differently?' 'How did you get buy-in from stakeholders?' 'What was the biggest risk?' 'How did you handle disagreement?' If any follow-up exposes a gap in your story, either deepen that part of the narrative or choose a different experience.",
        },
      ],
    },
  ],
  followUps: [
    "STAR Method and Behavioral Interview Frameworks",
    "System Design Interview Preparation and Evaluation Criteria",
    "Negotiation Strategies After Receiving a Big Tech Offer",
    "Engineering Career Ladders and Level Expectations at FAANG Companies",
  ],
};

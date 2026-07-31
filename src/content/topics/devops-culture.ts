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

  deepDive: [
    "**Organizational transformation** toward DevOps is not simply a technology shift -- it is a *fundamental reimagining* of how teams collaborate, communicate, and deliver value. Companies like **Netflix** pioneered the *\"you build it, you run it\"* model, giving development teams full ownership of their services in production. **Etsy** famously moved from bi-weekly deployments fraught with outages to deploying `50+ times per day` by investing in psychological safety, automated canary analysis, and *feature flags*. **Google's SRE** (Site Reliability Engineering) codified the cultural shift with `error budgets` -- a contractual agreement between product and reliability teams that *quantifies acceptable risk*. In every case, **leadership sponsorship** was the critical enabler; transformation stalled when executives treated DevOps as a grassroots-only initiative. Overcoming resistance requires identifying *change champions* in both Dev and Ops, demonstrating early wins (such as reducing a painful manual deployment to a single `git push`), and aligning incentives so that **shared metrics** replace team-specific KPIs.",
    "Advanced **CALMS implementation** goes beyond checkbox adoption into *measurable, data-driven practices*. **Culture** can be assessed through periodic *DevOps culture surveys* (e.g., Westrum organizational typology: pathological, bureaucratic, or generative) that measure information flow, cooperation, and trust. **Automation maturity models** progress from `Level 0` (fully manual) through `Level 3` (self-healing infrastructure with *auto-remediation* runbooks). **Lean** value stream metrics include `process time vs. wait time ratio`, *percent complete and accurate* (%C&A) at each handoff, and `cycle efficiency` -- the ratio of value-adding time to total lead time. Typical enterprises discover that **only 15-20%** of their delivery pipeline is *value-adding work*; the rest is waiting, handoffs, and rework. **Sharing** can be formalized through *knowledge graphs* that map expertise to people, internal `tech radar` documents (inspired by ThoughtWorks), cross-team *guilds and communities of practice*, and **open postmortem databases** that make incident learnings searchable and discoverable across the organization.",
    "Understanding **anti-patterns and failure modes** is essential for avoiding *cargo cult DevOps* -- adopting the superficial trappings of DevOps (tools, job titles, rituals) without the underlying cultural shift. The most common anti-pattern is the **tooling-first approach**: purchasing a CI/CD platform, declaring *\"we do DevOps now,\"* and wondering why deployments are still painful. Another frequent failure is **rebadging** -- renaming the Ops team to *\"DevOps team\"* without changing reporting structures, shared responsibilities, or incentive models. This creates a `DevOps silo`, which is the exact opposite of the intended outcome. The **\"wall of confusion\"** persists when teams adopt `Jira boards` and `standups` as ceremony without genuine *cross-functional collaboration*. Organizations also fail when they treat DevOps as a *destination rather than a journey* -- declaring victory after implementing CI/CD while ignoring feedback loops, measurement, and continuous improvement. The antidote is relentless focus on **outcomes over outputs**: measuring *customer impact* and *system reliability* rather than lines of code or number of deployments.",
  ],

  code: [
    {
      language: "cpp",
      caption: "DORA metrics collector -- aggregates deployment frequency, lead time, change failure rate, and MTTR from Git and incident data",
      source: `// DORA Metrics Collector -- aggregates the four key DevOps metrics.

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <cstdio>
#include <iomanip>
#include <numeric>

struct DORAMetrics {
    double deployment_frequency;   // deploys per day
    double lead_time_hours;        // commit to production (hours)
    double change_failure_rate;    // percentage of failed deployments
    double mttr_hours;             // mean time to recovery (hours)

    std::string performance_level() const {
        if (deployment_frequency >= 1.0 &&
            lead_time_hours < 24.0 &&
            change_failure_rate < 0.05 &&
            mttr_hours < 1.0)
            return "Elite";
        if (deployment_frequency >= 0.14 &&  // weekly
            lead_time_hours < 168.0 &&
            change_failure_rate < 0.15 &&
            mttr_hours < 24.0)
            return "High";
        if (change_failure_rate < 0.30 && mttr_hours < 168.0)
            return "Medium";
        return "Low";
    }
};

// Run a shell command and capture stdout
std::string exec_command(const std::string& cmd) {
    std::string result;
    FILE* pipe = popen(cmd.c_str(), "r");
    if (!pipe) return result;
    char buffer[256];
    while (fgets(buffer, sizeof(buffer), pipe))
        result += buffer;
    pclose(pipe);
    return result;
}

// Count lines in a string
int count_lines(const std::string& s) {
    if (s.empty()) return 0;
    int count = 0;
    for (char c : s) if (c == '\\n') ++count;
    return count;
}

double get_deployment_frequency(int days = 30) {
    // Count production deployments from git tags matching 'release-*'
    std::string cmd =
        "git tag -l 'release-*' --sort=-creatordate"
        " --after='" + std::to_string(days) + " days ago'";
    std::string output = exec_command(cmd);
    int deploy_count = count_lines(output);
    return static_cast<double>(deploy_count) / days;
}

double get_lead_time(int last_n = 20) {
    // Average hours from first commit to merge
    std::string cmd =
        "git log --merges -" + std::to_string(last_n) +
        " --format='%H %aI'";
    std::string output = exec_command(cmd);

    std::vector<double> lead_times;
    std::istringstream stream(output);
    std::string line;
    while (std::getline(stream, line)) {
        if (line.empty()) continue;
        auto space = line.find(' ');
        std::string sha = line.substr(0, space);
        // Get the first commit date in the merge
        std::string sub_cmd =
            "git log " + sha + "^.." + sha +
            " --format=%aI --reverse | head -1";
        std::string first_date = exec_command(sub_cmd);
        // Simplified: compute difference via date command
        std::string diff_cmd =
            "echo $(( $(date -d '" + line.substr(space + 1) +
            "' +%s) - $(date -d '" + first_date + "' +%s) ))";
        std::string diff_s = exec_command(diff_cmd);
        if (!diff_s.empty())
            lead_times.push_back(std::stod(diff_s) / 3600.0);
    }
    if (lead_times.empty()) return 0.0;
    double sum = std::accumulate(lead_times.begin(), lead_times.end(), 0.0);
    return sum / lead_times.size();
}

DORAMetrics collect_dora_metrics() {
    return DORAMetrics{
        get_deployment_frequency(),
        get_lead_time(),
        0.0,   // integrate with incident tracker
        0.0    // integrate with alerting system
    };
}

int main() {
    auto m = collect_dora_metrics();
    std::cout << std::fixed;
    std::cout << "Deployment Frequency: " << std::setprecision(2)
              << m.deployment_frequency << "/day\\n";
    std::cout << "Lead Time:            " << std::setprecision(1)
              << m.lead_time_hours << " hours\\n";
    std::cout << "Change Failure Rate:  " << std::setprecision(1)
              << (m.change_failure_rate * 100) << "%\\n";
    std::cout << "MTTR:                 " << std::setprecision(1)
              << m.mttr_hours << " hours\\n";
    std::cout << "Performance Level:    " << m.performance_level() << "\\n";
    return 0;
}`,
    },
    {
      language: "yaml",
      caption: "Blameless postmortem template -- structured YAML format for consistent incident review and organizational learning",
      source: `# Blameless Postmortem Template
# Fill in within 48 hours of incident resolution

postmortem:
  title: "Brief descriptive title of the incident"
  date: "YYYY-MM-DD"
  severity: "SEV-1 | SEV-2 | SEV-3 | SEV-4"
  duration: "e.g., 2h 15m"
  authors:
    - name: "Incident Commander"
      role: "IC"
    - name: "Primary Responder"
      role: "Responder"

  # Impact -- quantify user and business impact
  impact:
    users_affected: 0
    revenue_impact: "$0"
    sla_violated: false
    description: |
      Describe the user-visible impact clearly.
      e.g., "Checkout flow returned 500 errors for 12% of users"

  # Timeline -- factual, no blame, use UTC timestamps
  timeline:
    - time: "14:00 UTC"
      event: "Deployment of commit abc123 to production"
    - time: "14:05 UTC"
      event: "Error rate alert fires in PagerDuty"
    - time: "14:08 UTC"
      event: "On-call engineer acknowledges and begins investigation"
    - time: "14:22 UTC"
      event: "Root cause identified -- database connection pool exhausted"
    - time: "14:25 UTC"
      event: "Rollback initiated via CI/CD pipeline"
    - time: "14:30 UTC"
      event: "Service restored, error rates return to baseline"

  # Root Cause -- use 5 Whys or Fishbone, focus on SYSTEMS
  root_cause:
    summary: |
      The deployment introduced a query that held connections
      longer than the pool timeout, exhausting available connections
      under load.
    five_whys:
      - why: "Why did the service return 500 errors?"
        answer: "Database connection pool was exhausted"
      - why: "Why was the pool exhausted?"
        answer: "New query held connections 10x longer than expected"
      - why: "Why was the slow query not caught?"
        answer: "Load testing did not cover the affected endpoint"
      - why: "Why was that endpoint excluded from load tests?"
        answer: "No process to update load test scenarios for new features"
      - why: "Why is there no process?"
        answer: "Load test coverage is not part of the definition of done"

  # What went well -- celebrate what worked
  went_well:
    - "Alert fired within 5 minutes of degradation"
    - "Rollback completed in under 10 minutes"
    - "Clear runbook for database connection issues"

  # Action items -- each must have an owner and due date
  action_items:
    - action: "Add load test scenarios to definition of done checklist"
      owner: "Tech Lead"
      due: "YYYY-MM-DD"
      priority: "P1"
      ticket: "JIRA-1234"
    - action: "Add connection pool utilization to Grafana dashboard"
      owner: "SRE Team"
      due: "YYYY-MM-DD"
      priority: "P2"
      ticket: "JIRA-1235"
    - action: "Implement query timeout safeguards in ORM layer"
      owner: "Platform Team"
      due: "YYYY-MM-DD"
      priority: "P1"
      ticket: "JIRA-1236"

  # Lessons learned -- shared broadly for organizational learning
  lessons_learned:
    - "Connection pool metrics should be a standard SLI"
    - "Load test coverage must evolve with new feature development"
    - "Fast rollback capability significantly limited blast radius"`,
    },
    {
      language: "yaml",
      caption: "Value stream mapping configuration -- defines pipeline stages with process time, wait time, and percent complete/accurate for identifying waste",
      source: `# Value Stream Mapping Configuration
# Maps the delivery pipeline from idea to production

value_stream:
  name: "Feature Delivery Pipeline"
  target_lead_time: "5 days"
  current_lead_time: "23 days"

  stages:
    - name: "Product Backlog"
      type: "queue"
      avg_wait_time: "5 days"
      process_time: "0 days"
      pct_complete_accurate: 100  # % items ready for next stage

    - name: "Development"
      type: "process"
      avg_wait_time: "1 day"
      process_time: "3 days"
      pct_complete_accurate: 70   # 30% require rework after review
      bottleneck: false

    - name: "Code Review"
      type: "process"
      avg_wait_time: "2 days"     # BOTTLENECK: waiting for reviewers
      process_time: "0.5 days"
      pct_complete_accurate: 85
      bottleneck: true

    - name: "QA Testing"
      type: "process"
      avg_wait_time: "3 days"     # BOTTLENECK: manual test queue
      process_time: "2 days"
      pct_complete_accurate: 60   # 40% bounce back for defects
      bottleneck: true

    - name: "Staging Deploy"
      type: "process"
      avg_wait_time: "1 day"
      process_time: "0.5 days"
      pct_complete_accurate: 90
      bottleneck: false

    - name: "Change Approval"
      type: "queue"
      avg_wait_time: "3 days"     # BOTTLENECK: CAB meets weekly
      process_time: "0.25 days"
      pct_complete_accurate: 95
      bottleneck: true

    - name: "Production Deploy"
      type: "process"
      avg_wait_time: "0.5 days"
      process_time: "0.25 days"
      pct_complete_accurate: 95
      bottleneck: false

  # Calculated metrics
  metrics:
    total_process_time: "6.5 days"
    total_wait_time: "15.5 days"
    cycle_efficiency: "29.5%"     # process_time / total_lead_time
    target_efficiency: "70%"

  # Improvement opportunities identified
  improvements:
    - stage: "Code Review"
      action: "Implement PR size limits and auto-assign reviewers"
      expected_reduction: "1.5 days"
    - stage: "QA Testing"
      action: "Shift-left with automated test suite, reduce manual QA"
      expected_reduction: "3 days"
    - stage: "Change Approval"
      action: "Replace weekly CAB with automated policy-as-code gates"
      expected_reduction: "2.5 days"`,
    },
  ],

  diagrams: [
    {
      title: "CALMS Framework Mindmap",
      kind: "mindmap",
      caption: "The five pillars of the CALMS framework with key practices and metrics under each pillar",
      mermaid: `mindmap
  root((CALMS Framework))
    Culture
      Shared Ownership
      Blameless Postmortems
      Psychological Safety
      Cross-functional Teams
      Westrum Typology Assessment
    Automation
      CI/CD Pipelines
      Infrastructure as Code
      Automated Testing
      Self-healing Systems
      ChatOps
    Lean
      Value Stream Mapping
      WIP Limits
      Small Batch Sizes
      Eliminate Waste
      Cycle Efficiency
    Measurement
      DORA Metrics
      Error Budgets
      SLIs / SLOs / SLAs
      Deployment Frequency
      Lead Time & MTTR
    Sharing
      Runbooks & Docs
      Tech Talks
      Communities of Practice
      Open Postmortem DB
      Internal Tech Radar`,
    },
    {
      title: "The Three Ways of DevOps -- Flow Diagram",
      kind: "flow",
      caption: "Visualizing the First Way (flow), Second Way (feedback), and Third Way (continuous learning) as an integrated system",
      mermaid: `flowchart LR
    subgraph FirstWay["The First Way: Flow →"]
        direction LR
        A[Plan] --> B[Code]
        B --> C[Build]
        C --> D[Test]
        D --> E[Release]
        E --> F[Deploy]
        F --> G[Operate]
        G --> H[Monitor]
    end

    subgraph SecondWay["The Second Way: ← Feedback"]
        direction RL
        H -->|Alerts & Metrics| I{Issue Detected?}
        I -->|Yes| J[Fast Rollback]
        I -->|No| K[Continue]
        J --> L[Root Cause Analysis]
        L --> A
    end

    subgraph ThirdWay["The Third Way: Continuous Learning"]
        direction TB
        M[Blameless Postmortems]
        N[Chaos Engineering]
        O[Game Days]
        P[Innovation Time]
        Q[Experimentation]
    end

    L --> M
    M --> N
    N --> O
    O --> P
    P --> Q
    Q -->|Improve| A`,
    },
    {
      title: "DORA Metrics Performance Quadrant",
      kind: "architecture",
      caption: "DORA performance levels mapped across the four key metrics -- deployment frequency, lead time, change failure rate, and MTTR",
      mermaid: `block-beta
    columns 5
    block:header:5
        columns 5
        h1["Metric"]
        h2["Elite"]
        h3["High"]
        h4["Medium"]
        h5["Low"]
    end
    block:row1:5
        columns 5
        r1c1["Deploy Frequency"]
        r1c2["On demand\n(multiple/day)"]
        r1c3["Weekly to\nMonthly"]
        r1c4["Monthly to\nBi-annually"]
        r1c5["Fewer than once\nper 6 months"]
    end
    block:row2:5
        columns 5
        r2c1["Lead Time"]
        r2c2["Less than\n1 hour"]
        r2c3["1 day to\n1 week"]
        r2c4["1 week to\n1 month"]
        r2c5["1 month to\n6 months"]
    end
    block:row3:5
        columns 5
        r3c1["Change Fail Rate"]
        r3c2["0-5%"]
        r3c3["5-15%"]
        r3c4["15-30%"]
        r3c5["30%+"]
    end
    block:row4:5
        columns 5
        r4c1["MTTR"]
        r4c2["Less than\n1 hour"]
        r4c3["Less than\n1 day"]
        r4c4["Less than\n1 week"]
        r4c5["More than\n1 week"]
    end`,
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "Level 1 - Initial",
      "Level 2 - Managed",
      "Level 3 - Defined",
      "Level 4 - Measured",
      "Level 5 - Optimized",
    ],
    rows: [
      [
        "**Deployment Process**",
        "Manual, *ad hoc* deployments with no standard procedure",
        "Scripted deployments with some `automation`",
        "Fully automated **CI/CD pipelines** with *standardized* stages",
        "Deployments tracked with `DORA metrics` and **SLO compliance**",
        "*Self-service* deployments with **progressive delivery** and `canary analysis`",
      ],
      [
        "**Collaboration**",
        "Dev and Ops work in *isolated silos* with **handoff-based** workflow",
        "Some *cross-functional* meetings but separate reporting lines",
        "**Shared ownership** of services with *embedded* Ops in dev teams",
        "Collaboration effectiveness *measured* via `surveys` and **feedback loops**",
        "Fully *integrated* teams with **rotating roles** and `T-shaped` skills",
      ],
      [
        "**Incident Management**",
        "*Blame-oriented* post-incident finger-pointing",
        "Basic incident reports written but **rarely reviewed**",
        "**Blameless postmortems** conducted with *structured templates*",
        "Incident trends `measured`, action item completion **tracked**",
        "*Proactive* chaos engineering and **game days** to prevent incidents",
      ],
      [
        "**Testing Strategy**",
        "Manual testing *after* development is **complete**",
        "Some `unit tests` with manual *regression testing*",
        "**Automated test pyramid** with `unit`, *integration*, and `e2e` tests",
        "Test coverage and *flakiness* `measured` and **optimized**",
        "*Continuous testing* in production with **observability-driven** validation",
      ],
      [
        "**Feedback Loops**",
        "Feedback takes *weeks or months* through **formal channels**",
        "`Monitoring` in place but *alerts are noisy* and often ignored",
        "**Real-time dashboards** with *actionable alerts* and `SLIs`",
        "Feedback loop duration `measured`, *MTTR tracked* and **optimized**",
        "*Sub-minute* detection with **automated remediation** and `self-healing`",
      ],
      [
        "**Knowledge Sharing**",
        "Knowledge *trapped in individuals* with **no documentation**",
        "Basic `wiki` pages, *infrequently updated*",
        "**Internal tech talks**, *runbooks*, and `communities of practice`",
        "Knowledge sharing *effectiveness measured* via `discovery metrics`",
        "*AI-assisted* knowledge graphs with **automated doc generation**",
      ],
    ],
  },

  exercises: [
    "**Blameless Postmortem Simulation**: Take a real or hypothetical production incident (e.g., a database connection pool exhaustion during a deployment). Write a complete blameless postmortem using the *5 Whys* technique. Focus on `systemic causes` -- for each 'why,' ensure the answer points to a **process, tool, or system gap** rather than an individual's action. Include a timeline, impact assessment, *what went well*, and **action items with owners and due dates**. Practice facilitating the postmortem with a peer, redirecting any *blame language* toward systems thinking.",
    "**Value Stream Mapping Exercise**: Map your team's current delivery pipeline from *feature request to production deployment*. For each stage, record the `process time` (hands-on-keyboard work) and `wait time` (queues, approvals, handoffs). Calculate **cycle efficiency** as `process_time / total_lead_time`. Identify the *top three bottlenecks* and propose specific improvements for each. Typical targets: eliminate **CAB approval queues** with policy-as-code, reduce *code review wait time* with PR size limits and auto-assignment, and shift-left testing to reduce `QA queue` delays.",
    "**DORA Metrics Baseline Assessment**: Instrument your team's delivery pipeline to collect the *four DORA metrics*: `deployment frequency`, `lead time for changes`, `change failure rate`, and `MTTR`. Classify your team's current performance level (**Elite, High, Medium, or Low**) for each metric. Create a *90-day improvement plan* targeting one metric at a time -- for example, improving deployment frequency by reducing `batch sizes` and automating the **release process**. Track progress weekly and adjust experiments based on results.",
    "**Culture Assessment with Westrum Typology**: Survey your team using the *Westrum organizational culture model* to determine if your culture is `pathological` (power-oriented), `bureaucratic` (rule-oriented), or **generative** (performance-oriented). Ask questions about *information flow*, cooperation, responsibility sharing, and how **failures are treated**. Compare results across teams and identify specific interventions -- such as introducing `blameless postmortems`, creating *cross-functional guilds*, or establishing **error budgets** -- to shift toward a generative culture.",
    "**Chaos Engineering Game Day**: Design and execute a *controlled failure injection exercise* for a non-production environment. Plan a scenario (e.g., simulate a `dependency timeout`, kill a **critical service instance**, or inject `network latency`). Document your *hypothesis* (\"We believe the system will gracefully degrade and alert within 5 minutes\"), execute the experiment, observe the actual behavior, and compare it to your hypothesis. Write up **findings and action items** to improve resilience. Graduate to production experiments using `feature flags` and *blast radius controls*.",
  ],

  cheatSheet: [
    "**CALMS pillars**: *Culture* (shared ownership), *Automation* (CI/CD, IaC), *Lean* (eliminate waste), *Measurement* (DORA metrics), *Sharing* (knowledge dissemination) -- assess each on a `1-5 scale` for a quick maturity snapshot.",
    "**Three Ways**: 1st = *Flow* (fast left-to-right delivery via small batches and `CI/CD`), 2nd = *Feedback* (fast right-to-left loops via `monitoring` and alerting), 3rd = *Continuous Learning* (blameless postmortems, **chaos engineering**, innovation time).",
    "**DORA metrics quick reference**: `Deployment frequency` (how often), `Lead time` (commit to prod), `Change failure rate` (% of deploys causing incidents), `MTTR` (time to restore) -- **Elite** teams: *multiple deploys/day*, *<1hr lead time*, *<5% failure*, *<1hr MTTR*.",
    "**Blameless postmortem checklist**: Conduct within `48 hours` -- build *factual timeline*, apply **5 Whys** to find systemic root causes, document *what went well*, create **action items** with owners/dates/tickets, share broadly for *organizational learning*.",
    "**Westrum culture types**: `Pathological` = power-oriented, information is hoarded, failures are punished; `Bureaucratic` = rule-oriented, modest cooperation; **Generative** = *performance-oriented*, information flows freely, failures drive inquiry.",
    "**Value stream efficiency formula**: `Cycle Efficiency = Process Time / Total Lead Time`. Typical enterprise starts at **15-25%** -- most time is *waiting, not working*. Target **>40%** by eliminating manual approvals, reducing `WIP limits`, and automating handoffs.",
  ],

  revisionNotes: [
    "The **CALMS framework** is the go-to mental model for DevOps maturity assessment. Remember that *Culture comes first* -- tooling and automation without cultural change leads to `cargo cult DevOps`. Each pillar should be independently assessed: a team can be **strong in Automation** but weak in *Sharing* if knowledge remains siloed in individuals' heads.",
    "**DORA metrics** are the industry-standard measure of software delivery performance. The key insight is that *speed and stability are NOT trade-offs* -- **elite teams achieve both** by deploying smaller changes more frequently, which are easier to test, review, and roll back. When asked about DevOps measurement in interviews, always reference DORA and the `Accelerate` book by *Nicole Forsgren, Jez Humble, and Gene Kim*.",
    "**Blameless postmortems** are essential for building *psychological safety* and enabling honest incident analysis. The *5 Whys* technique is fundamental -- each answer must point to a **system or process gap**, never an individual. Remember Google's **Project Aristotle** finding: `psychological safety` is the *strongest predictor* of team effectiveness, more important than individual talent or team composition.",
    "The **Three Ways** from *The Phoenix Project* (Gene Kim) provide the architectural philosophy of DevOps: `Flow` (optimize the pipeline), `Feedback` (shorten detection loops), and `Continuous Learning` (experiment and improve). In interviews, connect these to concrete practices: **CI/CD** implements Flow, *monitoring and alerting* implements Feedback, and **chaos engineering** implements Continuous Learning.",
    "**Value stream mapping** is a *lean technique* that visualizes the entire delivery pipeline to expose hidden waste. The critical metric is `cycle efficiency` -- the ratio of value-adding **process time** to total lead time. Most organizations discover that *75-85% of their pipeline time is waste* (waiting for approvals, sitting in queues, manual handoffs). Improving cycle efficiency is often the single highest-leverage DevOps transformation activity.",
  ],
};

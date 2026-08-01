import type { TopicContent } from "../types";

export const chaosEngineering: TopicContent = {
  quickSummary: [
    "Chaos engineering is the discipline of experimenting on a system to build confidence in its ability to withstand turbulent conditions in production.",
    "The process follows a scientific method: define steady state, hypothesize that it will hold during disruption, inject failures, and observe whether the hypothesis holds.",
    "Blast radius control limits the scope of experiments to minimize customer impact, starting with non-production environments and gradually expanding to production.",
    "Tools like Chaos Monkey (random instance termination), Gremlin, and Litmus Chaos provide controlled failure injection across infrastructure and application layers.",
  ],
  detailed: [
    `## The Chaos Engineering Process

Chaos engineering follows a disciplined, scientific approach — not random destruction:

1. **Define steady state**: identify measurable indicators of normal system behavior (e.g., order success rate > 99.9%, p99 latency < 500ms, error rate < 0.1%).

2. **Form a hypothesis**: "When we terminate 1 of 3 API instances, the system will continue serving requests with no increase in error rate and less than 100ms increase in p99 latency."

3. **Design the experiment**: determine what failure to inject, how long, what to measure, and how to abort.

4. **Run the experiment**: inject the failure while monitoring steady-state metrics in real-time.

5. **Analyze results**: did the hypothesis hold? If yes, confidence increases. If no, you found a weakness to fix before it causes a real outage.

6. **Fix and iterate**: address weaknesses, then re-run the experiment to verify the fix.

The goal is not to break things — it is to discover weaknesses before they manifest as unplanned outages.`,

    `## Steady State Hypothesis

The steady state hypothesis is the foundation of every chaos experiment. It must be:

- **Measurable**: defined by concrete metrics, not subjective assessments.
- **Business-relevant**: tied to user-facing outcomes, not internal system metrics.
- **Observable in real-time**: monitored during the experiment to enable quick abort.

Examples of steady state definitions:

| System | Steady State Metric | Acceptable Range |
|--------|-------------------|------------------|
| E-commerce | Order completion rate | > 99.9% |
| Search engine | Query success rate | > 99.95% |
| Payment service | Transaction success rate | > 99.99% |
| API gateway | p99 latency | < 200ms |

If you cannot define steady state, you are not ready for chaos engineering — you have a more fundamental observability problem to solve first.`,

    `## Blast Radius Control

Blast radius is the potential impact of an experiment on users and systems:

**Progression of blast radius**:
1. **Development/staging**: validate experiment design with no customer impact.
2. **Canary production**: affect a small percentage of production traffic (e.g., 1%).
3. **Single availability zone**: test AZ failure resilience.
4. **Full production**: wide-scale experiments once confidence is high.

**Safety controls**:
- **Abort conditions**: automatically stop the experiment if steady-state metrics breach thresholds.
- **Duration limits**: bound experiment time (e.g., maximum 30 minutes).
- **Rollback mechanism**: one-click or automatic reversal of injected failures.
- **Communication**: notify the team before experiments; never run them during change freezes.
- **Audience targeting**: exclude VIP customers or critical business flows from initial experiments.

The principle: minimize the blast radius needed to learn. If you can learn from staging, do not test in production. If you can learn from 1% of traffic, do not affect 100%.`,

    `## Types of Chaos Experiments

**Infrastructure failures**:
- Instance/pod termination (Chaos Monkey).
- Availability zone outage simulation.
- Disk fill / I/O errors.
- Network partition between services.
- DNS resolution failures.

**Application failures**:
- Latency injection (add artificial delay to responses).
- Error injection (force specific error codes).
- Resource exhaustion (CPU stress, memory pressure).
- Dependency unavailability.

**Operational failures**:
- Certificate expiration.
- Configuration change (wrong config pushed).
- Deployment failure (bad version deployed).

**GameDay**: a structured team exercise where a realistic outage scenario is simulated and the team practices incident response. Combines chaos engineering with process validation. Typically runs for 2-4 hours with a facilitator, pre-planned scenario, and post-exercise review.`,

    `## Tools and Organizational Adoption

**Tools**:
- **Chaos Monkey** (Netflix): randomly terminates EC2 instances in production. Part of the Simian Army.
- **Gremlin**: SaaS platform for controlled failure injection across infrastructure, network, and application layers.
- **Litmus Chaos**: Kubernetes-native chaos engineering framework with a catalog of pre-built experiments.
- **Toxiproxy** (Shopify): TCP proxy for simulating network conditions (latency, jitter, bandwidth limits).
- **AWS Fault Injection Simulator**: managed service for running chaos experiments on AWS infrastructure.

**Adoption path**:
1. Start with **tabletop exercises**: discuss failure scenarios without actually injecting faults.
2. Run experiments in **staging** to build confidence and tooling.
3. Begin **automated chaos in production** on a schedule (weekly Chaos Monkey).
4. Integrate into **CI/CD**: run chaos tests as part of the deployment pipeline.
5. Build a **chaos engineering culture**: engineers propose experiments, results are shared broadly.

Prerequisites: solid observability (metrics, logs, traces), on-call processes, and incident response playbooks. Chaos engineering without observability is just breaking things.`,
  ],
  interviewQA: [
    {
      q: "What is the difference between chaos engineering and simply breaking things in production?",
      a: "Chaos engineering follows a scientific method: define steady-state metrics, form a specific hypothesis about system behavior under failure, design a controlled experiment with blast radius limits and abort conditions, and analyze results to learn. Simply breaking things has no hypothesis, no controls, no systematic learning. Chaos engineering is also progressive — you start in staging, then canary, then broader production. The goal is building confidence in resilience, not causing outages.",
    },
    {
      q: "What prerequisites should be in place before starting chaos engineering?",
      a: "First, solid observability: you need metrics, logs, and traces to define steady state and monitor experiments in real-time. Second, defined steady-state metrics tied to business outcomes. Third, incident response processes: on-call rotation, escalation paths, and runbooks. Fourth, the ability to quickly abort experiments and roll back failures. Without these, chaos engineering is reckless — you are injecting failures with no way to detect, understand, or stop their impact.",
    },
    {
      q: "How would you introduce chaos engineering to an organization that has never done it?",
      a: "Start with tabletop exercises: discuss 'what would happen if X failed?' without injecting anything. This builds awareness and reveals assumptions. Next, run experiments in staging to validate tooling and build team confidence. Then graduate to production with small blast radius (one instance, one AZ). Share results transparently — both successes and discovered weaknesses. Automate recurring experiments (e.g., weekly instance termination). Finally, integrate into the deployment pipeline: verify that new releases survive standard failure scenarios before reaching production.",
    },
    {
      q: "What is a GameDay and how does it differ from automated chaos experiments?",
      a: "A GameDay is a structured team exercise lasting 2-4 hours where a realistic outage scenario is simulated and the team practices full incident response: detection, communication, diagnosis, mitigation, and post-incident review. Unlike automated chaos experiments that test system resilience, GameDays also test human processes: do alerts fire? Does the on-call respond correctly? Are runbooks accurate? GameDays typically have a facilitator, a pre-planned scenario (unknown to participants), and a debrief session.",
    },
  ],
  mcqs: [
    {
      q: "What is the first step in a chaos engineering experiment?",
      options: [
        "Inject a random failure into production",
        "Define steady state behavior with measurable metrics",
        "Install chaos engineering tools",
        "Get management approval",
      ],
      answerIndex: 1,
      explanation:
        "The scientific method requires defining what 'normal' looks like before you can test whether the system maintains normality under disruption. Without steady-state metrics, you cannot evaluate experiment results.",
    },
    {
      q: "What is blast radius in chaos engineering?",
      options: [
        "The amount of data destroyed in an experiment",
        "The potential scope of impact on users and systems from an experiment",
        "The network range affected by a partition test",
        "The number of services involved in the experiment",
      ],
      answerIndex: 1,
      explanation:
        "Blast radius refers to how many users, services, or systems could be affected by a chaos experiment. Controlling blast radius is essential for minimizing customer impact while still learning.",
    },
    {
      q: "Which tool is specifically designed for simulating network conditions like latency and bandwidth limits?",
      options: [
        "Chaos Monkey",
        "Gremlin",
        "Toxiproxy",
        "Litmus Chaos",
      ],
      answerIndex: 2,
      explanation:
        "Toxiproxy by Shopify is a TCP proxy that sits between services and simulates adverse network conditions including latency, jitter, bandwidth limits, and connection resets.",
    },
    {
      q: "What is the key difference between a GameDay and automated chaos experiments?",
      options: [
        "GameDays only run in staging",
        "GameDays test human processes and incident response in addition to system resilience",
        "GameDays do not inject real failures",
        "GameDays are shorter than automated experiments",
      ],
      answerIndex: 1,
      explanation:
        "GameDays are structured exercises that test both system resilience and human incident response: detection, communication, diagnosis, and mitigation. Automated chaos experiments primarily test system behavior.",
    },
  ],
  flashcards: [
    {
      front: "What are the five steps of a chaos experiment?",
      back: "1) Define steady state metrics, 2) Form a hypothesis, 3) Design the experiment, 4) Run and observe, 5) Analyze results and fix weaknesses.",
    },
    {
      front: "What is a steady state hypothesis?",
      back: "A measurable, business-relevant statement about normal system behavior that the experiment tests. Example: 'Order completion rate stays above 99.9% when one API instance is terminated.'",
    },
    {
      front: "What is blast radius?",
      back: "The potential scope of impact from a chaos experiment. Controlled by progressing from staging to canary to production, with abort conditions and duration limits.",
    },
    {
      front: "What is Chaos Monkey?",
      back: "A Netflix tool that randomly terminates EC2 instances in production to ensure services can tolerate instance failures. Part of the broader Simian Army toolkit.",
    },
    {
      front: "What is a GameDay?",
      back: "A structured 2-4 hour exercise simulating a realistic outage scenario. Tests both system resilience and human incident response processes including detection, communication, and mitigation.",
    },
    {
      front: "What prerequisites are needed before chaos engineering?",
      back: "Observability (metrics, logs, traces), defined steady-state metrics, incident response processes, and the ability to quickly abort experiments and roll back injected failures.",
    },
    {
      front: "Name four chaos engineering tools.",
      back: "Chaos Monkey (Netflix, instance termination), Gremlin (SaaS platform), Litmus Chaos (Kubernetes-native), Toxiproxy (network conditions), AWS Fault Injection Simulator.",
    },
  ],
  glossary: [
    {
      term: "Chaos Engineering",
      definition:
        "The discipline of experimenting on a system in a controlled way to build confidence in its ability to withstand failures and turbulent conditions.",
    },
    {
      term: "Steady State",
      definition:
        "The measurable, normal operating behavior of a system, defined by business-relevant metrics that are monitored during chaos experiments.",
    },
    {
      term: "Blast Radius",
      definition:
        "The potential scope of impact on users and systems from a chaos experiment, controlled through progressive rollout and abort conditions.",
    },
    {
      term: "GameDay",
      definition:
        "A structured team exercise simulating a realistic outage to practice and validate both system resilience and human incident response processes.",
    },
    {
      term: "Chaos Monkey",
      definition:
        "A Netflix tool that randomly terminates production instances to ensure services are resilient to individual instance failures.",
    },
    {
      term: "Fault Injection",
      definition:
        "Deliberately introducing failures (latency, errors, resource exhaustion) into a system to test its behavior under adverse conditions.",
    },
    {
      term: "Abort Condition",
      definition:
        "A predefined threshold that triggers automatic termination of a chaos experiment when steady-state metrics breach acceptable limits.",
    },
  ],
  deepDive: [
    `## Netflix's Chaos Engineering Journey

**Netflix** pioneered chaos engineering out of necessity. When they migrated from monolithic data centers to *AWS* in 2011, they needed confidence that their **microservices architecture** could survive the inherent unreliability of cloud infrastructure. The first tool was **Chaos Monkey**, which randomly terminated \`EC2 instances\` during business hours, forcing every service team to build *instance-failure resilience* into their architecture. This evolved into the **Simian Army**: *Latency Monkey* (injecting artificial delays), *Conformity Monkey* (detecting non-compliant instances), *Doctor Monkey* (health checks), *Janitor Monkey* (cleanup), and **Chaos Gorilla** (simulating entire *availability zone* outages). The key insight was that running these experiments **continuously in production** -- not just in staging -- was essential because production environments have emergent behaviors that cannot be replicated. Netflix's \`ChAP\` (Chaos Automation Platform) later formalized the scientific method: defining **steady-state hypotheses**, automating experiment execution, and correlating results with business metrics like *stream starts per second* (SPS). Their approach proved that systems designed to tolerate chaos in normal operations gracefully handle *real failures* -- Netflix famously survived multiple AWS outages that took down other major services. The cultural shift was equally important: engineers began to **expect** failures rather than treat them as exceptional events, fundamentally changing how they designed and operated systems.`,

    `## Advanced Experiment Design

Beyond simple instance termination, mature chaos engineering programs tackle **multi-variable experiments** and *cascading failure scenarios*. A **cascading failure test** might simulate a database becoming slow (not unavailable), causing connection pool exhaustion in the calling service, which triggers *retry storms* that overwhelm other services -- a realistic scenario that single-component tests miss entirely. Testing **stateful systems** requires special care: injecting chaos into \`databases\` (simulating replication lag, leader failover, disk corruption) or *message queues* (consumer lag, partition rebalancing, message loss) can have lasting effects that outlive the experiment window. Advanced teams use **multi-variable experiments** that combine failure types: terminate an instance *while* injecting network latency *while* a deployment is in progress -- because real incidents rarely involve a single failure mode. **Data pipeline chaos** tests whether ETL jobs handle upstream schema changes, partial data loads, and \`out-of-order events\` gracefully. For *distributed systems*, **network partition testing** (using tools like \`tc\` or *Toxiproxy*) is critical: simulating split-brain scenarios between data centers, asymmetric network failures (A can reach B but B cannot reach A), and DNS resolution failures. The key principle is that experiments should be designed around **realistic failure modes** informed by past incidents and architecture analysis, not random destruction.`,

    `## Chaos Engineering Maturity Model

Organizations progress through distinct **maturity levels** in their chaos engineering adoption. At **Level 0** (*Ad-hoc*), teams discuss failure scenarios in *tabletop exercises* but do not inject real faults -- this is the awareness stage. At **Level 1** (*Exploratory*), engineers run manual experiments in staging environments using tools like \`Gremlin\` or *Litmus Chaos*, documenting results but without systematic follow-up. At **Level 2** (*Systematic*), chaos experiments run on a **regular schedule** in production with proper blast radius controls, abort conditions, and postmortem analysis -- this is where most organizations should aim first. At **Level 3** (*Automated*), chaos experiments are integrated into the **CI/CD pipeline**: every deployment must pass a suite of chaos tests (instance failure, latency injection, dependency unavailability) before reaching production. Tools like \`Steadybit\` and *Gremlin's CI integration* enable this. At **Level 4** (*Continuous*), chaos runs **continuously in production** -- not just during business hours or scheduled windows -- and the organization has *automated remediation* that self-heals discovered weaknesses. Building a dedicated **chaos engineering team** (or guild) helps accelerate adoption: they build tooling, define safety standards, coach product teams on experiment design, and maintain the experiment catalog. The team should be *embedded* in engineering (not a separate silo) and its success measured by the number of weaknesses discovered and fixed, not the number of experiments run.`,
  ],
  code: [
    {
      language: "yaml",
      caption: "Litmus Chaos Experiment -- Kubernetes pod kill with steady-state validation",
      source: `# LitmusChaos ChaosEngine for pod-delete experiment
# Targets a specific app deployment and validates steady state
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: api-pod-delete-chaos
  namespace: production
spec:
  appinfo:
    appns: production
    applabel: "app=api-server"
    appkind: deployment
  engineState: active
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        probe:
          # Steady-state validation: HTTP probe checks API health
          - name: api-health-check
            type: httpProbe
            mode: Continuous
            runProperties:
              probeTimeout: 5s
              retry: 3
              interval: 10s
              probePollingInterval: 2s
            httpProbe/inputs:
              url: "http://api-server.production.svc:8080/healthz"
              method:
                get:
                  criteria: "=="
                  responseCode: "200"
          # Validate order success rate stays above threshold
          - name: order-success-rate
            type: promProbe
            mode: Edge
            runProperties:
              probeTimeout: 10s
              retry: 2
              interval: 15s
            promProbe/inputs:
              endpoint: "http://prometheus.monitoring.svc:9090"
              query: >
                sum(rate(orders_completed_total[5m])) /
                sum(rate(orders_attempted_total[5m])) * 100
              comparator:
                type: float
                criteria: ">="
                value: "99.9"
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: "120"          # 2 minutes of chaos
            - name: CHAOS_INTERVAL
              value: "30"           # Kill a pod every 30s
            - name: FORCE
              value: "false"        # Graceful termination
            - name: PODS_AFFECTED_PERC
              value: "50"           # Kill 50% of pods`,
    },
    {
      language: "cpp",
      caption: "Toxiproxy Latency Injection -- programmatic network chaos for integration testing",
      source: `// Toxiproxy latency injection for chaos testing.
// Adds upstream latency to simulate slow database responses.
// Requires libcurl (link with -lcurl).

#include <curl/curl.h>
#include <iostream>
#include <string>
#include <sstream>
#include <thread>
#include <chrono>

const std::string TOXIPROXY_API = "http://localhost:8474";

// Callback for libcurl to capture response body
static size_t writeCallback(char* ptr, size_t size, size_t nmemb, std::string* data) {
    data->append(ptr, size * nmemb);
    return size * nmemb;
}

// Perform an HTTP request; returns HTTP status code and elapsed time in ms
long httpRequest(const std::string& method, const std::string& url,
                 const std::string& body = "", double* elapsedMs = nullptr) {
    CURL* curl = curl_easy_init();
    std::string response;
    long httpCode = 0;

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

    if (method == "POST") {
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
    } else if (method == "DELETE") {
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "DELETE");
    }

    CURLcode res = curl_easy_perform(curl);
    if (res == CURLE_OK) {
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpCode);
        if (elapsedMs) {
            double total = 0;
            curl_easy_getinfo(curl, CURLINFO_TOTAL_TIME, &total);
            *elapsedMs = total * 1000.0;
        }
    } else if (res == CURLE_OPERATION_TIMEDOUT) {
        httpCode = 0;  // Timeout sentinel
    }

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    return httpCode;
}

// Create a Toxiproxy proxy between service and dependency
void createProxy(const std::string& name, const std::string& listen,
                 const std::string& upstream) {
    std::string body = R"({"name":")" + name
        + R"(","listen":")" + listen            // Where the app connects
        + R"(","upstream":")" + upstream         // Actual dependency address
        + R"(","enabled":true})";
    httpRequest("POST", TOXIPROXY_API + "/proxies", body);
    std::cout << "[+] Proxy '" << name << "' created: "
              << listen << " -> " << upstream << std::endl;
}

// Inject latency into the proxy (upstream direction)
void addLatencyToxic(const std::string& proxyName,
                     int latencyMs, int jitterMs = 0) {
    std::string body = R"({"name":"chaos-latency","type":"latency",)"
        R"("stream":"upstream","toxicity":1.0,)"       // 100% of requests affected
        R"("attributes":{"latency":)" + std::to_string(latencyMs)
        + R"(,"jitter":)" + std::to_string(jitterMs) + R"(}})";
    httpRequest("POST", TOXIPROXY_API + "/proxies/" + proxyName + "/toxics", body);
    std::cout << "[+] Added " << latencyMs << "ms latency (jitter="
              << jitterMs << "ms)" << std::endl;
}

// Remove a specific toxic to end the experiment
void removeToxic(const std::string& proxyName, const std::string& toxicName) {
    httpRequest("DELETE", TOXIPROXY_API + "/proxies/" + proxyName + "/toxics/" + toxicName);
    std::cout << "[-] Removed toxic '" << toxicName << "'" << std::endl;
}

// Run a timed latency injection experiment with monitoring
void runChaosExperiment(const std::string& proxyName, int latencyMs,
                        int durationSeconds, const std::string& healthCheckUrl,
                        double thresholdMs = 500.0) {
    std::cout << "=== Chaos Experiment: " << latencyMs << "ms latency for "
              << durationSeconds << "s ===" << std::endl;

    // Baseline health check
    double baselineMs = 0;
    httpRequest("GET", healthCheckUrl, "", &baselineMs);
    std::cout << "Baseline response: " << static_cast<int>(baselineMs)
              << "ms" << std::endl;

    // Inject chaos
    addLatencyToxic(proxyName, latencyMs, 50);

    // Monitor during experiment
    int violations = 0;
    int checks = 0;
    for (int i = 0; i < durationSeconds / 5; ++i) {
        std::this_thread::sleep_for(std::chrono::seconds(5));
        double elapsedMs = 0;
        long code = httpRequest("GET", healthCheckUrl, "", &elapsedMs);
        ++checks;
        if (code == 0) {
            ++violations;
            std::cout << "  Check " << checks << ": TIMEOUT" << std::endl;
        } else {
            const char* status = (elapsedMs < thresholdMs) ? "OK" : "SLOW";
            if (elapsedMs >= thresholdMs) ++violations;
            std::cout << "  Check " << checks << ": "
                      << static_cast<int>(elapsedMs) << "ms ["
                      << status << "]" << std::endl;
        }
    }

    // Remove chaos
    removeToxic(proxyName, "chaos-latency");

    // Report
    std::cout << "\\n=== Results ===" << std::endl;
    std::cout << "Checks: " << checks << ", Violations: " << violations << std::endl;
    std::cout << "Hypothesis " << (violations == 0 ? "HELD" : "FAILED") << std::endl;
}

int main() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    createProxy("postgres-proxy", "0.0.0.0:15432", "postgres:5432");
    runChaosExperiment("postgres-proxy", 200, 60,
                       "http://localhost:8080/api/health");
    curl_global_cleanup();
    return 0;
}`,
    },
    {
      language: "bash",
      caption: "Steady-State Validation Script -- checks system metrics before and during chaos experiments",
      source: `#!/usr/bin/env bash
# Steady-State Validation for Chaos Experiments
# Checks key metrics against defined thresholds via Prometheus

set -euo pipefail

PROMETHEUS_URL="\${PROMETHEUS_URL:-http://prometheus:9090}"
ABORT_ON_FAILURE="\${ABORT_ON_FAILURE:-true}"

# Define steady-state thresholds
declare -A THRESHOLDS=(
  ["error_rate"]="0.1"            # Max 0.1% error rate
  ["p99_latency_ms"]="500"        # Max 500ms p99 latency
  ["success_rate"]="99.9"         # Min 99.9% success rate
  ["cpu_utilization"]="80"        # Max 80% CPU usage
)

query_prometheus() {
  local query="$1"
  curl -s --fail "\${PROMETHEUS_URL}/api/v1/query" \\
    --data-urlencode "query=\${query}" \\
    | jq -r '.data.result[0].value[1] // "N/A"'
}

check_metric() {
  local name="$1" query="$2" threshold="$3" comparison="$4"
  local value
  value=$(query_prometheus "$query")

  if [ "$value" = "N/A" ]; then
    echo "  WARN: $name = N/A (no data)"
    return 1
  fi

  local pass=0
  case "$comparison" in
    "lt") pass=$(echo "$value < $threshold" | bc -l) ;;
    "gt") pass=$(echo "$value > $threshold" | bc -l) ;;
  esac

  if [ "$pass" -eq 1 ]; then
    echo "  PASS: $name = $value ($comparison $threshold)"
    return 0
  else
    echo "  FAIL: $name = $value (expected $comparison $threshold)"
    return 1
  fi
}

validate_steady_state() {
  echo "=== Steady-State Validation ==="
  echo "Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  local failures=0

  check_metric "Error Rate (%)" \\
    'sum(rate(http_requests_total{code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100' \\
    "\${THRESHOLDS[error_rate]}" "lt" || ((failures++))

  check_metric "P99 Latency (ms)" \\
    'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) * 1000' \\
    "\${THRESHOLDS[p99_latency_ms]}" "lt" || ((failures++))

  check_metric "Success Rate (%)" \\
    'sum(rate(http_requests_total{code=~"2.."}[5m])) / sum(rate(http_requests_total[5m])) * 100' \\
    "\${THRESHOLDS[success_rate]}" "gt" || ((failures++))

  check_metric "CPU Utilization (%)" \\
    'avg(rate(container_cpu_usage_seconds_total[5m])) * 100' \\
    "\${THRESHOLDS[cpu_utilization]}" "lt" || ((failures++))

  echo ""
  if [ "$failures" -gt 0 ]; then
    echo "RESULT: $failures steady-state violations detected"
    if [ "$ABORT_ON_FAILURE" = "true" ]; then
      echo "ACTION: Aborting chaos experiment"
      exit 1
    fi
  else
    echo "RESULT: All steady-state metrics within thresholds"
  fi
  return "$failures"
}

# Run validation
validate_steady_state`,
    },
  ],
  diagrams: [
    {
      title: "Chaos Experiment Workflow",
      kind: "flow",
      caption: "The structured workflow for designing, running, and learning from a chaos engineering experiment.",
      mermaid: `flowchart TD
    A["Define Steady State"] --> B["Hypothesize Failure Impact"]
    B --> C["Design Experiment"]
    C --> D{"Production Safe?"}
    D -->|No| E["Run in Staging"]
    D -->|Yes| F["Run in Production with Limits"]
    E --> G["Observe Metrics"]
    F --> G
    G --> H{"Hypothesis Confirmed?"}
    H -->|Yes| I["System is Resilient"]
    H -->|No| J["Identify Weakness"]
    J --> K["Fix and Harden"]
    K --> A`,
    },
    {
      title: "Chaos Experiment Execution",
      kind: "sequence",
      caption: "Sequence of events between the chaos platform, target service, and observability stack during an experiment.",
      mermaid: `sequenceDiagram
    participant Eng as Engineer
    participant CP as Chaos Platform
    participant SUT as System Under Test
    participant Obs as Observability
    Eng->>CP: Define experiment config
    Eng->>Obs: Confirm baseline metrics
    Eng->>CP: Start experiment
    CP->>SUT: Inject fault (latency/error/kill)
    SUT-->>Obs: Degraded metrics emitted
    Obs-->>Eng: Alerts triggered
    Eng->>Obs: Monitor steady-state deviation
    Eng->>CP: Stop experiment
    CP->>SUT: Remove fault injection
    SUT-->>Obs: Recovery metrics
    Eng->>Obs: Analyse results and document`,
    },
    {
      title: "Failure Injection Categories",
      kind: "mindmap",
      caption: "Taxonomy of failure types that can be injected during chaos engineering experiments.",
      mermaid: `mindmap
  root((Chaos Failures))
    Network
      Latency injection
      Packet loss
      Partition
      Bandwidth limit
    Compute
      CPU stress
      Memory pressure
      Process kill
      Disk full
    Dependencies
      Third-party timeout
      DNS failure
      Certificate expiry
    Application
      Exception injection
      Slow response
      Bad data`,
    },
    {
      title: "Chaos Maturity Model",
      kind: "state",
      caption: "Progression through chaos engineering maturity levels from ad-hoc testing to fully automated game days.",
      mermaid: `stateDiagram-v2
    [*] --> Level1
    Level1 : Level 1 - Manual Tests
    Level2 : Level 2 - Staging Chaos
    Level3 : Level 3 - Production Chaos
    Level4 : Level 4 - Continuous Chaos
    Level1 --> Level2 : runbooks and monitoring in place
    Level2 --> Level3 : resilience patterns validated
    Level3 --> Level4 : auto gamedays scheduled
    Level4 --> Level4 : ongoing feedback loop`,
    },
  ],
  comparison: {
    columns: ["Tool", "Type", "Platform", "Experiments", "Ease of Use", "Production Ready"],
    rows: [
      ["**Chaos Monkey**", "*Open source*", "AWS EC2", "Instance termination only", "Simple -- single purpose", "**Yes** -- battle-tested at Netflix"],
      ["**Gremlin**", "*SaaS platform*", "Multi-cloud, VMs, containers", "Infrastructure, network, app, `state`", "**High** -- GUI + API + CLI", "**Yes** -- enterprise features"],
      ["**Litmus Chaos**", "*Open source*", "Kubernetes-native", "Pod, node, network, DNS, `disk`", "Medium -- YAML-based, CRDs", "**Yes** -- CNCF project"],
      ["**Toxiproxy**", "*Open source*", "Any (TCP proxy)", "Network: latency, jitter, bandwidth, *reset*", "**High** -- simple API", "Yes -- proxy-based, low risk"],
      ["**AWS FIS**", "*Managed service*", "AWS only", "EC2, ECS, EKS, RDS, `networking`", "**High** -- console + IaC", "**Yes** -- AWS-native safety controls"],
      ["**Steadybit**", "*SaaS platform*", "Kubernetes, cloud VMs", "Infrastructure, network, app, *state*", "**High** -- visual experiment designer", "Yes -- CI/CD integration"],
    ],
  },
  exercises: [
    "**Design a Chaos Experiment**: Choose a critical service in your architecture. Define its **steady-state hypothesis** using *business-relevant metrics* (e.g., order completion rate > 99.9%, `p99 latency < 500ms`). Design an experiment that tests instance failure resilience: specify the *failure to inject*, **blast radius controls**, abort conditions, duration limits, and what you will measure. Document the full experiment plan before running anything.",
    "**Run a GameDay**: Organize a **2-hour GameDay** exercise with your team. Create a *realistic outage scenario* (e.g., database primary failover during a deployment). Do NOT tell participants the scenario in advance. Observe: Do `alerts` fire? Does the on-call process work? Are *runbooks* accurate and up-to-date? Does the team communicate effectively in the incident channel? Write a **postmortem** of the GameDay itself, documenting process gaps discovered.",
    "**Implement Steady-State Monitoring**: Set up a *monitoring dashboard* that displays your system's **steady-state metrics** in real-time. Include: `error rate`, *p99 latency*, throughput (requests per second), and at least one **business metric** (orders, signups, search success rate). Configure abort-condition alerts that would trigger automatic experiment termination if any metric breaches its threshold.",
    "**Progressive Blast Radius Exercise**: Take a single chaos experiment (e.g., *pod termination*) and run it at progressively increasing blast radius: first in **staging**, then against a single production instance, then against `50%` of production pods. At each level, document: Did the **hypothesis hold**? What new behaviors emerged? What *safety controls* were needed? This teaches the discipline of progressive confidence-building.",
    "**Cascading Failure Analysis**: Identify a service in your architecture with **3+ downstream dependencies**. Using *Toxiproxy* or `tc`, inject increasing latency (100ms, 500ms, 2000ms) into one dependency and observe the effects on the entire call chain. Document: Does the service use *circuit breakers*? Do **timeouts** cascade? Does retry behavior cause amplification? Fix discovered weaknesses and re-test.",
  ],
  cheatSheet: [
    "**Chaos Experiment Checklist**: (1) Define *steady state* with measurable metrics, (2) Form a **specific hypothesis**, (3) Set `blast radius` + abort conditions, (4) Run and monitor, (5) Analyze results, (6) Fix and *re-test*",
    "**Blast Radius Progression**: *Tabletop* -> Dev/Staging -> **Canary** (1% production) -> Single AZ -> Multi-AZ -> Full production -- never skip levels",
    "**Safety Controls**: Always have `abort conditions` (auto-stop if metrics breach), *duration limits* (max 30 min for new experiments), **rollback mechanism** (one-click reversal), and team notification before running",
    "**Steady State Must Be**: *Measurable* (concrete numbers), **business-relevant** (user-facing outcomes), and observable in `real-time` -- if you cannot define it, solve your *observability gap* first",
    "**Tool Selection**: `Chaos Monkey` for simple instance kills, **Gremlin** for full-featured SaaS, *Litmus Chaos* for Kubernetes-native, `Toxiproxy` for network chaos, **AWS FIS** for AWS-managed experiments",
    "**Prerequisites Before Chaos**: solid *observability* (metrics, logs, traces), defined **steady-state metrics**, incident response processes (on-call, `runbooks`), and ability to quickly *abort and rollback*",
  ],
  revisionNotes: [
    "Chaos engineering follows the **scientific method**: define *steady state*, form a hypothesis, design a controlled experiment, run it, and analyze results. It is NOT random destruction -- the goal is **building confidence** in system resilience through *disciplined experimentation*.",
    "**Blast radius control** is the most critical safety mechanism. Always progress from *staging* to canary to production. Every experiment needs `abort conditions` (automatic stop on threshold breach), **duration limits**, and a *rollback mechanism*. The principle: minimize blast radius needed to learn.",
    "**Netflix's Simian Army** pioneered the field: *Chaos Monkey* (instance termination), Latency Monkey, Chaos Gorilla (AZ outage), and more. Their key insight: running experiments **continuously in production** is essential because staging cannot replicate *emergent production behaviors*.",
    "**GameDays** differ from automated chaos by testing *human processes* alongside systems: alert detection, on-call response, runbook accuracy, team communication. They are **structured 2-4 hour exercises** with a facilitator, pre-planned scenario (unknown to participants), and a debrief session.",
    "The **maturity path** goes from *ad-hoc tabletop exercises* (Level 0) to exploratory staging tests (Level 1) to scheduled production chaos (Level 2) to **CI/CD-integrated chaos** (Level 3) to continuous always-on chaos with `automated remediation` (Level 4). Most teams should aim for Level 2-3.",
  ],
};

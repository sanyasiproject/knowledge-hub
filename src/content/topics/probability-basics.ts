import type { TopicContent } from "../types";

export const probabilityBasics: TopicContent = {
  quickSummary: [
    "Probability measures the likelihood of an event, ranging from 0 (impossible) to 1 (certain). P(A) = |A| / |S| for equally likely outcomes in sample space S.",
    "Conditional probability P(A|B) = P(A and B) / P(B) captures how knowing B changes the likelihood of A. Independent events satisfy P(A and B) = P(A) * P(B).",
    "A random variable maps outcomes to numbers. Key distributions include uniform, binomial, Poisson, and normal, each modeling different real-world phenomena.",
    "The Law of Large Numbers says sample averages converge to the expected value; the Central Limit Theorem says the sum of many independent variables approaches a normal distribution.",
  ],
  detailed: [
    "A probability experiment has a sample space S (the set of all possible outcomes) and events (subsets of S). For a fair six-sided die, S = {1,2,3,4,5,6} and the event 'even' is {2,4,6} with P(even) = 3/6 = 0.5. The three axioms of probability (Kolmogorov) state: P(A) >= 0, P(S) = 1, and for mutually exclusive events, P(A or B) = P(A) + P(B).",
    "Conditional probability P(A|B) = P(A intersect B) / P(B) quantifies belief about A given that B has occurred. Two events are independent if knowing one does not change the probability of the other: P(A|B) = P(A), equivalently P(A intersect B) = P(A) * P(B). The multiplication rule extends to chains: P(A,B,C) = P(A) * P(B|A) * P(C|A,B).",
    "A random variable X is a function from the sample space to the real numbers. A discrete random variable takes countable values (e.g., number of heads in n flips), while a continuous random variable takes values in an interval (e.g., height). The probability mass function (PMF) gives P(X = x) for discrete variables; the probability density function (PDF) gives the density for continuous variables, where P(a <= X <= b) = integral of f(x) from a to b.",
    "Key discrete distributions: Uniform (each of k outcomes has probability 1/k), Binomial (number of successes in n independent Bernoulli trials with success probability p), and Poisson (count of events in a fixed interval when events occur at a constant average rate lambda). Key continuous distribution: Normal (Gaussian) with parameters mu (mean) and sigma (standard deviation), whose PDF is the bell curve.",
    "Expected value E[X] = sum of x * P(X = x) (discrete) or integral of x * f(x) dx (continuous) is the long-run average. Variance Var(X) = E[(X - mu)^2] = E[X^2] - (E[X])^2 measures spread. Standard deviation is sqrt(Var(X)). The Law of Large Numbers (LLN) guarantees that the sample mean converges to E[X] as sample size grows. The Central Limit Theorem (CLT) states that the distribution of the sample mean approaches N(mu, sigma^2/n) regardless of the original distribution, enabling confidence intervals and hypothesis tests.",
  ],
  deepDive: [
    "The Binomial distribution B(n, p) has PMF P(X = k) = C(n,k) * p^k * (1-p)^(n-k), mean np, and variance np(1-p). When n is large and p is small, it is well-approximated by the Poisson distribution with lambda = np. When n is large and p is moderate, the normal approximation N(np, np(1-p)) applies via the CLT.",
    "The Poisson distribution models rare events: the number of emails per hour, server requests per second, or radioactive decays per minute. Its PMF is P(X = k) = (lambda^k * e^(-lambda)) / k!, and uniquely, its mean and variance are both equal to lambda. The inter-arrival times between Poisson events follow an exponential distribution.",
    "The normal (Gaussian) distribution N(mu, sigma^2) is fully characterized by its mean and variance. The 68-95-99.7 rule states that approximately 68% of values lie within 1 sigma of the mean, 95% within 2 sigma, and 99.7% within 3 sigma. The standard normal Z = (X - mu) / sigma has mu = 0 and sigma = 1, used to compute probabilities via Z-tables or software.",
    "The Central Limit Theorem is arguably the most important result in probability. It states that for n independent, identically distributed random variables with mean mu and variance sigma^2, the standardized sample mean (X_bar - mu) / (sigma / sqrt(n)) converges in distribution to N(0, 1) as n approaches infinity. This holds regardless of the original distribution's shape, provided the variance is finite. The CLT justifies the widespread use of normal-based inference in statistics.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Simulating distributions and verifying the Central Limit Theorem",
      source: `#include <iostream>
#include <random>
#include <vector>
#include <cmath>
#include <numeric>
#include <iomanip>

// Simulate binomial distribution: n trials, probability p
int binomialSample(int n, double p, std::mt19937& rng) {
    std::bernoulli_distribution dist(p);
    int count = 0;
    for (int i = 0; i < n; ++i) {
        if (dist(rng)) ++count;
    }
    return count;
}

int main() {
    std::mt19937 rng(42);  // Seeded for reproducibility

    // Simulate and verify mean/variance of Binomial(100, 0.3)
    const int n = 100;
    const double p = 0.3;
    const int numSamples = 10000;
    std::vector<int> samples(numSamples);
    for (auto& s : samples) s = binomialSample(n, p, rng);

    double sampleMean = std::accumulate(samples.begin(), samples.end(), 0.0) / numSamples;
    double sampleVar = 0.0;
    for (int x : samples) sampleVar += (x - sampleMean) * (x - sampleMean);
    sampleVar /= numSamples;

    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Binomial(" << n << "," << p << "): mean=" << sampleMean
              << " (expected " << n * p << "), var=" << sampleVar
              << " (expected " << n * p * (1 - p) << ")" << std::endl;

    // Central Limit Theorem: sample means of Exponential(lambda=2)
    const double lam = 2.0;
    std::exponential_distribution<double> expDist(lam);
    std::vector<int> sampleSizes = {1, 5, 30, 100};

    for (int size : sampleSizes) {
        std::vector<double> means(5000);
        for (auto& m : means) {
            double sum = 0.0;
            for (int i = 0; i < size; ++i) sum += expDist(rng);
            m = sum / size;
        }
        double avg = std::accumulate(means.begin(), means.end(), 0.0) / means.size();
        double stddev = 0.0;
        for (double m : means) stddev += (m - avg) * (m - avg);
        stddev = std::sqrt(stddev / means.size());

        std::cout << std::setprecision(4);
        std::cout << "n=" << std::setw(3) << size
                  << ": sample_mean_avg=" << avg
                  << ", std=" << stddev << std::endl;
    }
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Computing conditional probability and Bayes' theorem",
      source: `#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
#include <iomanip>
#include <numeric>

int main() {
    // P(A|B) = P(A and B) / P(B)
    // Drawing cards from a standard 52-card deck
    // A = second card is a king, B = first card is a king
    double pB = 4.0 / 52;
    double pAandB = (4.0 / 52) * (3.0 / 51);
    double pAgivenB = pAandB / pB;
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "P(2nd king | 1st king) = " << pAgivenB << std::endl;

    // Simulation to verify
    std::mt19937 rng(42);
    std::vector<int> deck(52);
    std::iota(deck.begin(), deck.end(), 0);  // 0-3 are kings

    const int trials = 100000;
    int hits = 0, firstKingCount = 0;

    for (int t = 0; t < trials; ++t) {
        std::shuffle(deck.begin(), deck.end(), rng);
        if (deck[0] < 4) {           // first card is a king
            ++firstKingCount;
            if (deck[1] < 4) {       // second card is also a king
                ++hits;
            }
        }
    }

    double simulated = firstKingCount > 0
        ? static_cast<double>(hits) / firstKingCount : 0.0;
    std::cout << "Simulated P(2nd king | 1st king) = " << simulated << std::endl;
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Probability distribution family tree",
      kind: "mindmap",
      caption:
        "How common distributions relate: Bernoulli -> Binomial -> Normal (via CLT), Poisson -> Exponential, Uniform as the base case.",
    },
    {
      title: "Conditional probability and the sample space",
      kind: "flow",
      caption:
        "Venn diagram showing events A and B within sample space S, illustrating P(A|B) as restricting the sample space to B.",
    },
  ],
  animations: [
    {
      title: "Central Limit Theorem in action",
      steps: [
        {
          label: "Start with any distribution",
          detail:
            "Choose a non-normal distribution, e.g., exponential or uniform. Note its skewness.",
        },
        {
          label: "Draw a small sample (n=5)",
          detail:
            "Take 5 random values and compute their mean. The distribution of these means is still skewed.",
        },
        {
          label: "Increase sample size (n=30)",
          detail:
            "The distribution of sample means becomes approximately bell-shaped, even though individual values are not.",
        },
        {
          label: "Large sample (n=100)",
          detail:
            "The distribution of sample means is nearly perfectly normal, centered at the population mean.",
        },
        {
          label: "Observe convergence",
          detail:
            "The spread of the sampling distribution decreases proportionally to 1/sqrt(n).",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Distribution", "Type", "Parameters", "Mean", "Variance", "Use Case"],
    rows: [
      [
        "Uniform",
        "Discrete/Continuous",
        "a, b (range)",
        "(a+b)/2",
        "(b-a)^2/12",
        "Equal likelihood outcomes (dice, random number generation)",
      ],
      [
        "Binomial",
        "Discrete",
        "n (trials), p (success prob)",
        "np",
        "np(1-p)",
        "Number of successes in fixed trials (coin flips, defect rates)",
      ],
      [
        "Poisson",
        "Discrete",
        "lambda (rate)",
        "lambda",
        "lambda",
        "Count of rare events in fixed interval (arrivals, errors/hour)",
      ],
      [
        "Normal",
        "Continuous",
        "mu (mean), sigma (std dev)",
        "mu",
        "sigma^2",
        "Natural phenomena, measurement errors, CLT applications",
      ],
      [
        "Exponential",
        "Continuous",
        "lambda (rate)",
        "1/lambda",
        "1/lambda^2",
        "Time between Poisson events (wait times, component lifetimes)",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Explain the difference between independent and mutually exclusive events.",
      a: "Independent events do not affect each other's probability: P(A and B) = P(A) * P(B). Mutually exclusive events cannot occur together: P(A and B) = 0. They are different concepts: mutually exclusive events with nonzero probabilities are never independent, because knowing one occurred means the other did not.",
      followUps: [
        "Give a real-world example of each.",
        "Can two events be both independent and mutually exclusive?",
      ],
    },
    {
      q: "What is the Law of Large Numbers and why does it matter?",
      a: "The LLN states that as sample size increases, the sample mean converges to the population mean (expected value). It matters because it guarantees that empirical averages stabilize, justifying the use of sampling to estimate population parameters.",
      followUps: [
        "What is the difference between the weak and strong LLN?",
        "Does the LLN say anything about individual observations?",
      ],
    },
    {
      q: "Why is the Central Limit Theorem so important in statistics?",
      a: "The CLT states that the sampling distribution of the mean approaches a normal distribution as sample size grows, regardless of the population distribution. This allows us to use normal-based methods (z-tests, confidence intervals) even when the underlying data is not normally distributed, as long as the sample is large enough.",
      followUps: [
        "What sample size is typically considered 'large enough' for the CLT?",
        "Does the CLT require finite variance?",
      ],
    },
    {
      q: "How do you choose between a Binomial and Poisson distribution?",
      a: "Use Binomial when you have a fixed number of independent trials with a constant success probability. Use Poisson when counting events over a continuous interval (time, area) with a known average rate. When n is large and p is small, Binomial approximates Poisson with lambda = np.",
      followUps: [
        "What is the relationship between Poisson and Exponential distributions?",
        "When does the normal approximation to the Binomial apply?",
      ],
    },
  ],
  followUps: [
    "Study Bayes' theorem for updating probabilities with new evidence.",
    "Explore Markov chains and stochastic processes for modeling sequential random events.",
    "Learn about moment generating functions and their role in proving the CLT.",
  ],
  mcqs: [
    {
      q: "If P(A) = 0.4, P(B) = 0.5, and A and B are independent, what is P(A and B)?",
      options: ["0.1", "0.2", "0.9", "0.45"],
      answerIndex: 1,
      explanation:
        "For independent events, P(A and B) = P(A) * P(B) = 0.4 * 0.5 = 0.2.",
    },
    {
      q: "What is the variance of a Poisson distribution with lambda = 7?",
      options: ["sqrt(7)", "7", "49", "7/2"],
      answerIndex: 1,
      explanation:
        "For a Poisson distribution, both the mean and variance equal lambda. So Var(X) = 7.",
    },
    {
      q: "The Central Limit Theorem requires which condition?",
      options: [
        "The population must be normally distributed",
        "The sample size must be exactly 30",
        "The random variables must be identically distributed with finite variance",
        "The events must be mutually exclusive",
      ],
      answerIndex: 2,
      explanation:
        "The CLT requires independent, identically distributed random variables with finite mean and variance. The population need not be normal, and n = 30 is a rule of thumb, not a strict requirement.",
    },
    {
      q: "In a Binomial(n=10, p=0.5) distribution, what is the expected number of successes?",
      options: ["2.5", "5", "10", "0.5"],
      answerIndex: 1,
      explanation:
        "E[X] = np = 10 * 0.5 = 5.",
    },
    {
      q: "P(A or B) for non-mutually-exclusive events equals:",
      options: [
        "P(A) + P(B)",
        "P(A) * P(B)",
        "P(A) + P(B) - P(A and B)",
        "P(A) + P(B) + P(A and B)",
      ],
      answerIndex: 2,
      explanation:
        "The inclusion-exclusion principle: P(A or B) = P(A) + P(B) - P(A and B) to avoid double-counting the intersection.",
    },
  ],
  exercises: [
    "Simulate 10,000 rolls of two dice and compute the empirical probability of the sum being 7. Compare with the theoretical value of 6/36.",
    "Generate 10,000 samples from a Binomial(n=50, p=0.4) distribution and plot a histogram. Overlay a normal curve with matching mean and variance to visualize the CLT.",
    "Compute P(at least one 6 in 4 dice rolls) both analytically (1 - (5/6)^4) and by simulation. Verify they agree.",
    "Implement a function that computes conditional probability P(A|B) from a dataset of observations and verify with a known example.",
  ],
  flashcards: [
    {
      front: "State the three Kolmogorov axioms of probability.",
      back: "1) P(A) >= 0 for all events A. 2) P(S) = 1 where S is the sample space. 3) For mutually exclusive events A1, A2, ..., P(union) = sum of P(Ai).",
    },
    {
      front: "What is the formula for conditional probability?",
      back: "P(A|B) = P(A intersect B) / P(B), provided P(B) > 0.",
    },
    {
      front: "Mean and variance of Binomial(n, p)?",
      back: "Mean = np, Variance = np(1-p).",
    },
    {
      front: "What is the 68-95-99.7 rule?",
      back: "For a normal distribution, approximately 68% of data falls within 1 standard deviation of the mean, 95% within 2, and 99.7% within 3.",
    },
    {
      front: "How does the Poisson distribution relate to the Exponential distribution?",
      back: "If events occur according to a Poisson process with rate lambda, the time between consecutive events follows an Exponential distribution with the same rate lambda.",
    },
    {
      front: "What does the Central Limit Theorem state?",
      back: "The sampling distribution of the mean of n i.i.d. random variables (with finite variance) approaches a normal distribution as n -> infinity, regardless of the original distribution.",
    },
    {
      front: "What is the difference between PMF and PDF?",
      back: "PMF (probability mass function) gives P(X = x) for discrete random variables. PDF (probability density function) gives the density for continuous random variables; probabilities are obtained by integrating the PDF over an interval.",
    },
    {
      front: "When are two events independent?",
      back: "When P(A and B) = P(A) * P(B), equivalently P(A|B) = P(A). Knowing one event occurred does not change the probability of the other.",
    },
  ],
  revisionNotes: [
    "Probability: P(A) = favorable outcomes / total outcomes. Axioms: non-negativity, normalization, additivity for disjoint events.",
    "Conditional: P(A|B) = P(A,B)/P(B). Independence: P(A,B) = P(A)*P(B). Mutually exclusive: P(A,B) = 0.",
    "Discrete distributions: Uniform (1/k each), Binomial (n trials, p success), Poisson (rate lambda). Continuous: Normal (mu, sigma^2), Exponential (rate lambda).",
    "E[X] = sum/integral of x*P(x). Var(X) = E[X^2] - (E[X])^2. SD = sqrt(Var).",
    "LLN: sample mean -> population mean as n -> infinity. CLT: sample mean distribution -> Normal as n -> infinity.",
  ],
  cheatSheet: [
    "P(A or B) = P(A) + P(B) - P(A and B). For mutually exclusive: P(A or B) = P(A) + P(B).",
    "P(A and B) = P(A) * P(B|A). For independent: P(A and B) = P(A) * P(B).",
    "Binomial(n,p): P(X=k) = C(n,k) * p^k * (1-p)^(n-k). Mean=np, Var=np(1-p).",
    "Poisson(lambda): P(X=k) = lambda^k * e^(-lambda) / k!. Mean=Var=lambda.",
    "Normal: 68% within 1 sigma, 95% within 2 sigma, 99.7% within 3 sigma. Z = (X-mu)/sigma.",
    "CLT: X_bar ~ N(mu, sigma^2/n) for large n. Standard error = sigma/sqrt(n).",
  ],
  resources: [
    {
      label: "Introduction to Probability (Blitzstein & Hwang)",
      kind: "book",
      note: "Excellent undergraduate textbook with intuitive explanations and many examples. Free lectures available on YouTube (Harvard Stat 110).",
    },
    {
      label: "Khan Academy - Probability and Statistics",
      kind: "video",
      note: "Free video series covering probability from basics through distributions and the CLT.",
    },
    {
      label: "3Blue1Brown - Probability playlist",
      kind: "video",
      note: "Visual, intuition-driven explanations of probability concepts including Bayes' theorem and the CLT.",
    },
    {
      label: "Think Stats by Allen Downey",
      kind: "book",
      note: "A computational approach to probability and statistics using Python. Free online.",
    },
    {
      label: "Seeing Theory (Brown University)",
      kind: "article",
      note: "Interactive visual introduction to probability and statistics concepts.",
    },
  ],
  glossary: [
    {
      term: "Sample Space",
      definition:
        "The set of all possible outcomes of a probability experiment, denoted S.",
    },
    {
      term: "Random Variable",
      definition:
        "A function that assigns a numerical value to each outcome in the sample space. Can be discrete or continuous.",
    },
    {
      term: "Expected Value",
      definition:
        "The long-run average value of a random variable: E[X] = sum of x * P(X=x) for discrete X.",
    },
    {
      term: "Variance",
      definition:
        "A measure of spread: Var(X) = E[(X - E[X])^2]. Higher variance means more dispersed values.",
    },
    {
      term: "Independence",
      definition:
        "Two events A and B are independent if P(A and B) = P(A) * P(B); knowing one does not affect the other.",
    },
    {
      term: "PMF (Probability Mass Function)",
      definition:
        "For a discrete random variable, PMF gives P(X = x) for each possible value x.",
    },
    {
      term: "PDF (Probability Density Function)",
      definition:
        "For a continuous random variable, the PDF f(x) gives the density; P(a <= X <= b) = integral of f(x) from a to b.",
    },
    {
      term: "Central Limit Theorem",
      definition:
        "The theorem stating that the distribution of sample means approaches a normal distribution as sample size increases, regardless of the population distribution.",
    },
  ],
};

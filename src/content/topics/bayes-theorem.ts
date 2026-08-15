import type { TopicContent } from "../types";

export const bayesTheorem: TopicContent = {
  quickSummary: [
    "Bayes' theorem computes the posterior probability P(H|E) = P(E|H) * P(H) / P(E), updating a prior belief P(H) with observed evidence E via the likelihood P(E|H).",
    "Prior represents initial belief before evidence; likelihood is how probable the evidence is given the hypothesis; posterior is the updated belief after evidence.",
    "Bayesian updating is iterative: today's posterior becomes tomorrow's prior when new evidence arrives.",
    "Practical applications include spam filtering (Naive Bayes classifier), medical diagnostic testing, and machine learning classification.",
  ],
  detailed: [
    "Bayes' theorem is derived directly from the definition of conditional probability. Since P(H and E) = P(H|E) * P(E) = P(E|H) * P(H), dividing both sides by P(E) gives P(H|E) = P(E|H) * P(H) / P(E). The denominator P(E) = sum over all hypotheses H_i of P(E|H_i) * P(H_i) acts as a normalizing constant ensuring probabilities sum to 1.",
    "The prior P(H) encodes what we believe about a hypothesis before seeing the data. The likelihood P(E|H) measures how well the hypothesis explains the observed evidence. The posterior P(H|E) is the updated belief after incorporating the evidence. The key insight is that evidence does not just confirm or deny a hypothesis; it shifts our belief proportionally to how much more likely the evidence is under the hypothesis than under alternatives.",
    "Bayesian updating is the process of applying Bayes' theorem sequentially. After observing evidence E1, the posterior P(H|E1) becomes the new prior for incorporating the next piece of evidence E2: P(H|E1, E2) = P(E2|H, E1) * P(H|E1) / P(E2|E1). This sequential updating converges to the same result regardless of the order in which evidence is processed, provided the same evidence is used.",
    "The classic medical testing example illustrates the base rate fallacy. Suppose a disease has 1% prevalence (prior). A test has 99% sensitivity (P(positive|disease) = 0.99) and 95% specificity (P(negative|no disease) = 0.95). If a person tests positive: P(disease|positive) = (0.99 * 0.01) / (0.99 * 0.01 + 0.05 * 0.99) = 0.0099 / (0.0099 + 0.0495) = 16.7%. Despite the seemingly accurate test, most positives are false positives because the disease is rare.",
    "The Naive Bayes classifier applies Bayes' theorem to classification by assuming features are conditionally independent given the class label. For spam filtering: P(spam|words) is proportional to P(spam) * product of P(word_i|spam) for each word. Despite the naive independence assumption being unrealistic, it works surprisingly well in practice due to the ranking nature of classification (we only need the correct relative ordering of posterior probabilities, not their exact values).",
  ],
  deepDive: [
    "The Bayesian vs frequentist debate centers on the interpretation of probability and the role of prior information. Frequentists interpret probability as long-run frequency and avoid priors, relying on p-values and confidence intervals. Bayesians interpret probability as a degree of belief and embrace priors, producing posterior distributions and credible intervals. Bayesian methods can incorporate domain expertise through informative priors, while frequentist methods rely solely on the data. In practice, both approaches often agree, especially with large samples where the data overwhelms the prior.",
    "Conjugate priors are prior distributions that, when combined with a specific likelihood function, produce a posterior of the same distributional family. For example, a Beta prior combined with a Binomial likelihood yields a Beta posterior. If the prior is Beta(alpha, beta) and we observe k successes in n trials, the posterior is Beta(alpha + k, beta + n - k). Conjugate priors simplify computation and provide intuitive interpretations: the prior parameters can be thought of as 'pseudo-observations.'",
    "In Naive Bayes classification, Laplace smoothing (additive smoothing) addresses the zero-frequency problem: if a word never appears in spam emails during training, its likelihood is zero, which would make the entire posterior zero regardless of other evidence. Adding a small constant (typically 1) to all word counts ensures no probability is exactly zero. The formula becomes P(word|class) = (count(word, class) + 1) / (total words in class + vocabulary size).",
    "Bayesian inference extends beyond point estimates to full posterior distributions, enabling richer uncertainty quantification. Credible intervals (the Bayesian analog of confidence intervals) have a direct probability interpretation: a 95% credible interval means there is a 95% probability that the parameter lies within the interval, given the data and prior. This is often more intuitive than the frequentist interpretation of confidence intervals. Modern Bayesian computation relies on Markov Chain Monte Carlo (MCMC) methods like Metropolis-Hastings and Hamiltonian Monte Carlo to sample from complex posterior distributions.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Bayes' theorem: medical test and Bayesian updating",
      source: `#include <iostream>
#include <iomanip>

// Compute posterior probability using Bayes' theorem.
// P(H|E) = P(E|H) * P(H) / P(E)
// where P(E) = P(E|H)*P(H) + P(E|~H)*P(~H)
double bayes_theorem(double prior, double likelihood, double false_positive_rate) {
    double p_evidence = likelihood * prior + false_positive_rate * (1.0 - prior);
    return (likelihood * prior) / p_evidence;
}

int main() {
    // Medical test example
    double prevalence    = 0.01;  // P(disease) = 1%
    double sensitivity   = 0.99;  // P(positive | disease) = 99%
    double false_pos_rate = 0.05; // P(positive | no disease) = 5%

    double posterior = bayes_theorem(prevalence, sensitivity, false_pos_rate);
    std::cout << std::fixed << std::setprecision(4);
    std::cout << "P(disease | positive test) = " << posterior << "\\n";  // ~0.167

    // Bayesian updating: second independent test comes back positive
    double posterior_after_2 = bayes_theorem(posterior, sensitivity, false_pos_rate);
    std::cout << "P(disease | 2 positive tests) = " << posterior_after_2 << "\\n";  // ~0.795

    // Third positive test
    double posterior_after_3 = bayes_theorem(posterior_after_2, sensitivity, false_pos_rate);
    std::cout << "P(disease | 3 positive tests) = " << posterior_after_3 << "\\n";  // ~0.987

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Naive Bayes spam classifier from scratch",
      source: `#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cmath>
#include <limits>
#include <iostream>
#include <numeric>

class NaiveBayesClassifier {
public:
    explicit NaiveBayesClassifier(double alpha = 1.0) : alpha_(alpha) {}

    void train(const std::vector<std::pair<std::vector<std::string>, std::string>>& documents) {
        for (const auto& [words, label] : documents) {
            class_counts_[label]++;
            for (const auto& word : words) {
                word_counts_[label][word]++;
                vocab_.insert(word);
            }
        }
    }

    std::string predict(const std::vector<std::string>& words) const {
        int total = 0;
        for (const auto& [label, count] : class_counts_)
            total += count;

        std::string best_label;
        double best_score = -std::numeric_limits<double>::infinity();

        for (const auto& [label, count] : class_counts_) {
            // Log prior
            double score = std::log(static_cast<double>(count) / total);

            // Log likelihoods with Laplace smoothing
            const auto& wc = word_counts_.at(label);
            int total_words = 0;
            for (const auto& [w, c] : wc) total_words += c;

            for (const auto& word : words) {
                int word_freq = 0;
                auto it = wc.find(word);
                if (it != wc.end()) word_freq = it->second;
                score += std::log((word_freq + alpha_) /
                                  (total_words + alpha_ * vocab_.size()));
            }
            if (score > best_score) {
                best_score = score;
                best_label = label;
            }
        }
        return best_label;
    }

private:
    double alpha_;
    std::unordered_map<std::string, int> class_counts_;
    std::unordered_map<std::string, std::unordered_map<std::string, int>> word_counts_;
    std::unordered_set<std::string> vocab_;
};

int main() {
    // Training data: {words, label}
    std::vector<std::pair<std::vector<std::string>, std::string>> training_data = {
        {{"buy", "cheap", "pills", "now"}, "spam"},
        {{"limited", "offer", "buy", "now"}, "spam"},
        {{"free", "winner", "click", "now"}, "spam"},
        {{"meeting", "tomorrow", "project", "update"}, "ham"},
        {{"lunch", "tomorrow", "team", "meeting"}, "ham"},
        {{"project", "deadline", "review", "code"}, "ham"},
    };

    NaiveBayesClassifier clf;
    clf.train(training_data);
    std::cout << clf.predict({"buy", "free", "click"}) << "\\n";   // spam
    std::cout << clf.predict({"project", "meeting"}) << "\\n";      // ham
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Bayesian Inference Flow",
      kind: "flow",
      caption: "How prior belief, observed evidence, and the likelihood function combine through Bayes' theorem to produce an updated posterior probability.",
      mermaid: `flowchart TD
    A["Define Prior P of H<br/>Initial belief about hypothesis"] --> B["Observe Evidence E"]
    B --> C["Compute Likelihood P of E given H<br/>How well does H explain E?"]
    C --> D["Compute Evidence P of E<br/>Sum over all hypotheses"]
    D --> E["Apply Bayes Theorem<br/>Posterior equals Likelihood times Prior divided by Evidence"]
    E --> F["Posterior P of H given E<br/>Updated belief"]
    F --> G{"More evidence<br/>available?"}
    G -->|"Yes"| H["Posterior becomes new Prior"]
    H --> B
    G -->|"No"| I["Final belief estimate"]`,
    },
    {
      title: "Naive Bayes Classifier Architecture",
      kind: "architecture",
      caption: "Structure of a Naive Bayes spam classifier showing how word likelihoods and the class prior combine to compute the posterior spam probability.",
      mermaid: `graph TD
    Input["Input Email - word tokens"]
    Prior["Class Prior<br/>P of spam and P of ham"]
    Vocab["Vocabulary<br/>Word frequency counts"]
    Like1["P of word1 given spam"]
    Like2["P of word2 given spam"]
    Like3["P of word3 given spam"]
    Smooth["Laplace Smoothing<br/>count plus 1 over total plus vocab size"]
    LogSum["Sum of log likelihoods<br/>plus log prior"]
    Argmax["Argmax over classes"]
    Output["Predicted class - spam or ham"]

    Input --> Like1
    Input --> Like2
    Input --> Like3
    Vocab --> Smooth
    Smooth --> Like1
    Smooth --> Like2
    Smooth --> Like3
    Prior --> LogSum
    Like1 --> LogSum
    Like2 --> LogSum
    Like3 --> LogSum
    LogSum --> Argmax --> Output`,
    },
    {
      title: "Probability Concepts Mindmap",
      kind: "mindmap",
      caption: "Key concepts in Bayesian probability organized around Bayes' theorem and its practical applications.",
      mermaid: `mindmap
  root["Bayes Theorem"]
    Components
      Prior P of H
      Likelihood P of E given H
      Evidence P of E
      Posterior P of H given E
    Updating
      Sequential updating
      Conjugate priors
      Beta-Binomial
      Convergence with data
    Applications
      Medical testing
      Spam filtering
      Naive Bayes classifier
      Bayesian A/B testing
    vs Frequentist
      Credible intervals
      Confidence intervals
      p-values
      Prior information`,
    },
    {
      title: "Bayesian Belief Updating Sequence",
      kind: "sequence",
      caption: "How a medical diagnosis scenario iteratively updates the disease probability after each independent positive test result.",
      mermaid: `sequenceDiagram
    participant D as Doctor
    participant B as Bayes Engine
    participant P as Patient Record

    Note over D,P: Prior - disease prevalence 1 percent
    D->>B: P of disease = 0.01
    B-->>P: Store prior belief

    Note over D,P: First positive test - sensitivity 99 percent FPR 5 percent
    D->>B: Apply test result - positive
    B->>B: Posterior = 0.99 times 0.01 divided by evidence
    B-->>D: P of disease given positive = 0.167
    B-->>P: Update belief to 16.7 percent

    Note over D,P: Second independent positive test
    D->>B: Prior is now 0.167
    B->>B: Apply Bayes again with new prior
    B-->>D: P of disease given two positives = 0.795
    B-->>P: Update belief to 79.5 percent

    Note over D,P: Third positive test
    D->>B: Prior is now 0.795
    B->>B: Apply Bayes third time
    B-->>D: P of disease given three positives = 0.987`,
    },
  ],
  animations: [
    {
      title: "Bayesian updating with medical test results",
      steps: [
        {
          label: "Start with the prior",
          detail:
            "Disease prevalence is 1%. Before any test, P(disease) = 0.01. This is our prior belief.",
        },
        {
          label: "First positive test",
          detail:
            "Apply Bayes' theorem with sensitivity 99% and false-positive rate 5%. Posterior jumps to about 16.7%.",
        },
        {
          label: "Why so low?",
          detail:
            "The base rate is very low (1%). Most positives come from the 99% healthy population at a 5% false-positive rate, outnumbering true positives.",
        },
        {
          label: "Second positive test",
          detail:
            "Use the 16.7% posterior as the new prior. After a second independent positive test, posterior rises to about 79.5%.",
        },
        {
          label: "Third positive test",
          detail:
            "Using 79.5% as prior, a third positive test pushes posterior to about 98.7%. Evidence accumulates.",
        },
        {
          label: "Convergence",
          detail:
            "With enough consistent evidence, the posterior converges regardless of the initial prior. Data overwhelms the prior.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Bayesian", "Frequentist"],
    rows: [
      [
        "Probability interpretation",
        "Degree of belief (subjective)",
        "Long-run frequency (objective)",
      ],
      [
        "Parameters",
        "Random variables with distributions",
        "Fixed but unknown constants",
      ],
      [
        "Prior information",
        "Incorporated via prior distribution",
        "Not used; only data informs inference",
      ],
      [
        "Interval estimates",
        "Credible interval: 95% probability parameter is in the interval",
        "Confidence interval: 95% of intervals from repeated sampling contain the parameter",
      ],
      [
        "Small samples",
        "Handles well with informative priors",
        "May lack power; relies on asymptotic theory",
      ],
      [
        "Computation",
        "Often requires MCMC or variational methods",
        "Usually closed-form or simple optimization",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Explain Bayes' theorem with a real-world example.",
      a: "Bayes' theorem updates the probability of a hypothesis given new evidence. For a medical test: if a disease affects 1% of the population and a test has 99% sensitivity and 5% false-positive rate, a positive result gives only about a 16.7% chance of actually having the disease. This is because the large number of healthy people generating false positives outweighs the small number of true positives.",
      followUps: [
        "How would you explain the base rate fallacy to a non-technical stakeholder?",
        "What happens to the posterior as we get more positive test results?",
      ],
    },
    {
      q: "What assumptions does a Naive Bayes classifier make, and why does it still work?",
      a: "Naive Bayes assumes all features are conditionally independent given the class label. This is almost never true in practice (e.g., words in an email are correlated). It still works well because classification only needs the correct ranking of posteriors, not exact probabilities. The independence assumption leads to efficient computation (linear in the number of features) and performs competitively even against more sophisticated models, especially with limited training data.",
      followUps: [
        "When would Naive Bayes fail?",
        "How does Laplace smoothing help?",
      ],
    },
    {
      q: "What is the difference between a Bayesian credible interval and a frequentist confidence interval?",
      a: "A 95% Bayesian credible interval means there is a 95% probability that the parameter lies within the interval, given the observed data and prior. A 95% frequentist confidence interval means that if the experiment were repeated many times, 95% of the computed intervals would contain the true parameter. The Bayesian interpretation is often more intuitive, but it depends on the choice of prior.",
      followUps: [
        "How sensitive are credible intervals to the choice of prior?",
        "When do Bayesian and frequentist intervals agree?",
      ],
    },
    {
      q: "How is Bayes' theorem used in spam filtering?",
      a: "Spam filters use Naive Bayes: given an email's words, compute P(spam|words) proportional to P(spam) * product of P(word_i|spam). Words like 'free', 'winner', 'click' have high P(word|spam), increasing the spam posterior. The classifier compares P(spam|words) to P(ham|words) and assigns the class with the higher posterior. Laplace smoothing handles unseen words. The model is fast to train and update as new emails arrive.",
      followUps: [
        "How do you handle words that appear in both spam and ham?",
        "What are alternatives to Naive Bayes for text classification?",
      ],
    },
  ],
  followUps: [
    "Study Bayesian networks for modeling conditional dependencies among multiple variables.",
    "Explore Markov Chain Monte Carlo (MCMC) methods for sampling from complex posterior distributions.",
    "Learn about Bayesian A/B testing as an alternative to frequentist hypothesis testing in product analytics.",
    "Investigate probabilistic programming frameworks like PyMC and Stan for applied Bayesian modeling.",
  ],
  mcqs: [
    {
      q: "In Bayes' theorem P(H|E) = P(E|H) * P(H) / P(E), what is P(E|H) called?",
      options: ["Prior", "Posterior", "Likelihood", "Evidence"],
      answerIndex: 2,
      explanation:
        "P(E|H) is the likelihood: the probability of observing evidence E given that hypothesis H is true.",
    },
    {
      q: "A disease affects 0.1% of the population. A test has 99% sensitivity and 99% specificity. What is the approximate probability of disease given a positive test?",
      options: ["99%", "50%", "9%", "1%"],
      answerIndex: 2,
      explanation:
        "P(disease|+) = (0.99 * 0.001) / (0.99 * 0.001 + 0.01 * 0.999) = 0.00099 / (0.00099 + 0.00999) = 0.00099 / 0.01098 ≈ 9%. The low base rate means most positives are false positives.",
    },
    {
      q: "What assumption does Naive Bayes make about features?",
      options: [
        "Features are normally distributed",
        "Features are conditionally independent given the class",
        "Features have equal importance",
        "Features are binary",
      ],
      answerIndex: 1,
      explanation:
        "The 'naive' in Naive Bayes refers to the assumption that features are conditionally independent given the class label, allowing the joint probability to be factored into a product of individual feature probabilities.",
    },
    {
      q: "In Bayesian updating, what does the posterior from one observation become for the next?",
      options: [
        "The likelihood",
        "The evidence",
        "The prior",
        "The marginal",
      ],
      answerIndex: 2,
      explanation:
        "Bayesian updating is iterative: the posterior probability after observing evidence becomes the prior for incorporating the next piece of evidence.",
    },
    {
      q: "What problem does Laplace smoothing solve in Naive Bayes?",
      options: [
        "Overfitting to training data",
        "Zero probability for unseen features",
        "High computational cost",
        "Correlated features",
      ],
      answerIndex: 1,
      explanation:
        "Without smoothing, a word not seen in a class during training gets P(word|class) = 0, which zeros out the entire posterior. Laplace smoothing adds a small count to prevent this.",
    },
  ],
  exercises: [
    "A factory has two machines. Machine A produces 60% of items with a 2% defect rate; Machine B produces 40% with a 5% defect rate. A randomly selected item is defective. What is the probability it came from Machine A? Work through Bayes' theorem step by step.",
    "Implement a Naive Bayes sentiment classifier that categorizes movie reviews as positive or negative. Use Laplace smoothing and evaluate accuracy on a held-out test set.",
    "Simulate the Monty Hall problem (1000 trials) for both 'switch' and 'stay' strategies. Use Bayesian reasoning to explain why switching wins 2/3 of the time.",
    "Given a Beta(2, 5) prior for the probability of a coin landing heads, observe 8 heads in 10 flips. Compute the posterior distribution and plot prior, likelihood, and posterior on the same chart.",
  ],
  flashcards: [
    {
      front: "State Bayes' theorem.",
      back: "P(H|E) = P(E|H) * P(H) / P(E), where P(E) = sum over all hypotheses of P(E|H_i) * P(H_i).",
    },
    {
      front: "What is the prior in Bayesian inference?",
      back: "The prior P(H) represents our belief about the hypothesis before observing any evidence. It encodes domain knowledge or initial assumptions.",
    },
    {
      front: "What is the likelihood?",
      back: "P(E|H), the probability of observing the evidence given that the hypothesis is true. It measures how well the hypothesis explains the data.",
    },
    {
      front: "What is the base rate fallacy?",
      back: "Ignoring the prior probability (base rate) when interpreting conditional probabilities. A 99%-accurate test on a 1% prevalence disease still yields mostly false positives.",
    },
    {
      front: "What makes Naive Bayes 'naive'?",
      back: "The assumption that all features are conditionally independent given the class label. This is rarely true but simplifies computation and often works well in practice.",
    },
    {
      front: "What is a conjugate prior?",
      back: "A prior distribution that, when combined with a specific likelihood, produces a posterior of the same family. Example: Beta prior + Binomial likelihood = Beta posterior.",
    },
    {
      front: "Bayesian credible interval vs frequentist confidence interval?",
      back: "Credible interval: 95% probability the parameter is in the interval (given data + prior). Confidence interval: 95% of intervals from repeated experiments contain the parameter.",
    },
    {
      front: "How does Laplace smoothing work?",
      back: "Add a constant (typically 1) to all counts: P(word|class) = (count + 1) / (total + |vocabulary|). Prevents zero probabilities for unseen features.",
    },
  ],
  revisionNotes: [
    "Bayes' theorem: P(H|E) = P(E|H) * P(H) / P(E). Prior * Likelihood / Evidence = Posterior.",
    "Base rate fallacy: ignoring P(H) leads to overestimating posterior. A rare disease with a good test still yields many false positives because P(no disease) is large.",
    "Bayesian updating: posterior becomes the new prior when more evidence arrives. Order of evidence does not matter; the final posterior is the same.",
    "Naive Bayes: assumes feature independence given class. P(class|features) proportional to P(class) * product of P(feature_i|class). Fast, effective for text classification.",
    "Laplace smoothing: add alpha (usually 1) to all counts to avoid zero probabilities. Essential for handling unseen words in Naive Bayes.",
    "Bayesian vs Frequentist: Bayesian uses priors and produces posterior distributions; Frequentist avoids priors and uses p-values/confidence intervals. Both converge with large data.",
  ],
  cheatSheet: [
    "P(H|E) = P(E|H) * P(H) / P(E). Memorize as: Posterior = (Likelihood * Prior) / Evidence.",
    "P(E) = sum_i P(E|H_i) * P(H_i) — the law of total probability, used as the normalizer.",
    "Medical test: P(disease|+) = sensitivity * prevalence / (sensitivity * prevalence + FPR * (1 - prevalence)).",
    "Naive Bayes: P(class|x) proportional to P(class) * product(P(x_i|class)). Classify by argmax.",
    "Laplace smoothing: P(word|class) = (count(word,class) + 1) / (total_words_in_class + |vocab|).",
    "Conjugate pairs: Beta-Binomial, Normal-Normal, Gamma-Poisson, Dirichlet-Multinomial.",
  ],
  resources: [
    {
      label: "Think Bayes by Allen Downey", url: "https://allendowney.github.io/ThinkBayes2/",
      kind: "book",
      note: "Free computational introduction to Bayesian statistics using Python. Covers practical examples from medical testing to sports analytics.",
    },
    {
      label: "3Blue1Brown - Bayes' theorem (YouTube)", url: "https://www.3blue1brown.com/",
      kind: "video",
      note: "Excellent visual explanation of Bayes' theorem with intuitive geometric representations.",
    },
    {
      label: "Bayesian Methods for Hackers (GitHub book)",
      kind: "repo",
      note: "Hands-on introduction to Bayesian methods using PyMC. Free online with interactive Jupyter notebooks.",
    },
    {
      label: "An Intuitive Explanation of Bayes' Theorem (Eliezer Yudkowsky)",
      kind: "article",
      note: "Step-by-step walkthrough of Bayes' theorem with the medical testing example, aimed at building deep intuition.",
    },
    {
      label: "Statistical Rethinking by Richard McElreath",
      kind: "book",
      note: "A Bayesian course with examples in R/Stan. Free video lectures available on YouTube.",
    },
  ],
  glossary: [
    {
      term: "Prior",
      definition:
        "P(H), the probability assigned to a hypothesis before observing evidence. Encodes initial belief or domain knowledge.",
    },
    {
      term: "Posterior",
      definition:
        "P(H|E), the updated probability of a hypothesis after incorporating observed evidence via Bayes' theorem.",
    },
    {
      term: "Likelihood",
      definition:
        "P(E|H), the probability of observing the evidence given the hypothesis. Measures how well the hypothesis explains the data.",
    },
    {
      term: "Base Rate",
      definition:
        "The prior prevalence of a condition in the population. Ignoring the base rate when interpreting test results is the base rate fallacy.",
    },
    {
      term: "Conjugate Prior",
      definition:
        "A prior distribution that produces a posterior of the same distributional family when combined with a particular likelihood function.",
    },
    {
      term: "Naive Bayes",
      definition:
        "A classification algorithm that applies Bayes' theorem with the simplifying assumption that features are conditionally independent given the class label.",
    },
    {
      term: "Laplace Smoothing",
      definition:
        "Adding a small constant to feature counts to avoid zero probabilities for unseen features in Naive Bayes classification.",
    },
    {
      term: "Credible Interval",
      definition:
        "The Bayesian analog of a confidence interval: a range within which the parameter lies with a specified probability, given the data and prior.",
    },
  ],
};

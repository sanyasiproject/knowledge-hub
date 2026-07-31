import type { TopicContent } from "../types";

export const statisticsBasics: TopicContent = {
  quickSummary: [
    "Descriptive statistics summarize data with measures of central tendency (mean, median, mode) and spread (range, variance, standard deviation, percentiles).",
    "Inferential statistics use sample data to draw conclusions about populations through hypothesis testing, confidence intervals, and regression.",
    "A p-value is the probability of observing data as extreme as the sample, assuming the null hypothesis is true. A small p-value (typically < 0.05) leads to rejecting the null.",
    "Correlation measures linear association between two variables; regression models the relationship and enables prediction.",
  ],
  detailed: [
    "Descriptive statistics condense raw data into interpretable summaries. The mean (arithmetic average) is sensitive to outliers; the median (middle value when sorted) is robust to skew; the mode (most frequent value) is useful for categorical data. For the dataset [2, 3, 3, 5, 100], the mean is 22.6, the median is 3, and the mode is 3, illustrating how outliers affect the mean but not the median.",
    "Measures of spread quantify how dispersed the data is. The range (max - min) is simple but sensitive to outliers. Variance is the average squared deviation from the mean; standard deviation is its square root and is in the same units as the data. Percentiles divide data into 100 equal parts: the 25th percentile (Q1), 50th (median), and 75th (Q3) form the five-number summary with min and max. The interquartile range (IQR = Q3 - Q1) is a robust measure of spread.",
    "Hypothesis testing provides a framework for making decisions from data. The null hypothesis (H0) represents the status quo (e.g., 'the drug has no effect'). The alternative hypothesis (H1) is what we seek evidence for. We compute a test statistic from the sample, determine its p-value (probability of observing such an extreme statistic under H0), and reject H0 if the p-value is below a chosen significance level alpha (commonly 0.05). Type I error is rejecting a true H0 (false positive); Type II error is failing to reject a false H0 (false negative).",
    "A confidence interval provides a range of plausible values for a population parameter. A 95% confidence interval means: if we repeated the experiment many times, 95% of the computed intervals would contain the true parameter. For a mean with known sigma: CI = x_bar +/- z_(alpha/2) * (sigma / sqrt(n)). The width decreases with larger samples and increases with higher confidence levels.",
    "The t-test compares means: a one-sample t-test checks if a sample mean differs from a hypothesized value; a two-sample t-test compares means of two groups. The chi-squared test assesses independence between categorical variables or goodness of fit. Pearson correlation coefficient r measures linear association (-1 to 1). Simple linear regression fits y = beta_0 + beta_1 * x + epsilon, minimizing the sum of squared residuals (ordinary least squares).",
  ],
  deepDive: [
    "The t-distribution arises when estimating the mean of a normally distributed population with an unknown population standard deviation and a small sample. It has heavier tails than the normal distribution, reflecting greater uncertainty. As degrees of freedom increase (larger samples), the t-distribution converges to the standard normal. For a one-sample t-test: t = (x_bar - mu_0) / (s / sqrt(n)), with n-1 degrees of freedom.",
    "The chi-squared test for independence constructs a contingency table of observed frequencies and computes expected frequencies under the independence assumption. The test statistic is chi^2 = sum of (O_i - E_i)^2 / E_i, compared to a chi-squared distribution with (rows-1)*(cols-1) degrees of freedom. A large chi^2 indicates that the observed distribution deviates significantly from what independence predicts.",
    "In simple linear regression, beta_1 = Cov(X,Y) / Var(X) and beta_0 = y_bar - beta_1 * x_bar. R-squared (coefficient of determination) is the proportion of variance in Y explained by the model: R^2 = 1 - SS_residual / SS_total. An R^2 of 0.85 means the model explains 85% of the variability in Y. However, high R^2 does not imply causation, and adding more predictors always increases R^2 (hence adjusted R^2 penalizes model complexity).",
    "P-values are widely misinterpreted. A p-value is NOT the probability that H0 is true. It is the probability of seeing data as extreme as observed, assuming H0 is true. A p-value of 0.03 does not mean there is a 3% chance the null is true; it means there is a 3% chance of such extreme data if the null were true. Additionally, statistical significance (small p) does not imply practical significance; a tiny effect can be 'significant' with a large enough sample.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Descriptive statistics and hypothesis testing in C++",
      source: `#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <numeric>
#include <iomanip>

double mean(const std::vector<double>& v) {
    return std::accumulate(v.begin(), v.end(), 0.0) / v.size();
}

double median(std::vector<double> v) {
    std::sort(v.begin(), v.end());
    size_t n = v.size();
    return (n % 2 == 0) ? (v[n/2 - 1] + v[n/2]) / 2.0 : v[n/2];
}

double sample_std(const std::vector<double>& v) {
    double m = mean(v);
    double sum_sq = 0;
    for (double x : v) sum_sq += (x - m) * (x - m);
    return std::sqrt(sum_sq / (v.size() - 1));  // Bessel's correction
}

double percentile(std::vector<double> v, double p) {
    std::sort(v.begin(), v.end());
    double idx = p / 100.0 * (v.size() - 1);
    size_t lo = static_cast<size_t>(idx);
    double frac = idx - lo;
    if (lo + 1 < v.size()) return v[lo] * (1 - frac) + v[lo + 1] * frac;
    return v[lo];
}

// Approximate two-tailed p-value from t-distribution using normal approx
// (for a real application, use a stats library or lookup table)
double t_to_p_approx(double t_stat, int df) {
    // Simple approximation; adequate for demonstration
    double x = std::abs(t_stat);
    double p = std::exp(-0.5 * x * x) * (0.4 / (1.0 + 0.3 * x));
    return 2.0 * p;  // two-tailed
}

int main() {
    std::vector<double> data = {23, 25, 28, 30, 32, 35, 37, 40, 42, 150};
    int n = data.size();

    // Descriptive statistics
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Mean:   " << mean(data) << "\\n";      // 44.20 (outlier inflates)
    std::cout << "Median: " << median(data) << "\\n";    // 33.50 (robust)
    std::cout << "Std:    " << sample_std(data) << "\\n"; // sample std dev
    std::cout << "Q1:     " << percentile(data, 25) << "\\n";
    std::cout << "Q3:     " << percentile(data, 75) << "\\n";
    std::cout << "IQR:    " << percentile(data, 75) - percentile(data, 25) << "\\n";

    // One-sample t-test: is the mean significantly different from 35?
    double mu_0 = 35.0;
    double m = mean(data);
    double s = sample_std(data);
    double se = s / std::sqrt(n);
    double t_stat = (m - mu_0) / se;
    double p_value = t_to_p_approx(t_stat, n - 1);

    std::cout << std::setprecision(4);
    std::cout << "\\nt-statistic: " << t_stat << ", p-value: " << p_value << "\\n";
    double alpha = 0.05;
    if (p_value < alpha)
        std::cout << "Reject H0: mean is significantly different from 35\\n";
    else
        std::cout << "Fail to reject H0: no significant difference from 35\\n";

    // 95% confidence interval for the mean (using t critical value ~ 2.262 for df=9)
    double t_crit = 2.262;  // t(0.025, df=9)
    double ci_lo = m - t_crit * se;
    double ci_hi = m + t_crit * se;
    std::cout << std::setprecision(2);
    std::cout << "95% CI for mean: (" << ci_lo << ", " << ci_hi << ")\\n";
}`,
    },
    {
      language: "cpp",
      caption: "Correlation and simple linear regression in C++",
      source: `#include <iostream>
#include <vector>
#include <cmath>
#include <numeric>
#include <iomanip>

int main() {
    // Sample data: hours studied vs exam score
    std::vector<double> hours  = {1, 2, 3, 4, 5, 6, 7, 8};
    std::vector<double> scores = {52, 58, 65, 70, 74, 80, 85, 90};
    int n = hours.size();

    // Compute means
    double mean_x = std::accumulate(hours.begin(), hours.end(), 0.0) / n;
    double mean_y = std::accumulate(scores.begin(), scores.end(), 0.0) / n;

    // Compute covariance and standard deviations
    double cov_xy = 0, var_x = 0, var_y = 0;
    for (int i = 0; i < n; ++i) {
        double dx = hours[i] - mean_x;
        double dy = scores[i] - mean_y;
        cov_xy += dx * dy;
        var_x  += dx * dx;
        var_y  += dy * dy;
    }

    // Pearson correlation: r = Cov(X,Y) / (SD(X) * SD(Y))
    double r = cov_xy / std::sqrt(var_x * var_y);

    // Approximate p-value for r (using t-distribution transformation)
    double t_stat = r * std::sqrt((n - 2) / (1.0 - r * r));
    // For large |t| this is effectively 0; shown for completeness
    std::cout << std::fixed;
    std::cout << "Pearson r = " << std::setprecision(4) << r << "\\n";

    // Simple linear regression: score = beta0 + beta1 * hours
    // beta1 = Cov(X,Y) / Var(X),  beta0 = mean_y - beta1 * mean_x
    double slope     = cov_xy / var_x;
    double intercept = mean_y - slope * mean_x;
    double r_squared = r * r;

    std::cout << std::setprecision(2);
    std::cout << "Regression: score = " << intercept << " + "
              << slope << " * hours\\n";
    std::cout << std::setprecision(4);
    std::cout << "R-squared: " << r_squared << "\\n";
    std::cout << std::setprecision(1);
    std::cout << "Prediction for 10 hours: " << intercept + slope * 10 << "\\n";
}`,
    },
  ],
  diagrams: [
    {
      title: "Hypothesis testing decision flowchart",
      kind: "flow",
      caption:
        "From stating hypotheses through computing the test statistic, determining the p-value, and making a decision to reject or fail to reject H0.",
    },
    {
      title: "Types of error in hypothesis testing",
      kind: "architecture",
      caption:
        "A 2x2 matrix showing the four outcomes: correct decision (true positive/negative) vs Type I error (false positive) vs Type II error (false negative).",
    },
  ],
  animations: [
    {
      title: "Building a confidence interval",
      steps: [
        {
          label: "Collect sample",
          detail:
            "Draw a random sample of size n from the population and compute the sample mean x_bar and standard error SE = s / sqrt(n).",
        },
        {
          label: "Choose confidence level",
          detail:
            "Select a confidence level (e.g., 95%), which determines the critical value z* or t* from the appropriate distribution.",
        },
        {
          label: "Compute margin of error",
          detail:
            "Margin of error = critical value * standard error. This quantifies the precision of the estimate.",
        },
        {
          label: "Construct the interval",
          detail:
            "CI = (x_bar - margin of error, x_bar + margin of error). This is the range of plausible values for the population mean.",
        },
        {
          label: "Interpret",
          detail:
            "If we repeated sampling many times, 95% of such intervals would contain the true population mean. Any single interval either contains it or does not.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Test", "Use Case", "Data Type", "Assumptions", "Output"],
    rows: [
      [
        "One-sample t-test",
        "Compare sample mean to a known value",
        "Continuous",
        "Approximately normal (or n > 30)",
        "t-statistic, p-value",
      ],
      [
        "Two-sample t-test",
        "Compare means of two independent groups",
        "Continuous",
        "Normal, equal variance (or Welch's variant)",
        "t-statistic, p-value",
      ],
      [
        "Paired t-test",
        "Compare means of matched pairs (before/after)",
        "Continuous",
        "Differences are approximately normal",
        "t-statistic, p-value",
      ],
      [
        "Chi-squared test",
        "Test independence of categorical variables",
        "Categorical",
        "Expected frequencies >= 5",
        "chi^2 statistic, p-value",
      ],
      [
        "Pearson correlation",
        "Measure linear association between two continuous variables",
        "Continuous",
        "Linear relationship, bivariate normality",
        "r (-1 to 1), p-value",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between a Type I and Type II error?",
      a: "A Type I error (false positive) occurs when you reject a true null hypothesis. A Type II error (false negative) occurs when you fail to reject a false null hypothesis. The probability of Type I error is alpha (significance level); the probability of Type II error is beta. Power = 1 - beta is the probability of correctly rejecting a false null.",
      followUps: [
        "How do you reduce Type I error without increasing Type II error?",
        "What is the relationship between significance level and power?",
      ],
    },
    {
      q: "Explain the difference between correlation and causation.",
      a: "Correlation measures the strength and direction of a linear relationship between two variables. Causation means one variable directly influences the other. Correlation does not imply causation: two variables may be correlated due to a confounding variable, reverse causation, or coincidence. Establishing causation typically requires controlled experiments or causal inference techniques.",
      followUps: [
        "Give an example of spurious correlation.",
        "What methods can help establish causation from observational data?",
      ],
    },
    {
      q: "When would you use the median instead of the mean?",
      a: "Use the median when the data is skewed or contains outliers, since the median is robust to extreme values. For example, income data is typically right-skewed (a few very high earners pull up the mean), so median income is more representative of the 'typical' person.",
      followUps: [
        "What about the trimmed mean as a compromise?",
        "When is the mode more informative than either?",
      ],
    },
    {
      q: "What does a 95% confidence interval actually mean?",
      a: "It means that if we repeated the sampling procedure many times and constructed a confidence interval each time, approximately 95% of those intervals would contain the true population parameter. It does NOT mean there is a 95% probability that the true parameter lies in this specific interval. The parameter is fixed; the interval is random.",
      followUps: [
        "How does sample size affect the width of the confidence interval?",
        "What is the difference between a confidence interval and a credible interval?",
      ],
    },
  ],
  followUps: [
    "Study multiple linear regression and regularization techniques (Ridge, Lasso) for modeling with many predictors.",
    "Explore non-parametric tests (Mann-Whitney U, Wilcoxon) for when normality assumptions fail.",
    "Learn about ANOVA for comparing means across three or more groups.",
    "Investigate Bayesian inference as an alternative framework to frequentist hypothesis testing.",
  ],
  mcqs: [
    {
      q: "Which measure of central tendency is most affected by outliers?",
      options: ["Mean", "Median", "Mode", "IQR"],
      answerIndex: 0,
      explanation:
        "The mean includes every value in its calculation, so extreme outliers pull it significantly. Median and mode are robust to outliers.",
    },
    {
      q: "A p-value of 0.03 means:",
      options: [
        "There is a 3% probability that the null hypothesis is true",
        "There is a 3% probability of observing data this extreme if the null hypothesis is true",
        "The alternative hypothesis is 97% likely",
        "The effect size is 3%",
      ],
      answerIndex: 1,
      explanation:
        "The p-value is the probability of the observed (or more extreme) data under the null hypothesis, not the probability of the null being true.",
    },
    {
      q: "What does R-squared measure in linear regression?",
      options: [
        "The slope of the regression line",
        "The statistical significance of the model",
        "The proportion of variance in Y explained by the model",
        "The correlation between residuals",
      ],
      answerIndex: 2,
      explanation:
        "R^2 = 1 - SS_residual/SS_total, representing the fraction of total variance in Y that the regression model accounts for.",
    },
    {
      q: "A 99% confidence interval is ______ than a 95% CI for the same data.",
      options: ["Narrower", "Wider", "The same width", "Sometimes narrower, sometimes wider"],
      answerIndex: 1,
      explanation:
        "Higher confidence requires a larger critical value, which increases the margin of error and makes the interval wider.",
    },
    {
      q: "The chi-squared test is used for:",
      options: [
        "Comparing means of two groups",
        "Testing independence between categorical variables",
        "Measuring correlation between continuous variables",
        "Fitting a regression line",
      ],
      answerIndex: 1,
      explanation:
        "The chi-squared test of independence determines whether there is a significant association between two categorical variables using observed vs expected frequencies in a contingency table.",
    },
  ],
  exercises: [
    "Compute the mean, median, mode, variance, and standard deviation by hand for the dataset: [12, 15, 15, 18, 22, 25, 30, 35, 40, 200]. Discuss how the outlier (200) affects each measure.",
    "Perform a two-sample t-test (by hand or with code) to determine if there is a significant difference in exam scores between two classes. State your hypotheses, compute the test statistic and p-value, and interpret the result.",
    "Construct a 95% confidence interval for the mean height of a population given a sample of 50 students with mean 170 cm and standard deviation 8 cm.",
    "Given a contingency table of gender vs. preference (coffee/tea), perform a chi-squared test of independence. Compute expected frequencies, the chi^2 statistic, and interpret the result.",
  ],
  flashcards: [
    {
      front: "What is the difference between population and sample standard deviation?",
      back: "Population SD divides by N; sample SD divides by N-1 (Bessel's correction) to give an unbiased estimator of the population variance.",
    },
    {
      front: "What is a p-value?",
      back: "The probability of observing a test statistic as extreme as (or more extreme than) the observed value, assuming the null hypothesis is true.",
    },
    {
      front: "What is the formula for Pearson's correlation coefficient r?",
      back: "r = Cov(X,Y) / (SD(X) * SD(Y)). It ranges from -1 (perfect negative linear) to +1 (perfect positive linear). r = 0 means no linear correlation.",
    },
    {
      front: "Type I error vs Type II error?",
      back: "Type I: rejecting a true null (false positive, probability = alpha). Type II: failing to reject a false null (false negative, probability = beta).",
    },
    {
      front: "What does a confidence interval represent?",
      back: "A range computed from sample data that, across many repetitions of the sampling procedure, would contain the true population parameter a specified percentage (e.g., 95%) of the time.",
    },
    {
      front: "When should you use a t-test vs a z-test?",
      back: "Use a z-test when the population standard deviation is known (rare). Use a t-test when estimating the population SD from the sample (the common case).",
    },
    {
      front: "What is R-squared?",
      back: "R^2 = 1 - SS_res/SS_total. The proportion of variance in the dependent variable explained by the regression model. Ranges from 0 to 1.",
    },
    {
      front: "What is the interquartile range (IQR)?",
      back: "IQR = Q3 - Q1 (75th percentile minus 25th percentile). A robust measure of spread that is not affected by outliers.",
    },
  ],
  revisionNotes: [
    "Central tendency: Mean (sensitive to outliers) vs Median (robust, middle value) vs Mode (most frequent). Use median for skewed data.",
    "Spread: Variance = avg squared deviations. SD = sqrt(variance). IQR = Q3 - Q1 for outlier-robust spread.",
    "Hypothesis testing: State H0/H1, compute test statistic, get p-value, compare to alpha. p < alpha => reject H0. Type I = false positive (alpha), Type II = false negative (beta).",
    "Confidence interval: CI = estimate +/- critical_value * standard_error. Wider with higher confidence or smaller n.",
    "t-test: one-sample (vs known value), two-sample (compare groups), paired (matched pairs). Uses t-distribution with n-1 df.",
    "Correlation (r): linear association, -1 to 1. Regression: y = b0 + b1*x, R^2 = explained variance fraction. Correlation does not imply causation.",
  ],
  cheatSheet: [
    "Mean = sum(x) / n. Median = middle value (or avg of two middle). Mode = most frequent value.",
    "Sample variance = sum((x - x_bar)^2) / (n - 1). SD = sqrt(variance).",
    "95% CI for mean: x_bar +/- t_(0.025, n-1) * (s / sqrt(n)).",
    "t-statistic: t = (x_bar - mu_0) / (s / sqrt(n)), df = n - 1.",
    "Chi-squared: chi^2 = sum((O - E)^2 / E), df = (rows-1)(cols-1).",
    "Pearson r = Cov(X,Y) / (SD_X * SD_Y). R^2 = r^2 for simple linear regression.",
  ],
  resources: [
    {
      label: "OpenIntro Statistics (free textbook)",
      kind: "book",
      note: "Free, well-organized textbook covering descriptive stats, probability, inference, and regression with exercises.",
    },
    {
      label: "Khan Academy - Statistics and Probability",
      kind: "video",
      note: "Comprehensive free video course from basics through hypothesis testing and regression.",
    },
    {
      label: "Naked Statistics by Charles Wheelan",
      kind: "book",
      note: "Accessible, non-technical overview of statistical thinking. Great for intuition before diving into formulas.",
    },
    {
      label: "Scipy.stats documentation",
      kind: "docs",
      note: "Reference for Python statistical functions: distributions, hypothesis tests, correlation, and regression.",
    },
    {
      label: "Seeing Theory (Brown University)",
      kind: "article",
      note: "Interactive visual introduction to probability and statistics concepts in the browser.",
    },
  ],
  glossary: [
    {
      term: "Mean",
      definition:
        "The arithmetic average of a dataset: sum of all values divided by the count. Sensitive to outliers.",
    },
    {
      term: "Median",
      definition:
        "The middle value when data is sorted. Robust to outliers and skew.",
    },
    {
      term: "Standard Deviation",
      definition:
        "The square root of the variance; measures the typical distance of data points from the mean, in the same units as the data.",
    },
    {
      term: "P-value",
      definition:
        "The probability of observing a test statistic as extreme as the one computed, assuming the null hypothesis is true.",
    },
    {
      term: "Confidence Interval",
      definition:
        "A range of values constructed from sample data that, in repeated sampling, would contain the true population parameter a specified percentage of the time.",
    },
    {
      term: "Type I Error",
      definition:
        "Rejecting a true null hypothesis (false positive). Its probability is the significance level alpha.",
    },
    {
      term: "Type II Error",
      definition:
        "Failing to reject a false null hypothesis (false negative). Its probability is beta; power = 1 - beta.",
    },
    {
      term: "R-squared",
      definition:
        "The proportion of variance in the dependent variable explained by the regression model. Ranges from 0 (no explanatory power) to 1 (perfect fit).",
    },
  ],
};

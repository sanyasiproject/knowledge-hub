import type { TopicContent } from "../types";

export const mlEvaluation: TopicContent = {
  quickSummary: [
    "Precision measures the fraction of positive predictions that are actually correct, while recall measures the fraction of actual positives that the model identifies.",
    "The F1 score is the harmonic mean of precision and recall, providing a single metric that balances both, especially useful when classes are imbalanced.",
    "A confusion matrix is a table showing true positives, false positives, true negatives, and false negatives, giving a complete picture of classification performance.",
    "ROC curves plot true positive rate against false positive rate at various thresholds, and AUC summarizes overall discriminative ability in a single number.",
  ],
  detailed: [
    `## Precision, Recall, and F1 Score

**Precision** = TP / (TP + FP). It answers: of all items the model labeled positive, how many were actually positive? High precision means few false alarms.

**Recall** (sensitivity) = TP / (TP + FN). It answers: of all actual positives, how many did the model catch? High recall means few missed cases.

**F1 Score** = 2 * (Precision * Recall) / (Precision + Recall). It is the harmonic mean of precision and recall. The harmonic mean penalizes extreme imbalances, so a model with 0.95 precision but 0.10 recall gets a low F1.

The trade-off between precision and recall depends on the application. Spam filtering may tolerate lower recall to avoid false positives in the inbox. Cancer screening prioritizes recall to avoid missed diagnoses.`,

    `## Confusion Matrix

A confusion matrix for binary classification is a 2x2 table:

|                | Predicted Positive | Predicted Negative |
|----------------|--------------------|--------------------|
| Actual Positive | True Positive (TP) | False Negative (FN) |
| Actual Negative | False Positive (FP) | True Negative (TN) |

For multi-class problems, the matrix extends to N x N. Each cell (i, j) shows how many samples of class i were predicted as class j.

Key derived metrics:
- **Accuracy** = (TP + TN) / Total
- **Specificity** = TN / (TN + FP)
- **False Positive Rate** = FP / (FP + TN) = 1 - Specificity

Accuracy can be misleading with imbalanced datasets. If 95 percent of samples are negative, a model that always predicts negative achieves 95 percent accuracy but zero recall.`,

    `## ROC Curve and AUC

The **Receiver Operating Characteristic (ROC)** curve plots the True Positive Rate (recall) on the y-axis against the False Positive Rate on the x-axis at every possible classification threshold.

A perfect classifier hugs the top-left corner (TPR = 1, FPR = 0). A random classifier follows the diagonal.

**AUC (Area Under the Curve)** summarizes the ROC curve as a single scalar:
- AUC = 1.0: perfect discrimination
- AUC = 0.5: no discrimination (random)
- AUC < 0.5: worse than random (predictions are inverted)

AUC is threshold-independent, making it useful for comparing models without committing to a specific operating point. However, when the cost of false positives and false negatives differs greatly, examining the ROC at specific thresholds is more informative.`,

    `## Cross-Validation

Cross-validation estimates how well a model generalizes to unseen data by partitioning the dataset into multiple folds.

**k-Fold Cross-Validation**: split data into k equal folds. Train on k-1 folds, validate on the remaining fold. Repeat k times and average the metrics. Common choices are k = 5 or k = 10.

**Stratified k-Fold**: preserves the class distribution in each fold, critical for imbalanced datasets.

**Leave-One-Out (LOO)**: k equals the number of samples. Computationally expensive but maximizes training data per fold.

**Time-series split**: for temporal data, always train on past data and validate on future data to prevent data leakage.

Cross-validation reduces the variance of the performance estimate compared to a single train/test split and helps detect overfitting.`,

    `## Choosing the Right Metric

No single metric suits every problem. Guidelines:

- **Balanced classes, equal error costs**: accuracy or F1
- **Imbalanced classes**: F1, precision-recall AUC, or Matthews Correlation Coefficient
- **Ranking problems**: AUC-ROC, NDCG, Mean Average Precision
- **Regression**: MSE, RMSE, MAE, R-squared
- **Business alignment**: always map model metrics to business outcomes (e.g., revenue impact, user satisfaction)

Overfitting to a single metric is dangerous. Use a primary metric for optimization and guardrail metrics to ensure nothing else degrades.`,
  ],
  interviewQA: [
    {
      q: "When would you optimize for precision over recall, and vice versa?",
      a: "Optimize for precision when false positives are costly, such as email spam filtering where a legitimate email sent to spam is worse than missing some spam. Optimize for recall when false negatives are costly, such as disease screening where missing a positive case could be life-threatening. The choice depends on the relative cost of each type of error in the business context.",
    },
    {
      q: "Why is accuracy misleading on imbalanced datasets?",
      a: "If 99 percent of samples belong to the negative class, a model that always predicts negative achieves 99 percent accuracy while catching zero positive cases. Metrics like F1, precision-recall AUC, or the Matthews Correlation Coefficient are more informative because they account for the distribution of errors across classes.",
    },
    {
      q: "What does an AUC of 0.85 tell you about a classifier?",
      a: "An AUC of 0.85 means that if you pick a random positive sample and a random negative sample, the model assigns a higher score to the positive sample 85 percent of the time. It indicates good but not perfect discriminative ability. However, AUC does not reveal performance at any specific threshold, so you still need to choose a threshold based on the precision-recall trade-off for your use case.",
    },
    {
      q: "How does stratified k-fold cross-validation differ from regular k-fold?",
      a: "Stratified k-fold ensures each fold preserves the same class proportions as the full dataset. Regular k-fold splits data randomly, which can produce folds where a minority class is underrepresented or absent. Stratification is especially important for imbalanced datasets to get reliable per-fold estimates.",
    },
  ],
  followUps: [
    "Why is accuracy misleading here, and what would you report instead?",
    "Where could leakage be hiding in this setup?",
    "How do you cross-validate time-series data?",
    "How do you monitor quality when labels arrive weeks later?",
  ],
  mcqs: [
    {
      q: "A model predicts 100 items as positive. 80 are actually positive and 20 are negative. What is the precision?",
      options: ["0.20", "0.80", "0.50", "Cannot be determined"],
      answerIndex: 1,
      explanation:
        "Precision = TP / (TP + FP) = 80 / (80 + 20) = 0.80.",
    },
    {
      q: "Which metric is the harmonic mean of precision and recall?",
      options: ["Accuracy", "AUC", "F1 Score", "Specificity"],
      answerIndex: 2,
      explanation:
        "The F1 score is defined as 2 * (Precision * Recall) / (Precision + Recall), the harmonic mean of the two.",
    },
    {
      q: "What does the diagonal line on an ROC plot represent?",
      options: [
        "A perfect classifier",
        "A random classifier",
        "A classifier with zero false positives",
        "A classifier with perfect recall",
      ],
      answerIndex: 1,
      explanation:
        "The diagonal from (0,0) to (1,1) represents a random classifier with AUC = 0.5.",
    },
    {
      q: "In time-series cross-validation, why must you avoid random shuffling?",
      options: [
        "It increases training time",
        "It causes data leakage by letting the model train on future data",
        "It reduces the dataset size",
        "It changes the class distribution",
      ],
      answerIndex: 1,
      explanation:
        "Random shuffling breaks temporal order, allowing the model to see future data during training, which inflates performance estimates and does not reflect real-world deployment.",
    },
  ],
  flashcards: [
    {
      front: "What is precision?",
      back: "TP / (TP + FP) -- the fraction of positive predictions that are actually correct.",
    },
    {
      front: "What is recall (sensitivity)?",
      back: "TP / (TP + FN) -- the fraction of actual positives that the model correctly identifies.",
    },
    {
      front: "What is the F1 score?",
      back: "The harmonic mean of precision and recall: 2 * P * R / (P + R).",
    },
    {
      front: "What does AUC = 0.5 indicate?",
      back: "The model has no discriminative ability, equivalent to random guessing.",
    },
    {
      front: "What is specificity?",
      back: "TN / (TN + FP) -- the fraction of actual negatives correctly identified as negative.",
    },
    {
      front: "What is stratified k-fold cross-validation?",
      back: "A cross-validation variant that preserves the class distribution in every fold.",
    },
    {
      front: "Why is accuracy misleading on imbalanced data?",
      back: "A naive model predicting the majority class achieves high accuracy while failing completely on the minority class.",
    },
  ],
  resources: [
    {
      label: "Designing Machine Learning Systems — Chip Huyen",
      kind: "book",
    },
    {
      label: "scikit-learn documentation — model evaluation", url: "https://scikit-learn.org/stable/",
      kind: "docs",
    },
  ],
  glossary: [
    {
      term: "Precision",
      definition: "The ratio of true positives to all predicted positives, measuring the accuracy of positive predictions.",
    },
    {
      term: "Recall",
      definition: "The ratio of true positives to all actual positives, measuring the completeness of positive identification.",
    },
    {
      term: "F1 Score",
      definition: "The harmonic mean of precision and recall, balancing both metrics in a single value.",
    },
    {
      term: "Confusion Matrix",
      definition: "A table that visualizes model predictions against actual labels, showing TP, FP, TN, and FN counts.",
    },
    {
      term: "ROC Curve",
      definition: "A plot of true positive rate vs false positive rate at varying classification thresholds.",
    },
    {
      term: "AUC",
      definition: "Area Under the ROC Curve, summarizing a classifier's overall discriminative ability as a single scalar between 0 and 1.",
    },
    {
      term: "Cross-Validation",
      definition: "A resampling technique that partitions data into multiple train/test folds to estimate generalization performance.",
    },
  ],
  deepDive: [
    `**Precision-Recall curves** offer a more *informative* evaluation than **ROC curves** when dealing with **imbalanced datasets**. While the ROC curve plots *True Positive Rate* vs *False Positive Rate*, the **PR curve** plots **Precision** (y-axis) against **Recall** (x-axis) at every classification threshold. The key insight is that the *False Positive Rate* used in ROC can appear deceptively low when the negative class is very large — even a high number of false positives translates to a small FPR. The **PR AUC** (also called *Average Precision*) directly focuses on the positive class, making it far more sensitive to changes in model performance on the *minority class*. A model with \`AUC-ROC = 0.95\` might have a \`PR AUC = 0.40\` on a dataset where only 1% of samples are positive, revealing that the model struggles with the rare class. In practice, always examine **both** curves: the ROC curve for overall discriminative ability and the PR curve for *class-specific* performance. The \`sklearn.metrics.precision_recall_curve\` and \`sklearn.metrics.average_precision_score\` functions make this straightforward in Python.`,

    `**Statistical significance testing** is *critical* when comparing two models to ensure that observed performance differences are not due to random variation. The **paired t-test** on cross-validation folds compares the mean difference in scores across *k* folds, but it can be *anti-conservative* because fold results are not truly independent (they share training data). **McNemar's test** is more appropriate for comparing two classifiers on the *same* test set: it constructs a 2x2 contingency table of samples where the models *disagree* and tests whether the disagreements are symmetric. The test statistic is \`chi2 = (b - c)^2 / (b + c)\` where *b* and *c* are the off-diagonal counts. For a more robust approach, **bootstrap confidence intervals** repeatedly resample the test set (with replacement), compute the metric difference on each resample, and derive a *95% confidence interval*. If the interval excludes zero, the difference is statistically significant. Use \`scipy.stats.ttest_rel\` for paired t-tests and implement bootstrap with \`numpy.random.choice\`. Always report **confidence intervals** alongside point estimates — a model with *0.82 F1 +/- 0.03* is far more informative than just *0.82 F1*.`,

    `**Evaluation pitfalls** can silently inflate metrics and lead to models that *fail catastrophically* in production. **Data leakage** is the most dangerous: it occurs when information from the test set bleeds into training, either through *feature leakage* (using a feature that encodes the target, like a \`patient_outcome\` column computed after diagnosis) or *temporal leakage* (shuffling time-series data so the model trains on future events). Always apply \`train_test_split\` *before* any preprocessing like scaling or imputation — fitting a \`StandardScaler\` on the full dataset before splitting leaks test statistics into training. **Label noise** — incorrect labels in the training or test data — biases both training and evaluation. A model may appear to underperform when it is actually correct and the labels are wrong. Audit a random sample of labels, especially near the *decision boundary*. **Metric gaming** happens when teams over-optimize a single metric at the expense of real-world performance: a fraud detector tuned purely for *recall* may flag 80% of transactions as fraudulent. Use **guardrail metrics** (latency, false positive rate, user satisfaction) alongside the primary optimization target. Run \`sklearn.model_selection.cross_val_score\` with multiple scoring parameters to track several metrics simultaneously.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "Classification metrics from the confusion matrix — and why accuracy lies",
      source: `type Binary = 0 | 1;

export function confusionMatrix(yTrue: Binary[], yPred: Binary[]) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < yTrue.length; i++) {
    if (yPred[i] === 1 && yTrue[i] === 1) tp++;
    else if (yPred[i] === 1 && yTrue[i] === 0) fp++;
    else if (yPred[i] === 0 && yTrue[i] === 0) tn++;
    else fn++;
  }
  return { tp, fp, tn, fn };
}

export function metrics(yTrue: Binary[], yPred: Binary[]) {
  const { tp, fp, tn, fn } = confusionMatrix(yTrue, yPred);
  const safe = (num: number, den: number) => (den === 0 ? 0 : num / den);

  const precision = safe(tp, tp + fp); // of what I flagged, how much was right
  const recall = safe(tp, tp + fn);    // of what was really there, how much I caught

  return {
    accuracy: safe(tp + tn, tp + tn + fp + fn),
    precision,
    recall,
    f1: safe(2 * precision * recall, precision + recall),
    baseRate: safe(tp + fn, yTrue.length), // ALWAYS report this alongside
  };
}

// The trap, made concrete. 1,000 transactions, 5 of them fraudulent.
// A model that predicts "not fraud" for everything:
//   accuracy  = 995/1000 = 99.5%   <- looks excellent
//   recall    = 0/5      = 0%      <- catches nothing
//   precision = undefined          <- never flags anything
//
// This is why accuracy is meaningless without the base rate, and why
// imbalanced problems are reported with precision, recall, and PR-AUC.
// ROC-AUC is also over-optimistic here: the false-positive rate has a huge
// denominator (995 negatives) so it stays flatteringly low.
//
// The threshold is a business decision, not a model property: pick it from the
// cost of a missed fraud versus the cost of blocking a real customer.`,
    },
  ],
  diagrams: [
    {
      title: "Model Evaluation Pipeline",
      kind: "flow",
      caption: "End-to-end flow from raw data through evaluation to model selection",
      mermaid: `graph TD
    A[Raw Dataset] --> B[Train/Test Split]
    B --> C[Training Set]
    B --> D[Test Set]
    C --> E[k-Fold Cross-Validation]
    E --> F[Fold 1: Train on 4, Validate on 1]
    E --> G[Fold 2: Train on 4, Validate on 1]
    E --> H[Fold k: Train on 4, Validate on 1]
    F --> I[Compute Metrics per Fold]
    G --> I
    H --> I
    I --> J[Average Metrics + Std Dev]
    J --> K{Metrics Acceptable?}
    K -->|Yes| L[Evaluate on Held-Out Test Set]
    K -->|No| M[Tune Hyperparameters]
    M --> E
    L --> N[Final Performance Report]
    N --> O[Deploy or Iterate]`,
    },
    {
      title: "Metrics Selection Decision Flow",
      kind: "flow",
      caption: "How to choose the right evaluation metric based on problem characteristics",
      mermaid: `graph TD
    A[What is the problem type?] --> B{Classification or Regression?}
    B -->|Classification| C{Classes Balanced?}
    B -->|Regression| D[Use MSE, RMSE, MAE, R-squared]
    C -->|Yes| E{Error Costs Equal?}
    C -->|No| F[Use F1, PR AUC, MCC]
    E -->|Yes| G[Use Accuracy or F1]
    E -->|No| H{Which Error is Costlier?}
    H -->|False Positives| I[Optimize Precision]
    H -->|False Negatives| J[Optimize Recall]
    F --> K{Ranking Needed?}
    K -->|Yes| L[Use AUC-ROC, NDCG, MAP]
    K -->|No| M[Use F1 or PR AUC]`,
    },
  ],
  animations: [
    {
      title: "Where leakage hides",
      steps: [
        {
          label: "Load the full dataset",
          detail: "All rows, all features.",
        },
        {
          label: "Scale it",
          detail: "Fit the scaler on everything, then split into train and test.",
        },
        {
          label: "The leak",
          detail: "The scaler's mean and variance were computed using test rows — the test set influenced the transform.",
        },
        {
          label: "Result",
          detail: "Validation scores look excellent, because the model was evaluated on data it indirectly saw.",
        },
        {
          label: "Production",
          detail: "Performance drops sharply, and nothing in the offline process predicted it.",
        },
        {
          label: "Fix",
          detail: "Split first, then fit every transform inside the training fold only. Put preprocessing in a pipeline so this can't be forgotten.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Metric", "Formula", "Best For", "Limitations", "Range"],
    rows: [
      ["**Accuracy**", "`(TP+TN) / Total`", "Balanced binary/multiclass", "Misleading on *imbalanced* data", "`[0, 1]`"],
      ["**Precision**", "`TP / (TP+FP)`", "When **false positives** are costly (spam filter)", "Ignores false negatives entirely", "`[0, 1]`"],
      ["**Recall**", "`TP / (TP+FN)`", "When **false negatives** are costly (disease screening)", "Ignores false positives entirely", "`[0, 1]`"],
      ["**F1 Score**", "`2*P*R / (P+R)`", "*Imbalanced* classes; balancing precision and recall", "Assumes equal importance of P and R", "`[0, 1]`"],
      ["**AUC-ROC**", "Area under TPR vs FPR curve", "Threshold-independent model comparison", "Can be *overly optimistic* on imbalanced data", "`[0, 1]`"],
      ["**MAE**", "`mean(|y - y_hat|)`", "Regression with *uniform* error importance", "Less sensitive to outliers than RMSE", "`[0, inf)`"],
      ["**RMSE**", "`sqrt(mean((y - y_hat)^2))`", "Regression where **large errors** matter more", "Sensitive to *outliers*; hard to compare across scales", "`[0, inf)`"],
    ],
  },
  exercises: [
    `**Exercise 1: Confusion Matrix Analysis** -- Given a binary classifier with \`TP=45\`, \`FP=10\`, \`TN=130\`, \`FN=15\`, compute **precision**, **recall**, **F1 score**, **accuracy**, and **specificity** by hand. Then determine whether this model is better suited for a *spam filter* or a *disease screener* and justify your choice.`,
    `**Exercise 2: ROC and PR Curve Comparison** -- Train two classifiers (e.g., \`LogisticRegression\` and \`RandomForestClassifier\`) on the *breast cancer* dataset from \`sklearn.datasets\`. Plot both the **ROC curve** and the **Precision-Recall curve** for each model. Compare the \`AUC-ROC\` and \`PR AUC\` values and explain when each curve is more informative.`,
    `**Exercise 3: Cross-Validation Experiment** -- Using \`sklearn.model_selection.cross_val_score\`, compare **5-fold**, **10-fold**, and **Leave-One-Out** cross-validation on a small dataset (n=200). Measure the *mean* and *standard deviation* of F1 scores. Discuss the **bias-variance tradeoff** in the cross-validation estimate itself.`,
    `**Exercise 4: Data Leakage Detection** -- Intentionally create a data leakage scenario: fit a \`StandardScaler\` on the *entire* dataset before splitting, then compare test metrics against a correct pipeline using \`sklearn.pipeline.Pipeline\`. Quantify how much the **leaked** metrics overestimate true performance.`,
    `**Exercise 5: Bootstrap Confidence Intervals** -- Implement a **bootstrap** procedure (1000 resamples) to compute a *95% confidence interval* for the **F1 score** of a trained classifier. Use \`numpy.random.choice\` with \`replace=True\` and report whether the confidence interval is wide enough to overlap with a competing model's interval.`,
  ],
  cheatSheet: [
    `**Precision** = \`TP / (TP + FP)\` -- *"Of all predicted positives, how many are correct?"*`,
    `**Recall** = \`TP / (TP + FN)\` -- *"Of all actual positives, how many did we catch?"*`,
    `**F1** = \`2 * P * R / (P + R)\` -- harmonic mean; use when classes are *imbalanced*`,
    `**AUC-ROC** -- threshold-independent; \`1.0\` = perfect, \`0.5\` = random; prefer **PR AUC** for imbalanced data`,
    `**Stratified k-Fold** -- always use \`StratifiedKFold\` for classification to preserve class ratios in each fold`,
    `**Data leakage check** -- fit preprocessors *inside* \`Pipeline\` or *after* \`train_test_split\`, never on the full dataset before splitting`,
  ],
  revisionNotes: [
    `**Precision vs Recall tradeoff**: raising the classification *threshold* increases **precision** but decreases **recall**. The optimal threshold depends on the *business cost* of false positives vs false negatives. Use \`precision_recall_curve\` to visualize.`,
    `**ROC vs PR curves**: ROC curves can be *misleadingly optimistic* on imbalanced datasets because FPR stays low even with many false positives. *Always* supplement ROC with a **Precision-Recall curve** when the positive class is rare (<10% prevalence).`,
    `**Cross-validation best practices**: use *stratified* folds for classification, *time-series split* for temporal data, and report \`mean +/- std\` across folds. A high *standard deviation* across folds indicates the model is **sensitive to data splits** and may not generalize well.`,
    `**Statistical comparison**: never claim Model A beats Model B based on a *single* test set score. Use **McNemar's test** (for paired predictions), **bootstrap confidence intervals**, or **paired t-test** on cross-validation folds to establish significance at \`p < 0.05\`.`,
    `**Guard against data leakage**: the three most common sources are (1) *fitting preprocessors* on the full dataset before splitting, (2) using *future information* in time-series features, and (3) including *proxy features* that encode the target variable. Always use \`sklearn.pipeline.Pipeline\` to encapsulate preprocessing.`,
  ],
};

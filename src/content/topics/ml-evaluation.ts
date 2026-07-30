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
};

import type { TopicContent } from "../types";

export const mlBasics: TopicContent = {
  quickSummary: [
    "Supervised learning trains models on labeled data (input-output pairs). The model learns to map inputs to outputs by minimizing prediction error. Examples: classification (spam detection), regression (house price prediction).",
    "Unsupervised learning finds patterns in unlabeled data without predefined outputs. Examples: clustering (customer segmentation with K-means), dimensionality reduction (PCA), anomaly detection. The model discovers structure on its own.",
    "Training is the process of learning model parameters from data. Inference is using the trained model to make predictions on new data. Training is compute-intensive and done offline; inference must be fast and runs in production.",
    "Overfitting occurs when a model memorizes training data (including noise) and performs poorly on unseen data. The bias-variance trade-off captures the tension between a model that is too simple (high bias, underfitting) and too complex (high variance, overfitting).",
  ],
  detailed: [
    "## Supervised vs. Unsupervised Learning\n\n**Supervised learning** requires labeled training data: each example has input features and a known output label. The model learns a function f(x) -> y that generalizes to unseen inputs. **Classification** predicts discrete categories (email is spam or not spam; image contains a cat or dog). Common algorithms: logistic regression, decision trees, random forests, SVMs, neural networks. **Regression** predicts continuous values (house price, temperature, stock return). Common algorithms: linear regression, polynomial regression, gradient boosting, neural networks. **Unsupervised learning** works with unlabeled data: the model finds structure without being told what to look for. **Clustering** groups similar data points (K-means, DBSCAN, hierarchical clustering). **Dimensionality reduction** compresses high-dimensional data while preserving structure (PCA, t-SNE, autoencoders). **Anomaly detection** identifies unusual patterns (isolation forest, one-class SVM). **Semi-supervised learning** combines a small amount of labeled data with a large amount of unlabeled data, useful when labeling is expensive.",
    "## Training and Inference Pipeline\n\n**Training pipeline**: (1) Data collection and cleaning: remove duplicates, handle missing values, fix errors. (2) Feature engineering: transform raw data into useful features (one-hot encoding, normalization, feature crosses). (3) Train/test split: typically 80/20. Use cross-validation for robust evaluation. (4) Model training: feed training data to the algorithm, which iteratively adjusts parameters to minimize a loss function (e.g., mean squared error for regression, cross-entropy for classification). (5) Evaluation: measure performance on the test set using metrics like accuracy, precision, recall, F1, AUC-ROC. (6) Hyperparameter tuning: adjust settings like learning rate, tree depth, regularization strength. **Inference pipeline**: (1) Receive input data. (2) Apply the same feature transformations used during training. (3) Pass through the trained model. (4) Return prediction. Inference must be fast (milliseconds) and consistent. Deploy models via REST APIs, batch prediction jobs, or embedded in applications.",
    "## Overfitting and Underfitting\n\n**Overfitting**: the model learns the training data too well, including noise and outliers. It achieves high accuracy on training data but poor accuracy on unseen test data. Signs: large gap between training and test performance. Causes: model too complex (too many parameters), too little training data, training for too many epochs. **Remedies**: regularization (L1/L2 penalties that shrink model weights), dropout (randomly disabling neurons during training), early stopping (stop training when test performance stops improving), data augmentation (artificially increasing training data), simpler model architecture. **Underfitting**: the model is too simple to capture the patterns in the data. Low accuracy on both training and test data. Causes: model too simple, insufficient features, too much regularization. **Remedies**: more complex model, better features, less regularization, more training time.",
    "## Bias-Variance Trade-Off\n\n**Bias** is the error from overly simplistic assumptions. A high-bias model (e.g., linear regression on non-linear data) consistently misses patterns, underfitting both training and test data. **Variance** is the error from sensitivity to training data fluctuations. A high-variance model (e.g., a deep decision tree) fits training data perfectly but gives different results on different training sets, overfitting. **Total error = Bias^2 + Variance + Irreducible Noise**. As model complexity increases, bias decreases but variance increases. The optimal model minimizes total error. In practice: start simple (high bias, low variance), gradually increase complexity, monitor test performance, and stop when test error starts increasing (variance begins to dominate). Ensemble methods like random forests reduce variance (by averaging many high-variance trees), while boosting methods reduce bias (by sequentially correcting errors).",
    "## Key Concepts for Engineers\n\n**Feature engineering** is often more impactful than model selection. A well-engineered feature (e.g., 'days since last purchase' instead of raw purchase timestamps) can make a simple model outperform a complex one. **Train/validation/test split**: use training data to learn, validation data to tune hyperparameters, test data for final evaluation. Never peek at test data during development. **Cross-validation**: split data into K folds, train on K-1, validate on 1, repeat K times. Gives a more robust performance estimate. **Metrics matter**: accuracy is misleading for imbalanced datasets (99% accuracy on 99% negative data means predicting all negative). Use precision (how many positive predictions are correct), recall (how many actual positives are found), and F1 (harmonic mean of precision and recall). For ranking problems, use AUC-ROC or NDCG.",
  ],
  interviewQA: [
    {
      q: "Explain the bias-variance trade-off with a concrete example.",
      a: "Imagine fitting a curve to data points. A straight line (linear regression) has high bias: it cannot capture a curved pattern, so it underfits. A very high-degree polynomial has high variance: it passes through every training point (including noisy ones) but oscillates wildly between points, so it overfits. The best model is somewhere in between: complex enough to capture the true pattern but not so complex that it fits the noise. For example, if the true relationship is quadratic, a degree-2 polynomial has both low bias and low variance. Total error = bias^2 + variance + noise. As you increase polynomial degree, bias drops but variance rises. The optimal degree minimizes total error.",
    },
    {
      q: "How do you detect and prevent overfitting?",
      a: "Detection: compare training and test/validation performance. If training accuracy is 99% but test accuracy is 75%, the model is overfitting. Plot learning curves (performance vs. training set size): if the training curve is high and the test curve is low and they diverge, it is overfitting. Prevention: (1) More training data (most effective). (2) Regularization (L1/L2 add a penalty for large weights). (3) Dropout (for neural networks, randomly disable neurons during training). (4) Early stopping (stop when validation loss stops decreasing). (5) Simpler model (fewer layers, fewer trees, lower polynomial degree). (6) Data augmentation (for images: rotation, flipping, cropping). (7) Cross-validation for robust evaluation.",
    },
    {
      q: "When would you use unsupervised learning instead of supervised learning?",
      a: "Use unsupervised learning when: (1) You don't have labeled data and labeling is expensive or impractical. (2) You want to discover hidden structure (customer segments you didn't know existed). (3) For data preprocessing: dimensionality reduction with PCA before supervised learning to reduce noise and computation. (4) Anomaly detection where anomalies are rare and diverse (fraud, intrusion detection): train on normal data and flag deviations. (5) Exploratory data analysis: understand the structure of a new dataset before building supervised models. Supervised learning is preferred when labels are available because it directly optimizes for the task you care about.",
    },
    {
      q: "What is the difference between training and inference, and why does it matter for system design?",
      a: "Training learns model parameters from data: it's compute-intensive (hours to weeks on GPUs), done offline, and tolerant of high latency. Inference uses the trained model to make predictions: it must be fast (milliseconds), runs in production, and must handle concurrent requests. This matters for system design because: training requires GPU clusters, large storage for datasets, and experiment tracking. Inference requires model serving infrastructure (TensorFlow Serving, TorchServe), low-latency networking, model caching, batching for throughput, and A/B testing for model rollout. The training pipeline and inference pipeline have very different scaling, latency, and reliability requirements.",
    },
  ],
  mcqs: [
    {
      q: "A model achieves 98% accuracy on training data but only 60% on test data. This is an example of:",
      options: [
        "Underfitting",
        "Overfitting",
        "High bias",
        "Good generalization",
      ],
      answerIndex: 1,
      explanation:
        "A large gap between training and test performance indicates overfitting: the model has memorized training data (including noise) and fails to generalize to unseen data.",
    },
    {
      q: "Which of the following is an unsupervised learning task?",
      options: [
        "Spam email detection",
        "Customer segmentation using clustering",
        "House price prediction",
        "Image classification",
      ],
      answerIndex: 1,
      explanation:
        "Customer segmentation using clustering (e.g., K-means) is unsupervised: it groups customers by similarity without predefined labels. The other tasks require labeled data (spam/not-spam, price, category).",
    },
    {
      q: "Regularization helps prevent overfitting by:",
      options: [
        "Adding more training data",
        "Increasing model complexity",
        "Penalizing large model weights to keep the model simpler",
        "Training for more epochs",
      ],
      answerIndex: 2,
      explanation:
        "Regularization (L1/L2) adds a penalty term to the loss function proportional to the magnitude of model weights. This discourages the model from assigning extreme weights, effectively constraining complexity and reducing overfitting.",
    },
    {
      q: "In the bias-variance trade-off, as model complexity increases:",
      options: [
        "Both bias and variance increase",
        "Both bias and variance decrease",
        "Bias decreases and variance increases",
        "Bias increases and variance decreases",
      ],
      answerIndex: 2,
      explanation:
        "More complex models can fit more patterns (lower bias) but become more sensitive to training data fluctuations (higher variance). The optimal complexity minimizes the sum of bias squared plus variance.",
    },
  ],
  flashcards: [
    {
      front: "What is supervised learning?",
      back: "Learning from labeled data (input-output pairs). The model learns to predict outputs from inputs by minimizing error on training examples. Classification predicts categories; regression predicts continuous values.",
    },
    {
      front: "What is unsupervised learning?",
      back: "Learning from unlabeled data to discover structure. Clustering groups similar points (K-means). Dimensionality reduction compresses features (PCA). Anomaly detection finds outliers. No predefined correct answers.",
    },
    {
      front: "What is overfitting?",
      back: "When a model learns training data too well, including noise, and performs poorly on unseen data. Signs: high training accuracy, low test accuracy. Remedies: regularization, dropout, early stopping, more data, simpler model.",
    },
    {
      front: "What is the bias-variance trade-off?",
      back: "Total error = bias^2 + variance + noise. Bias: error from simplistic assumptions (underfitting). Variance: error from sensitivity to training data (overfitting). Increasing complexity reduces bias but increases variance. Optimal complexity minimizes total error.",
    },
    {
      front: "What is the difference between training and inference?",
      back: "Training: learning model parameters from data. Compute-intensive, done offline (hours-weeks on GPUs). Inference: using the trained model to make predictions. Must be fast (milliseconds), runs in production, handles concurrent requests.",
    },
    {
      front: "What is regularization?",
      back: "A technique to prevent overfitting by adding a penalty to the loss function for large model weights. L1 (Lasso) encourages sparse weights (feature selection). L2 (Ridge) encourages small weights. Lambda controls penalty strength.",
    },
    {
      front: "Why is accuracy misleading for imbalanced datasets?",
      back: "If 99% of samples are negative, always predicting negative gives 99% accuracy but catches zero positives. Use precision (correct positive predictions / total positive predictions), recall (correct positive predictions / total actual positives), and F1 (harmonic mean) instead.",
    },
  ],
  glossary: [
    {
      term: "Supervised Learning",
      definition:
        "A machine learning paradigm where models learn from labeled training data (input-output pairs) to predict outputs for new inputs.",
    },
    {
      term: "Unsupervised Learning",
      definition:
        "A machine learning paradigm where models find patterns in unlabeled data without predefined outputs. Includes clustering, dimensionality reduction, and anomaly detection.",
    },
    {
      term: "Overfitting",
      definition:
        "When a model memorizes training data (including noise) and fails to generalize to unseen data. Characterized by high training accuracy and low test accuracy.",
    },
    {
      term: "Bias (ML)",
      definition:
        "Error from overly simplistic model assumptions. High bias leads to underfitting: the model cannot capture the true patterns in the data.",
    },
    {
      term: "Variance (ML)",
      definition:
        "Error from the model's sensitivity to fluctuations in the training data. High variance leads to overfitting: different training sets produce very different models.",
    },
    {
      term: "Regularization",
      definition:
        "A technique that adds a penalty term to the loss function to discourage complex models. L1 promotes sparsity; L2 promotes small weights. Reduces overfitting.",
    },
    {
      term: "Cross-Validation",
      definition:
        "A technique that splits data into K folds, trains on K-1 folds and validates on the remaining fold, repeating K times. Provides a robust estimate of model performance.",
    },
  ],
};

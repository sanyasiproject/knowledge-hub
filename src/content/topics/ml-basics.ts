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
  deepDive: [
    `**Mathematical Foundations of Gradient Descent and Loss Functions**

Gradient descent is the *workhorse optimization algorithm* behind most machine learning models. At its core, it iteratively adjusts model parameters **w** by computing the **gradient** (vector of partial derivatives) of a *loss function* \`L(w)\` with respect to each parameter, then stepping in the **opposite direction**: \`w = w - learning_rate * dL/dw\`. The **learning rate** (often denoted \`alpha\` or \`eta\`) controls the step size — too large and the optimizer *overshoots* the minimum, too small and convergence is *painfully slow*. **Batch gradient descent** computes the gradient over the *entire* dataset, giving a stable but expensive update. **Stochastic gradient descent** (\`SGD\`) computes the gradient on a *single sample*, introducing noise that can help escape **local minima** but makes convergence erratic. **Mini-batch gradient descent** (typical batch sizes: \`32\`, \`64\`, \`128\`) strikes a balance and is the *de facto standard*. The choice of **loss function** defines what the model optimizes for: \`Mean Squared Error (MSE)\` for regression penalizes large errors quadratically, \`Cross-Entropy Loss\` for classification measures the divergence between predicted probabilities and true labels, and \`Hinge Loss\` is used by **SVMs** for maximum-margin classification. Advanced optimizers like **Adam** combine *momentum* (exponentially weighted moving average of past gradients) with *adaptive learning rates* per parameter, making them robust to hyperparameter choices. The **convergence guarantee** of gradient descent relies on the loss function being *convex* — for non-convex problems (like **neural networks**), we rely on empirical success and techniques like \`learning rate scheduling\`, \`warm restarts\`, and \`gradient clipping\`.`,

    `**Feature Engineering Best Practices and Pitfalls**

Feature engineering is often called the *"secret sauce"* of machine learning — a well-crafted feature can boost performance more than switching to a fancier model. **Numerical features** should be *scaled* appropriately: use \`StandardScaler\` (zero mean, unit variance) for algorithms sensitive to scale like **SVMs** and **k-NN**, or \`MinMaxScaler\` for bounded ranges. **Categorical features** require encoding: \`one-hot encoding\` works for low-cardinality features (e.g., color with 5 values), but creates *curse of dimensionality* issues with high-cardinality features (e.g., zip codes) — consider \`target encoding\` or \`embedding layers\` instead. **Date/time features** should be decomposed into meaningful components: \`day_of_week\`, \`hour\`, \`is_weekend\`, \`days_since_event\`. **Text features** can be transformed using \`TF-IDF\`, \`word2vec\`, or modern **transformer embeddings**. Common *pitfalls* include: **data leakage** — accidentally including information from the target variable or future data in features (e.g., using \`total_purchases\` to predict \`will_purchase\`); **look-ahead bias** — using data that would not be available at prediction time; **overfitting to training data** — computing feature statistics (mean, std) on the *entire dataset* instead of only the training fold. Always use \`Pipeline\` from **scikit-learn** to ensure transformations are fit *only* on training data and applied consistently to test data. **Feature selection** methods include *filter methods* (correlation, mutual information), *wrapper methods* (\`recursive feature elimination\`), and *embedded methods* (**L1 regularization** which zeros out irrelevant feature weights). The golden rule: *start with simple, interpretable features before engineering complex ones*.`,

    `**Ensemble Methods: Bagging vs. Boosting in Depth**

Ensemble methods combine multiple *weak learners* to produce a **strong learner**, leveraging the *wisdom of crowds* principle. The two dominant paradigms are **bagging** and **boosting**, which address different components of the *bias-variance tradeoff*. **Bagging** (Bootstrap AGGregatING) reduces **variance** by training multiple models on *bootstrap samples* (random samples with replacement) of the training data and **averaging** their predictions (regression) or taking a **majority vote** (classification). The canonical example is the **Random Forest**: it bags \`n_estimators\` decision trees, and additionally introduces *feature randomness* by considering only a random subset of features (\`max_features\`) at each split. This *decorrelates* the trees, further reducing variance. Key hyperparameters: \`n_estimators\` (more trees = lower variance, diminishing returns past ~100-500), \`max_depth\`, \`min_samples_split\`. **Boosting** reduces **bias** by training models *sequentially*, where each new model focuses on the **errors** of the previous ensemble. **AdaBoost** reweights misclassified samples so the next classifier pays more attention to them. **Gradient Boosting** (\`XGBoost\`, \`LightGBM\`, \`CatBoost\`) fits each new tree to the *residual errors* (negative gradient of the loss function) of the current ensemble. Key hyperparameters: \`learning_rate\` (shrinkage — lower values require more trees but generalize better), \`n_estimators\`, \`max_depth\` (typically shallow, 3-8). *When to use which*: bagging when you have a **high-variance** base model (deep trees), boosting when you need to squeeze out **maximum accuracy** and are willing to risk overfitting (mitigated by \`early_stopping\` and \`regularization\`). **Stacking** is a third approach: train diverse models (e.g., random forest + SVM + neural net) and use a *meta-learner* to combine their predictions.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "ML training pipeline in C++: data split, scaling, training, and evaluation",
      source: `// Demonstrates a simple ML training pipeline in C++:
// data generation, train/test split, feature scaling, and evaluation metrics.

#include <iostream>
#include <vector>
#include <random>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <iomanip>

struct Dataset {
    std::vector<std::vector<double>> X;
    std::vector<int> y;
};

// Split dataset into train/test by ratio
std::pair<Dataset, Dataset> train_test_split(
    const Dataset& data, double test_ratio, unsigned seed = 42)
{
    size_t n = data.X.size();
    std::vector<size_t> indices(n);
    std::iota(indices.begin(), indices.end(), 0);
    std::mt19937 rng(seed);
    std::shuffle(indices.begin(), indices.end(), rng);

    size_t test_size = static_cast<size_t>(n * test_ratio);
    Dataset train, test;
    for (size_t i = 0; i < n; ++i) {
        if (i < n - test_size) {
            train.X.push_back(data.X[indices[i]]);
            train.y.push_back(data.y[indices[i]]);
        } else {
            test.X.push_back(data.X[indices[i]]);
            test.y.push_back(data.y[indices[i]]);
        }
    }
    return {train, test};
}

// StandardScaler: compute mean/std from train, apply to both
struct Scaler {
    std::vector<double> mean, stddev;

    void fit(const std::vector<std::vector<double>>& X) {
        size_t n = X.size(), d = X[0].size();
        mean.assign(d, 0.0);
        stddev.assign(d, 0.0);
        for (const auto& row : X)
            for (size_t j = 0; j < d; ++j) mean[j] += row[j];
        for (auto& m : mean) m /= n;
        for (const auto& row : X)
            for (size_t j = 0; j < d; ++j)
                stddev[j] += (row[j] - mean[j]) * (row[j] - mean[j]);
        for (auto& s : stddev) s = std::sqrt(s / n);
    }

    void transform(std::vector<std::vector<double>>& X) const {
        for (auto& row : X)
            for (size_t j = 0; j < row.size(); ++j)
                row[j] = (stddev[j] > 1e-8) ? (row[j] - mean[j]) / stddev[j] : 0.0;
    }
};

// Simple nearest-centroid classifier for demonstration
struct NearestCentroidClassifier {
    std::vector<std::vector<double>> centroids;  // one per class
    int num_classes = 2;

    void fit(const std::vector<std::vector<double>>& X, const std::vector<int>& y) {
        size_t d = X[0].size();
        centroids.assign(num_classes, std::vector<double>(d, 0.0));
        std::vector<int> counts(num_classes, 0);
        for (size_t i = 0; i < X.size(); ++i) {
            for (size_t j = 0; j < d; ++j)
                centroids[y[i]][j] += X[i][j];
            counts[y[i]]++;
        }
        for (int c = 0; c < num_classes; ++c)
            for (size_t j = 0; j < d; ++j)
                centroids[c][j] /= counts[c];
    }

    int predict_one(const std::vector<double>& x) const {
        int best = 0;
        double best_dist = 1e18;
        for (int c = 0; c < num_classes; ++c) {
            double dist = 0;
            for (size_t j = 0; j < x.size(); ++j)
                dist += (x[j] - centroids[c][j]) * (x[j] - centroids[c][j]);
            if (dist < best_dist) { best_dist = dist; best = c; }
        }
        return best;
    }

    std::vector<int> predict(const std::vector<std::vector<double>>& X) const {
        std::vector<int> preds;
        preds.reserve(X.size());
        for (const auto& x : X) preds.push_back(predict_one(x));
        return preds;
    }
};

double accuracy(const std::vector<int>& y_true, const std::vector<int>& y_pred) {
    int correct = 0;
    for (size_t i = 0; i < y_true.size(); ++i)
        if (y_true[i] == y_pred[i]) ++correct;
    return static_cast<double>(correct) / y_true.size();
}

int main() {
    // Generate synthetic data: y = 1 if X[0] + X[1] > 0
    std::mt19937 rng(42);
    std::normal_distribution<double> dist(0.0, 1.0);
    Dataset data;
    for (int i = 0; i < 1000; ++i) {
        std::vector<double> row(10);
        for (auto& v : row) v = dist(rng);
        data.X.push_back(row);
        data.y.push_back((row[0] + row[1] > 0) ? 1 : 0);
    }

    // Split 80/20
    auto [train, test] = train_test_split(data, 0.2);

    // Scale features
    Scaler scaler;
    scaler.fit(train.X);
    scaler.transform(train.X);
    scaler.transform(test.X);

    // Train and evaluate
    NearestCentroidClassifier model;
    model.fit(train.X, train.y);
    auto y_pred = model.predict(test.X);

    std::cout << "Accuracy: " << std::fixed << std::setprecision(4)
              << accuracy(test.y, y_pred) << std::endl;

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Gradient descent from scratch for linear regression in C++",
      source: `// Linear regression via gradient descent in C++.
// Minimizes MSE loss: L = (1/n) * sum((y - Xw - b)^2)

#include <iostream>
#include <vector>
#include <cmath>
#include <random>
#include <iomanip>
#include <numeric>

using Vec = std::vector<double>;
using Mat = std::vector<Vec>;

struct GDResult {
    Vec weights;
    double bias;
    Vec losses;
};

GDResult gradient_descent(const Mat& X, const Vec& y,
                           double learning_rate = 0.01, int epochs = 1000)
{
    int n_samples = static_cast<int>(X.size());
    int n_features = static_cast<int>(X[0].size());

    Vec weights(n_features, 0.0);
    double bias = 0.0;
    Vec losses;
    losses.reserve(epochs);

    for (int epoch = 0; epoch < epochs; ++epoch) {
        // Forward pass: y_pred = X @ weights + bias
        Vec y_pred(n_samples);
        for (int i = 0; i < n_samples; ++i) {
            double dot = bias;
            for (int j = 0; j < n_features; ++j)
                dot += X[i][j] * weights[j];
            y_pred[i] = dot;
        }

        // Compute MSE loss
        double loss = 0.0;
        for (int i = 0; i < n_samples; ++i) {
            double diff = y[i] - y_pred[i];
            loss += diff * diff;
        }
        loss /= n_samples;
        losses.push_back(loss);

        // Compute gradients: dw = -(2/n) * X^T @ (y - y_pred)
        Vec dw(n_features, 0.0);
        double db = 0.0;
        for (int i = 0; i < n_samples; ++i) {
            double residual = y[i] - y_pred[i];
            for (int j = 0; j < n_features; ++j)
                dw[j] -= (2.0 / n_samples) * X[i][j] * residual;
            db -= (2.0 / n_samples) * residual;
        }

        // Update parameters
        for (int j = 0; j < n_features; ++j)
            weights[j] -= learning_rate * dw[j];
        bias -= learning_rate * db;

        if (epoch % 100 == 0) {
            std::cout << "Epoch " << epoch << ", Loss: "
                      << std::fixed << std::setprecision(6) << loss << std::endl;
        }
    }

    return {weights, bias, losses};
}

int main() {
    // Generate synthetic data: y = 2*x0 - 1.5*x1 + 0.5*x2 + 3.0 + noise
    std::mt19937 rng(42);
    std::normal_distribution<double> normal(0.0, 1.0);
    std::normal_distribution<double> noise(0.0, 0.1);

    int n = 200, d = 3;
    Vec true_weights = {2.0, -1.5, 0.5};
    double true_bias = 3.0;

    Mat X(n, Vec(d));
    Vec y(n);
    for (int i = 0; i < n; ++i) {
        double target = true_bias;
        for (int j = 0; j < d; ++j) {
            X[i][j] = normal(rng);
            target += true_weights[j] * X[i][j];
        }
        y[i] = target + noise(rng);
    }

    // Train
    auto result = gradient_descent(X, y, 0.01, 1000);

    // Report
    std::cout << "\\nLearned weights: [";
    for (size_t j = 0; j < result.weights.size(); ++j)
        std::cout << (j ? ", " : "") << std::setprecision(4) << result.weights[j];
    std::cout << "]" << std::endl;
    std::cout << "Learned bias: " << std::setprecision(4) << result.bias << std::endl;
    std::cout << "True weights: [2.0, -1.5, 0.5], True bias: 3.0" << std::endl;

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Simple linear model inference in C++: loading weights and computing prediction",
      source: `#include <iostream>
#include <vector>
#include <fstream>
#include <sstream>
#include <numeric>

struct LinearModel {
    std::vector<double> weights;
    double bias;

    // Load weights from a simple text file
    // Format: bias on first line, then one weight per line
    bool loadWeights(const std::string& filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            std::cerr << "Error: cannot open " << filepath << std::endl;
            return false;
        }
        file >> bias;
        double w;
        while (file >> w) {
            weights.push_back(w);
        }
        return !weights.empty();
    }

    // Compute prediction: y = dot(weights, features) + bias
    double predict(const std::vector<double>& features) const {
        if (features.size() != weights.size()) {
            throw std::runtime_error("Feature size mismatch");
        }
        double result = bias;
        for (size_t i = 0; i < weights.size(); ++i) {
            result += weights[i] * features[i];
        }
        return result;
    }
};

int main() {
    LinearModel model;

    // Load trained weights from file
    if (!model.loadWeights("model_weights.txt")) {
        std::cerr << "Failed to load model weights." << std::endl;
        return 1;
    }

    std::cout << "Model loaded: " << model.weights.size()
              << " features, bias = " << model.bias << std::endl;

    // Example inference with input features
    std::vector<double> input = {1.5, -0.3, 2.1, 0.7};
    double prediction = model.predict(input);
    std::cout << "Prediction: " << prediction << std::endl;

    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "ML Training Pipeline",
      kind: "flow",
      caption: "End-to-end machine learning training pipeline from raw data to deployed model",
      mermaid: `graph TD
    A[Raw Data Collection] --> B[Data Cleaning & Preprocessing]
    B --> C[Exploratory Data Analysis]
    C --> D[Feature Engineering]
    D --> E[Train / Validation / Test Split]
    E --> F[Model Selection]
    F --> G[Model Training]
    G --> H{Evaluate on Validation Set}
    H -->|Performance OK| I[Hyperparameter Tuning]
    H -->|Poor Performance| D
    I --> J{Evaluate on Test Set}
    J -->|Meets Threshold| K[Model Serialization]
    J -->|Below Threshold| F
    K --> L[Deploy to Production]
    L --> M[Monitor & Retrain]
    M -->|Data Drift Detected| A`,
    },
    {
      title: "Bias-Variance Tradeoff",
      kind: "mindmap",
      caption: "Key concepts and relationships in the bias-variance tradeoff",
      mermaid: `mindmap
  root((Bias-Variance Tradeoff))
    Bias
      High Bias = Underfitting
      Model too simple
      Misses true patterns
      Examples
        Linear regression on nonlinear data
        Shallow decision tree
      Remedies
        Increase model complexity
        Add more features
        Reduce regularization
    Variance
      High Variance = Overfitting
      Model too complex
      Fits noise in data
      Examples
        Deep decision tree
        High-degree polynomial
      Remedies
        More training data
        Regularization L1 L2
        Dropout and early stopping
    Total Error
      Bias squared + Variance + Irreducible Noise
      Sweet spot minimizes total error
      Cross-validation to estimate
    Ensemble Solutions
      Bagging reduces variance
      Boosting reduces bias
      Stacking combines both`,
    },
  ],
  comparison: {
    columns: ["Algorithm", "Type", "Strengths", "Weaknesses", "Best For"],
    rows: [
      [
        "Linear Regression",
        "Regression",
        "Simple, interpretable, fast training, no hyperparameter tuning needed",
        "Assumes linear relationship, sensitive to outliers, poor with non-linear data",
        "Baseline models, interpretable predictions, linearly separable data",
      ],
      [
        "Decision Tree",
        "Classification / Regression",
        "Highly interpretable, handles non-linear data, no feature scaling needed",
        "Prone to overfitting, unstable (small data changes alter tree), high variance",
        "Explainable models, mixed feature types, quick prototyping",
      ],
      [
        "Random Forest",
        "Classification / Regression",
        "Reduces overfitting via bagging, handles high-dimensional data, robust to outliers",
        "Less interpretable than single tree, slower inference, memory-intensive",
        "General-purpose tasks, feature importance ranking, noisy datasets",
      ],
      [
        "SVM",
        "Classification / Regression",
        "Effective in high-dimensional spaces, works well with clear margins, kernel trick for non-linear data",
        "Slow on large datasets, sensitive to feature scaling, hard to interpret",
        "Text classification, image recognition, small to medium datasets with clear separation",
      ],
      [
        "Neural Network",
        "Classification / Regression",
        "Learns complex non-linear patterns, scales with data, state-of-the-art on many tasks",
        "Requires large data and compute, black-box, many hyperparameters to tune",
        "Image/speech/NLP tasks, large datasets, problems where accuracy trumps interpretability",
      ],
    ],
  },
  exercises: [
    `**Exercise 1: Build a Classification Pipeline** — Using **scikit-learn**, load the \`iris\` dataset with \`load_iris()\`. Split it into train/test sets using \`train_test_split()\` with \`test_size=0.2\`. Train a \`RandomForestClassifier\` and a \`LogisticRegression\` model. Compare their **accuracy**, **precision**, and **recall** using \`classification_report()\`. *Which model performs better and why?*`,
    `**Exercise 2: Implement K-Fold Cross-Validation** — Write code that manually implements **5-fold cross-validation** without using \`cross_val_score()\`. Split your data into 5 folds, train on 4 folds, validate on 1, and rotate. Compute the *mean* and *standard deviation* of accuracy across folds. Then verify your results match \`cross_val_score(estimator, X, y, cv=5)\`.`,
    `**Exercise 3: Visualize the Bias-Variance Tradeoff** — Generate a *synthetic* non-linear dataset using \`np.sin(X) + noise\`. Fit **polynomial regression** models with degrees \`1, 3, 5, 10, 15, 20\`. Plot *training error* and *test error* vs. polynomial degree. Identify the **sweet spot** where test error is minimized. *At which degree does overfitting become visible?*`,
    `**Exercise 4: Feature Engineering Challenge** — Take a raw dataset with *timestamps*, *categorical variables*, and *missing values*. Engineer at least **5 new features**: extract \`hour_of_day\`, \`day_of_week\` from timestamps, create \`is_weekend\` boolean, apply \`one-hot encoding\` to categorical columns, and impute missing values using \`SimpleImputer(strategy='median')\`. Measure the model performance *before and after* feature engineering.`,
    `**Exercise 5: Regularization Experiment** — Train a \`Ridge\` (L2) and \`Lasso\` (L1) regression model on a dataset with **20+ features**, several of which are *irrelevant noise*. Vary the regularization parameter \`alpha\` from \`0.001\` to \`100\` (use \`np.logspace(-3, 2, 20)\`). Plot the **coefficient paths** (weight values vs. alpha). Observe how *Lasso drives irrelevant feature weights to exactly zero* while Ridge only shrinks them.`,
  ],
  cheatSheet: [
    `**Train/Test Split**: Use \`train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\` — always set \`stratify=y\` for classification to preserve class ratios.`,
    `**Scaling**: Apply \`StandardScaler\` for *SVM, k-NN, logistic regression*; \`MinMaxScaler\` for *neural networks*; tree-based models (**Random Forest**, **XGBoost**) do *not* require scaling.`,
    `**Regularization**: \`L1 (Lasso)\` = **feature selection** (zeros out weights); \`L2 (Ridge)\` = **weight shrinkage** (small but non-zero weights); \`ElasticNet\` = *combination of both*.`,
    `**Evaluation Metrics**: *Accuracy* for balanced datasets; \`precision\` when **false positives** are costly (spam filter); \`recall\` when **false negatives** are costly (disease detection); \`F1\` for a *balanced measure*; \`AUC-ROC\` for ranking quality.`,
    `**Cross-Validation**: Use \`cross_val_score(model, X, y, cv=5, scoring='accuracy')\` for robust evaluation. For *time-series data*, use \`TimeSeriesSplit\` instead of random splits to avoid **look-ahead bias**.`,
    `**Hyperparameter Tuning**: Start with \`RandomizedSearchCV\` (faster) over \`GridSearchCV\` (exhaustive). Key params: **Random Forest** — \`n_estimators\`, \`max_depth\`, \`min_samples_split\`; **Gradient Boosting** — \`learning_rate\`, \`n_estimators\`, \`max_depth\`; **SVM** — \`C\`, \`kernel\`, \`gamma\`.`,
  ],
  revisionNotes: [
    `**Supervised vs. Unsupervised**: *Supervised* = labeled data, predicts \`y\` from \`X\` (classification + regression). *Unsupervised* = no labels, finds structure (clustering with \`KMeans\`, dimensionality reduction with \`PCA\`). **Semi-supervised** uses a *small labeled set* + large unlabeled set.`,
    `**Overfitting Signals & Fixes**: Training accuracy *much higher* than test accuracy = overfitting. Fix with **regularization** (\`L1\`/\`L2\`), **dropout**, **early stopping**, *more data*, or a *simpler model*. Use \`learning curves\` to diagnose: plot accuracy vs. training set size.`,
    `**Bias-Variance Tradeoff**: *Total Error* = \`Bias^2 + Variance + Noise\`. **High bias** = underfitting (model too simple, *increase complexity*). **High variance** = overfitting (model too complex, *add regularization or data*). Ensemble methods help: **bagging** reduces *variance*, **boosting** reduces *bias*.`,
    `**Gradient Descent Variants**: \`Batch GD\` — uses *full dataset*, stable but slow. \`SGD\` — uses *one sample*, noisy but fast. \`Mini-batch GD\` — uses \`32-128\` samples, the *practical default*. **Adam** optimizer combines *momentum + adaptive learning rates* and is the go-to for **deep learning**.`,
    `**Model Selection Hierarchy**: Start with a *simple baseline* (\`LogisticRegression\`, \`LinearRegression\`). Then try **tree ensembles** (\`RandomForest\`, \`XGBoost\`) for tabular data. Use **neural networks** only when you have *large data* and the problem demands it (images, text, audio). Always compare against the baseline — *complexity must earn its keep*.`,
  ],
};

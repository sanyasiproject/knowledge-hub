import type { TopicContent } from "../types";

export const modelServing: TopicContent = {
  quickSummary: [
    "Model serving is the process of deploying trained ML models to production so they can receive inputs and return predictions in real time or in batch.",
    "Online serving handles individual requests with low latency, while batch serving processes large datasets on a schedule for throughput-oriented workloads.",
    "A model registry acts as a centralized catalog for versioned model artifacts, metadata, and lineage, enabling reproducibility and governance.",
    "A/B testing and shadow mode are deployment strategies that reduce risk by comparing new models against existing ones before full rollout.",
  ],
  detailed: [
    `## Online vs Batch Serving

Online (real-time) serving exposes a model behind an API endpoint. Each request is processed independently with strict latency requirements, typically under 100 ms. Common infrastructure includes REST/gRPC servers, load balancers, and autoscalers.

Batch serving runs predictions over large datasets on a fixed schedule (hourly, daily). It prioritizes throughput over latency and is well-suited for recommendation precomputation, report generation, and ETL pipelines. Frameworks like Apache Spark or AWS Batch are often used.

Choosing between online and batch depends on the use case: fraud detection needs online serving, while weekly churn scores can be batch.`,

    `## Model Registry and Versioning

A model registry stores every trained model along with its hyperparameters, training data reference, evaluation metrics, and deployment history. Tools like MLflow Model Registry, Vertex AI Model Registry, and SageMaker Model Registry are widely adopted.

Key capabilities include:
- **Version control**: track iterations and roll back to a known-good model
- **Stage management**: transition models through stages like Staging, Production, and Archived
- **Lineage tracking**: connect a deployed model back to its training run and dataset
- **Access control**: restrict who can promote a model to production`,

    `## A/B Testing for Models

A/B testing splits live traffic between a control model (current production) and a treatment model (candidate). Statistical significance is measured on business metrics such as click-through rate or revenue per session.

Important considerations:
- **Sample size**: ensure enough traffic for reliable conclusions
- **Randomization**: users must be consistently assigned to the same variant
- **Duration**: run long enough to capture weekly or seasonal patterns
- **Guardrail metrics**: monitor for regressions in safety or latency even if the primary metric improves`,

    `## Shadow Mode Deployment

In shadow mode (also called dark launching), the candidate model receives a copy of live traffic and produces predictions, but those predictions are not served to users. Instead, they are logged and compared against the production model offline.

Benefits:
- Zero user-facing risk during evaluation
- Real production data distribution for testing
- Ability to measure latency and resource consumption under realistic load

Shadow mode is typically used before A/B testing as an initial validation step. Once the shadow model shows comparable or better performance, it graduates to an A/B test.`,

    `## Serving Infrastructure Patterns

**Model-as-a-Service**: wrap the model in a containerized microservice (Docker + FastAPI/TorchServe/Triton). Each model scales independently.

**Embedded models**: compile the model into the application binary (ONNX Runtime, TensorFlow Lite). Useful for edge and mobile deployments with strict latency or connectivity constraints.

**Feature stores**: serving often depends on real-time features. A feature store (Feast, Tecton) provides low-latency access to precomputed feature vectors, ensuring consistency between training and inference.

**Canary deployments**: route a small percentage of traffic (e.g., 5 percent) to the new model. Gradually increase if metrics are healthy; roll back instantly if not.`,
  ],
  interviewQA: [
    {
      q: "When would you choose batch serving over online serving?",
      a: "Batch serving is preferred when predictions are not needed in real time, when the dataset is large, and when throughput matters more than latency. Examples include precomputing recommendation lists nightly, generating daily risk scores, or running periodic churn prediction. It is also more cost-effective because you can use spot instances and schedule jobs during off-peak hours.",
    },
    {
      q: "What is the purpose of a model registry and what should it track?",
      a: "A model registry is a centralized store for model artifacts and metadata. It should track the model version, training hyperparameters, evaluation metrics, dataset lineage, deployment stage (staging, production, archived), and who promoted it. This enables reproducibility, auditability, and safe rollbacks.",
    },
    {
      q: "How does shadow mode differ from A/B testing?",
      a: "In shadow mode the candidate model processes real traffic but its predictions are not shown to users; they are logged for offline comparison. In A/B testing the candidate model's predictions are actually served to a subset of users and business metrics are measured. Shadow mode is lower risk and typically precedes A/B testing.",
    },
    {
      q: "What are canary deployments and why are they useful for ML models?",
      a: "A canary deployment routes a small fraction of live traffic to a new model while the majority continues to hit the existing model. If the canary shows healthy metrics (latency, error rate, business KPIs), traffic is gradually shifted. If problems arise, traffic is immediately routed back. This limits the blast radius of a bad model release.",
    },
  ],
  mcqs: [
    {
      q: "Which serving pattern is best suited for a nightly product recommendation refresh?",
      options: [
        "Online serving with auto-scaling",
        "Batch serving on a scheduled pipeline",
        "Shadow mode deployment",
        "Canary deployment",
      ],
      answerIndex: 1,
      explanation:
        "Nightly precomputation of recommendations is a throughput-oriented task with no real-time latency requirement, making batch serving the right choice.",
    },
    {
      q: "What is the primary benefit of shadow mode?",
      options: [
        "It reduces model training time",
        "It evaluates a new model on live traffic without user-facing risk",
        "It automatically selects the best hyperparameters",
        "It compresses the model for faster inference",
      ],
      answerIndex: 1,
      explanation:
        "Shadow mode copies live traffic to the candidate model but does not serve its predictions to users, enabling risk-free evaluation under realistic conditions.",
    },
    {
      q: "Which component ensures consistent feature values between training and serving?",
      options: [
        "Model registry",
        "Feature store",
        "Container orchestrator",
        "Load balancer",
      ],
      answerIndex: 1,
      explanation:
        "A feature store provides a single source of truth for feature computation, preventing training-serving skew by serving the same transformations used during training.",
    },
    {
      q: "In an A/B test for ML models, what does consistent user assignment mean?",
      options: [
        "All users see the new model",
        "A user always sees the same model variant throughout the test",
        "The model is retrained after each request",
        "Traffic is split 50/50 at the load balancer level without session stickiness",
      ],
      answerIndex: 1,
      explanation:
        "Consistent assignment (session stickiness) ensures a user always interacts with the same variant, preventing noisy metrics caused by switching between models mid-session.",
    },
  ],
  flashcards: [
    {
      front: "What is online (real-time) serving?",
      back: "Exposing a model behind an API endpoint that processes individual requests with low latency, typically under 100 ms.",
    },
    {
      front: "What is batch serving?",
      back: "Running model predictions over large datasets on a schedule, prioritizing throughput over latency.",
    },
    {
      front: "What does a model registry store?",
      back: "Versioned model artifacts, hyperparameters, evaluation metrics, dataset lineage, deployment stage, and promotion history.",
    },
    {
      front: "What is shadow mode?",
      back: "A deployment strategy where the candidate model processes live traffic but its predictions are only logged, not served to users.",
    },
    {
      front: "What is a canary deployment?",
      back: "Routing a small percentage of traffic to a new model and gradually increasing it if metrics remain healthy.",
    },
    {
      front: "What is training-serving skew?",
      back: "A mismatch between how features are computed during training versus inference, leading to degraded model performance in production.",
    },
    {
      front: "What is a feature store?",
      back: "Infrastructure that provides consistent, low-latency access to precomputed features for both training and serving.",
    },
  ],
  glossary: [
    {
      term: "Online Serving",
      definition:
        "Deploying a model as a low-latency API that handles individual prediction requests in real time.",
    },
    {
      term: "Batch Serving",
      definition:
        "Running predictions on large datasets on a schedule, optimizing for throughput rather than latency.",
    },
    {
      term: "Model Registry",
      definition:
        "A centralized catalog for storing, versioning, and managing ML model artifacts and their metadata.",
    },
    {
      term: "A/B Testing",
      definition:
        "A controlled experiment that splits live traffic between model variants to measure which performs better on business metrics.",
    },
    {
      term: "Shadow Mode",
      definition:
        "A deployment strategy where a candidate model receives live traffic but its outputs are logged rather than served, enabling risk-free evaluation.",
    },
    {
      term: "Canary Deployment",
      definition:
        "Gradually routing increasing traffic to a new model while monitoring for regressions before full rollout.",
    },
    {
      term: "Feature Store",
      definition:
        "Infrastructure that manages and serves precomputed feature values consistently across training and inference.",
    },
  ],
};

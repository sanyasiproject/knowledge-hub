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
  followUps: [
    "Batch or real-time — what does the prediction actually depend on?",
    "What is training-serving skew and how do you detect it?",
    "How do you roll out a new model version safely?",
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
  resources: [
    {
      label: "Designing Machine Learning Systems — Chip Huyen",
      kind: "book",
    },
    {
      label: "Machine Learning Design Patterns — Lakshmanan, Robinson & Munn",
      kind: "book",
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
  deepDive: [
    `**Model Optimization Techniques for Production Serving**

When deploying ML models to production, *raw trained models* are often too large and slow for real-time inference. **Quantization** reduces the numerical precision of model weights — converting from \`float32\` to \`int8\` or \`float16\` — which can shrink model size by **2–4x** and accelerate inference on hardware that supports lower-precision arithmetic. *Post-training quantization* (PTQ) applies quantization after training with minimal accuracy loss, while **quantization-aware training** (QAT) simulates quantized inference during training for *better accuracy retention*. **Pruning** removes redundant weights or entire neurons/channels that contribute minimally to output quality. *Structured pruning* removes whole filters or attention heads, yielding models that run faster on standard hardware without sparse-computation support. **Knowledge distillation** trains a smaller *student model* to mimic the outputs of a larger *teacher model*, using \`soft labels\` (the teacher's probability distribution) as training targets. The student learns the teacher's *dark knowledge* — inter-class similarities encoded in output probabilities. Finally, **ONNX conversion** (\`torch.onnx.export()\` or \`tf2onnx\`) translates models into the *Open Neural Network Exchange* format, enabling inference on optimized runtimes like \`ONNX Runtime\`, \`TensorRT\`, or \`OpenVINO\`. Combining these techniques — for example, *distilling* a large model, then *quantizing* the student to \`int8\`, then running it on \`ONNX Runtime\` — can yield **10–50x speedups** with minimal accuracy degradation.`,

    `**Scaling Model Serving Infrastructure**

Production ML systems must handle *variable and often unpredictable* traffic patterns. **Horizontal scaling** deploys multiple replicas of a model server behind a **load balancer** — common choices include *round-robin*, *least-connections*, and **weighted routing** (useful during canary deployments). Container orchestrators like \`Kubernetes\` manage replica scaling via the \`HorizontalPodAutoscaler\` (HPA), which can scale on *CPU utilization*, *GPU memory*, or **custom metrics** like \`requests_per_second\` or \`inference_latency_p99\`. **Request batching** is critical for GPU-based serving: instead of processing one request at a time, the server accumulates requests into a *batch* and runs a single forward pass. Frameworks like \`Triton Inference Server\` support **dynamic batching** with configurable \`max_batch_size\`, \`max_queue_delay_microseconds\`, and *preferred batch sizes*. This dramatically improves GPU utilization and throughput. **GPU sharing** via \`NVIDIA MPS\` (Multi-Process Service) or \`MIG\` (Multi-Instance GPU) allows multiple model instances to share a single GPU, which is valuable for *smaller models* that don't fully utilize GPU compute. **Model sharding** distributes a single large model across multiple GPUs using *tensor parallelism* or *pipeline parallelism*, essential for serving models with billions of parameters. The overall architecture should include **health checks**, \`readiness probes\`, and **circuit breakers** to gracefully handle failures and prevent cascading outages.`,

    `**Monitoring and Observability for ML Systems**

ML systems require monitoring that goes *beyond traditional software metrics*. **Data drift detection** monitors changes in the *statistical distribution* of input features over time. Techniques include the **Kolmogorov-Smirnov test** for continuous features, \`chi-squared tests\` for categorical features, and **Population Stability Index** (PSI) for overall distribution shifts. When \`PSI > 0.2\`, a *significant drift* has occurred and model retraining should be triggered. **Concept drift** is subtler — the *relationship between features and the target* changes even if feature distributions remain stable. Monitoring \`prediction_confidence\` distributions and tracking **ground-truth feedback loops** (comparing predictions to actual outcomes once available) are essential for detecting concept drift. **Prediction quality tracking** involves logging every prediction alongside input features, model version, and \`inference_latency_ms\`, then joining with *delayed ground truth* to compute metrics like \`accuracy\`, \`precision\`, \`recall\`, and **business KPIs** over sliding windows. **Alerting strategies** should be *multi-tiered*: **P1 alerts** for model service downtime or latency spikes (\`p99 > SLA threshold\`), **P2 alerts** for significant accuracy degradation or data drift, and **P3 alerts** for gradual metric trends. Tools like \`Prometheus\` + \`Grafana\` handle infrastructure metrics, while platforms like *Evidently AI*, \`WhyLabs\`, or **Arize** provide ML-specific monitoring including *feature importance drift*, prediction distribution analysis, and **explainability dashboards**. The golden rule: *if you can't measure it in production, you can't trust it in production*.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "A serving endpoint: validation, timeout, batching, and health",
      source: `import express from "express";
import * as ort from "onnxruntime-node";
import { z } from "zod";

const app = express();
app.use(express.json({ limit: "1mb" })); // unbounded bodies are a DoS vector

let session: ort.InferenceSession | null = null;
let modelVersion = "unknown";

const Input = z.object({
  features: z.array(z.number()).length(32),
});

// LIVENESS: is the process alive? Restart if not.
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// READINESS: can it actually serve? The load balancer uses this. Failing it
// removes the instance from rotation WITHOUT restarting it — which is what you
// want while a model is still loading.
app.get("/readyz", (_req, res) =>
  session ? res.status(200).json({ modelVersion }) : res.status(503).send("model not loaded")
);

app.post("/predict", async (req, res) => {
  if (!session) return res.status(503).json({ error: "model not loaded" });

  const parsed = Input.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid input", issues: parsed.error.issues });
  }

  const tensor = new ort.Tensor("float32", Float32Array.from(parsed.data.features), [1, 32]);

  try {
    const out = await withTimeout(session.run({ input: tensor }), 500);
    const scores = Array.from(out.output.data as Float32Array);
    res.json({ scores, modelVersion });
  } catch (err) {
    // Log the detail, return a generic message plus a correlation id.
    req.log.error({ err }, "inference failed");
    res.status(500).json({ error: "inference failed", requestId: req.id });
  }
});

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("inference timeout")), ms)),
  ]);
}

// Load BEFORE accepting traffic, so readiness only passes once we can serve.
(async () => {
  session = await ort.InferenceSession.create("./model.onnx");
  modelVersion = process.env.MODEL_VERSION ?? "dev";
  app.listen(8080);
})();

// The failure this shape prevents: without a readiness probe, Kubernetes sends
// traffic the moment the port is open — while the model is still loading — and
// every request in that window 500s on each deploy.
//
// Batching note: inference throughput improves markedly if you accumulate
// requests for a few milliseconds and run them as one batch, at the cost of
// per-request latency. That is the core serving trade-off, and it should be a
// deliberate, measured choice rather than a default.`,
    },
  ],
  diagrams: [
    {
      title: "Model Serving Architecture",
      kind: "architecture",
      caption: "High-level architecture showing load balancer, serving containers, feature store, model registry, and monitoring components",
      mermaid: `graph TD
    Client[Client Applications] -->|REST/gRPC| LB[Load Balancer]
    LB --> S1[Serving Container 1]
    LB --> S2[Serving Container 2]
    LB --> S3[Serving Container N]

    S1 --> Cache[Prediction Cache]
    S2 --> Cache
    S3 --> Cache

    S1 --> FS[Feature Store]
    S2 --> FS
    S3 --> FS

    MR[Model Registry] -->|Pull Model Artifact| S1
    MR -->|Pull Model Artifact| S2
    MR -->|Pull Model Artifact| S3

    S1 --> Mon[Monitoring & Logging]
    S2 --> Mon
    S3 --> Mon

    Mon --> Alerts[Alerting System]
    Mon --> Dashboard[Grafana Dashboard]
    Mon --> Drift[Drift Detector]

    Drift -->|Trigger Retrain| Pipeline[Training Pipeline]
    Pipeline -->|Register New Model| MR

    subgraph Serving Layer
        S1
        S2
        S3
        Cache
    end

    subgraph Data Layer
        FS
        MR
    end

    subgraph Observability
        Mon
        Alerts
        Dashboard
        Drift
    end`,
    },
    {
      title: "Model Deployment Pipeline",
      kind: "sequence",
      caption: "Sequence diagram showing the end-to-end model deployment flow from training to production rollout",
      mermaid: `sequenceDiagram
    participant DS as Data Scientist
    participant TR as Training Pipeline
    participant MR as Model Registry
    participant CI as CI/CD Pipeline
    participant STG as Staging Env
    participant SM as Shadow Mode
    participant AB as A/B Test
    participant PRD as Production

    DS->>TR: Trigger training run
    TR->>TR: Train model on dataset v3.2
    TR->>TR: Evaluate on holdout set
    TR->>MR: Register model v2.1 (metrics attached)

    DS->>MR: Promote model to Staging
    MR->>CI: Webhook triggers deployment

    CI->>STG: Deploy to staging
    CI->>STG: Run integration tests
    STG-->>CI: Tests pass

    CI->>SM: Deploy shadow mode
    SM->>SM: Log predictions on live traffic
    SM-->>DS: Shadow report (7 days)

    DS->>AB: Start A/B test (10% traffic)
    AB->>AB: Measure business metrics
    AB-->>DS: A/B results (14 days)

    DS->>MR: Promote to Production
    MR->>CI: Trigger production deploy
    CI->>PRD: Canary rollout (5% -> 25% -> 100%)
    PRD-->>DS: Production metrics healthy`,
    },
  ],
  animations: [
    {
      title: "How training-serving skew appears",
      steps: [
        {
          label: "Training",
          detail: "A pandas pipeline computes `days_since_signup`, filling nulls with the median.",
        },
        {
          label: "Serving",
          detail: "A service reimplements it in application code, filling nulls with 0.",
        },
        {
          label: "Both look right",
          detail: "Each passes its own tests. Neither is obviously wrong.",
        },
        {
          label: "Production",
          detail: "New users have null signup dates. Training saw the median; serving sees 0.",
        },
        {
          label: "Silent degradation",
          detail: "No error, no alert — just predictions that are quietly worse for the newest users.",
        },
        {
          label: "Fix",
          detail: "One implementation shared by both paths, or a feature store. Then log served feature values and compare distributions.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Framework", "Supported Formats", "Batching", "GPU Support", "Best For"],
    rows: [
      ["TorchServe", "PyTorch (.pt, .mar)", "Dynamic batching", "Yes (CUDA)", "PyTorch-native teams needing built-in model management and versioning"],
      ["Triton Inference Server", "ONNX, TensorRT, PyTorch, TensorFlow, custom", "Dynamic & sequence batching", "Yes (CUDA, TensorRT)", "Multi-framework deployments requiring maximum GPU utilization and throughput"],
      ["TF Serving", "TensorFlow SavedModel", "Built-in batching", "Yes (CUDA)", "TensorFlow-only pipelines integrated with TFX ecosystem"],
      ["FastAPI + Custom", "Any (manual loading)", "Custom implementation", "Yes (manual setup)", "Rapid prototyping, custom preprocessing pipelines, and lightweight deployments"],
      ["ONNX Runtime", "ONNX", "Session-level parallelism", "Yes (CUDA, TensorRT, DirectML)", "Cross-platform inference with optimized performance on diverse hardware"],
      ["BentoML", "Any (via runners)", "Adaptive batching", "Yes (CUDA)", "End-to-end model packaging, containerization, and deployment with minimal boilerplate"],
    ],
  },
  exercises: [
    `**Exercise 1: Build a Model Serving API** — Use \`FastAPI\` to create a REST endpoint that loads a **scikit-learn** model from a \`.joblib\` file and serves predictions. Include \`/health\`, \`/predict\`, and \`/predict/batch\` endpoints. Add *request validation* with \`Pydantic\` models and return \`latency_ms\` in every response. Test with \`pytest\` and \`httpx.AsyncClient\`.`,

    `**Exercise 2: ONNX Export and Benchmarking** — Train a simple *PyTorch CNN* on MNIST, then export it to ONNX using \`torch.onnx.export()\`. Run inference with both **PyTorch** and **ONNX Runtime**, comparing \`mean_latency\`, \`p95_latency\`, and \`throughput_rps\` across batch sizes of *1, 8, 32, and 128*. Visualize results with \`matplotlib\`.`,

    `**Exercise 3: Implement Dynamic Batching** — Build a *batching middleware* that accumulates incoming prediction requests for up to \`max_wait_ms=50\` or until \`max_batch_size=32\` is reached, then sends them as a **single batch** to the model. Measure the *throughput improvement* vs. processing requests individually. Use \`asyncio.Queue\` and \`asyncio.Event\` for coordination.`,

    `**Exercise 4: Set Up Model Monitoring** — Deploy a model and instrument it with \`Prometheus\` metrics: \`prediction_latency_seconds\` (histogram), \`prediction_count\` (counter by class), and \`feature_drift_score\` (gauge). Create a **Grafana dashboard** with panels for *latency percentiles*, prediction distribution, and drift alerts. Configure an *alert rule* that fires when \`p99_latency > 200ms\`.`,

    `**Exercise 5: Blue-Green Model Deployment** — Using \`Docker Compose\` or \`Kubernetes\`, implement a **blue-green deployment** for an ML model. Deploy *model v1* (blue) and *model v2* (green) simultaneously. Write a script that switches traffic from blue to green using \`nginx\` upstream configuration or \`kubectl patch\`. Add a **rollback mechanism** that restores the previous model within \`30 seconds\` if error rate exceeds a threshold.`,
  ],
  cheatSheet: [
    `**Model Export**: \`torch.onnx.export(model, dummy_input, "model.onnx", opset_version=17, dynamic_axes={...})\` — always set \`dynamic_axes\` for variable batch sizes and validate with \`onnx.checker.check_model()\``,

    `**FastAPI Serving**: \`uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4\` — use \`lifespan\` context manager for model loading, \`Pydantic\` models for request/response validation, and \`async\` endpoints for concurrency`,

    `**ONNX Runtime Session**: \`ort.InferenceSession("model.onnx", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])\` — set \`sess_options.graph_optimization_level = ORT_ENABLE_ALL\` and tune \`intra_op_num_threads\` for CPU inference`,

    `**Triton Dynamic Batching**: In \`config.pbtxt\`, set \`dynamic_batching { max_queue_delay_microseconds: 5000, preferred_batch_size: [8, 16] }\` — Triton automatically batches concurrent requests up to \`max_batch_size\``,

    `**Prometheus Metrics**: \`from prometheus_client import Histogram, Counter\` — track \`LATENCY = Histogram("predict_latency", "Prediction latency", buckets=[0.01, 0.05, 0.1, 0.25, 0.5])\` and use \`@LATENCY.time()\` decorator on predict functions`,

    `**Docker Health Check**: \`HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8000/health || exit 1\` — ensures orchestrators restart unresponsive containers; pair with \`readinessProbe\` in Kubernetes for traffic gating`,
  ],
  revisionNotes: [
    `**Online vs. Batch Serving**: *Online serving* exposes models as \`REST/gRPC\` endpoints with **<100ms latency** requirements; *batch serving* processes large datasets on a schedule for **throughput-oriented** workloads like recommendation precomputation — choose based on whether the use case needs *real-time* responses or can tolerate delay.`,

    `**Model Optimization Pipeline**: Apply **quantization** (\`float32\` → \`int8/float16\`) for *2–4x size reduction*, **pruning** to remove low-magnitude weights, **knowledge distillation** to train a smaller *student* from a larger *teacher*, and **ONNX conversion** for cross-platform optimized inference — these techniques *compound* for maximum speedup.`,

    `**Deployment Strategies**: Use **shadow mode** first (candidate processes traffic but predictions are *only logged*), then **A/B testing** (serve predictions to a *user subset* and measure business metrics), then **canary deployment** (gradually shift traffic from *5% → 25% → 100%*) — each stage *reduces risk* progressively before full rollout.`,

    `**Feature Store Importance**: A \`feature store\` like *Feast* or *Tecton* ensures **training-serving consistency** by providing the *same feature transformations* in both environments — without it, **training-serving skew** silently degrades production model performance.`,

    `**ML Monitoring Essentials**: Track **data drift** with \`PSI\` and *KS tests* on input features, monitor **prediction quality** by joining predictions with *delayed ground truth*, set up \`multi-tiered alerts\` (**P1** for downtime, **P2** for accuracy drops, **P3** for gradual trends), and use tools like *Evidently AI*, \`Prometheus\`, and **Grafana** for comprehensive observability.`,
  ],
};

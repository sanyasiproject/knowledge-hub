import type { TopicContent } from "../types";

export const promptingTechniques: TopicContent = {
  quickSummary: [
    "Few-shot prompting provides input-output examples in the prompt to demonstrate the desired pattern, significantly improving task performance without any model training.",
    "Chain-of-thought (CoT) prompting instructs the model to reason step by step, improving accuracy on math, logic, and multi-step reasoning tasks.",
    "ReAct (Reasoning + Acting) combines reasoning traces with tool-use actions, enabling models to interact with external systems like search engines or APIs.",
    "Self-consistency generates multiple reasoning paths and selects the most common answer, improving reliability on complex problems.",
  ],
  detailed: [
    `## Few-Shot Prompting

Few-shot prompting includes one or more examples of the desired input-output behavior in the prompt. The model identifies the pattern and applies it to the new input.

**Zero-shot**: no examples. Relies entirely on the instruction.
**One-shot**: a single example. Establishes the format.
**Few-shot**: 2-8 examples. Demonstrates edge cases and consistency.

Best practices:
- Choose examples that are representative of the task distribution
- Include diverse examples covering different categories or edge cases
- Order examples from simple to complex
- Use consistent formatting across all examples
- For classification, balance examples across classes

Few-shot prompting is especially effective for:
- Custom classification taxonomies
- Specific output formats (e.g., structured extraction)
- Domain-specific language or terminology
- Tasks where the instruction alone is ambiguous`,

    `## Chain-of-Thought (CoT) Prompting

Chain-of-thought prompting asks the model to show its reasoning before giving a final answer. This dramatically improves performance on tasks requiring multi-step reasoning.

**Explicit CoT**: "Think step by step before answering."
**Few-shot CoT**: provide examples that include reasoning steps.

Example:
- Question: "If a store has 42 apples and sells 3/7 of them, how many remain?"
- CoT: "3/7 of 42 = 42 * 3/7 = 18 apples sold. 42 - 18 = 24 apples remain. Answer: 24."

Without CoT, models frequently jump to incorrect answers on arithmetic and logic problems. With CoT, accuracy can improve by 20-40 percentage points on benchmarks like GSM8K.

CoT works because it decomposes complex problems into simpler sub-problems the model can solve sequentially. It also makes errors easier to diagnose since the reasoning is visible.`,

    `## ReAct (Reasoning + Acting)

ReAct interleaves reasoning traces (Thought) with tool-use actions (Action) and their results (Observation). This enables the model to interact with external systems to gather information.

A typical ReAct loop:
1. **Thought**: analyze the question and decide what information is needed
2. **Action**: call an external tool (search, calculator, API, database)
3. **Observation**: receive the tool result
4. **Thought**: interpret the result and decide the next step
5. Repeat until the answer is found

ReAct is the foundation for LLM agent frameworks. It outperforms pure reasoning (CoT) on knowledge-intensive tasks because the model can look up facts instead of relying on potentially incorrect training knowledge.

Limitations: the model must correctly decide when and which tools to use. Poor tool selection or hallucinated tool calls can derail the process.`,

    `## Self-Consistency

Self-consistency improves on chain-of-thought by generating multiple independent reasoning paths (using temperature > 0) and selecting the answer that appears most frequently.

Process:
1. Prompt the model with a CoT instruction
2. Sample N responses (e.g., N = 5-20) with non-zero temperature
3. Extract the final answer from each response
4. Return the majority vote answer

This works because different reasoning paths may make different errors, but the correct answer tends to appear more consistently across samples.

Self-consistency is compute-intensive (N forward passes) but consistently improves accuracy on math, commonsense reasoning, and logic tasks. It can be combined with other techniques and does not require special training.`,

    `## Other Advanced Techniques

**Tree of Thought (ToT)**: explores multiple reasoning branches at each step and evaluates which branches are most promising before continuing. More structured than self-consistency but also more complex and expensive.

**Least-to-Most prompting**: decomposes a complex problem into sub-problems, solves each in order, and feeds each solution as context for the next. Effective for problems that build on intermediate results.

**Retrieval-Augmented Generation (RAG)**: retrieves relevant documents and includes them in the prompt. Covered in detail in the RAG topic but mentioned here as a prompting technique that provides dynamic context.

**Prompt chaining**: breaks a complex task into a pipeline of simpler prompts, where each prompt's output feeds the next. Useful when a single prompt cannot handle the full complexity.

**Structured output prompting**: instructs the model to respond in a specific format (JSON, XML, YAML). Covered in detail in the Structured Output topic.`,
  ],
  interviewQA: [
    {
      q: "When would you use few-shot prompting over zero-shot?",
      a: "Few-shot prompting is preferred when the task has a specific format the model might not infer from instructions alone, when the classification taxonomy is custom, when edge cases need to be demonstrated, or when zero-shot produces inconsistent results. It is also useful for domain-specific tasks where examples establish terminology and conventions. Zero-shot is sufficient for straightforward, well-understood tasks where instructions are unambiguous.",
    },
    {
      q: "Why does chain-of-thought prompting improve accuracy on math problems?",
      a: "CoT decomposes a complex calculation into sequential sub-steps. Without CoT, the model attempts to compute the answer in a single forward pass, which is unreliable for multi-step arithmetic. With CoT, each intermediate result is generated as text and becomes part of the context for the next step, effectively giving the model a scratchpad. This mirrors how humans solve math problems step by step.",
    },
    {
      q: "What is the trade-off of self-consistency?",
      a: "Self-consistency improves accuracy by sampling multiple reasoning paths and taking the majority vote, but it requires N forward passes per query (typically 5-20x more compute). This increases latency and cost proportionally. It is most valuable for high-stakes decisions where accuracy matters more than speed, and less practical for low-latency, high-volume applications.",
    },
    {
      q: "How does ReAct differ from standard chain-of-thought?",
      a: "Standard CoT is purely internal reasoning with no external interaction. ReAct adds an action step where the model calls external tools (search, APIs, databases) and incorporates the results into its reasoning. This grounds the model's answers in real data rather than relying solely on training knowledge, making it more accurate for knowledge-intensive and real-time information tasks.",
    },
  ],
  followUps: [
    "When does chain-of-thought help, and when is it wasted tokens?",
    "How many few-shot examples before you get diminishing returns?",
    "Why does example ordering change the output?",
  ],
  mcqs: [
    {
      q: "What is the key insight behind self-consistency?",
      options: [
        "A single reasoning path is always correct",
        "Different reasoning paths may make different errors, but the correct answer appears most frequently",
        "The model should always use temperature 0",
        "Longer responses are more accurate",
      ],
      answerIndex: 1,
      explanation:
        "Self-consistency exploits the fact that while individual reasoning chains can err differently, the correct answer tends to recur across multiple independent samples.",
    },
    {
      q: "In the ReAct framework, what does 'Observation' refer to?",
      options: [
        "The model's internal reasoning",
        "The final answer to the user's question",
        "The result returned from an external tool call",
        "The user's follow-up question",
      ],
      answerIndex: 2,
      explanation:
        "In ReAct, an Observation is the output received from executing an Action (tool call). The model uses this data in its next Thought step.",
    },
    {
      q: "Why should few-shot examples be diverse?",
      options: [
        "To maximize the token count",
        "To cover different categories and edge cases the model might encounter",
        "To confuse the model into producing more creative output",
        "To reduce the need for a system prompt",
      ],
      answerIndex: 1,
      explanation:
        "Diverse examples show the model how to handle different scenarios, including edge cases. If all examples are similar, the model may fail on inputs that differ from the narrow pattern demonstrated.",
    },
    {
      q: "What does 'Think step by step' trigger in a model?",
      options: [
        "Few-shot learning",
        "Chain-of-thought reasoning",
        "Tool use via ReAct",
        "Self-consistency sampling",
      ],
      answerIndex: 1,
      explanation:
        "Phrases like 'think step by step' or 'show your reasoning' trigger chain-of-thought behavior, causing the model to break down the problem and reason through intermediate steps before answering.",
    },
  ],
  flashcards: [
    {
      front: "What is few-shot prompting?",
      back: "Including input-output examples in the prompt to demonstrate the desired behavior, without any model training.",
    },
    {
      front: "What is chain-of-thought (CoT) prompting?",
      back: "Instructing the model to reason step by step before giving a final answer, improving performance on multi-step problems.",
    },
    {
      front: "What does ReAct stand for?",
      back: "Reasoning + Acting -- a framework that interleaves reasoning traces with tool-use actions and observations.",
    },
    {
      front: "How does self-consistency work?",
      back: "Generate multiple reasoning paths with temperature > 0, extract the final answer from each, and return the majority vote.",
    },
    {
      front: "What is prompt chaining?",
      back: "Breaking a complex task into a pipeline of simpler prompts, where each prompt's output feeds the next.",
    },
    {
      front: "What is least-to-most prompting?",
      back: "Decomposing a complex problem into ordered sub-problems, solving each and feeding solutions as context for the next.",
    },
    {
      front: "What is Tree of Thought (ToT)?",
      back: "Exploring multiple reasoning branches at each step and evaluating which are most promising before continuing.",
    },
  ],
  deepDive: [
    `The evolution from **zero-shot** to **few-shot** to **chain-of-thought** prompting represents a fundamental insight about how language models process information: they perform best when given *explicit patterns to follow* rather than abstract instructions to interpret. Few-shot prompting works because it converts an ambiguous task description into an **unambiguous demonstration**. When you provide 3-5 examples of input-output pairs, you are effectively compiling your requirements into a format the model's pattern-matching capabilities can directly leverage. The key subtlety is *example selection* -- biased or unrepresentative examples will teach the model the wrong pattern. For classification tasks, always balance examples across all classes. For extraction tasks, include examples with **missing data** (showing how to handle nulls) and **edge cases** (ambiguous inputs). Order matters too: placing the most complex example last gives the model the best chance of generalizing, because recency bias means the last example has the strongest influence on the output distribution.`,

    `**Chain-of-thought (CoT)** prompting is arguably the single most impactful prompting technique discovered. Its power comes from a simple but profound mechanism: by asking the model to *show its work*, you convert a single difficult reasoning step into **multiple easier steps**, each of which can leverage the model's full capabilities. Without CoT, a math problem like "If a train travels 120km in 1.5 hours, and then 80km in 1 hour, what is the average speed for the entire journey?" requires the model to compute the answer in one forward pass -- essentially guessing. With CoT, the model writes "Total distance = 120 + 80 = 200km. Total time = 1.5 + 1 = 2.5 hours. Average speed = 200/2.5 = 80 km/h." Each intermediate result becomes *part of the context* for the next computation, giving the model a **scratchpad**. The technique generalizes beyond math: any task involving *multi-step logic*, *comparison*, or *conditional reasoning* benefits from CoT. However, CoT has costs -- it increases output token usage (and therefore latency and cost) and can occasionally produce *plausible but incorrect* reasoning chains that lead to confident wrong answers.`,

    `**ReAct** and **self-consistency** represent two different strategies for overcoming the fundamental limitations of single-pass prompting. ReAct addresses the *knowledge boundary* problem: models cannot reliably reason about information they were not trained on or that has changed since training. By interleaving **Thought** (reasoning), **Action** (tool calls), and **Observation** (tool results), ReAct gives the model access to external ground truth. This is the foundation of every modern **AI agent framework** -- from simple search-augmented chatbots to complex multi-tool autonomous agents. Self-consistency, on the other hand, addresses the *reasoning reliability* problem: any single reasoning chain may contain errors, but the correct answer tends to be **robust across multiple independent attempts**. By sampling N reasoning paths (typically 5-20) and taking the majority vote, self-consistency can improve accuracy by 5-15 percentage points on reasoning benchmarks. The tradeoff is compute cost -- N forward passes per query. In production, you can optimize by using *early stopping* (stop sampling once an answer reaches a confidence threshold) or *adaptive sampling* (use more samples for harder questions). Combining ReAct with self-consistency -- sampling multiple tool-augmented reasoning chains -- yields the most reliable results but at the highest cost.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "Few-shot prompting — examples do the work that instructions cannot",
      source: `type Example = { input: string; output: string };

// Balanced across classes, and deliberately including the boundary cases.
// If every example is a clear positive, the model learns "say positive".
const EXAMPLES: Example[] = [
  { input: "Crashes every time I export a PDF.", output: "bug" },
  { input: "Could you add dark mode?", output: "feature_request" },
  { input: "How do I reset my password?", output: "question" },
  { input: "Export is slow AND the icon is wrong.", output: "bug" }, // multi-issue -> pick primary
  { input: "Love the new dashboard!", output: "feedback" },
];

function buildPrompt(ticket: string): string {
  const shots = EXAMPLES.map(
    (e) => \`Ticket: \${e.input}\\nCategory: \${e.output}\`
  ).join("\\n\\n");

  return \`Classify the ticket into exactly one of:
bug | feature_request | question | feedback

\${shots}

Ticket: \${ticket}
Category:\`;
}

// Notes that matter more than the code:
// - Order affects output. Models weight later examples more, so do not put all
//   of one class at the end.
// - 3-5 examples usually captures most of the gain; 20 mostly costs tokens.
// - The examples define the output format, which is why the answer arrives as
//   a bare label rather than a sentence — no parsing instructions needed.`,
    },
    {
      language: "typescript",
      caption: "Chain-of-thought — and when it is wasted tokens",
      source: `// WITH reasoning: multi-step work where intermediate results matter.
const COT = \`A customer on the £40/month Team plan upgrades to Business (£90)
on day 12 of a 30-day billing cycle. What is the prorated charge today?

Think step by step:
1. Days remaining in the cycle.
2. Unused credit from the old plan.
3. Cost of the new plan for those days.
4. Net charge.

Then give the final figure on its own line as: ANSWER: <amount>\`;

// The structured "ANSWER:" line matters: it gives you something to parse
// without regexing prose, and it survives the model's reasoning changing shape.

// WITHOUT reasoning: classification gains nothing and costs latency.
const DIRECT = \`Classify the sentiment as positive, negative, or neutral.
Reply with one word.

Review: "Shipping was quick but the fabric feels cheap."\`;

// Where chain-of-thought helps:
//   arithmetic, multi-constraint scheduling, debugging, anything where an
//   intermediate value feeds the next step.
// Where it does not:
//   classification, extraction, lookup, formatting — you pay tokens and
//   latency for accuracy you already had.
//
// On reasoning models: they do this internally. Telling them to "think step by
// step" is redundant and can make the output worse by constraining a process
// that was already running.`,
    },
    {
      language: "javascript",
      caption: "**Self-consistency** pattern -- sampling multiple reasoning paths and taking the majority vote",
      source: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function selfConsistency(prompt, n = 5) {
  // Sample N reasoning paths with temperature > 0
  const responses = await Promise.all(
    Array.from({ length: n }, () =>
      client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        temperature: 0.7,  // Non-zero for diverse reasoning paths
        messages: [{ role: "user", content: prompt }],
      })
    )
  );

  // Extract final answers using a regex pattern
  const answers = responses.map((r) => {
    const text = r.content[0].text;
    const match = text.match(/Final Answer:\\s*(.+)/i);
    return match ? match[1].trim() : text.trim();
  });

  // Majority vote
  const counts = {};
  for (const ans of answers) {
    counts[ans] = (counts[ans] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return {
    answer: sorted[0][0],
    confidence: sorted[0][1] / n,
    allAnswers: answers,
  };
}

// Usage
const result = await selfConsistency(
  "Think step by step. What is 17 * 23 + 14 * 8? Final Answer: [number]"
);
console.log(result);
// { answer: "503", confidence: 1.0, allAnswers: ["503","503","503","503","503"] }`,
    },
  ],
  diagrams: [
    {
      title: "Prompting Techniques Decision Tree",
      kind: "flow",
      caption: "How to choose the right prompting technique based on task characteristics and accuracy requirements.",
      mermaid: `flowchart TD
    A[New Task] --> B{Requires external data?}
    B -->|Yes| C[ReAct or Tool-Augmented]
    B -->|No| D{Multi-step reasoning?}
    D -->|Yes| E{High stakes or accuracy critical?}
    D -->|No| F{Ambiguous instructions?}
    E -->|Yes| G[Self-Consistency + CoT]
    E -->|No| H[Chain-of-Thought]
    F -->|Yes| I{Have good examples?}
    F -->|No| J[Zero-Shot with Clear Instructions]
    I -->|Yes| K[Few-Shot Prompting]
    I -->|No| J
    C --> L{Accuracy critical?}
    L -->|Yes| M[ReAct + Self-Consistency]
    L -->|No| C`,
    },
    {
      title: "ReAct Thought-Action-Observation Loop",
      kind: "sequence",
      caption: "The Thought-Action-Observation cycle in a ReAct agent answering a factual question with tool use.",
      mermaid: `sequenceDiagram
    participant U as User
    participant M as Model
    participant T as Tool - Search API
    U->>M: What is the population of Tokyo in 2024?
    M->>M: Thought: I need current population data
    M->>T: Action: search Tokyo population 2024
    T-->>M: Observation: 14 million city proper
    M->>M: Thought: User may want metro area too
    M->>T: Action: search Tokyo metropolitan area population 2024
    T-->>M: Observation: 37.4 million metro area
    M->>M: Thought: I have both figures, can answer now
    M->>U: Tokyo city proper ~14M, metro area ~37.4M`,
    },
    {
      title: "Prompting Techniques Comparison",
      kind: "mindmap",
      caption: "Overview of major prompting techniques, their mechanisms, and the problem types they are best suited for.",
      mermaid: `mindmap
  root((Prompting Techniques))
    Zero-Shot
      No examples needed
      Simple well-defined tasks
      Relies on model knowledge
    Few-Shot
      2 to 8 examples in prompt
      Custom formats
      Classification tasks
      Domain-specific output
    Chain-of-Thought
      Step by step reasoning
      Math and logic problems
      Append think step by step
      Reduces reasoning errors
    Self-Consistency
      Sample N reasoning paths
      Majority vote on answer
      High-stakes decisions
      Expensive N forward passes
    ReAct
      Interleaves thought and action
      Calls external tools
      Grounded in real data
      Multi-step research tasks
    Tree of Thought
      Explores branching paths
      Complex planning problems
      Most expensive technique`,
    },
  ],
  animations: [
    {
      title: "When chain-of-thought earns its tokens",
      steps: [
        {
          label: "Direct prompt",
          detail: "'What's 17% of 340, minus 12?' Answered in one shot; often wrong on multi-step arithmetic.",
        },
        {
          label: "Add reasoning",
          detail: "'Work through it step by step.' The model produces intermediate steps and gets it right more often.",
        },
        {
          label: "Why it helps",
          detail: "Each generated token conditions the next, so intermediate results become available to later steps instead of having to be produced in one leap.",
        },
        {
          label: "Where it doesn't",
          detail: "Classification, extraction, and lookup gain nothing — you pay tokens and latency for no accuracy.",
        },
        {
          label: "Reasoning models",
          detail: "Newer models do this internally; prompting them to think step by step is redundant and sometimes harmful.",
        },
        {
          label: "Better still",
          detail: "For arithmetic specifically, give it a calculator tool rather than asking it to reason.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Technique", "When to Use", "Accuracy Gain", "Cost Increase", "Key Limitation"],
    rows: [
      ["**Zero-shot**", "Simple, well-defined tasks", "Baseline", "None (1x)", "Fails on ambiguous or complex tasks"],
      ["**Few-shot**", "Custom formats, classification, domain-specific tasks", "+10-25%", "Minimal (extra input tokens)", "Requires *good representative examples*"],
      ["**Chain-of-Thought**", "Math, logic, multi-step reasoning", "+20-40%", "Moderate (longer outputs)", "Can produce *plausible but wrong* reasoning"],
      ["**Self-Consistency**", "High-stakes reasoning where accuracy is critical", "+5-15% over CoT", "High (**N x** forward passes)", "Expensive; diminishing returns past N=10"],
      ["**ReAct**", "Knowledge-intensive tasks needing external data", "Significant (grounded)", "Variable (depends on tool calls)", "Depends on *correct tool selection*"],
      ["**Tree of Thought**", "Complex problems with branching solutions", "+10-20% over CoT", "Very high (branching exploration)", "Complex to implement; **slow**"],
    ],
  },
  exercises: [
    "**Few-Shot Design Challenge**: Build a few-shot prompt that classifies support tickets into 5 categories (billing, technical, account, feature-request, other). Create 2 examples per category (10 total), ensuring diversity within each class. Test with 20 new tickets and measure accuracy. Then experiment with *reducing to 1 example per category* -- how much accuracy do you lose?",
    "**CoT vs Zero-Shot Benchmark**: Take 10 multi-step word problems (math, logic, or scheduling) and solve each with (a) a zero-shot prompt and (b) a chain-of-thought prompt. Record the accuracy of each approach and analyze *where* CoT made the difference. Identify any cases where CoT produced **plausible but incorrect reasoning**.",
    "**Build a Mini ReAct Agent**: Using the Anthropic or OpenAI API with tool use, build a simple ReAct agent that can answer questions by searching a provided knowledge base (a dictionary or small database). Implement the Thought-Action-Observation loop for at least 3 turns. Test with questions that require *multiple lookups* to answer.",
    "**Self-Consistency Implementation**: Implement the self-consistency pattern from the code example above. Test it on 10 arithmetic word problems with N=1, N=5, and N=10 samples. Plot **accuracy vs. N** and identify the point of diminishing returns. Calculate the **cost multiplier** at each N value.",
    "**Technique Combination Lab**: Pick a complex task (e.g., \"analyze a company's quarterly earnings and recommend buy/sell/hold\"). Implement it using (a) zero-shot, (b) few-shot + CoT, and (c) ReAct with a search tool. Compare outputs on 3 different companies and evaluate *which technique combination* produces the most reliable, well-reasoned analysis.",
  ],
  cheatSheet: [
    "**Few-shot golden rule**: use 3-5 *diverse, representative* examples. Balance across classes for classification. Put the hardest example last (recency bias).",
    "**Trigger CoT** with \"Think step by step\" or \"Show your reasoning before answering\" -- this alone can boost accuracy 20-40% on reasoning tasks.",
    "**Self-consistency** = sample N responses at temperature > 0, extract final answers, take majority vote. Start with N=5; diminishing returns past N=10.",
    "**ReAct pattern**: Thought (reason) -> Action (tool call) -> Observation (result) -> repeat. The model decides *when* and *which* tools to call.",
    "**Prompt chaining** > monolithic prompts: break complex tasks into a pipeline of 2-4 simpler prompts. Each step's output feeds the next step's input.",
    "**Least-to-most** for building-block problems: decompose into sub-problems, solve in order, feed each solution as context for the next.",
  ],
  revisionNotes: [
    "**Few-shot prompting** provides input-output examples that demonstrate the desired pattern. Best practices: *diverse, balanced* examples; consistent formatting; 3-5 examples for most tasks; include edge cases with missing data.",
    "**Chain-of-thought (CoT)** converts one hard reasoning step into multiple easier steps by asking the model to *show its work*. Each intermediate result becomes context for the next step -- essentially a **scratchpad**. Improves accuracy 20-40% on math/logic tasks.",
    "**ReAct** (Reasoning + Acting) interleaves Thought, Action, and Observation to give models access to **external tools and data**. It is the foundation of modern AI agent frameworks and outperforms pure CoT on knowledge-intensive tasks.",
    "**Self-consistency** improves on CoT by sampling N independent reasoning paths and selecting the **majority vote** answer. Costs N x compute but consistently improves accuracy. Combine with early stopping for efficiency.",
    "**Key tradeoff**: simpler techniques (zero-shot, few-shot) are faster and cheaper; advanced techniques (CoT, self-consistency, ReAct) improve accuracy but increase latency and cost. Choose based on *task complexity* and *accuracy requirements*.",
  ],
  resources: [
    {
      label: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models — Wei et al., 2022",
      kind: "paper",
    },
    {
      label: "ReAct: Synergizing Reasoning and Acting in Language Models — Yao et al., 2022",
      kind: "paper",
    },
  ],
  glossary: [
    {
      term: "Few-Shot Prompting",
      definition: "Including examples in the prompt to demonstrate desired input-output behavior.",
    },
    {
      term: "Chain-of-Thought (CoT)",
      definition: "A prompting strategy that elicits step-by-step reasoning to improve accuracy on complex tasks.",
    },
    {
      term: "ReAct",
      definition: "A framework combining reasoning traces with tool-use actions and observations for grounded problem-solving.",
    },
    {
      term: "Self-Consistency",
      definition: "Sampling multiple reasoning paths and selecting the most frequent answer via majority voting.",
    },
    {
      term: "Prompt Chaining",
      definition: "Connecting multiple prompts in sequence, where each output feeds the next input.",
    },
    {
      term: "Tree of Thought",
      definition: "A structured exploration of multiple reasoning branches with evaluation at each step.",
    },
    {
      term: "Zero-Shot Prompting",
      definition: "Performing a task from instructions alone without any examples.",
    },
  ],
};

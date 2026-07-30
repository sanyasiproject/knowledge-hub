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

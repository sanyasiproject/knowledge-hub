import type { TopicContent } from "../types";

export const agentFundamentals: TopicContent = {
  quickSummary: [
    "An AI agent is a system that perceives its environment, reasons about goals, plans actions, executes them using tools, and observes outcomes in a loop until the task is complete.",
    "The core agent loop is Perceive-Reason-Plan-Act-Observe: the agent takes in context, thinks about what to do, selects and executes actions, then evaluates results to decide the next step.",
    "Reasoning is the agent's ability to break down problems, evaluate options, and make decisions. Chain-of-thought, ReAct, and reflection patterns enable structured reasoning.",
    "Tool selection is how agents choose which capability to invoke. It depends on understanding tool descriptions, matching them to the current sub-task, and handling tool outputs correctly.",
  ],
  detailed: [
    "## The Agent Loop\n\nEvery agent follows a loop: (1) **Perceive** the current state (user input, tool outputs, environment observations), (2) **Reason** about what has been accomplished and what remains, (3) **Plan** the next action or sequence of actions, (4) **Act** by calling a tool or generating output, (5) **Observe** the result and update internal state. The loop continues until the task is complete, an error requires human intervention, or a maximum iteration limit is reached. This loop distinguishes agents from simple prompt-response systems: agents maintain state across multiple turns and adapt based on intermediate results.",
    "## Reasoning Patterns\n\nAgents use structured reasoning to solve complex tasks. **Chain-of-thought (CoT)** has the model think step-by-step before acting. **ReAct** (Reasoning + Acting) interleaves reasoning traces with tool calls: the model explains its thinking, takes an action, observes the result, and reasons again. **Reflection** has the agent critique its own output and retry if unsatisfied. **Tree-of-thought** explores multiple reasoning paths in parallel. The choice of reasoning pattern affects reliability: ReAct is the most common for tool-using agents because it creates an auditable trace of decisions.",
    "## Tool Selection and Invocation\n\nAgents are given descriptions of available tools (name, description, parameters, return type). The LLM must: understand what each tool does from its description, match the current sub-task to the appropriate tool, extract and format the correct arguments, and handle the tool's response (including errors). Good tool descriptions are critical: vague descriptions lead to incorrect tool selection. Tool schemas should include parameter constraints, example values, and expected output format. Agents should gracefully handle tool failures by retrying, falling back to alternative tools, or asking for clarification.",
    "## Stopping Conditions and Guardrails\n\nAgents need clear stopping conditions to avoid infinite loops or runaway costs. Common patterns include: maximum iteration limits, budget caps (token or API call limits), confidence thresholds (stop when the agent believes the answer is sufficient), and human-in-the-loop checkpoints for high-stakes decisions. Guardrails include input/output validation, tool call sandboxing, and monitoring for off-topic or harmful behavior. Without these safeguards, agents can waste resources on unproductive loops or take unintended actions.",
  ],
  interviewQA: [
    {
      q: "What distinguishes an AI agent from a standard LLM prompt-response system?",
      a: "An agent operates in a loop: it maintains state across multiple steps, uses tools to interact with the environment, observes results, and adapts its plan based on intermediate outcomes. A standard prompt-response system processes each request independently without state, tool use, or iterative refinement. Agents have autonomy to decide what to do next, while prompt-response systems only react to explicit inputs.",
    },
    {
      q: "How does the ReAct pattern work?",
      a: "ReAct interleaves reasoning and acting in a structured loop. The agent first writes a thought explaining its reasoning and plan, then selects and executes an action (tool call), then observes the result. Based on the observation, it writes another thought, potentially takes another action, and repeats until the task is complete. This creates an auditable trace of why each action was taken, making debugging and evaluation easier than opaque end-to-end generation.",
    },
    {
      q: "Why are good tool descriptions critical for agent performance?",
      a: "The LLM selects tools based solely on their descriptions, parameter schemas, and names. If a description is vague, the model may choose the wrong tool or pass incorrect arguments. Effective descriptions include: what the tool does, when to use it (and when not to), parameter constraints and examples, expected output format, and error conditions. This is essentially prompt engineering for tool selection.",
    },
  ],
  mcqs: [
    {
      q: "In the agent loop, what happens after the 'Act' step?",
      options: [
        "The agent immediately plans the next action",
        "The agent observes the result and reasons about it",
        "The loop terminates",
        "The agent restarts from the beginning",
      ],
      answerIndex: 1,
      explanation:
        "After acting (executing a tool or generating output), the agent observes the result and uses it to update its understanding of the current state before deciding the next step.",
    },
    {
      q: "Which reasoning pattern interleaves explicit thinking with tool invocations?",
      options: [
        "Chain-of-thought only",
        "ReAct (Reasoning + Acting)",
        "Few-shot prompting",
        "Self-consistency",
      ],
      answerIndex: 1,
      explanation:
        "ReAct explicitly alternates between reasoning traces (Thought) and tool calls (Action/Observation), creating an auditable decision trace.",
    },
    {
      q: "Why do agents need maximum iteration limits?",
      options: [
        "To improve response quality",
        "To prevent infinite loops and runaway costs",
        "To reduce model context window usage",
        "To ensure tools are called in the correct order",
      ],
      answerIndex: 1,
      explanation:
        "Without iteration limits, an agent could get stuck in unproductive loops, retrying failed actions or exploring dead ends indefinitely, wasting tokens and API calls.",
    },
    {
      q: "What is reflection in the context of AI agents?",
      options: [
        "Mirroring the user's input back to them",
        "The agent critiquing its own output and retrying if unsatisfied",
        "Embedding the agent's memory into a vector store",
        "Generating multiple responses and voting on the best one",
      ],
      answerIndex: 1,
      explanation:
        "Reflection is a pattern where the agent evaluates its own output against quality criteria and, if the output is insufficient, revises its approach and tries again.",
    },
  ],
  flashcards: [
    { front: "What are the five steps of the agent loop?", back: "Perceive, Reason, Plan, Act, Observe. The agent takes in context, thinks, plans actions, executes them, and evaluates results in a continuous loop." },
    { front: "What is ReAct?", back: "Reasoning + Acting. A pattern where the agent alternates between writing explicit reasoning traces and executing tool calls, creating an auditable decision trail." },
    { front: "What is chain-of-thought (CoT)?", back: "A prompting technique where the model is encouraged to think step-by-step before producing a final answer, improving accuracy on complex reasoning tasks." },
    { front: "What is tree-of-thought?", back: "A reasoning pattern that explores multiple reasoning paths in parallel, evaluates them, and selects the most promising one. More thorough than linear chain-of-thought." },
    { front: "Why is tool description quality important?", back: "The LLM selects tools based on their descriptions. Vague descriptions lead to wrong tool selection or incorrect arguments. Descriptions should include purpose, usage conditions, parameter constraints, and examples." },
    { front: "What are common agent guardrails?", back: "Max iteration limits, token/cost budgets, input/output validation, tool call sandboxing, human-in-the-loop checkpoints, and monitoring for off-topic behavior." },
    { front: "What is the difference between an agent and a chain?", back: "A chain follows a fixed, predetermined sequence of steps. An agent dynamically decides which steps to take based on intermediate results, adapting its plan at runtime." },
  ],
  glossary: [
    { term: "Agent Loop", definition: "The perceive-reason-plan-act-observe cycle that agents execute repeatedly until a task is complete or a stopping condition is met." },
    { term: "ReAct", definition: "Reasoning and Acting. A prompting framework where the model interleaves explicit reasoning traces with tool invocations." },
    { term: "Chain-of-Thought (CoT)", definition: "A technique prompting the model to produce intermediate reasoning steps before a final answer." },
    { term: "Reflection", definition: "An agent pattern where the model critiques its own output and iterates to improve quality." },
    { term: "Tool Schema", definition: "A structured description of a tool's name, purpose, parameters, and return type that the LLM uses for tool selection." },
    { term: "Guardrails", definition: "Safety mechanisms (iteration limits, budgets, validation) that prevent agents from undesirable behaviors like infinite loops or harmful actions." },
    { term: "Scratchpad", definition: "A working memory area where agents record intermediate findings, reasoning, and state across loop iterations." },
  ],
};

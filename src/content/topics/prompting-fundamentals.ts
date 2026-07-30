import type { TopicContent } from "../types";

export const promptingFundamentals: TopicContent = {
  quickSummary: [
    "Clear, specific instructions are the foundation of effective prompting -- telling the model exactly what to do, in what format, and what to avoid.",
    "System prompts set the model's persona, constraints, and behavioral guidelines that persist across the entire conversation.",
    "Providing relevant context (background info, reference documents, examples) dramatically improves response quality and accuracy.",
    "Prompt structure matters: well-organized prompts with delimiters, sections, and explicit formatting instructions produce more reliable outputs.",
  ],
  detailed: [
    `## Writing Clear Instructions

The most common reason for poor LLM output is vague instructions. Effective prompts are specific about:

- **Task**: what exactly the model should do (summarize, classify, extract, generate, compare)
- **Format**: how the output should be structured (bullet points, JSON, table, paragraph)
- **Length**: approximate desired length (one sentence, 200 words, 3 bullet points)
- **Constraints**: what to avoid (do not include opinions, do not use technical jargon, do not make up information)
- **Audience**: who the output is for (technical expert, general public, executive)

Bad prompt: "Tell me about machine learning."
Better prompt: "Explain supervised learning to a software engineer who has never worked with ML. Cover the core concept, 3 common algorithms, and when to use each. Keep it under 300 words."

Specificity reduces ambiguity and gives the model a clear target.`,

    `## System Prompts

A system prompt (or system message) is a special instruction block that sets the model's behavior for the entire conversation. It is processed before user messages.

Common uses:
- **Persona**: "You are a senior data engineer specializing in Apache Spark."
- **Constraints**: "Only answer questions about our product. If asked about competitors, politely decline."
- **Output rules**: "Always respond in valid JSON. Never include markdown formatting."
- **Safety**: "Never provide medical diagnoses. Always recommend consulting a professional."

System prompts are not foolproof -- determined users can sometimes override them. Defense-in-depth strategies include input validation, output filtering, and model-level safety training.

Keep system prompts concise and unambiguous. Contradictory instructions confuse the model and produce inconsistent behavior.`,

    `## Context Provision

LLMs generate better responses when given relevant context. Types of context:

**Reference material**: paste relevant documentation, code snippets, or data directly into the prompt. The model can then cite and reason over this material rather than relying on training data that may be outdated or incorrect.

**Conversation history**: in multi-turn interactions, prior messages provide continuity. Summarizing long histories can save tokens while preserving key context.

**Task examples**: showing the model one or more input-output examples (few-shot prompting) establishes the pattern you want.

**Metadata**: providing date, user role, or application state helps the model tailor its response.

When providing context, use clear delimiters (triple backticks, XML tags, or section headers) to separate context from instructions so the model does not confuse data with commands.`,

    `## Prompt Structure and Organization

Well-structured prompts consistently outperform unstructured ones. A useful template:

1. **Role/System instruction**: set the model's persona and constraints
2. **Context/Background**: provide reference material
3. **Task**: state what the model should do
4. **Format**: specify the desired output structure
5. **Examples** (optional): show input-output pairs

Using delimiters prevents the model from treating data as instructions:
- XML tags: \`<context>...</context>\`
- Triple backticks for code blocks
- Section headers with markdown

Other structural techniques:
- **Numbered steps**: for multi-step tasks, list steps explicitly
- **Checklists**: "Before responding, verify that your answer includes X, Y, and Z"
- **Negative instructions**: "Do NOT include..." can be more effective than positive framing for common failure modes`,

    `## Common Pitfalls

**Prompt injection**: user input that attempts to override system instructions. Mitigate by separating user input into clearly delimited sections and instructing the model to treat them as data, not instructions.

**Instruction overload**: too many conflicting rules confuse the model. Prioritize the most important instructions and test for consistency.

**Assumed knowledge**: the model may not know about recent events, internal systems, or domain-specific terms. Always provide necessary context rather than assuming.

**Vague quality criteria**: "write a good summary" is less useful than "write a 3-sentence summary covering the main finding, methodology, and practical implication."

**Ignoring token limits**: very long prompts can push the response out of the context window. Monitor total token usage (prompt + response) and trim context when needed.`,
  ],
  interviewQA: [
    {
      q: "What makes a prompt effective compared to a vague one?",
      a: "An effective prompt specifies the exact task, desired format, length constraints, target audience, and what to avoid. It removes ambiguity so the model does not have to guess intent. For example, instead of 'summarize this', an effective prompt says 'write a 3-bullet executive summary of this report, focusing on financial impact, using non-technical language.' Specificity reduces variance in outputs.",
    },
    {
      q: "How do you mitigate prompt injection risks?",
      a: "Use clear delimiters (XML tags, triple backticks) to separate user-provided input from system instructions. Instruct the model to treat delimited content as data, not commands. Add validation layers that check user input before passing it to the model. Use output filtering to catch responses that indicate the system prompt was overridden. Defense-in-depth is key since no single technique is foolproof.",
    },
    {
      q: "When should you use a system prompt versus including instructions in the user message?",
      a: "System prompts are best for persistent behavior that should apply across all turns: persona, safety constraints, output format rules. User-message instructions are better for task-specific, one-time directions. System prompts have higher precedence in most APIs and are less likely to be accidentally overridden by conversation flow. Use both together for robust prompting.",
    },
    {
      q: "Why is context provision important even when the model might already know the information?",
      a: "Model training data has a cutoff date and may contain errors. Providing explicit context ensures the model reasons over correct, current information rather than potentially outdated training knowledge. It also makes the model's reasoning auditable -- you can verify the source material. For enterprise use, this is critical for accuracy and compliance.",
    },
  ],
  mcqs: [
    {
      q: "Which prompt is most likely to produce a useful response?",
      options: [
        "Tell me about Python.",
        "Write a good explanation of Python.",
        "Explain Python's GIL to a senior developer in 3 sentences, focusing on its impact on multi-threaded CPU-bound tasks.",
        "Python explanation please.",
      ],
      answerIndex: 2,
      explanation:
        "This prompt specifies the topic (GIL), audience (senior developer), format (3 sentences), and focus area (multi-threaded CPU-bound tasks), minimizing ambiguity.",
    },
    {
      q: "What is the primary purpose of delimiters in a prompt?",
      options: [
        "Making the prompt look more professional",
        "Separating data from instructions so the model does not confuse them",
        "Reducing the token count",
        "Enabling multi-turn conversations",
      ],
      answerIndex: 1,
      explanation:
        "Delimiters (XML tags, backticks, headers) clearly mark where data ends and instructions begin, preventing the model from treating user-provided content as commands.",
    },
    {
      q: "What is prompt injection?",
      options: [
        "Adding more examples to a few-shot prompt",
        "User input that attempts to override or bypass system instructions",
        "Compressing the prompt to fit within token limits",
        "Automatically generating prompts from templates",
      ],
      answerIndex: 1,
      explanation:
        "Prompt injection occurs when user-supplied input contains instructions designed to override the system prompt or manipulate the model into unintended behavior.",
    },
    {
      q: "Why might a very long system prompt cause problems?",
      options: [
        "It makes the model respond faster",
        "Contradictory instructions confuse the model and reduce available tokens for the response",
        "It improves output quality in all cases",
        "It automatically enables few-shot learning",
      ],
      answerIndex: 1,
      explanation:
        "Long system prompts risk containing contradictions that confuse the model. They also consume context window tokens, leaving less room for user input and model output.",
    },
  ],
  flashcards: [
    {
      front: "What five elements should an effective prompt specify?",
      back: "Task (what to do), format (output structure), length (how much), constraints (what to avoid), and audience (who it is for).",
    },
    {
      front: "What is a system prompt?",
      back: "A special instruction block setting the model's persona, constraints, and behavior for an entire conversation, processed before user messages.",
    },
    {
      front: "Why use delimiters in prompts?",
      back: "To clearly separate data from instructions, preventing the model from treating user content as commands (prompt injection defense).",
    },
    {
      front: "What is prompt injection?",
      back: "User input designed to override or bypass system instructions, causing unintended model behavior.",
    },
    {
      front: "Why provide context even if the model might know the information?",
      back: "Training data may be outdated or incorrect. Explicit context ensures accuracy, auditability, and compliance.",
    },
    {
      front: "What is a negative instruction?",
      back: "Telling the model what NOT to do (e.g., 'Do not include opinions'). Sometimes more effective than positive framing for common failure modes.",
    },
    {
      front: "What is instruction overload?",
      back: "Providing too many conflicting rules that confuse the model and produce inconsistent outputs.",
    },
  ],
  glossary: [
    {
      term: "System Prompt",
      definition: "A persistent instruction block that sets the model's persona, constraints, and behavior for an entire conversation.",
    },
    {
      term: "Prompt Injection",
      definition: "An attack where user input attempts to override system instructions or manipulate model behavior.",
    },
    {
      term: "Delimiter",
      definition: "A marker (XML tags, backticks, headers) used to separate data from instructions in a prompt.",
    },
    {
      term: "Few-Shot Prompting",
      definition: "Including input-output examples in the prompt to demonstrate the desired pattern.",
    },
    {
      term: "Context Window",
      definition: "The maximum number of tokens a model can process in a single prompt-plus-response.",
    },
    {
      term: "Zero-Shot Prompting",
      definition: "Asking the model to perform a task without providing any examples.",
    },
    {
      term: "Instruction Tuning",
      definition: "Training a model specifically to follow natural language instructions, improving prompt responsiveness.",
    },
  ],
};

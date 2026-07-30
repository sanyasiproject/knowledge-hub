import type { TopicContent } from "../types";

export const toolUse: TopicContent = {
  quickSummary: [
    "Tool use (function calling) allows LLMs to invoke external functions by generating structured JSON arguments that match predefined schemas, bridging the gap between language understanding and real-world action.",
    "Tool schemas define the interface: name, description, parameter types, required fields, and constraints. The quality of schemas directly determines how reliably the model calls tools.",
    "Error handling in tool use requires graceful degradation: retrying with corrected arguments, falling back to alternative tools, or surfacing clear error messages to the user.",
    "Parallel tool use enables the model to invoke multiple independent tools simultaneously, reducing latency for tasks that require several data sources.",
  ],
  detailed: [
    "## Function Calling Mechanics\n\nWhen an LLM supports tool use, you provide a list of tool definitions alongside the conversation. The model decides whether to call a tool, selects which one, and generates a JSON object with the required arguments. The system executes the function and returns the result to the model, which incorporates it into its response. This is not the model executing code: the model generates a structured request, and your application handles execution. Models like Claude, GPT-4, and Gemini all support this pattern with slightly different API formats, but the concept is identical.",
    "## Designing Tool Schemas\n\nA tool schema includes: **name** (concise, descriptive verb-noun like `search_documents`), **description** (when to use it, what it returns, edge cases), and **parameters** (JSON Schema with types, descriptions, enums, defaults, and required fields). Best practices: use enums to constrain categorical parameters, provide parameter descriptions with examples, mark optional parameters with defaults, and include negative guidance (when NOT to use the tool). The description is the most important field: it is the model's primary signal for tool selection. Treat it like API documentation for an LLM reader.",
    "## Error Handling Patterns\n\nTool calls can fail in several ways: invalid arguments (schema violation), tool execution errors (API timeouts, not found), and semantic errors (tool succeeds but returns unhelpful results). Robust error handling includes: returning structured error objects with error type and message, allowing the model to retry with corrected arguments, implementing fallback chains (try tool A, if it fails try tool B), and setting maximum retry limits to prevent loops. The error message should be informative enough for the model to correct its approach, not just 'error occurred'.",
    "## Parallel Tool Use\n\nSome APIs allow the model to request multiple tool calls in a single turn. This is useful when several independent pieces of information are needed: for example, fetching weather, calendar, and email simultaneously. The system executes all calls in parallel and returns all results at once. This reduces round trips and latency. Not all calls can be parallelized: if tool B's arguments depend on tool A's result, they must be sequential. The model should be able to express these dependencies, and the orchestration layer should respect them.",
    "## Security Considerations\n\nTool use introduces security surface area. Key concerns: **prompt injection** (malicious input causing unintended tool calls), **argument injection** (crafted inputs that exploit tool parameters), **excessive permissions** (tools with destructive capabilities like delete or write), and **data exfiltration** (tools that send data to external endpoints). Mitigations include: input validation before tool execution, least-privilege tool permissions, confirmation prompts for destructive operations, output sanitization, and audit logging of all tool invocations.",
  ],
  interviewQA: [
    {
      q: "How does function calling work in LLMs?",
      a: "You provide tool definitions (name, description, parameter schema) alongside the conversation. The model analyzes the user's request and decides whether a tool call is needed. If so, it generates a JSON object with the tool name and arguments matching the schema. Your application executes the function with those arguments and returns the result to the model. The model then uses the result to formulate its response. The model never executes code directly: it produces structured requests that your code handles.",
    },
    {
      q: "What makes a good tool description?",
      a: "A good description tells the model: what the tool does, when to use it, when NOT to use it, what it returns, and any limitations. It should include examples of appropriate use cases and edge cases. Think of it as API documentation written for an LLM reader. Avoid vague descriptions like 'searches things': instead, say 'Searches the product catalog by name or category. Use when the user asks about specific products. Returns top 10 matches with name, price, and availability.'",
    },
    {
      q: "How should you handle tool call errors?",
      a: "Return structured error objects with error type and a descriptive message the model can act on. Allow the model to retry with corrected arguments (e.g., if a parameter was out of range). Implement fallback chains for critical operations. Set maximum retry limits to prevent infinite loops. Log all errors for debugging. The error message should guide correction: 'date must be in YYYY-MM-DD format, received: tomorrow' is actionable; 'invalid input' is not.",
    },
  ],
  mcqs: [
    {
      q: "What is the model's role in function calling?",
      options: [
        "Executing the function directly",
        "Generating structured JSON arguments for the function",
        "Compiling and running the function code",
        "Storing the function results in memory",
      ],
      answerIndex: 1,
      explanation:
        "The model generates a JSON object with the tool name and arguments. The application is responsible for actually executing the function and returning results to the model.",
    },
    {
      q: "Why should tool parameters use enums where possible?",
      options: [
        "Enums make the schema file smaller",
        "Enums constrain the model to valid values, reducing argument errors",
        "Enums are required by the JSON Schema specification",
        "Enums allow the model to skip validation",
      ],
      answerIndex: 1,
      explanation:
        "Enums restrict parameter values to a predefined set of valid options, preventing the model from generating invalid or unexpected argument values.",
    },
    {
      q: "When is parallel tool use beneficial?",
      options: [
        "When tool B's arguments depend on tool A's results",
        "When multiple independent data sources need to be queried simultaneously",
        "When only one tool is available",
        "When the model needs to reduce token usage",
      ],
      answerIndex: 1,
      explanation:
        "Parallel tool use reduces latency by executing independent tool calls simultaneously. It is only applicable when calls have no dependencies on each other's results.",
    },
    {
      q: "What is the primary security risk of tool use?",
      options: [
        "The model generates too many tokens",
        "Prompt injection causing unintended tool calls with malicious arguments",
        "Tool descriptions being too verbose",
        "The model refusing to call tools",
      ],
      answerIndex: 1,
      explanation:
        "Prompt injection can cause the model to invoke tools with arguments crafted by an attacker embedded in the input, potentially causing data exfiltration, unauthorized actions, or destructive operations.",
    },
  ],
  flashcards: [
    { front: "What are the three parts of a tool schema?", back: "Name (concise verb-noun), description (when/how to use), and parameters (JSON Schema with types, constraints, and required fields)." },
    { front: "What is the difference between tool calling and code execution?", back: "In tool calling, the model generates structured arguments (JSON); the application executes the function. The model never runs code directly." },
    { front: "What is a fallback chain in tool use?", back: "A pattern where if the primary tool fails, the system automatically tries alternative tools that can accomplish the same task." },
    { front: "What is parallel tool use?", back: "The model requesting multiple independent tool calls in a single turn, which are executed simultaneously to reduce latency." },
    { front: "Why is negative guidance important in tool descriptions?", back: "Telling the model when NOT to use a tool prevents incorrect tool selection. For example: 'Do not use for real-time data; results may be up to 24 hours old.'" },
    { front: "What is argument injection?", back: "A security attack where malicious input is crafted to manipulate tool call arguments, potentially causing unintended actions or data access." },
    { front: "What makes an error message actionable for an LLM?", back: "It describes what went wrong, what the correct format/values should be, and provides enough context for the model to retry with corrected arguments." },
  ],
  glossary: [
    { term: "Function Calling", definition: "An LLM capability where the model generates structured JSON arguments to invoke external functions, with execution handled by the application." },
    { term: "Tool Schema", definition: "A JSON Schema definition of a tool's name, description, and parameters that tells the model how to invoke it." },
    { term: "Parallel Tool Use", definition: "Invoking multiple independent tools simultaneously in a single model turn to reduce latency." },
    { term: "Prompt Injection", definition: "An attack where malicious instructions are embedded in input to manipulate the model's behavior, including tool calls." },
    { term: "Fallback Chain", definition: "A sequence of alternative tools tried in order when the primary tool fails." },
    { term: "JSON Schema", definition: "A vocabulary for annotating and validating JSON documents, used to define tool parameter types and constraints." },
    { term: "Structured Output", definition: "Model output constrained to a specific format (like JSON matching a schema) rather than free-form text." },
  ],
};

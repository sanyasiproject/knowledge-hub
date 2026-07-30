import type { TopicContent } from "../types";

export const structuredOutput: TopicContent = {
  quickSummary: [
    "JSON mode constrains the model to output valid JSON, enabling reliable downstream parsing without complex extraction logic.",
    "Function calling allows the model to select and invoke predefined functions with correctly typed arguments, bridging LLMs with external systems.",
    "Schema enforcement uses JSON Schema or similar specifications to ensure model output conforms to an exact structure with required fields and types.",
    "Structured output is critical for building reliable LLM-powered pipelines where outputs feed into code, APIs, or databases.",
  ],
  detailed: [
    `## JSON Mode

JSON mode instructs the model to produce output that is valid JSON. Most API providers offer this as a parameter (e.g., response_format: { type: "json_object" }).

Key points:
- The model guarantees syntactically valid JSON, eliminating parsing errors
- You still need to specify the desired schema in your prompt -- JSON mode alone does not enforce a particular structure
- Useful for extraction tasks: pulling entities, attributes, or structured data from unstructured text
- Combine with prompt instructions that describe the expected keys, types, and nesting

Without JSON mode, models may wrap JSON in markdown code fences, add explanatory text before or after, or produce malformed JSON. JSON mode eliminates these failure modes.

Limitations: JSON mode ensures valid JSON but not schema compliance. A response might be valid JSON but missing required fields or using wrong types.`,

    `## Function Calling (Tool Use)

Function calling lets you define a set of tools (functions) with their names, descriptions, and parameter schemas. The model decides when to call a function and generates the appropriate arguments.

Workflow:
1. Define tools with name, description, and JSON Schema for parameters
2. Send the user message along with tool definitions
3. The model either responds directly or returns a tool call with arguments
4. Your code executes the function with the provided arguments
5. Send the function result back to the model
6. The model incorporates the result into its final response

Function calling enables:
- **API integration**: the model calls your backend services
- **Data retrieval**: querying databases, search engines, or knowledge bases
- **Computation**: performing calculations the model should not attempt internally
- **Multi-step workflows**: chaining multiple tool calls to accomplish complex tasks

The model does not execute functions -- it only generates the call specification. Your application handles execution.`,

    `## Schema Enforcement

Schema enforcement goes beyond JSON mode by ensuring the output matches a specific JSON Schema, including required fields, data types, enum values, and nesting structure.

Approaches:
- **API-level enforcement**: some providers (OpenAI, Anthropic) support passing a JSON Schema that the model must conform to via constrained decoding
- **Prompt-level enforcement**: include the schema in the prompt and instruct the model to follow it
- **Post-processing validation**: parse the output and validate against the schema, retrying on failure
- **Libraries**: tools like Instructor, Outlines, and Guidance provide schema-constrained generation

Constrained decoding modifies the token sampling process to only allow tokens that are valid given the schema at each position. This guarantees structural compliance but may slightly impact generation quality.

Best practice: use API-level enforcement when available, with prompt-level instructions as reinforcement.`,

    `## Practical Patterns

**Entity extraction**: given unstructured text, extract structured entities (names, dates, amounts, relationships) into a defined schema. Critical for document processing, form parsing, and data entry automation.

**Classification with metadata**: instead of returning just a label, return a structured object with the label, confidence reasoning, and supporting evidence.

**Multi-step pipelines**: chain structured outputs where each step's schema is the next step's input format. For example: extract entities -> validate entities -> enrich with external data -> generate report.

**Error handling**: always validate structured output before using it. Implement retry logic with feedback: if the output fails validation, send the error message back to the model and ask it to correct the output.

**Streaming structured output**: when streaming JSON, you cannot parse until the response is complete. Use partial JSON parsers or wait for the full response when strict parsing is needed.`,

    `## Design Considerations

**Schema complexity**: simpler schemas produce more reliable output. Deeply nested schemas with many optional fields increase error rates. Flatten when possible.

**Field descriptions**: include clear descriptions for each field in the schema. The model uses these to understand what each field should contain.

**Enum constraints**: use enums for fields with a fixed set of valid values. This prevents the model from inventing categories.

**Nullable fields**: explicitly mark fields as nullable when the information may not be present. This is better than the model inventing values to fill required fields.

**Versioning**: treat your output schemas like API contracts. Version them and maintain backward compatibility when downstream systems depend on the structure.

**Testing**: test structured output with diverse inputs, including edge cases where expected data is missing, ambiguous, or contradictory.`,
  ],
  interviewQA: [
    {
      q: "What is the difference between JSON mode and schema enforcement?",
      a: "JSON mode guarantees syntactically valid JSON but does not enforce a specific structure -- the output might have wrong keys, missing fields, or incorrect types. Schema enforcement constrains the output to match an exact JSON Schema, ensuring required fields, correct types, valid enum values, and proper nesting. Schema enforcement is more reliable but may require API support or constrained decoding.",
    },
    {
      q: "How does function calling work in LLM APIs?",
      a: "You define tools with names, descriptions, and parameter schemas. The model receives these definitions alongside the user message and decides whether to respond directly or generate a tool call with structured arguments. Your application executes the function and sends the result back to the model, which then incorporates it into its response. The model never executes functions itself -- it only generates the call specification.",
    },
    {
      q: "Why is schema complexity a concern for structured output?",
      a: "Deeply nested schemas with many optional fields, complex conditional logic, or ambiguous field descriptions increase the likelihood of the model producing non-conforming output. Simpler, flatter schemas are more reliably filled. When complex structures are needed, breaking them into multiple simpler extraction steps is often more reliable than a single complex schema.",
    },
    {
      q: "How would you handle structured output failures in a production pipeline?",
      a: "Implement a validation-retry loop: parse and validate the model's output against the schema. If validation fails, send the validation error back to the model with the original prompt and ask it to fix the output. Set a maximum retry count (typically 2-3). Log failures for monitoring. For critical pipelines, fall back to a more capable model or manual review if retries are exhausted.",
    },
  ],
  mcqs: [
    {
      q: "What does constrained decoding do during structured output generation?",
      options: [
        "It fine-tunes the model on structured data",
        "It modifies token sampling to only allow tokens valid given the schema",
        "It compresses the output to reduce token count",
        "It adds post-processing validation",
      ],
      answerIndex: 1,
      explanation:
        "Constrained decoding restricts the token sampling at each position to only those tokens that would produce output conforming to the specified schema.",
    },
    {
      q: "In function calling, who executes the function?",
      options: [
        "The LLM model itself",
        "The API provider's server",
        "Your application code",
        "The user's browser",
      ],
      answerIndex: 2,
      explanation:
        "The model only generates the function name and arguments as structured data. Your application receives this specification, executes the actual function, and sends the result back.",
    },
    {
      q: "Why should you use enum constraints in output schemas?",
      options: [
        "To improve model training",
        "To prevent the model from inventing values outside the valid set",
        "To reduce the schema file size",
        "To enable streaming output",
      ],
      answerIndex: 1,
      explanation:
        "Enum constraints restrict a field to a predefined set of valid values, preventing the model from generating unexpected or inconsistent categories.",
    },
    {
      q: "What is the main limitation of JSON mode without schema enforcement?",
      options: [
        "It produces invalid JSON",
        "It guarantees valid JSON but not the correct structure or fields",
        "It only works with small models",
        "It prevents function calling",
      ],
      answerIndex: 1,
      explanation:
        "JSON mode ensures the output is parseable JSON, but the JSON may have wrong keys, missing required fields, or incorrect types. Schema enforcement is needed for structural guarantees.",
    },
  ],
  flashcards: [
    {
      front: "What does JSON mode guarantee?",
      back: "Syntactically valid JSON output. It does NOT guarantee the output matches a specific schema.",
    },
    {
      front: "What is function calling in the context of LLMs?",
      back: "A mechanism where the model selects predefined functions and generates structured arguments, but the application executes the actual function.",
    },
    {
      front: "What is constrained decoding?",
      back: "Modifying the token sampling process to only allow tokens that conform to a specified schema at each generation step.",
    },
    {
      front: "Name three libraries for schema-constrained LLM output.",
      back: "Instructor, Outlines, and Guidance.",
    },
    {
      front: "Why use enum fields in output schemas?",
      back: "To restrict values to a predefined valid set, preventing the model from inventing categories.",
    },
    {
      front: "What is a validation-retry loop?",
      back: "Parsing output against a schema, and on failure, sending the error back to the model to fix the output, with a maximum retry count.",
    },
    {
      front: "Why flatten complex schemas when possible?",
      back: "Simpler, flatter schemas produce more reliable model output. Deep nesting and many optional fields increase error rates.",
    },
  ],
  glossary: [
    {
      term: "JSON Mode",
      definition: "An API setting that constrains the model to output syntactically valid JSON.",
    },
    {
      term: "Function Calling",
      definition: "A mechanism for the model to select and parameterize predefined functions that the application then executes.",
    },
    {
      term: "Schema Enforcement",
      definition: "Ensuring model output conforms to a specific JSON Schema with required fields, types, and constraints.",
    },
    {
      term: "Constrained Decoding",
      definition: "Modifying token-level sampling to only allow outputs that conform to a given structural specification.",
    },
    {
      term: "Tool Use",
      definition: "The broader concept of LLMs interacting with external functions, APIs, or systems via structured calls.",
    },
    {
      term: "Instructor",
      definition: "A Python library that provides schema-validated structured output from LLMs using Pydantic models.",
    },
    {
      term: "Partial JSON Parsing",
      definition: "Parsing incomplete JSON during streaming to provide incremental structured data before the full response is available.",
    },
  ],
};

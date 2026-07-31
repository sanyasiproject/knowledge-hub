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
  deepDive: [
    `**Structured output** is the bridge between the probabilistic world of language models and the deterministic world of software engineering. Every production LLM application eventually needs to parse model output programmatically -- whether it is extracting entities from documents, generating API call parameters, or producing database-ready records. The challenge is that language models are fundamentally *text generators*: they produce sequences of tokens optimized for linguistic coherence, not structural validity. **JSON mode** was the first step toward solving this, guaranteeing syntactically valid JSON output by constraining the model's generation process. However, JSON mode alone is like having a type system that only checks "is this valid JavaScript?" without checking "does this match the interface?" -- your output might be \`{"foo": 42}\` when you needed \`{"name": string, "age": number}\`. This is why **schema enforcement** is critical for production systems: it ensures not just valid syntax but valid *structure*, with the right fields, types, and constraints. The combination of JSON mode + schema enforcement transforms LLM output from "text that looks like data" into "data that happens to be generated by an LLM."`,

    `**Function calling** (also called *tool use*) represents a paradigm shift in how we think about LLM output. Instead of asking the model to produce a final text response, you define a set of **typed function signatures** and let the model decide when to call them and with what arguments. The model never executes functions -- it only generates the *call specification* as structured data (function name + arguments object). Your application handles execution and feeds results back. This separation of concerns is powerful: the model contributes *reasoning and intent*, while your code contributes *execution and safety*. Function calling enables the entire ecosystem of LLM agents, from simple calculator tools to complex multi-step workflows involving databases, APIs, and external services. The key design principle is **schema quality**: well-described functions with clear parameter descriptions and constrained types (enums, bounded numbers, required vs. optional fields) dramatically reduce argument errors. Think of your tool definitions as a *developer experience API* -- if a human developer would find your function signature confusing, the model will too.`,

    `Building reliable **structured output pipelines** requires treating model output schemas like *API contracts* with all the discipline that implies: versioning, validation, error handling, and testing. The **validation-retry pattern** is foundational: parse the model's output against your schema, and if validation fails, send the error message back to the model with the original prompt and ask it to correct the output (typically with a maximum of 2-3 retries). Libraries like **Instructor** (Python) and **Zod** (TypeScript) make this pattern ergonomic by integrating schema definition, validation, and retry logic into a single workflow. For high-throughput production systems, also consider **constrained decoding** -- a technique where the API provider modifies the token sampling process to *only allow tokens valid for the current schema position*. This guarantees structural compliance at generation time, eliminating the need for retries entirely, though it may slightly affect generation quality for complex schemas. Finally, test your structured output with *adversarial inputs*: documents with missing data, contradictory information, or unexpected formats. The schema's \`nullable\` fields and default values are your safety net -- always prefer explicitly marking a field as nullable over letting the model **hallucinate** a value to fill a required field.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "**Tool use / function calling** with the Anthropic API in C++ -- defining tools and handling responses",
      source: `#include <iostream>
#include <string>
#include <curl/curl.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// libcurl write callback
size_t write_cb(char* ptr, size_t size, size_t nmemb, std::string* data) {
    data->append(ptr, size * nmemb);
    return size * nmemb;
}

int main() {
    // Define tools with clear descriptions and typed parameters
    json tools = json::array({
        {
            {"name", "get_weather"},
            {"description", "Get the current weather for a specific location. "
                            "Use this when the user asks about weather conditions."},
            {"input_schema", {
                {"type", "object"},
                {"properties", {
                    {"location", {
                        {"type", "string"},
                        {"description", "City and country, e.g. 'London, UK'"}
                    }},
                    {"units", {
                        {"type", "string"},
                        {"enum", {"celsius", "fahrenheit"}},
                        {"description", "Temperature unit preference"}
                    }}
                }},
                {"required", {"location"}}
            }}
        }
    });

    // Build the request body
    json request_body = {
        {"model", "claude-sonnet-4-20250514"},
        {"max_tokens", 1024},
        {"tools", tools},
        {"messages", json::array({
            {{"role", "user"}, {"content", "What's the weather in Tokyo?"}}
        })}
    };

    // Send request via libcurl
    CURL* curl = curl_easy_init();
    std::string response_str;
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "x-api-key: YOUR_API_KEY");
    headers = curl_slist_append(headers, "anthropic-version: 2023-06-01");

    curl_easy_setopt(curl, CURLOPT_URL, "https://api.anthropic.com/v1/messages");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    std::string body = request_body.dump();
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_str);
    curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    // Handle tool use response
    auto response = json::parse(response_str);
    for (auto& block : response["content"]) {
        if (block["type"] == "tool_use") {
            std::cout << "Tool: " << block["name"] << "\\n";
            std::cout << "Args: " << block["input"].dump(2) << "\\n";
            // Your code executes the actual function here
            // Then send the result back to the model
        }
    }
}`,
    },
    {
      language: "cpp",
      caption: "**Schema-validated structured extraction** using struct definitions and JSON validation in C++",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <optional>
#include <stdexcept>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// Define your output schema as C++ structs
enum class Sentiment { POSITIVE, NEGATIVE, NEUTRAL };

std::string sentiment_to_string(Sentiment s) {
    switch (s) {
        case Sentiment::POSITIVE: return "positive";
        case Sentiment::NEGATIVE: return "negative";
        case Sentiment::NEUTRAL:  return "neutral";
    }
    return "unknown";
}

Sentiment string_to_sentiment(const std::string& s) {
    if (s == "positive") return Sentiment::POSITIVE;
    if (s == "negative") return Sentiment::NEGATIVE;
    if (s == "neutral")  return Sentiment::NEUTRAL;
    throw std::invalid_argument("Invalid sentiment: " + s);
}

struct ReviewAnalysis {
    Sentiment             sentiment;       // Overall sentiment of the review
    double                confidence;      // Confidence score 0-1
    std::vector<std::string> key_topics;   // Main topics mentioned
    bool                  action_required; // Whether this needs human follow-up
    std::string           summary;         // Brief summary (max 200 chars)
    std::optional<std::string> customer_name; // Customer name if mentioned
};

// Validate and parse the JSON response into our struct
ReviewAnalysis parse_review(const json& j) {
    ReviewAnalysis result;

    // Validate required fields and types
    result.sentiment = string_to_sentiment(j.at("sentiment").get<std::string>());

    result.confidence = j.at("confidence").get<double>();
    if (result.confidence < 0.0 || result.confidence > 1.0)
        throw std::invalid_argument("confidence must be between 0 and 1");

    result.key_topics = j.at("key_topics").get<std::vector<std::string>>();
    result.action_required = j.at("action_required").get<bool>();

    result.summary = j.at("summary").get<std::string>();
    if (result.summary.size() > 200)
        throw std::invalid_argument("summary exceeds 200 characters");

    if (j.contains("customer_name") && !j["customer_name"].is_null())
        result.customer_name = j["customer_name"].get<std::string>();

    return result;
}

// Serialize back to JSON
json to_json(const ReviewAnalysis& r) {
    return {
        {"sentiment",       sentiment_to_string(r.sentiment)},
        {"confidence",      r.confidence},
        {"key_topics",      r.key_topics},
        {"action_required", r.action_required},
        {"summary",         r.summary},
        {"customer_name",   r.customer_name.has_value() ? json(*r.customer_name) : json(nullptr)}
    };
}

// Example: validation-retry loop (pseudo-code for API call)
// In production, use libcurl to call the Anthropic API, parse JSON,
// validate with parse_review(), and retry on validation failure.
int main() {
    // Simulated model response (in production, this comes from the API)
    json model_output = {
        {"sentiment", "negative"},
        {"confidence", 0.92},
        {"key_topics", {"update", "workflow", "frustration"}},
        {"action_required", true},
        {"summary", "Long-term customer frustrated by a new update that broke their workflow."},
        {"customer_name", nullptr}
    };

    try {
        ReviewAnalysis analysis = parse_review(model_output);
        std::cout << to_json(analysis).dump(2) << "\\n";
        // Guaranteed to match ReviewAnalysis schema
    } catch (const std::exception& e) {
        std::cerr << "Validation error: " << e.what() << "\\n";
        // Retry with error feedback sent back to the model
    }
}`,
    },
    {
      language: "javascript",
      caption: "**Validation-retry pattern** in Node.js with Zod schema validation",
      source: `import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic();

// Define schema with Zod
const EntitySchema = z.object({
  entities: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(["person", "organization", "location", "date", "amount"]),
    value: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  raw_text_length: z.number().int().positive(),
});

async function extractWithRetry(text, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const prompt = attempt === 0
      ? \`Extract all entities from this text as JSON.
Schema: { entities: [{ name, type, value, confidence }], raw_text_length }
Types: person | organization | location | date | amount

Text: "\${text}"\`
      : \`Your previous output had a validation error: \${lastError}
Please fix the output and try again. Original text: "\${text}"\`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    try {
      const parsed = JSON.parse(response.content[0].text);
      return EntitySchema.parse(parsed); // Throws on validation failure
    } catch (err) {
      lastError = err.message;
      console.warn(\`Attempt \${attempt + 1} failed: \${lastError}\`);
    }
  }
  throw new Error(\`Failed after \${maxRetries} retries: \${lastError}\`);
}

const result = await extractWithRetry(
  "On Jan 15, 2025, Acme Corp paid $50,000 to Jane Smith in New York."
);
console.log(JSON.stringify(result, null, 2));`,
    },
  ],
  diagrams: [
    {
      title: "Structured Output Pipeline",
      kind: "flow",
      caption: "End-to-end flow from unstructured input through schema-validated structured output with retry logic",
      mermaid: `flowchart TD
    A[Unstructured Input Text] --> B[Construct Prompt with Schema]
    B --> C[Send to LLM with JSON Mode]
    C --> D[Parse Response as JSON]
    D --> E{Valid JSON?}
    E -- No --> F[Retry with Error Feedback]
    F --> C
    E -- Yes --> G[Validate Against Schema]
    G --> H{Schema Valid?}
    H -- No --> I{Retries Left?}
    I -- Yes --> J[Send Validation Error to LLM]
    J --> C
    I -- No --> K[Fallback: Log & Alert]
    H -- Yes --> L[Use Structured Data]
    L --> M[Downstream System / API / DB]`,
    },
    {
      title: "Function Calling Sequence",
      kind: "sequence",
      caption: "The complete lifecycle of a function calling interaction between user, model, and application",
      mermaid: `sequenceDiagram
    participant U as User
    participant App as Application
    participant LLM as Language Model
    participant API as External API

    U->>App: "What is the weather in Tokyo?"
    App->>LLM: User message + tool definitions
    LLM-->>App: tool_use: get_weather({location: "Tokyo"})
    App->>API: GET /weather?city=Tokyo
    API-->>App: {temp: 22, condition: "sunny"}
    App->>LLM: tool_result: {temp: 22, condition: "sunny"}
    LLM-->>App: "It is 22C and sunny in Tokyo"
    App->>U: "It is 22C and sunny in Tokyo"`,
    },
  ],
  comparison: {
    columns: ["Approach", "Guarantees", "Implementation Effort", "Reliability", "Best For"],
    rows: [
      ["**Prompt-only** (\"respond in JSON\")", "None -- model may add prose or malform JSON", "Minimal", "Low (~70-80%)", "Quick prototypes, *non-critical* tasks"],
      ["**JSON mode**", "Syntactically valid JSON", "Low (API parameter)", "Medium (~90%)", "Simple extraction where *any* valid JSON works"],
      ["**Schema in prompt** + validation", "Valid JSON + structure (with retries)", "Medium", "High (~95%)", "Production pipelines with **custom schemas**"],
      ["**API-level schema enforcement**", "Guaranteed schema compliance via constrained decoding", "Low-Medium", "Very High (~99%)", "High-volume pipelines needing **zero failures**"],
      ["**Instructor / Outlines library**", "Schema + validation + retry in one package", "Low", "High (~97%)", "Python/TS apps wanting **ergonomic** structured output"],
      ["**Function calling / tool use**", "Typed arguments matching tool definitions", "Medium", "High (~95%)", "**Agent workflows**, API integrations, multi-tool tasks"],
    ],
  },
  exercises: [
    "**Entity Extraction Pipeline**: Build a structured extraction pipeline that takes an unstructured job posting and outputs a validated JSON object with fields: `title`, `company`, `location`, `salary_range` (nullable), `requirements` (array), and `remote_policy` (enum: onsite/hybrid/remote). Implement the **validation-retry pattern** with a maximum of 3 retries. Test with 5 real job postings including one with *missing salary info*.",
    "**Multi-Tool Agent**: Define 3 tools (a calculator, a dictionary lookup, and a date calculator) with proper JSON Schema definitions. Build a simple agent loop that sends the user query + tool definitions to the model, executes any tool calls, and feeds results back. Test with questions that require *chaining multiple tools* (e.g., \"How many days between Jan 1 and March 15, and what is that number squared?\").",
    "**Schema Evolution Lab**: Start with a simple extraction schema (3 fields). Build a working pipeline, then add 3 more fields (including one *nullable* and one *enum*). Observe how the model handles the schema change. Implement **schema versioning** and a migration strategy for downstream consumers.",
    "**Adversarial Testing**: Take your entity extraction pipeline and test it with 5 adversarial inputs: (a) empty text, (b) text in a different language, (c) contradictory information, (d) prompt injection attempt inside the text, (e) extremely long input. Document how each failure mode manifests and implement **defensive handling** for each case.",
  ],
  cheatSheet: [
    "**JSON mode != schema enforcement**: JSON mode guarantees *valid syntax*; schema enforcement guarantees *correct structure*. Always use both in production.",
    "**Validation-retry pattern**: parse output -> validate against schema -> on failure, send error back to model -> retry (max 2-3 times). This catches 95%+ of structural errors.",
    "**Function definitions are prompts**: write clear `description` fields for each tool and parameter. The model uses these to decide *when* to call and *how* to fill arguments.",
    "**Prefer enums over free text** for categorical fields. `\"type\": {\"enum\": [\"bug\", \"feature\", \"question\"]}` prevents the model from inventing categories like \"enhancement\" or \"issue\".",
    "**Mark nullable explicitly**: use `\"nullable\": true` for fields where data may be missing. This is *always* better than letting the model **hallucinate** values for required fields.",
    "**Flatten schemas**: deeply nested structures with many optional fields increase error rates. If your schema has more than 3 levels of nesting, consider breaking it into **multiple extraction steps**.",
  ],
  revisionNotes: [
    "**JSON mode** guarantees syntactically valid JSON but does *not* enforce a specific schema. It eliminates parsing errors (no markdown fences, no prose wrappers) but the output may have wrong fields or types. Always combine with **schema validation**.",
    "**Function calling** lets you define typed tool signatures; the model generates call specs (name + arguments) but *never executes* functions. Your application handles execution and feeds results back. This is the foundation of **LLM agent systems**.",
    "**Schema enforcement** via constrained decoding modifies token sampling to only allow schema-valid tokens at each position. It guarantees structural compliance but requires API support. Use **Instructor** (Python) or **Zod** (TypeScript) for library-level enforcement with automatic retries.",
    "**Production patterns**: always validate before using structured output. Implement the **validation-retry loop** (parse -> validate -> retry with error feedback, max 2-3 attempts). For critical pipelines, fall back to a more capable model or manual review if retries are exhausted.",
    "**Design for failure**: use `nullable` fields for missing data, `enum` constraints for categorical values, clear field `descriptions`, and flat schemas (max 3 nesting levels). Test with **adversarial inputs** including missing data, contradictions, and prompt injection in input text.",
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

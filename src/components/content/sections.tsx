import React, { useState, useRef, useEffect, useCallback } from "react";
import type {
  AnimationSpec,
  ComparisonTable,
  Flashcard,
  GlossaryEntry,
  MCQItem,
  QAItem,
  ResourceLink,
  TopicContent,
} from "../../content/types";
import type { ContentComponentKind } from "../../data/topicSections";
import { Placeholder, Pill, cx } from "../ui/primitives";
import { RichParagraphs, RichText } from "./RichText";

/* ------------------------------------------------------------------ */
/* Learn                                                               */
/* ------------------------------------------------------------------ */

function Paragraphs({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return <RichParagraphs items={items} />;
}

function QuickSummary({ c }: { c: TopicContent }) {
  if (!c.quickSummary?.length)
    return <Placeholder icon="⚡" title="Quick Summary">A 2-minute revision of this topic will appear here.</Placeholder>;
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800/60 dark:bg-brand-900/20">
      <ul className="space-y-3">
        {c.quickSummary.map((s, i) => (
          <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-200">
            <span className="mt-1 text-brand-500">&#x25C6;</span>
            <span><RichText text={s} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailedExplanation({ c }: { c: TopicContent }) {
  if (!c.detailed?.length)
    return <Placeholder icon="📖" title="Detailed Explanation">A full, from-first-principles explanation will appear here.</Placeholder>;
  return <Paragraphs items={c.detailed} />;
}

function DeepDive({ c }: { c: TopicContent }) {
  if (!c.deepDive?.length)
    return <Placeholder icon="🔬" title="Deep Technical Explanation">Internals, edge cases, and trade-offs for mastery will appear here.</Placeholder>;
  return <Paragraphs items={c.deepDive} />;
}

/* ------------------------------------------------------------------ */
/* Syntax Highlighting                                                 */
/* ------------------------------------------------------------------ */

interface Token {
  type: "keyword" | "string" | "comment" | "number" | "plain";
  text: string;
}

const KEYWORDS = new Set([
  "const", "let", "var", "function", "class", "return", "if", "else", "for",
  "while", "import", "export", "interface", "type", "struct", "enum", "int",
  "string", "bool", "void", "auto", "public", "private", "protected", "static",
  "new", "this", "super", "extends", "implements", "abstract", "final",
  "default", "switch", "case", "break", "continue", "throw", "try", "catch",
  "finally", "async", "await", "yield", "from", "as", "of", "in", "typeof",
  "instanceof", "null", "undefined", "true", "false", "nil", "None", "def",
  "fn", "pub", "mod", "use", "crate", "impl", "trait", "where", "match",
  "mut", "ref", "self", "println", "package", "main", "fmt", "func", "go",
  "chan", "select", "defer", "map", "range", "make", "append",
]);

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = source.length;

  while (i < len) {
    // Line comment
    if (source[i] === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      const commentEnd = end === -1 ? len : end;
      tokens.push({ type: "comment", text: source.slice(i, commentEnd) });
      i = commentEnd;
      continue;
    }

    // Block comment
    if (source[i] === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? len : end + 2;
      tokens.push({ type: "comment", text: source.slice(i, commentEnd) });
      i = commentEnd;
      continue;
    }

    // Hash comment (Python, Ruby, etc.)
    if (source[i] === "#" && (i === 0 || source[i - 1] === "\n" || /\s/.test(source[i - 1]))) {
      const end = source.indexOf("\n", i);
      const commentEnd = end === -1 ? len : end;
      tokens.push({ type: "comment", text: source.slice(i, commentEnd) });
      i = commentEnd;
      continue;
    }

    // Strings
    if (source[i] === '"' || source[i] === "'" || source[i] === "`") {
      const quote = source[i];
      let j = i + 1;
      while (j < len && source[j] !== quote) {
        if (source[j] === "\\") j++; // skip escaped char
        j++;
      }
      if (j < len) j++; // include closing quote
      tokens.push({ type: "string", text: source.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(source[i]) && (i === 0 || /[\s,;([\]{:=+\-*/<>!&|^~%]/.test(source[i - 1]))) {
      let j = i;
      // hex
      if (source[j] === "0" && (source[j + 1] === "x" || source[j + 1] === "X")) {
        j += 2;
        while (j < len && /[0-9a-fA-F_]/.test(source[j])) j++;
      } else {
        while (j < len && /[0-9._eE]/.test(source[j])) j++;
      }
      tokens.push({ type: "number", text: source.slice(i, j) });
      i = j;
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_$]/.test(source[i])) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_$]/.test(source[j])) j++;
      const word = source.slice(i, j);
      tokens.push({ type: KEYWORDS.has(word) ? "keyword" : "plain", text: word });
      i = j;
      continue;
    }

    // Everything else (whitespace, operators, etc.)
    tokens.push({ type: "plain", text: source[i] });
    i++;
  }

  return tokens;
}

const TOKEN_CLASS: Record<Token["type"], string> = {
  keyword: "text-purple-400",
  string: "text-emerald-400",
  comment: "text-slate-500 italic",
  number: "text-amber-400",
  plain: "",
};

function highlightCode(source: string, _language: string): React.ReactNode {
  const tokens = tokenize(source);
  return tokens.map((t, i) =>
    t.type === "plain" ? (
      <span key={i}>{t.text}</span>
    ) : (
      <span key={i} className={TOKEN_CLASS[t.type]}>
        {t.text}
      </span>
    )
  );
}

/* ------------------------------------------------------------------ */
/* Code Block with syntax highlighting + copy button                   */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="rounded px-2 py-0.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ c }: { c: TopicContent }) {
  if (!c.code?.length)
    return <Placeholder icon="💻" title="Code & Examples">Runnable snippets and reference implementations will appear here.</Placeholder>;
  return (
    <div className="space-y-4">
      {c.code.map((block, i) => (
        <figure key={i} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <figcaption className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
            <span>{block.caption ?? "Example"}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase">{block.language}</span>
              <CopyButton text={block.source} />
            </div>
          </figcaption>
          <pre className="thin-scroll overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
            <code>{highlightCode(block.source, block.language)}</code>
          </pre>
        </figure>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visualize                                                           */
/* ------------------------------------------------------------------ */

const DIAGRAM_ICON: Record<string, string> = {
  architecture: "🏛️",
  flow: "🔀",
  sequence: "↔️",
  state: "🔵",
  mindmap: "🧠",
  network: "🌐",
};

function useThemeChanges() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "class") {
          setTick((t) => t + 1);
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return document.documentElement.classList.contains("dark") ? "dark" : "default";
}

function MermaidBlock({ source }: { source: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const currentTheme = useThemeChanges();

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(false);
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: currentTheme,
          securityLevel: "loose",
          fontFamily: "Inter, system-ui, sans-serif",
        });
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, source);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [source, currentTheme]);

  if (error) {
    return (
      <div className="flex h-36 items-center justify-center rounded-lg border-2 border-dashed border-red-300 text-sm text-red-400 dark:border-red-700">
        Diagram syntax error
      </div>
    );
  }
  if (!svg) {
    return (
      <div className="flex h-36 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700">
        Loading diagram...
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className="overflow-x-auto rounded-lg bg-white p-3 dark:bg-slate-800/50 [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

class DiagramErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-36 items-center justify-center rounded-lg border-2 border-dashed border-red-300 text-sm text-red-400 dark:border-red-700">
          Diagram failed to render
        </div>
      );
    }
    return this.props.children;
  }
}

function Diagrams({ c }: { c: TopicContent }) {
  if (!c.diagrams?.length)
    return (
      <Placeholder icon="🗺️" title="Diagrams">
        Architecture, flow, sequence, and state diagrams will appear here. This slot accepts SVG, Mermaid, or images.
      </Placeholder>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {c.diagrams.map((d, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg" aria-hidden>{DIAGRAM_ICON[d.kind] ?? "📊"}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{d.title}</span>
            <Pill>{d.kind}</Pill>
          </div>
          {d.mermaid ? (
            <DiagramErrorBoundary><MermaidBlock source={d.mermaid} /></DiagramErrorBoundary>
          ) : (
            <div className="flex h-36 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700">
              {d.kind} diagram
            </div>
          )}
          {d.caption && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{d.caption}</p>}
        </div>
      ))}
    </div>
  );
}

function StepAnimation({ spec }: { spec: AnimationSpec }) {
  const [step, setStep] = useState(0);
  const atStart = step === 0;
  const atEnd = step === spec.steps.length - 1;
  const current = spec.steps[step];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-slate-800 dark:text-slate-100">🎬 {spec.title}</span>
        <span className="text-sm text-slate-500">
          Step {step + 1} / {spec.steps.length}
        </span>
      </div>
      <div className="mb-4 flex gap-1">
        {spec.steps.map((_, i) => (
          <div
            key={i}
            className={cx(
              "h-1.5 flex-1 rounded-full transition",
              i <= step ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-700"
            )}
          />
        ))}
      </div>
      <div className="min-h-[5rem] rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
        <div className="font-semibold text-brand-600 dark:text-brand-300">{current.label}</div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{current.detail}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={atStart}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-slate-700"
        >
          &larr; Prev
        </button>
        <button
          onClick={() => setStep((s) => Math.min(spec.steps.length - 1, s + 1))}
          disabled={atEnd}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Next &rarr;
        </button>
        <button
          onClick={() => setStep(0)}
          className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function Animations({ c }: { c: TopicContent }) {
  if (!c.animations?.length)
    return (
      <Placeholder icon="🎬" title="Animations">
        Step-by-step animated walkthroughs will appear here. This slot supports SVG, Lottie, CSS animation, GIF, or video.
      </Placeholder>
    );
  return (
    <div className="space-y-4">
      {c.animations.map((a, i) => (
        <StepAnimation key={i} spec={a} />
      ))}
    </div>
  );
}

function Comparison({ table }: { table?: ComparisonTable }) {
  if (!table)
    return <Placeholder icon="📊" title="Comparison Table">A side-by-side comparison against alternatives will appear here.</Placeholder>;
  return (
    <div className="thin-scroll overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            {table.columns.map((col, i) => (
              <th key={i} className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r} className="border-t border-slate-200 odd:bg-white even:bg-slate-50 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-900/50">
              {row.map((cell, ci) => (
                <td key={ci} className={cx("px-4 py-2.5 text-slate-600 dark:text-slate-300", ci === 0 && "font-medium text-slate-800 dark:text-slate-100")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Practice                                                            */
/* ------------------------------------------------------------------ */

function QA({ item }: { item: QAItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="font-medium text-slate-800 dark:text-slate-100">{item.q}</span>
        <span className="text-brand-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
          <div className="text-slate-700 dark:text-slate-300"><RichText text={item.a} /></div>
          {item.followUps?.length ? (
            <div className="mt-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Follow-ups</div>
              <ul className="list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-400">
                {item.followUps.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function InterviewQA({ c }: { c: TopicContent }) {
  if (!c.interviewQA?.length)
    return <Placeholder icon="🎤" title="Interview Questions & Answers">Common questions with model answers will appear here.</Placeholder>;
  return (
    <div className="space-y-2">
      {c.interviewQA.map((item, i) => (
        <QA key={i} item={item} />
      ))}
    </div>
  );
}

function FollowUps({ c }: { c: TopicContent }) {
  if (!c.followUps?.length)
    return <Placeholder icon="↪️" title="Follow-up & Tricky Questions">Deeper follow-ups and frequently-confused points will appear here.</Placeholder>;
  return (
    <ul className="space-y-2">
      {c.followUps.map((f, i) => (
        <li key={i} className="flex gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span className="text-brand-500">&rarr;</span>
          <span><RichText text={f} /></span>
        </li>
      ))}
    </ul>
  );
}

function MCQ({ item, onAnswer }: { item: MCQItem; onAnswer?: (choice: number) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const answered = choice !== null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-3 font-medium text-slate-800 dark:text-slate-100">{item.q}</p>
      <div className="space-y-2">
        {item.options.map((opt, i) => {
          const isCorrect = i === item.answerIndex;
          const isChosen = i === choice;
          return (
            <button
              key={i}
              onClick={() => { if (!answered) { setChoice(i); onAnswer?.(i); } }}
              disabled={answered}
              className={cx(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition",
                !answered && "border-slate-200 hover:border-brand-300 dark:border-slate-700",
                answered && isCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30",
                answered && isChosen && !isCorrect && "border-rose-400 bg-rose-50 dark:bg-rose-900/30",
                answered && !isChosen && !isCorrect && "border-slate-200 opacity-60 dark:border-slate-800"
              )}
            >
              <span className="font-mono text-slate-400">{String.fromCharCode(65 + i)}</span>
              <span className="text-slate-700 dark:text-slate-200">{opt}</span>
              {answered && isCorrect && <span className="ml-auto text-emerald-600">&#x2713;</span>}
              {answered && isChosen && !isCorrect && <span className="ml-auto text-rose-600">&#x2717;</span>}
            </button>
          );
        })}
      </div>
      {answered && item.explanation && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <RichText text={item.explanation} />
        </div>
      )}
    </div>
  );
}

function MCQs({ c }: { c: TopicContent }) {
  if (!c.mcqs?.length)
    return <Placeholder icon="✅" title="MCQs">Self-test multiple-choice questions will appear here.</Placeholder>;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [retryKey, setRetryKey] = useState(0);
  const total = c.mcqs.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;
  const correctCount = c.mcqs.filter(
    (m, i) => answers[i] !== undefined && answers[i] === m.answerIndex
  ).length;

  const handleAnswer = (index: number, choice: number) => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const handleRetry = () => {
    setAnswers({});
    setRetryKey((k) => k + 1);
  };

  return (
    <div key={retryKey}>
      <div className="space-y-3">
        {c.mcqs.map((m, i) => (
          <MCQ key={i} item={m} onAnswer={(choice) => handleAnswer(i, choice)} />
        ))}
      </div>
      {allAnswered && (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${correctCount === total ? "text-emerald-600" : correctCount >= total / 2 ? "text-amber-600" : "text-rose-600"}`}>
              {correctCount}/{total}
            </span>
            <span className="text-sm text-slate-500">correct</span>
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all ${
                correctCount === total ? "bg-emerald-500" : correctCount >= total / 2 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${(correctCount / total) * 100}%` }}
            />
          </div>
          <button
            onClick={handleRetry}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function Exercises({ c }: { c: TopicContent }) {
  if (!c.exercises?.length)
    return <Placeholder icon="🏋️" title="Exercises & Scenarios">Practical, scenario-based, and debugging exercises will appear here.</Placeholder>;
  return (
    <ol className="space-y-2">
      {c.exercises.map((e, i) => (
        <li key={i} className="flex gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{i + 1}</span>
          <span><RichText text={e} /></span>
        </li>
      ))}
    </ol>
  );
}

function FlashcardView({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="flex min-h-[7rem] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="mb-1 text-xs uppercase tracking-wide text-slate-400">{flipped ? "Answer" : "Prompt"}</span>
      <span className="font-medium text-slate-800 dark:text-slate-100">{flipped ? card.back : card.front}</span>
      <span className="mt-2 text-xs text-slate-400">tap to flip</span>
    </button>
  );
}

function Flashcards({ c }: { c: TopicContent }) {
  if (!c.flashcards?.length)
    return <Placeholder icon="🃏" title="Flashcards">Active-recall cards for spaced repetition will appear here.</Placeholder>;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {c.flashcards.map((card, i) => (
        <FlashcardView key={i} card={card} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reference                                                           */
/* ------------------------------------------------------------------ */

function BulletBox({ items, icon, title, tone }: { items?: string[]; icon: string; title: string; tone: "notes" | "cheat" }) {
  if (!items?.length) return <Placeholder icon={icon} title={title}>{title} will appear here.</Placeholder>;
  return (
    <div
      className={cx(
        "rounded-xl border p-5",
        tone === "notes"
          ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10"
          : "border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-900"
      )}
    >
      <ul className="space-y-2">
        {items.map((n, i) => (
          <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
            <span className={tone === "notes" ? "mt-1 text-amber-500" : "mt-1 text-brand-500"}>{tone === "notes" ? "●" : "›"}</span>
            <span><RichText text={n} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const RESOURCE_ICON: Record<ResourceLink["kind"], string> = {
  docs: "📄",
  book: "📚",
  paper: "🧾",
  article: "📰",
  video: "🎥",
  repo: "💾",
};

function Resources({ c }: { c: TopicContent }) {
  if (!c.resources?.length)
    return <Placeholder icon="🔖" title="Resources">Docs, books, papers, talks, and open-source references will appear here.</Placeholder>;
  return (
    <ul className="space-y-2">
      {c.resources.map((r, i) => (
        <li key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <span aria-hidden>{RESOURCE_ICON[r.kind]}</span>
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100">{r.label}</div>
            {r.note && <div className="text-sm text-slate-500 dark:text-slate-400">{r.note}</div>}
          </div>
          <Pill>{r.kind}</Pill>
        </li>
      ))}
    </ul>
  );
}

function Glossary({ entries }: { entries?: GlossaryEntry[] }) {
  if (!entries?.length)
    return <Placeholder icon="🔤" title="Glossary">Key terms for this topic will appear here.</Placeholder>;
  return (
    <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {entries.map((e, i) => (
        <div key={i} className="px-4 py-3">
          <dt className="font-semibold text-slate-800 dark:text-slate-100">{e.term}</dt>
          <dd className="text-sm text-slate-600 dark:text-slate-400"><RichText text={e.definition} /></dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

/**
 * Renders the right presentation component for a section. `related` is handled
 * by the page (it needs the taxonomy), so it's not in this registry.
 */
export function renderSection(kind: ContentComponentKind, content: TopicContent) {
  switch (kind) {
    case "quick-summary":
      return <QuickSummary c={content} />;
    case "detailed-explanation":
      return <DetailedExplanation c={content} />;
    case "deep-dive":
      return <DeepDive c={content} />;
    case "code":
      return <CodeBlock c={content} />;
    case "diagram":
      return <Diagrams c={content} />;
    case "animation":
      return <Animations c={content} />;
    case "comparison-table":
      return <Comparison table={content.comparison} />;
    case "interview-qa":
      return <InterviewQA c={content} />;
    case "follow-ups":
      return <FollowUps c={content} />;
    case "mcq":
      return <MCQs c={content} />;
    case "exercises":
      return <Exercises c={content} />;
    case "flashcards":
      return <Flashcards c={content} />;
    case "revision-notes":
      return <BulletBox items={content.revisionNotes} icon="📝" title="Revision Notes" tone="notes" />;
    case "cheat-sheet":
      return <BulletBox items={content.cheatSheet} icon="🧾" title="Cheat Sheet" tone="cheat" />;
    case "resources":
      return <Resources c={content} />;
    case "glossary":
      return <Glossary entries={content.glossary} />;
    default:
      return null;
  }
}

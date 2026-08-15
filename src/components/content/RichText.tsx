import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { allTopics, topicPath } from "../../data/taxonomy";

/* ------------------------------------------------------------------ */
/* Automatic topic cross-linking                                       */
/*                                                                     */
/* The first mention of another topic's title inside a paragraph       */
/* becomes a link to that topic — the "wiki rabbit hole" reading       */
/* style. Multi-word titles link freely; single-word titles only from  */
/* an allowlist of distinctive terms, so common words like "state" or  */
/* "functions" never turn into link noise.                             */
/* ------------------------------------------------------------------ */

const SINGLE_WORD_ALLOW = new Set([
  "encapsulation", "polymorphism", "immutability", "deadlocks", "idempotency",
  "sharding", "microservices", "normalization", "cqrs", "sagas", "gitops",
  "profiling", "rebasing",
]);

let topicIndex: { byTitle: Map<string, string>; regex: RegExp } | null = null;

function getTopicIndex() {
  if (!topicIndex) {
    const items = allTopics()
      .map((loc) => ({ title: loc.topic.title, path: topicPath(loc) }))
      .filter((t) =>
        t.title.includes(" ")
          ? t.title.length >= 8
          : SINGLE_WORD_ALLOW.has(t.title.toLowerCase())
      )
      .sort((a, b) => b.title.length - a.title.length);
    const byTitle = new Map(items.map((t) => [t.title.toLowerCase(), t.path]));
    const escaped = items.map((t) => t.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    topicIndex = { byTitle, regex: new RegExp(`\\b(${escaped.join("|")})\\b`, "gi") };
  }
  return topicIndex;
}

/** parseInline plus topic links (max 2 per string, each title once). */
function linkifyInline(text: string): ReactNode[] {
  const { byTitle, regex } = getTopicIndex();
  const current = typeof window !== "undefined" ? window.location.pathname : "";
  const nodes: ReactNode[] = [];
  const used = new Set<string>();
  let last = 0;
  let links = 0;
  let key = 9000;
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while (links < 2 && (m = regex.exec(text)) !== null) {
    const lower = m[1].toLowerCase();
    const path = byTitle.get(lower);
    if (!path || used.has(lower) || path === current) continue;
    // Don't linkify inside markdown code/bold spans — cheap check: an odd
    // number of backticks or ** before the match means we're inside one.
    const before = text.slice(0, m.index);
    if ((before.split("`").length - 1) % 2 === 1) continue;
    used.add(lower);
    links++;
    nodes.push(...parseInline(text.slice(last, m.index)));
    nodes.push(
      <Link
        key={key++}
        to={path}
        className="font-medium text-brand-600 underline decoration-brand-300 decoration-dotted underline-offset-2 transition hover:decoration-solid dark:text-brand-300 dark:decoration-brand-600"
      >
        {m[1]}
      </Link>
    );
    last = m.index + m[1].length;
  }
  nodes.push(...parseInline(text.slice(last)));
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Inline parsing: `code`, ***marker***, **bold**, *italic*, O(...)    */
/* ------------------------------------------------------------------ */

/** Big-O expressions get monospace + color so complexity claims pop out of prose. */
function decoratePlain(text: string, keyBase: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\bO\([^()]{1,14}(?:\([^()]{0,8}\))?[^()]{0,6}\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = keyBase;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(
      <span key={key++} className="font-mono text-[0.9em] font-semibold text-brand-600 dark:text-brand-300">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(`[^`]+`)|(\*\*\*[^*]+\*\*\*)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...decoratePlain(text.slice(lastIndex, match.index), key));
      key += 50;
    }
    const m = match[0];
    if (match[1]) {
      nodes.push(
        <code key={key++} className="rounded bg-brand-100 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {m.slice(1, -1)}
        </code>
      );
    } else if (match[2]) {
      nodes.push(
        <mark key={key++} className="rounded bg-amber-100 px-1 font-semibold text-slate-900 dark:bg-amber-500/20 dark:text-amber-100">
          {m.slice(3, -3)}
        </mark>
      );
    } else if (match[3]) {
      nodes.push(
        <strong key={key++} className="font-bold text-slate-900 dark:text-white">
          {m.slice(2, -2)}
        </strong>
      );
    } else if (match[4]) {
      nodes.push(
        <em key={key++} className="italic text-slate-800 dark:text-slate-200">
          {m.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) {
    nodes.push(...decoratePlain(text.slice(lastIndex), key));
  }
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Example-sentence highlighting                                       */
/*                                                                     */
/* Theory paragraphs bury their examples mid-text. Detect sentences    */
/* that begin with an example/practice marker and tint them, so every  */
/* concrete illustration is visually distinct from the abstract idea.  */
/* ------------------------------------------------------------------ */

const INLINE_MARKER =
  /(?<=^|[.!?:]\s)((?:For example|For instance|In practice|As an example|A classic example|The classic example|Concretely)[,:]?\s)/;

function splitExample(text: string): { before: string; example: string } | null {
  const m = INLINE_MARKER.exec(text);
  if (!m || m.index === undefined) return null;
  // The example runs from the marker to the end of its sentence — approximated
  // as the next sentence break followed by a capital letter, else the paragraph end.
  const start = m.index;
  const rest = text.slice(start);
  const end = rest.search(/[.!?](?:['")\]]?)\s+(?=[A-Z])/);
  const example = end === -1 ? rest : rest.slice(0, end + 1);
  return { before: text.slice(0, start), example };
}

function renderParagraphText(text: string): ReactNode {
  const split = splitExample(text);
  if (!split) return linkifyInline(text);
  const after = text.slice(split.before.length + split.example.length);
  return (
    <>
      {linkifyInline(split.before)}
      <span className="rounded bg-emerald-50 box-decoration-clone px-1 py-0.5 text-emerald-900 dark:bg-emerald-900/25 dark:text-emerald-100">
        <span aria-hidden className="mr-1">💡</span>
        {linkifyInline(split.example)}
      </span>
      {after ? linkifyInline(after) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Callout blocks: paragraphs that LEAD with a marker become cards     */
/* ------------------------------------------------------------------ */

const CALLOUTS: Array<{ re: RegExp; icon: string; label: string; cls: string }> = [
  {
    re: /^(real-world example|for example|example|a real-world case)[:,]\s*/i,
    icon: "💡", label: "Example",
    cls: "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-100",
  },
  {
    re: /^(common mistake|pitfall|warning|watch out|gotcha)[:,]\s*/i,
    icon: "⚠️", label: "Watch out",
    cls: "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-900/20 dark:text-rose-100",
  },
  {
    re: /^(in practice|rule of thumb|pro tip|tip)[:,]\s*/i,
    icon: "🛠️", label: "In practice",
    cls: "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-600 dark:bg-sky-900/20 dark:text-sky-100",
  },
  {
    re: /^(key insight|important|remember|why it matters|intuition|analogy)[:,]\s*/i,
    icon: "🔑", label: "Key insight",
    cls: "border-brand-400 bg-brand-50 text-slate-800 dark:border-brand-600 dark:bg-brand-900/20 dark:text-slate-100",
  },
];

function matchCallout(line: string) {
  for (const c of CALLOUTS) {
    const m = c.re.exec(line);
    if (m) {
      const body = line.slice(m[0].length);
      return { ...c, body: body.charAt(0).toUpperCase() + body.slice(1) };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Block-level parsing                                                 */
/* ------------------------------------------------------------------ */

function parseLine(line: string, key: number, emphasizeLead: boolean): ReactNode {
  if (line.startsWith("### ")) {
    return (
      <h4 key={key} className="mt-5 mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">
        {parseInline(line.slice(4))}
      </h4>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h3 key={key} className="mt-7 mb-2 border-l-[3px] border-brand-500 pl-3 text-lg font-bold text-slate-900 dark:text-white">
        {parseInline(line.slice(3))}
      </h3>
    );
  }
  if (line.startsWith("# ")) {
    return (
      <h3 key={key} className="mt-8 mb-3 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {parseInline(line.slice(2))}
      </h3>
    );
  }
  if (line.startsWith("- ") || line.startsWith("* ")) {
    return (
      <li key={key} className="ml-4 flex gap-2 text-slate-700 dark:text-slate-300">
        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
        <span>{parseInline(line.slice(2))}</span>
      </li>
    );
  }
  if (/^\d+\.\s/.test(line)) {
    const num = line.match(/^(\d+)\.\s/)![1];
    const rest = line.replace(/^\d+\.\s/, "");
    return (
      <li key={key} className="ml-4 flex gap-2 text-slate-700 dark:text-slate-300">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {num}
        </span>
        <span>{parseInline(rest)}</span>
      </li>
    );
  }
  if (line.startsWith("> ")) {
    return (
      <blockquote key={key} className="border-l-4 border-amber-400 bg-amber-50 py-2 pl-4 pr-3 text-sm italic text-amber-800 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-200">
        {parseInline(line.slice(2))}
      </blockquote>
    );
  }
  if (line.startsWith("| ") && line.endsWith("|")) {
    return null;
  }
  if (line.trim() === "") {
    return <div key={key} className="h-2" />;
  }

  const callout = matchCallout(line);
  if (callout) {
    return (
      <div key={key} className={`my-3 rounded-xl border-l-4 px-4 py-3 ${callout.cls}`}>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-80">
          <span aria-hidden>{callout.icon}</span>
          <span>{callout.label}</span>
        </div>
        <p className="leading-7">{parseInline(callout.body)}</p>
      </div>
    );
  }

  // The opening sentence of a theory block is its thesis — set it in a heavier
  // weight so a reader skimming the page still gets the argument.
  if (emphasizeLead) {
    const m = /^(.+?[.!?])(['")\]]?)(\s+|$)/.exec(line);
    if (m && m[1].length >= 25) {
      const rest = line.slice(m[1].length + m[2].length);
      return (
        <p key={key} className="max-w-[70ch] leading-7 text-slate-700 dark:text-slate-300">
          <strong className="font-semibold text-slate-900 dark:text-white">{parseInline(m[1] + m[2])}</strong>
          {rest ? <> {renderParagraphText(rest.trimStart())}</> : null}
        </p>
      );
    }
  }

  return (
    <p key={key} className="max-w-[70ch] leading-7 text-slate-700 dark:text-slate-300">
      {renderParagraphText(line)}
    </p>
  );
}

function parseTable(lines: string[]): ReactNode | null {
  const tableLines = lines.filter(l => l.startsWith("|") && l.endsWith("|"));
  if (tableLines.length < 3) return null;

  const parseRow = (line: string) =>
    line.split("|").slice(1, -1).map(c => c.trim());

  const headers = parseRow(tableLines[0]);
  const dataRows = tableLines.slice(2).map(parseRow);

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-brand-50 dark:bg-brand-900/20">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 font-bold text-brand-700 dark:text-brand-300">
                {parseInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, r) => (
            <tr key={r} className="border-t border-slate-200 odd:bg-white even:bg-slate-50 dark:border-slate-700 dark:odd:bg-slate-900 dark:even:bg-slate-800/50">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-2.5 text-slate-600 dark:text-slate-300 ${ci === 0 ? "font-medium text-slate-800 dark:text-slate-100" : ""}`}>
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Inline-only markdown: `code`, **bold**, *italic*.
 *
 * Unlike `RichText` this adds no block wrapper, so it is safe inside an
 * existing `<li>`, `<td>`, or `<p>` — which is what the Interview pages need,
 * since their content is already structured as lists and tables.
 */
export function Inline({ text }: { text: string }) {
  return <>{parseInline(text)}</>;
}

export function RichText({ text, lead = false }: { text: string; lead?: boolean }) {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;
  let leadPending = lead;

  while (i < lines.length) {
    if (lines[i].startsWith("|") && lines[i].endsWith("|")) {
      const tableStart = i;
      while (i < lines.length && lines[i].startsWith("|") && lines[i].endsWith("|")) {
        i++;
      }
      const table = parseTable(lines.slice(tableStart, i));
      if (table) elements.push(<div key={key++}>{table}</div>);
      continue;
    }
    const isPlainParagraph =
      lines[i].trim() !== "" && !/^(#{1,3} |[-*] |\d+\. |> |\|)/.test(lines[i]);
    const node = parseLine(lines[i], key++, leadPending && isPlainParagraph);
    if (leadPending && isPlainParagraph) leadPending = false;
    if (node) elements.push(node);
    i++;
  }

  return <div className="space-y-2">{elements}</div>;
}

export function RichParagraphs({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-4">
      {items.map((p, i) => (
        <RichText key={i} text={p} />
      ))}
    </div>
  );
}

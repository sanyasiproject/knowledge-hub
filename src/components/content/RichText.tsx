import type { ReactNode } from "react";

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(`[^`]+`)|(\*\*\*[^*]+\*\*\*)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
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
        <strong key={key++} className="font-bold italic text-slate-900 dark:text-white">
          {m.slice(3, -3)}
        </strong>
      );
    } else if (match[3]) {
      nodes.push(
        <strong key={key++} className="font-bold text-slate-900 dark:text-white">
          {m.slice(2, -2)}
        </strong>
      );
    } else if (match[4]) {
      nodes.push(
        <em key={key++} className="italic text-brand-600 dark:text-brand-300">
          {m.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function parseLine(line: string, key: number): ReactNode {
  if (line.startsWith("### ")) {
    return (
      <h4 key={key} className="mt-5 mb-2 text-base font-bold text-purple-600 dark:text-purple-400">
        {parseInline(line.slice(4))}
      </h4>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h3 key={key} className="mt-6 mb-2 text-lg font-bold text-brand-600 dark:text-brand-400">
        {parseInline(line.slice(3))}
      </h3>
    );
  }
  if (line.startsWith("# ")) {
    return (
      <h3 key={key} className="mt-6 mb-3 text-xl font-extrabold text-brand-700 dark:text-brand-300">
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
  return (
    <p key={key} className="text-slate-700 leading-relaxed dark:text-slate-300">
      {parseInline(line)}
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

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;

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
    const node = parseLine(lines[i], key++);
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

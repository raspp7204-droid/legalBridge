"use client";

import ReactMarkdown, { type Components } from "react-markdown";

/**
 * The assistant's answers, rendered as markdown in LawNest's own type.
 *
 * Every element is mapped explicitly — browser defaults would drop a
 * Times-New-Roman heading and blue underlined links into a 400px panel.
 * Headings are deliberately flattened: at this width a real h2 shouts.
 */
const COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="leading-relaxed [&:not(:first-child)]:mt-3">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1.5 pl-4 marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1.5 pl-4 marker:text-accent">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-accent underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="font-mono-num rounded bg-surface px-1 py-0.5 text-[0.85em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-3 overflow-x-auto rounded-md border border-rule bg-surface p-3 text-[0.85em]">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-l-2 border-accent/40 pl-3 text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-rule" />,
  h1: ({ children }) => <p className="mt-4 font-medium text-ink">{children}</p>,
  h2: ({ children }) => <p className="mt-4 font-medium text-ink">{children}</p>,
  h3: ({ children }) => <p className="mt-4 font-medium text-ink">{children}</p>,
};

export function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={COMPONENTS}>{children}</ReactMarkdown>;
}

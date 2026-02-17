"use client";

import ReactMarkdown from "react-markdown";

export function BlogBody({ content }: { content: string }) {
  return (
    <div className="max-w-none text-slate-700">
      <ReactMarkdown
        components={{
          h2: ({ children }) => <h2 className="mb-2 mt-6 text-base font-semibold">{children}</h2>,
          h1: ({ children }) => <h1 className="mb-3 mt-4 text-lg font-semibold">{children}</h1>,
          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
          code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

// Headings stay the same size as the body. The model sometimes emits # for a sentence.
function Heading({ children }) {
  return <p className="mb-1 text-sm font-semibold leading-6 last:mb-0">{children}</p>;
}

function Paragraph({ children }) {
  return <p className="mb-2 text-sm leading-6 last:mb-0">{children}</p>;
}

// react-markdown escapes HTML unless rehype-raw is added. It is not added.
export function AiMarkdown({ text, className = "" }) {
  if (!text) return null;

  return (
    <div className={`text-sm leading-6 text-zinc-800 dark:text-zinc-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          p: Paragraph,
          h1: Heading,
          h2: Heading,
          h3: Heading,
          h4: Heading,
          h5: Heading,
          h6: Heading,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="leading-6">{children}</li>,
          code: ({ children }) => (
            <code className="rounded bg-zinc-100 px-1 font-mono text-[0.85em] dark:bg-zinc-800">{children}</code>
          ),
          pre: ({ children }) => <pre className="my-2 overflow-x-auto text-xs leading-5 last:mb-0">{children}</pre>,
          a: ({ children }) => <span>{children}</span>,
          img: () => null,
        }}
      >
        {String(text)}
      </ReactMarkdown>
    </div>
  );
}

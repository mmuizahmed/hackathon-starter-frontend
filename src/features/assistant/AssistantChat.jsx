import { useEffect, useRef, useState } from "react";
import { Badge, Button, EmptyState, Spinner, Textarea } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { AiMarkdown } from "./AiMarkdown";
import { sendChat } from "./api";
import { SUGGESTED_QUESTIONS, assistantProblem, basedOnText, toolLabel } from "./messages";

function SourceList({ sources = [] }) {
  const title = basedOnText(sources);
  if (!title) return null;
  const rows = sources.filter((source) => toolLabel(source?.tool));

  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</summary>
      <ul className="mt-2 space-y-1">
        {rows.map((source, index) => {
          const label = toolLabel(source.tool);
          const detail = source.resultSummary ? `${label}. ${source.resultSummary}` : label;
          return (
            <li key={`${source.tool}-${index}`} className="text-xs leading-5 text-zinc-600 dark:text-zinc-300">
              {detail}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export function AssistantChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const suggestions = SUGGESTED_QUESTIONS[user?.role] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, sending]);

  async function send(text) {
    const content = text.trim();
    if (!content || sending) return;
    const history = [...messages, { role: "user", content }];
    setMessages(history);
    setDraft("");
    setSending(true);
    try {
      const data = await sendChat({
        messages: history.map((message) => ({ role: message.role, content: message.content })),
      });
      const problem = assistantProblem(null, data);
      setMessages([
        ...history,
        {
          role: "assistant",
          content: data.fallback ? problem : data.answer || problem || "The assistant did not return an answer.",
          label: data.label || (data.aiGenerated ? "AI-generated" : ""),
          sources: data.sources || [],
          fallback: Boolean(data.fallback),
        },
      ]);
    } catch (error) {
      setMessages([
        ...history,
        {
          role: "assistant",
          content: assistantProblem(error),
          label: "",
          sources: [],
          fallback: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    send(draft);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState
            title="Ask about records you can already open"
            message="Answers use the same access as your role. The conversation stays in this panel until you leave the page."
          />
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${index}-${message.role}`}
            className={
              message.role === "user"
                ? "ml-8 rounded-card bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "mr-8 rounded-card border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
            }
          >
            {message.role === "assistant" && message.label ? <Badge tone="blue">{message.label}</Badge> : null}
            {message.role === "assistant" ? (
              <AiMarkdown className={message.label ? "mt-2" : ""} text={message.content} />
            ) : (
              <p className="leading-6">{message.content}</p>
            )}
            {message.role === "assistant" ? <SourceList sources={message.sources} /> : null}
          </div>
        ))}
        {sending ? <Spinner label="Assistant is writing" /> : null}
        <div ref={bottomRef} />
      </div>
      {suggestions.length > 0 && messages.length === 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {suggestions.map((question) => (
            <Button key={question} variant="secondary" className="!h-auto whitespace-normal px-3 py-2 text-left" onClick={() => send(question)} disabled={sending}>
              {question}
            </Button>
          ))}
        </div>
      ) : null}
      <form className="space-y-2 border-t border-zinc-200 p-4 dark:border-zinc-800" onSubmit={onSubmit}>
        <Textarea
          name="assistantMessage"
          label="Message"
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send(draft);
            }
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Enter sends. Shift + Enter adds a line.</p>
          <Button type="submit" className="shrink-0" loading={sending} disabled={!draft.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

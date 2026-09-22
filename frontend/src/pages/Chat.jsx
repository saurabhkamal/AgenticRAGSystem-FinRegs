import { useEffect, useRef, useState } from "react";
import Logo from "../components/Logo";
import { UserBubble, AgentBubble } from "../components/MessageBubble";
import InlineTrace from "../components/pipeline/InlineTrace";
import { sendMessage } from "../lib/api";
import {
  Send,
  Plus,
  LogOut,
  FileText,
  Sparkles,
  Landmark,
  Cpu,
  BookOpenText,
  MessageCircle,
} from "lucide-react";

const SAMPLE_QUERIES = [
  { label: "Core principles for financial market infrastructures?", kind: "doc" },
  { label: "Key security requirements in the PCI DSS guide?", kind: "doc" },
  { label: "Building blocks for enhancing cross-border payments?", kind: "doc" },
  { label: "How does the FCA define e-money?", kind: "doc" },
  { label: "Payment methods described in the Stripe guide?", kind: "doc" },
  { label: "Hi, how are you?", kind: "chat" },
  { label: "What is 15% of 200?", kind: "chat" },
  { label: "What is the capital of France?", kind: "chat" },
  { label: "Tell me a fun fact about the moon.", kind: "chat" },
  { label: "What does PCI DSS stand for?", kind: "chat" },
];

const SOURCE_DOCS = [
  "Principles for Financial Market Infrastructures",
  "PCI DSS Quick Reference Guide",
  "Cross-Border Payments Roadmap",
  "FCA: Payment Services & E-Money",
  "Stripe: Guide to Payment Methods",
];

export default function Chat({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function submit(question) {
    const q = (question ?? input).trim();
    if (!q || loading) return;

    setInput("");
    setError("");
    const history = messages
      .filter((m) => m.role === "agent")
      .map((m) => ({ question: m.question, answer: m.answer }));

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await sendMessage(q, history);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          question: q,
          answer: res.answer,
          route: res.route,
          citations: res.citations,
          tokens: res.tokens,
          time: res.time,
        },
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong talking to the agent.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function newConversation() {
    setMessages([]);
    setError("");
  }

  return (
    <div className="h-screen w-full bg-ink-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[310px] shrink-0 border-r border-ink-800 bg-ink-900/60 flex flex-col">
        <div className="px-5 py-5 border-b border-ink-800">
          <Logo size={36} />
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-ink-700 hover:border-brand-500/50 hover:bg-ink-850 text-[15px] text-ink-200 font-medium py-2.5 transition"
          >
            <Plus size={16} /> New conversation
          </button>
        </div>

        <div className="px-4 pt-6">
          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-400 mb-2.5">
            <Sparkles size={12} /> Try a sample query
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {SAMPLE_QUERIES.map((sq, i) => (
              <button
                key={i}
                onClick={() => submit(sq.label)}
                disabled={loading}
                className="w-full flex items-start gap-2 text-left text-[14px] leading-snug text-ink-100 hover:text-white bg-ink-850 hover:bg-ink-800 border border-ink-700 hover:border-brand-500/50 rounded-lg px-3 py-2.5 transition disabled:opacity-50 group"
              >
                {sq.kind === "doc" ? (
                  <BookOpenText size={14} className="text-brand-400 mt-0.5 shrink-0" />
                ) : (
                  <MessageCircle size={14} className="text-accent-400 mt-0.5 shrink-0" />
                )}
                <span>{sq.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-6 mt-auto pb-4">
          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-400 mb-2.5">
            <FileText size={12} /> Knowledge base
          </div>
          <div className="space-y-1">
            {SOURCE_DOCS.map((doc, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[13.5px] text-ink-200 px-2 py-1.5 rounded-lg hover:bg-ink-850 transition"
              >
                <Landmark size={14} className="mt-0.5 text-brand-400 shrink-0" />
                <span className="leading-snug">{doc}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-ink-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-[12.5px] font-semibold text-ink-200 shrink-0">
                {username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-[14px] text-ink-200 truncate">{username}</span>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="text-ink-500 hover:text-red-400 transition p-1.5 rounded-md hover:bg-red-500/10"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main chat panel */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[820px] mx-auto px-6 py-8 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center pt-20 animate-fadeUp">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-ink-700 flex items-center justify-center mb-4">
                  <Sparkles size={26} className="text-brand-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Ask the agent anything</h2>
                <p className="text-[15px] text-ink-400 max-w-[440px]">
                  It automatically decides whether to search the financial regulation
                  documents or answer directly — pick a sample query on the left, or type
                  your own below.
                </p>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <UserBubble key={i} text={m.text} />
              ) : (
                <AgentBubble
                  key={i}
                  answer={m.answer}
                  route={m.route}
                  citations={m.citations}
                  tokens={m.tokens}
                  time={m.time}
                />
              )
            )}

            {loading && (
              <div className="flex justify-start animate-fadeUp">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu size={15} className="text-ink-950" />
                  </div>
                  <InlineTrace status="loading" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-ink-800 bg-ink-900/60 backdrop-blur px-6 py-4">
          <div className="max-w-[820px] mx-auto">
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                {error}
              </div>
            )}
            <div className="flex items-end gap-2.5 bg-ink-850 border border-ink-700 focus-within:border-brand-500/60 rounded-xl px-3.5 py-2.5 transition">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about payments, e-money, PCI DSS, FMI principles..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-[15.5px] text-white placeholder:text-ink-500 max-h-32 py-1"
              />
              <button
                onClick={() => submit()}
                disabled={loading || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-ink-950 disabled:opacity-40 hover:opacity-90 transition"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[12px] text-ink-500 mt-2 text-center">
              Answers are generated from the agent's document retrieval — always verify citations for critical decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

import ReactMarkdown from "react-markdown";
import { BookText, User, Cpu } from "lucide-react";
import InlineTrace from "./pipeline/InlineTrace";

export function UserBubble({ text }) {
  return (
    <div className="flex justify-end animate-fadeUp">
      <div className="flex items-start gap-2.5 max-w-[75%]">
        <div className="bg-gradient-to-br from-accent-600 to-accent-500 text-white text-[15.5px] leading-relaxed rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-lg shadow-accent-900/20">
          {text}
        </div>
        <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center shrink-0 mt-0.5">
          <User size={15} className="text-ink-300" />
        </div>
      </div>
    </div>
  );
}

export function AgentBubble({ answer, route, citations, tokens, time }) {
  return (
    <div className="flex justify-start animate-fadeUp">
      <div className="flex items-start gap-2.5 max-w-[85%] w-full">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0 mt-0.5">
          <Cpu size={15} className="text-ink-950" />
        </div>
        <div className="space-y-3 min-w-0 flex-1">
          <InlineTrace status="done" route={route} tokens={tokens} time={time} citationsCount={citations?.length ?? 0} />

          <div className="bg-ink-850 border border-ink-700 leading-relaxed text-ink-100 rounded-2xl rounded-tl-sm px-4 py-3.5">
            <div className="markdown-answer prose prose-invert prose-base max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:mt-3 prose-headings:mb-2 first:prose-p:mt-0 last:prose-p:mb-0 prose-strong:text-white">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>

          {citations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {citations.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-200 bg-ink-800/80 border border-ink-700 rounded-md px-2.5 py-1.5"
                >
                  <BookText size={11} className="text-brand-400" />
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

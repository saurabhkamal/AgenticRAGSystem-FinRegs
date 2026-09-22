import { useEffect, useState } from "react";
import {
  MessageCircleQuestion,
  GitBranch,
  BookOpenText,
  Zap,
  CheckCircle2,
  Cpu,
  Clock,
} from "lucide-react";

const TONE = {
  brand: {
    border: "border-brand-500",
    bg: "bg-brand-500/15",
    icon: "text-brand-400",
    line: "bg-brand-500",
    spark: "via-brand-300",
  },
  accent: {
    border: "border-accent-500",
    bg: "bg-accent-500/15",
    icon: "text-accent-400",
    line: "bg-accent-500",
    spark: "via-accent-300",
  },
  neutral: {
    border: "border-ink-500",
    bg: "bg-ink-800",
    icon: "text-ink-200",
    line: "bg-ink-600",
    spark: "via-brand-300",
  },
};

function Pill({ icon: Icon, label, tone, pulsing, done }) {
  const t = TONE[tone];
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border-[1.5px] ${t.border} ${t.bg} px-3.5 py-2 transition-all duration-300 ${
        pulsing ? "animate-pulse" : ""
      }`}
    >
      <Icon size={15} className={t.icon} />
      <span className="text-[14px] font-semibold text-white leading-none">{label}</span>
      {done && <CheckCircle2 size={13} className={t.icon} />}
    </div>
  );
}

// vertical connector between pills; while loading, a bright spark travels top -> bottom
function Connector({ tone = "neutral", live = false }) {
  const t = TONE[tone];
  return (
    <div className="relative w-[3px] h-7 mx-4 overflow-hidden rounded-full">
      <div className={`absolute inset-0 ${live ? "bg-ink-700" : t.line}`} />
      {live && (
        <div
          className={`absolute left-0 w-full h-4 bg-gradient-to-b from-transparent ${t.spark} to-transparent animate-currentFlow`}
        />
      )}
    </div>
  );
}

const LOADING_LABELS = ["Reading question", "Deciding route", "Working on it"];

export default function InlineTrace({ status = "loading", route, tokens, time, citationsCount = 0 }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (status !== "loading") return;
    const id = setInterval(() => {
      setActiveStep((s) => (s + 1) % LOADING_LABELS.length);
    }, 850);
    return () => clearInterval(id);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-start animate-fadeUp">
        <Pill icon={MessageCircleQuestion} label="Question received" tone="neutral" done />
        <Connector live />
        <Pill icon={GitBranch} label={LOADING_LABELS[activeStep]} tone="neutral" pulsing />
        <Connector live />
        <Pill icon={Cpu} label="Generate" tone="neutral" />
      </div>
    );
  }

  const isRetrieve = route === "retrieve";
  const tone = isRetrieve ? "brand" : "accent";

  return (
    <div className="flex flex-col items-start animate-fadeUp">
      <Pill icon={MessageCircleQuestion} label="Question received" tone={tone} done />
      <Connector tone={tone} />
      <Pill icon={GitBranch} label={isRetrieve ? "Routed: retrieve" : "Routed: direct"} tone={tone} done />
      <Connector tone={tone} />
      <Pill
        icon={isRetrieve ? BookOpenText : Zap}
        label={isRetrieve ? `${citationsCount} source${citationsCount === 1 ? "" : "s"} found` : "No lookup needed"}
        tone={tone}
        done
      />
      <Connector tone={tone} />
      <Pill icon={CheckCircle2} label="Answer generated" tone={tone} done />

      {(tokens != null || time != null) && (
        <div className="flex items-center gap-4 mt-3 ml-1">
          {tokens != null && (
            <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-100">
              <Cpu size={13} className={TONE[tone].icon} /> {tokens} tokens
            </span>
          )}
          {time != null && (
            <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-100">
              <Clock size={13} className={TONE[tone].icon} /> {time}s
            </span>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import Logo from "../components/Logo";
import { login } from "../lib/api";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";

const DEMO_USER = "demo";
const DEMO_PASSWORD = "demo1234";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(username, password);
      onLogin(res.username);
    } catch (err) {
      setError(err.message || "Could not sign in. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setUsername(DEMO_USER);
    setPassword(DEMO_PASSWORD);
    setError("");
  }

  return (
    <div className="min-h-screen w-full bg-ink-950 relative overflow-hidden flex items-center justify-center px-4">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-accent-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative w-full max-w-[400px] animate-fadeUp">
        <div className="flex justify-center mb-8">
          <Logo size={44} />
        </div>

        <div className="bg-ink-900/80 backdrop-blur-xl border border-ink-700 rounded-2xl shadow-glow p-8">
          <h1 className="text-2xl font-semibold text-white mb-1.5">Welcome back</h1>
          <p className="text-[15px] text-ink-400 mb-6">
            Sign in to query financial regulation documents through the agent.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-400 mb-1.5">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="demo"
                autoFocus
                className="w-full rounded-lg bg-ink-850 border border-ink-700 px-3.5 py-2.5 text-[15px] text-white placeholder:text-ink-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-ink-850 border border-ink-700 px-3.5 py-2.5 text-[15px] text-white placeholder:text-ink-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition"
              />
            </div>

            {error && (
              <div className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 font-semibold text-[15px] py-2.5 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <button
            onClick={fillDemo}
            type="button"
            className="mt-5 w-full flex items-center gap-2.5 rounded-lg border border-dashed border-ink-600 hover:border-brand-500/60 bg-ink-850/50 px-3.5 py-2.5 text-left transition group"
          >
            <ShieldCheck size={17} className="text-brand-400 shrink-0" />
            <span className="text-[13.5px] text-ink-300 group-hover:text-ink-200 transition">
              Use demo credentials —{" "}
              <span className="mono text-ink-100">
                {DEMO_USER} / {DEMO_PASSWORD}
              </span>
            </span>
          </button>
        </div>

        <p className="text-center text-[12.5px] text-ink-500 mt-6">
          Retrieval-augmented agent over cross-border payments, e-money, PCI DSS &amp; FMI standards.
        </p>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock, Sparkles, Crown, X, ShieldCheck, Cookie, Zap, TrendingUp, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CalcPro™ — The AI-Powered Calculator-as-a-Service" },
      { name: "description", content: "Revolutionary cloud-native arithmetic. Synergize your sums. Disrupt your division. Now with Blockchain." },
    ],
  }),
  component: Index,
});

const PLANS = [
  { name: "BASIC", price: "$4.99", perk: "10 calcs/mo", color: "border-border" },
  { name: "PRO", price: "$19.99", perk: "Unlimited*", color: "border-brand ring-2 ring-brand", featured: true },
  { name: "TEAMS", price: "$49.99", perk: "5 seats", color: "border-border" },
  { name: "ENTERPRISE", price: "$2,499", perk: "Call us 😉", color: "border-border" },
];

const TOASTS = [
  "Jeff in Ohio just upgraded to PRO ⭐",
  "🔥 87 people are viewing this pricing right now",
  "Sarah saved 0.4 seconds with CalcPro AI",
  "⚠️ Your free trial of breathing expires soon",
  "A competitor just calculated 7×8 without you",
];

function Index() {
  const [display, setDisplay] = useState("2 + 2 =");
  const [calcsUsed, setCalcsUsed] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCookies, setShowCookies] = useState(true);
  const [showEula, setShowEula] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [eulaScroll, setEulaScroll] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
      setTimeout(() => setToast(null), 4200);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const handleKey = (k: string) => {
    if (k === "=") {
      setCalcsUsed((c) => c + 1);
      setShowPaywall(true);
      return;
    }
    setDisplay((d) => (d === "2 + 2 =" ? k : d + " " + k));
  };

  const keys = useMemo(
    () => [
      ["C", "±", "%", "÷"],
      ["7", "8", "9", "×"],
      ["4", "5", "6", "−"],
      ["1", "2", "3", "+"],
      ["0", ".", "="],
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background pb-24">
      {/* Cookie banner */}
      {showCookies && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-foreground text-background px-4 py-3 text-sm shadow-lg">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
            <Cookie className="h-4 w-4 shrink-0" />
            <span className="flex-1 min-w-[200px]">
              We use <b>847 cookies</b>, <b>12 trackers</b>, and your <b>browsing history since 2009</b> to deliver
              "essential" calculator functionality. By scrolling, blinking, or existing, you agree.
            </span>
            <button className="rounded-md bg-background/10 px-3 py-1.5 text-xs hover:bg-background/20">
              Manage 847 partners
            </button>
            <button
              onClick={() => setShowCookies(false)}
              className="rounded-md bg-brand px-4 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90"
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      <div className={`mx-auto max-w-md px-4 ${showCookies ? "pt-24" : "pt-10"}`}>
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-danger text-brand-foreground font-black">
              C
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">CalcPro™</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                AI · Cloud · Blockchain · Quantum
              </p>
            </div>
          </div>
          <span className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-danger">
            Free Plan
          </span>
        </header>

        {/* Calculator */}
        <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl">
          <div className="relative mb-4 flex items-center justify-between rounded-2xl bg-foreground px-5 py-6 text-background">
            <span className="text-3xl font-light tracking-wide">{display}</span>
            <Lock className="h-5 w-5 text-lock" />
          </div>

          <div className="space-y-2">
            {keys.map((row, ri) => (
              <div key={ri} className="grid grid-cols-4 gap-2">
                {row.map((k) => {
                  const isOp = ["÷", "×", "−", "+", "="].includes(k);
                  const isEquals = k === "=";
                  const isZero = k === "0";
                  return (
                    <button
                      key={k}
                      onClick={() => handleKey(k)}
                      className={`h-14 rounded-xl text-lg font-semibold transition active:scale-95 ${
                        isEquals
                          ? "bg-brand text-brand-foreground hover:opacity-90"
                          : isOp
                            ? "bg-secondary text-brand hover:bg-secondary/70"
                            : "bg-background border border-border hover:bg-secondary"
                      } ${isZero ? "col-span-2" : ""}`}
                    >
                      {k}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade card */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-lock" />
            <h2 className="font-bold">Unlock your result</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            You've used <b className="text-foreground">{calcsUsed}</b> of your <b>0</b> free calculations this month.
            Upgrade to see the answer.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {PLANS.slice(0, 3).map((p, i) => (
              <button
                key={p.name}
                onClick={() => setSelectedPlan(i)}
                className={`rounded-xl border bg-background p-3 text-center transition ${
                  selectedPlan === i ? "border-brand ring-2 ring-brand" : "border-border"
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold tracking-wider text-muted-foreground">
                  {p.name}
                  {p.featured && <Star className="h-3 w-3 fill-lock text-lock" />}
                </div>
                <div className="mt-1 text-base font-black">{p.price}</div>
                <div className="text-[10px] text-muted-foreground">/mo</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{p.perk}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowPaywall(true)}
            className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/30 transition hover:opacity-90"
          >
            Upgrade to see {display.replace("=", "").trim() || "2 + 2"}
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Free plan: <span className="font-bold text-danger">0 calculations/month</span>
          </p>
        </div>

        {/* Sarcastic features */}
        <div className="mt-6 space-y-2">
          {[
            { icon: Sparkles, t: "AI-Powered Addition™", d: "Our GPT-7 model decides if 2+2 is really 4 today." },
            { icon: ShieldCheck, t: "SOC-99 Compliant", d: "Your numbers are encrypted, then sold." },
            { icon: TrendingUp, t: "Cloud-Native Subtraction", d: "Now with 47ms latency (we round down)." },
            { icon: Zap, t: "Blockchain Verified", d: "Every '=' mints an NFT. You don't own it." },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <f.icon className="mt-0.5 h-4 w-4 text-brand" />
              <div>
                <div className="text-sm font-semibold">{f.t}</div>
                <div className="text-xs text-muted-foreground">{f.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Fake testimonials */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Loved by 0 calculators
          </h3>
          {[
            { n: "Marcus T., CFO", q: "After switching to CalcPro™, I now pay $19.99/mo to add two numbers. 10/10." },
            { n: "Linda K., Influencer", q: "I no longer think for myself. Liberating." },
            { n: "Anonymous, Definitely Real", q: "This is the Uber of calculators. Whatever that means." },
          ].map((t, i) => (
            <div key={i} className="border-t border-border py-3 first:border-t-0 first:pt-0">
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-lock text-lock" />
                ))}
              </div>
              <p className="text-sm italic">"{t.q}"</p>
              <p className="mt-1 text-xs text-muted-foreground">— {t.n}</p>
            </div>
          ))}
        </div>

        <footer className="mt-8 text-center text-[10px] text-muted-foreground">
          © 2026 CalcPro Holdings, LLC, a subsidiary of CalcPro International, a portfolio company of CalcPro Capital.
          <br />
          By reading this footer you owe us $3.
        </footer>
      </div>

      {/* Live toast */}
      {toast && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-2xl animate-in slide-in-from-left">
          {toast}
        </div>
      )}

      {/* Paywall modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-muted-foreground/40 hover:bg-secondary"
              aria-label="close"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-danger">
                <Crown className="h-7 w-7 text-brand-foreground" />
              </div>
              <h3 className="mt-4 text-2xl font-black">You've hit your limit.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You used <b className="text-danger">{calcsUsed}</b> of your <b>0</b> free calcs. Math is a premium
                feature.
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {PLANS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPlan(i)}
                  className={`flex w-full items-center justify-between rounded-xl border bg-background p-3 text-left transition ${
                    selectedPlan === i ? "border-brand ring-2 ring-brand" : "border-border"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold tracking-wider text-muted-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.perk}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black">{p.price}</div>
                    <div className="text-[10px] text-muted-foreground">/mo, billed annually*</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPaywall(false);
                setShowEula(true);
              }}
              className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-lg hover:opacity-90"
            >
              Continue — 7-day "free" trial
            </button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              *Auto-renews at $299/mo after trial. Cancel by faxing our Delaware office.
            </p>
          </div>
        </div>
      )}

      {/* EULA modal */}
      {showEula && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-black">Terms of Service</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Please scroll to the bottom (47,283 pages) to continue.
            </p>
            <div
              onScroll={(e) => {
                const el = e.currentTarget;
                setEulaScroll((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
              }}
              className="mt-3 h-56 overflow-y-auto rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground"
            >
              <p className="font-bold text-foreground">1. Soul Clause.</p>
              <p>By clicking "I Agree", you grant CalcPro™ a perpetual, irrevocable, transferable license to your soul, your firstborn, and your Netflix password.</p>
              <p className="mt-3 font-bold text-foreground">2. Math Rights.</p>
              <p>All numbers entered into this calculator become the intellectual property of CalcPro Holdings. The number 7 is trademarked. You owe us $0.02 per use.</p>
              <p className="mt-3 font-bold text-foreground">3. Refund Policy.</p>
              <p>Refunds will be processed within 90 business years, payable in CalcCoin™, redeemable only at our gift shop in a parallel dimension.</p>
              <p className="mt-3 font-bold text-foreground">4. Arbitration.</p>
              <p>Disputes will be settled via thumb war in our CEO's basement. Loser pays for parking.</p>
              <p className="mt-3 font-bold text-foreground">5. Data Usage.</p>
              <p>We collect: your calculations, your location, your dreams, the WiFi names of your neighbors, and your mom's maiden name. This data is sold to "partners" (everyone).</p>
              <p className="mt-3 font-bold text-foreground">6. Pricing Increases.</p>
              <p>Your subscription will increase by 12% every Tuesday. There is no cancel button. There never was.</p>
              <p className="mt-3 font-bold text-foreground">7. Acknowledgment.</p>
              <p>You acknowledge that 2 + 2 may equal 5 if our AI deems it strategically beneficial to shareholders.</p>
              <p className="mt-3">...continued for 47,282 more pages...</p>
              <p className="mt-3 text-foreground">Bottom. You may now click "I Agree".</p>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-brand transition-all" style={{ width: `${eulaScroll}%` }} />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowEula(false)}
                className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                Decline & Lose Access
              </button>
              <button
                disabled={eulaScroll < 95}
                onClick={() => {
                  setShowEula(false);
                  setToast("✅ Charged $299. Welcome to PRO. Result: 4 (estimated).");
                  setTimeout(() => setToast(null), 5000);
                }}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {eulaScroll < 95 ? `Scroll (${Math.floor(eulaScroll)}%)` : "I Agree to Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

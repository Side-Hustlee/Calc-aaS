import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Lock,
  Sparkles,
  Crown,
  X,
  ShieldCheck,
  Cookie,
  Zap,
  TrendingUp,
  Star,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MaaS — Math as a Service" },
      {
        name: "description",
        content:
          "The world's first cloud-native, AI-powered, blockchain-verified Math-as-a-Service platform. Pay per equals sign.",
      },
    ],
  }),
  component: Index,
});


type PlanKey = "BASIC" | "PRO" | "TEAMS" | "ENTERPRISE";

const PLANS: {
  name: PlanKey;
  price: string;
  priceNum: number;
  advertised: number; // calcs you THINK you're buying
  granted: number; // calcs you ACTUALLY get
  perk: string;
  featured?: boolean;
}[] = [
  { name: "BASIC", price: "$4.99", priceNum: 4.99, advertised: 100, granted: 3, perk: "100 calcs/mo*" },
  { name: "PRO", price: "$19.99", priceNum: 19.99, advertised: 9999, granted: 7, perk: "Unlimited*", featured: true },
  { name: "TEAMS", price: "$49.99", priceNum: 49.99, advertised: 500, granted: 12, perk: "500 calcs · 5 seats*" },
  { name: "ENTERPRISE", price: "$2,499", priceNum: 2499, advertised: 1000000, granted: 25, perk: "1M calcs (LOL)*" },
];

const TOASTS = [
  "Jeff in Ohio just upgraded to PRO ⭐",
  "🔥 87 people are viewing this pricing right now",
  "Sarah saved 0.4 seconds with CalcPro AI",
  "⚠️ Your free trial of breathing expires soon",
  "A competitor just calculated 7×8 without you",
];

type Session = {
  plan: PlanKey | null;
  calcsRemaining: number;
  totalCharged: number;
  history: { expr: string; result: string; at: number }[];
};

const STORAGE_KEY = "calcpro_session_v1";

const loadSession = (): Session => {
  if (typeof window === "undefined") return { plan: null, calcsRemaining: 0, totalCharged: 0, history: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { plan: null, calcsRemaining: 0, totalCharged: 0, history: [] };
};

// Safe-ish eval for our calculator tokens
const evaluate = (expr: string): string => {
  try {
    const js = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/[^0-9+\-*/.() ]/g, "");
    if (!js.trim()) return "0";
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${js})`)();
    if (typeof v !== "number" || !isFinite(v)) return "Error";
    return String(Math.round(v * 1e8) / 1e8);
  } catch {
    return "Error";
  }
};

function Index() {
  const [display, setDisplay] = useState("0");
  const [pendingExpr, setPendingExpr] = useState<string | null>(null);
  const [showGotcha, setShowGotcha] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCookies, setShowCookies] = useState(true);
  const [showEula, setShowEula] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [eulaScroll, setEulaScroll] = useState(0);
  const [session, setSession] = useState<Session>({ plan: null, calcsRemaining: 0, totalCharged: 0, history: [] });
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });


  useEffect(() => {
    setSession(loadSession());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  useEffect(() => {
    const id = setInterval(() => {
      setToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
      setTimeout(() => setToast(null), 4200);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const handleKey = (k: string) => {
    if (k === "C") {
      setDisplay("0");
      return;
    }
    if (k === "=") {
      if (display === "0" || display === "Error") return;
      if (!session.plan || session.calcsRemaining <= 0) {
        setPendingExpr(display);
        setShowGotcha(true);
        return;
      }
      runEvaluation(display);
      return;
    }
    setDisplay((d) => (d === "0" || d === "Error" ? k : d + k));
  };

  const runEvaluation = (expr: string) => {
    const result = evaluate(expr);
    setSession((s) => ({
      ...s,
      calcsRemaining: Math.max(0, s.calcsRemaining - 1),
      history: [{ expr, result, at: Date.now() }, ...s.history].slice(0, 20),
    }));
    setDisplay(result);
    setPendingExpr(null);
    const left = Math.max(0, session.calcsRemaining - 1);
    setToast(
      left <= 0
        ? "💀 You're out of calcs. Time to renew (price went up 12%)."
        : `✨ Math achieved. ${left} calcs left.`,
    );
    setTimeout(() => setToast(null), 4000);
  };


  const keys = useMemo(
    () => [
      ["C", "(", ")", "÷"],
      ["7", "8", "9", "×"],
      ["4", "5", "6", "−"],
      ["1", "2", "3", "+"],
      ["0", ".", "="],
    ],
    [],
  );

  const completePurchase = () => {
    setProcessing(true);
    setTimeout(() => {
      const plan = PLANS[selectedPlan];
      setSession((s) => ({
        plan: plan.name,
        calcsRemaining: plan.granted,
        totalCharged: s.totalCharged + plan.priceNum,
        history: s.history,
      }));
      setProcessing(false);
      setShowEula(false);
      setShowCheckout(false);
      setToast(
        `✅ Charged ${plan.price}. You got ${plan.granted} calcs (advertised ${plan.advertised.toLocaleString()}). Fine print, baby.`,
      );
      setTimeout(() => setToast(null), 6000);
      // auto-evaluate the equation the user was trying to solve
      if (pendingExpr) {
        setTimeout(() => {
          const result = evaluate(pendingExpr);
          setSession((s) => ({
            ...s,
            calcsRemaining: Math.max(0, s.calcsRemaining - 1),
            history: [{ expr: pendingExpr, result, at: Date.now() }, ...s.history].slice(0, 20),
          }));
          setDisplay(result);
          setPendingExpr(null);
        }, 400);
      }
    }, 1800);
  };


  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession({ plan: null, calcsRemaining: 0, totalCharged: 0, history: [] });
    setToast("🧹 Session wiped. Your $$$ is NOT refunded.");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background pb-24">
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
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              session.plan
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            {session.plan ? `${session.plan} · ${session.calcsRemaining} left` : "Free Plan"}
          </span>
        </header>

        {/* Calculator */}
        <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl">
          <div className="relative mb-4 flex items-center justify-between rounded-2xl bg-foreground px-5 py-6 text-background">
            <span className="truncate text-3xl font-light tracking-wide">{display}</span>
            {session.plan ? (
              <CheckCircle2 className="h-5 w-5 text-brand" />
            ) : (
              <Lock className="h-5 w-5 text-lock" />
            )}
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

        {/* Session status */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-xl">
          {session.plan ? (
            <>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-brand" />
                <h2 className="font-bold">{session.plan} Member</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                You have <b className="text-foreground">{session.calcsRemaining}</b> calculations left. Total charged
                so far: <b className="text-danger">${session.totalCharged.toFixed(2)}</b>.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowPaywall(true)}
                  className="flex-1 rounded-xl bg-brand py-2.5 text-xs font-bold text-brand-foreground hover:opacity-90"
                >
                  Buy More (12% Surcharge)
                </button>
                <button
                  onClick={clearSession}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Wipe Session
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-lock" />
                <h2 className="font-bold">Unlock your calculator</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Free plan includes <b className="text-danger">0</b> calculations. Math is a premium feature.
              </p>
              <button
                onClick={() => setShowPaywall(true)}
                className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/30 hover:opacity-90"
              >
                Choose a Plan
              </button>
            </>
          )}
        </div>

        {/* History */}
        {session.history.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Session History ({session.history.length})
              </h3>
              <span className="text-[10px] text-muted-foreground">stored locally · forever</span>
            </div>
            <ul className="divide-y divide-border text-sm">
              {session.history.slice(0, 6).map((h, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span className="font-mono text-muted-foreground">{h.expr}</span>
                  <span className="font-mono font-bold">= {h.result}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
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

        <footer className="mt-8 space-y-2 text-center text-[10px] text-muted-foreground">
          <p>
            © 2026 CalcPro Holdings, LLC, a subsidiary of CalcPro International, a portfolio company of CalcPro
            Capital. By reading this footer you owe us $3.
          </p>
          <p className="text-foreground/70">
            🪤 A sketchy idea by <b className="text-brand">Ntwali</b> :) — built to make non-tech users flinch.
          </p>
        </footer>
      </div>

      {toast && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-2xl animate-in slide-in-from-left">
          {toast}
        </div>
      )}

      {/* Paywall / plan picker */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-muted-foreground/40 hover:bg-secondary"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-danger">
                <Crown className="h-7 w-7 text-brand-foreground" />
              </div>
              <h3 className="mt-4 text-2xl font-black">Pick your poison.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                All plans include math*. *Subject to interpretation.
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
                    <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground">
                      {p.name}
                      {p.featured && <Star className="h-3 w-3 fill-lock text-lock" />}
                    </div>
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
                setEulaScroll(0);
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

      {/* EULA */}
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
              <p className="mt-3 font-bold text-foreground">2. The "Advertised vs Actual" Clause.</p>
              <p>Calc quotas listed on pricing tiles are <i>aspirational</i>. Actual delivered quota will be drastically lower. By agreeing you accept that "100" means "3", "unlimited" means "7", and "1,000,000" means "25". This is a feature.</p>
              <p className="mt-3 font-bold text-foreground">3. Refund Policy.</p>
              <p>Refunds will be processed within 90 business years, payable in CalcCoin™.</p>
              <p className="mt-3 font-bold text-foreground">4. Math Rights.</p>
              <p>All numbers entered become the intellectual property of CalcPro Holdings. The number 7 is trademarked.</p>
              <p className="mt-3 font-bold text-foreground">5. Pricing Increases.</p>
              <p>Your subscription will increase by 12% every Tuesday. There is no cancel button. There never was.</p>
              <p className="mt-3 font-bold text-foreground">6. Acknowledgment.</p>
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
                  setShowCheckout(true);
                }}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {eulaScroll < 95 ? `Scroll (${Math.floor(eulaScroll)}%)` : "I Agree to Everything"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand" />
              <h3 className="text-xl font-black">Secure* Checkout</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              *Card data sent in plaintext to 14 "partners". You agreed (page 9,841).
            </p>

            <div className="mt-4 rounded-xl border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {PLANS[selectedPlan].name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Advertised: {PLANS[selectedPlan].advertised.toLocaleString()} calcs/mo
                  </div>
                </div>
                <div className="text-xl font-black">{PLANS[selectedPlan].price}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <input
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="Name on card (and SSN)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              <input
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                placeholder="4242 4242 4242 4242"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-brand"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={card.exp}
                  onChange={(e) => setCard({ ...card, exp: e.target.value })}
                  placeholder="MM/YY"
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-brand"
                />
                <input
                  value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                  placeholder="CVC"
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-brand"
                />
              </div>
            </div>

            <button
              onClick={completePurchase}
              disabled={processing}
              className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-lg hover:opacity-90 disabled:opacity-60"
            >
              {processing ? "Charging your card 3 times…" : `Pay ${PLANS[selectedPlan].price}`}
            </button>
            <button
              onClick={() => setShowCheckout(false)}
              className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:underline"
            >
              Cancel (you'll still be charged a $4 cancellation fee)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

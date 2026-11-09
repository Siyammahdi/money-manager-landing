"use client";

import { Backspace, Check, Keyboard } from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion, useAnimate, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";

import { Glyph } from "./icons";
import { cn, money, type TxType } from "./lib";
import { TxAvatar } from "./phone";
import { Odometer, Reveal, SplitWords } from "./ui";

const CATEGORIES: Record<TxType, { name: string; icon: string }[]> = {
  expense: [
    { name: "Food", icon: "food" },
    { name: "Transport", icon: "car" },
    { name: "Software", icon: "cpu" },
    { name: "Rent", icon: "rent" },
    { name: "Coffee", icon: "coffee" },
  ],
  income: [
    { name: "Client project", icon: "briefcase" },
    { name: "Retainer", icon: "repeat" },
    { name: "Consulting", icon: "chat" },
    { name: "Design", icon: "design" },
  ],
  transfer: [
    { name: "City Bank → bKash", icon: "swap" },
    { name: "bKash → Cash", icon: "swap" },
    { name: "Payoneer → City Bank", icon: "swap" },
  ],
};

const TYPES: { key: TxType; label: string }[] = [
  { key: "expense", label: "Expense" },
  { key: "income", label: "Income" },
  { key: "transfer", label: "Transfer" },
];

type Entry = { id: number; title: string; sub: string; type: TxType; amount: number; icon: string };

const SEED: Entry[] = [
  { id: 2, title: "Coffee", sub: "Petty cash · 10:24", type: "expense", amount: 450, icon: "coffee" },
  { id: 1, title: "Client project", sub: "City Bank · 09:02", type: "income", amount: 48000, icon: "briefcase" },
];

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"] as const;

function Key({ k, onPress }: { k: (typeof KEYS)[number]; onPress: (k: string) => void }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const down = (e: RPointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = performance.now();
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((rs) => rs.filter((p) => p.id !== id)), 650);
  };
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 600, damping: 20 }}
      onPointerDown={down}
      onClick={() => onPress(k)}
      aria-label={k === "del" ? "Delete digit" : k}
      className="relative h-14 overflow-hidden rounded-2xl bg-surface-alt text-[22px] font-semibold transition-colors hover:bg-sunken"
    >
      {ripples.map((p) => (
        <motion.span
          key={p.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 6, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute size-8 rounded-full bg-lime"
          style={{ left: p.x - 16, top: p.y - 16 }}
        />
      ))}
      <span className="relative grid place-items-center">{k === "del" ? <Backspace size={22} /> : k}</span>
    </motion.button>
  );
}

export function QuickAdd() {
  const [type, setType] = useState<TxType>("expense");
  const [digits, setDigits] = useState("");
  const [cat, setCat] = useState<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>(SEED);
  const [balance, setBalance] = useState(115896);
  const [saved, setSaved] = useState(false);
  const [scope, animate] = useAnimate();
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { margin: "-20% 0px -20% 0px" });
  const amount = Number(digits || "0");
  const step = saved ? 3 : cat !== null && amount > 0 ? 2 : amount > 0 ? 1 : 0;

  const press = useCallback((k: string) => {
    setSaved(false);
    setDigits((d) => {
      if (k === "del") return d.slice(0, -1);
      const next = (d + k).replace(/^0+/, "");
      return next.length > 8 ? d : next;
    });
  }, []);

  const save = useCallback(() => {
    if (amount <= 0 || cat === null) {
      animate(scope.current, { x: [0, -12, 11, -8, 6, -3, 0] }, { duration: 0.5 });
      return;
    }
    const c = CATEGORIES[type][cat];
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setEntries((es) =>
      [
        {
          id: Date.now(),
          title: c.name,
          sub: `${type === "transfer" ? "Transfer" : type === "income" ? "City Bank" : "Petty cash"} · ${time}`,
          type,
          amount,
          icon: c.icon,
        },
        ...es,
      ].slice(0, 4),
    );
    if (type !== "transfer") setBalance((b) => b + (type === "income" ? amount : -amount));
    setSaved(true);
    setTimeout(() => {
      setDigits("");
      setCat(null);
      setSaved(false);
    }, 1300);
  }, [amount, animate, cat, scope, type]);

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
      else if (e.key === "Enter") save();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, press, save]);

  const shown = digits ? money(amount).slice(1) : "0";

  return (
    <section id="features" className="relative px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-16 xl:grid-cols-12 xl:gap-10">
        <div className="xl:col-span-5 xl:pt-10">
          <SplitWords text={"Add an entry\nin three taps."} className="text-[clamp(2.6rem,5.6vw,4.6rem)]" />
          <Reveal delay={0.2} className="mt-7 max-w-[440px] text-[17px] leading-relaxed text-text-2">
            Tap +, type the amount and pick a category. Today’s date and your default account are already filled in.
            Client, note and repeat are under “More details” when you need them.
          </Reveal>

          <Reveal delay={0.3} className="mt-12">
            <ol className="relative space-y-1">
              <span aria-hidden className="absolute top-5 bottom-5 left-[17px] w-px bg-ink/10" />
              {["Enter the amount", "Choose a category", "Save"].map((s, i) => {
                const done = step > i;
                const current = step === i;
                return (
                  <li key={s} className="relative flex items-center gap-4 py-2.5">
                    <span
                      className={cn(
                        "relative grid size-9 place-items-center rounded-full transition-all duration-500 ease-(--ease-spring)",
                        done ? "bg-ink text-lime" : current ? "scale-110 bg-lime" : "bg-surface-alt",
                      )}
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        {done ? (
                          <motion.span
                            key="c"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 22 }}
                          >
                            <Check size={15} weight="bold" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="d"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={cn("size-2 rounded-full", current ? "bg-ink" : "bg-muted/50")}
                          />
                        )}
                      </AnimatePresence>
                    </span>
                    <span className={cn("text-[18px] transition-colors duration-300", done || current ? "text-ink" : "text-muted")}>{s}</span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-8 flex items-center gap-2 text-[13px] text-muted">
              <Keyboard size={16} /> Try it here. Your keyboard works too: numbers, Backspace and Enter.
            </p>
          </Reveal>
        </div>

        <div className="relative min-w-0 xl:col-span-7">
          <div aria-hidden className="absolute -inset-10 -z-10 rounded-[64px] bg-[radial-gradient(closest-side,rgba(212,242,92,0.5),transparent)] blur-2xl" />
          <div className="grid gap-5 md:grid-cols-[1.25fr_1fr]">
            {/* Entry sheet */}
            <Reveal y={60} className="min-w-0">
              <div ref={cardRef}>
                <div ref={scope} className="rounded-[32px] bg-surface p-5 shadow-[0_40px_80px_-40px_rgba(20,23,15,0.35)] ring-1 ring-line md:p-6">
                  <LayoutGroup id="qa-type">
                    <div className="grid grid-cols-3 rounded-full bg-surface-alt p-1">
                      {TYPES.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => {
                            setType(t.key);
                            setCat(null);
                          }}
                          className={cn("relative h-10 rounded-full text-[14px] font-semibold transition-colors", type === t.key ? "text-ink" : "text-text-2")}
                        >
                          {type === t.key && (
                            <motion.span
                              layoutId="qa-pill"
                              className="absolute inset-0 rounded-full bg-surface shadow-[0_2px_8px_rgba(20,23,15,0.08)]"
                              transition={{ type: "spring", stiffness: 500, damping: 36 }}
                            />
                          )}
                          <span className="relative">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </LayoutGroup>

                  <div className="flex h-[118px] flex-col items-center justify-center">
                    <div
                      className={cn(
                        "tabular flex items-baseline text-[42px] leading-none font-bold tracking-tight transition-colors duration-300 sm:text-[56px]",
                        digits ? (type === "income" ? "text-income" : "text-ink") : "text-muted/60",
                      )}
                    >
                      <span className="mr-1 text-[36px] text-muted">৳</span>
                      {shown.split("").map((ch, i) => (
                        <motion.span
                          key={`${shown.length}-${i}-${ch}`}
                          initial={digits ? { y: 18, opacity: 0, scale: 0.7 } : false}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 600, damping: 26 }}
                        >
                          {ch}
                        </motion.span>
                      ))}
                      <span className="caret ml-1 inline-block h-[44px] w-[3px] self-center rounded-full bg-lime-press" />
                    </div>
                    <div className="tabular mt-2 h-5 text-[13px] text-muted">{amount > 0 && `≈ ${money(amount, "USD")} at ৳122 / $1`}</div>
                  </div>

                  <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:-mx-6 md:px-6">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {CATEGORIES[type].map((c, i) => (
                        <motion.button
                          key={`${type}-${c.name}`}
                          type="button"
                          layout
                          initial={{ opacity: 0, y: 12, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28, delay: i * 0.03 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            setCat(i);
                            setSaved(false);
                          }}
                          className={cn(
                            "flex shrink-0 items-center gap-2 rounded-full py-2 pr-4 pl-2 text-[13.5px] font-semibold transition-colors duration-300",
                            cat === i ? "bg-ink text-on-ink" : "bg-surface-alt hover:bg-sunken",
                          )}
                        >
                          <span className={cn("grid size-7 place-items-center rounded-full transition-colors", cat === i ? "bg-lime text-ink" : "bg-surface")}>
                            <Glyph name={c.icon} size={15} />
                          </span>
                          {c.name}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {KEYS.map((k) => (
                      <Key key={k} k={k} onPress={press} />
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    onClick={save}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "relative mt-4 flex h-14 w-full items-center justify-center overflow-hidden rounded-full text-[16px] font-semibold transition-colors duration-500",
                      saved ? "bg-lime text-ink" : "bg-ink text-on-ink",
                    )}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={saved ? "ok" : type}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        className="flex items-center gap-2"
                      >
                        {saved ? (
                          <>
                            <motion.span initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                              <Check size={20} weight="bold" />
                            </motion.span>
                            Saved
                          </>
                        ) : (
                          `Save ${type}`
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </Reveal>

            {/* Live ledger */}
            <Reveal y={60} delay={0.12} className="flex min-w-0 flex-col gap-5">
              <div className="relative overflow-hidden rounded-[28px] bg-lime p-5">
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 160 101" preserveAspectRatio="xMidYMid slice" aria-hidden>
                  <path d="M70 -10 C 110 30, 120 60, 170 70 L 170 -10 Z" fill="#11140D" fillOpacity={0.07} />
                </svg>
                <div className="relative text-[13px] font-medium text-ink/60">Petty cash · balance</div>
                <div className="relative mt-1 text-[32px] font-bold tracking-tight">
                  <Odometer value={money(balance)} />
                </div>
              </div>
              <div className="flex-1 rounded-[28px] bg-surface p-2 ring-1 ring-line">
                <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[13px] font-semibold text-text-2">
                  <span>Today</span>
                  <span className="tabular">{entries.length} entries</span>
                </div>
                <ul>
                  <AnimatePresence initial={false}>
                    {entries.map((e) => (
                      <motion.li
                        key={e.id}
                        layout
                        initial={{ opacity: 0, y: -30, scale: 0.85, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
                      >
                        <TxAvatar icon={e.icon} type={e.type} size={38} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold">{e.title}</div>
                          <div className="text-[12px] text-muted">{e.sub}</div>
                        </div>
                        <span className={cn("tabular text-[14px] font-semibold", e.type === "income" && "text-income")}>
                          {money(e.amount, "BDT", e.type === "income" ? "+" : e.type === "expense" ? "-" : undefined)}
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
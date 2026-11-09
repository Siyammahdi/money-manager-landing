"use client";

import { ArrowCounterClockwise, Bell, Check, Fingerprint, LockOpen, LockSimple } from "@phosphor-icons/react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Glyph } from "./icons";
import { ACCOUNT_COLORS, ACCOUNTS, cn, money, type AccountColor, type Currency, type Pattern } from "./lib";
import { AccountCard, Artwork, DueCard } from "./phone";
import { Odometer, Reveal, SplitWords, useSpotlight } from "./ui";

/* ---------------------------------------------------------------- Card shell */

function Card({
  className,
  tone = "light",
  title,
  body,
  children,
  delay = 0,
  onPointerEnter,
  onPointerLeave,
}: {
  className?: string;
  tone?: "light" | "ink" | "lime" | "alt";
  title: ReactNode;
  body: ReactNode;
  children: ReactNode;
  delay?: number;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const ref = useSpotlight<HTMLDivElement>();
  const toneCls = {
    light: "bg-surface text-ink ring-1 ring-line",
    alt: "bg-surface-alt text-ink",
    ink: "bg-ink text-on-ink",
    lime: "bg-lime text-ink",
  }[tone];
  const spot = tone === "ink" ? "rgba(212,242,92,0.13)" : tone === "lime" ? "rgba(255,255,255,0.45)" : "rgba(212,242,92,0.35)";
  return (
    <Reveal delay={delay} y={50} className={className}>
      <div
        ref={ref}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className={cn("group/card relative isolate flex h-full flex-col overflow-hidden rounded-[32px] p-6 md:p-7", toneCls)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{ background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${spot}, transparent 60%)` }}
        />
        <div className="relative min-h-[220px] flex-1">{children}</div>
        <div className="relative mt-6">
          <h3 className="text-[24px] leading-tight font-normal tracking-[-0.025em]">{title}</h3>
          <p className={cn("mt-2 max-w-[460px] text-[15px] leading-relaxed", tone === "ink" ? "text-on-ink-muted" : tone === "lime" ? "text-ink/65" : "text-text-2")}>
            {body}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------------------------------------------------------------- Accounts */

function AccountsFan() {
  const [fan, setFan] = useState(false);
  const [spread, setSpread] = useState(112);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setSpread(mq.matches ? 52 : 112);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const n = ACCOUNTS.length;
  return (
    <Card
      className="lg:col-span-7"
      title="All your accounts, side by side"
      body="Cash, bank, mobile wallets, cards and savings, each with its own balance and currency. Move money between them, even across currencies, and both sides stay correct."
      onPointerEnter={() => setFan(true)}
      onPointerLeave={() => setFan(false)}
    >
      <div className="absolute inset-0 grid place-items-center" onClick={() => setFan((f) => !f)}>
        {ACCOUNTS.map((a, i) => {
          const c = i - (n - 1) / 2;
          return (
            <motion.div
              key={a.id}
              drag
              dragSnapToOrigin
              dragElastic={0.6}
              whileDrag={{ scale: 1.08, zIndex: 20, cursor: "grabbing" }}
              animate={
                fan
                  ? { x: c * spread, y: Math.abs(c) * 18 - 6, rotate: c * 8 }
                  : { x: c * 16, y: c * -10 + 10, rotate: c * 3 - 2 }
              }
              transition={{ type: "spring", stiffness: 220, damping: 20, delay: fan ? i * 0.03 : (n - i) * 0.02 }}
              className="absolute cursor-grab touch-none"
              style={{ zIndex: i }}
            >
              <AccountCard
                account={a}
                width={190}
                className="shadow-[0_24px_40px_-20px_rgba(20,23,15,0.45)] ring-1 ring-black/5"
              />
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- Currencies */

function Currencies() {
  const [cur, setCur] = useState<Currency>("BDT");
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched) return;
    const t = setInterval(() => setCur((c) => (c === "BDT" ? "USD" : "BDT")), 2600);
    return () => clearInterval(t);
  }, [touched]);
  const rows = [
    { label: "Northwind Labs", v: 256200 },
    { label: "Adobe CC", v: 17080 },
  ];
  return (
    <Card
      className="lg:col-span-5"
      tone="lime"
      delay={0.08}
      title="Two currencies, no confusion"
      body="Set a main currency and a second one, like BDT and USD. Each entry keeps the rate from the day you saved it, so last month’s totals never shift."
    >
      <div className="flex h-full flex-col justify-between">
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            setCur((c) => (c === "BDT" ? "USD" : "BDT"));
          }}
          className="relative grid h-14 w-[164px] grid-cols-2 rounded-full bg-ink p-1.5 text-[14px] font-semibold"
          aria-label="Switch currency"
        >
          <motion.span
            className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-lime"
            animate={{ x: cur === "BDT" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          {(["BDT", "USD"] as const).map((c) => (
            <span key={c} className={cn("relative grid place-items-center transition-colors duration-300", cur === c ? "text-ink" : "text-on-ink/60")}>
              {c === "BDT" ? "৳ BDT" : "$ USD"}
            </span>
          ))}
        </button>
        <div className="mt-6">
          <div className="text-[13px] font-medium text-ink/55">Total balance</div>
          <div className="text-[clamp(2.4rem,4.5vw,3.4rem)] leading-none font-normal tracking-[-0.04em]">
            <Odometer value={money(1726939, cur)} />
          </div>
          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between text-[14px]">
                <span className="text-ink/60">{r.label}</span>
                <Odometer value={money(r.v, cur)} className="font-semibold" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- Dues */

const DUES = [
  { id: "nw", title: "Northwind Labs", sub: "Client Project · Due 7 Nov", amount: 256200, chip: "2 days overdue", overdue: true },
  { id: "bp", title: "Bluepeak Realty", sub: "Monthly Retainer · Due 10 Nov", amount: 219600, chip: "Due tomorrow" },
];

function Dues() {
  const [done, setDone] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [undo, setUndo] = useState<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const owed = 568500 - DUES.filter((d) => done.includes(d.id)).reduce((s, d) => s + d.amount, 0);
  const left = DUES.filter((d) => !done.includes(d.id));

  const mark = (id: string) => {
    setPending(id);
    setTimeout(() => {
      setDone((d) => [...d, id]);
      setPending(null);
      setUndo(id);
      clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndo(null), 3800);
    }, 650);
  };

  return (
    <Card
      className="lg:col-span-5"
      tone="ink"
      delay={0.04}
      title="Who owes you, and what you owe"
      body="Unpaid invoices and upcoming bills in one list, overdue first. Mark one received or paid when the money moves, and undo if you tapped too soon."
    >
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[13px] text-on-ink/55">Clients owe you</div>
            <div className="text-[36px] leading-tight font-normal tracking-[-0.035em]">
              <Odometer value={money(owed)} />
            </div>
          </div>
          {left.length === 0 && (
            <button
              type="button"
              onClick={() => setDone([])}
              className="mb-2 flex items-center gap-1.5 rounded-full bg-on-ink/10 px-3 py-1.5 text-[12px] font-semibold text-on-ink hover:bg-on-ink/20"
            >
              <ArrowCounterClockwise size={13} weight="bold" /> Reset
            </button>
          )}
        </div>
        <div className="relative mt-4 flex-1 text-ink">
          <AnimatePresence initial={false}>
            {left.map((d) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, scale: 0.9, filter: "blur(4px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="pb-2.5">
                  <DueCard {...d} done={pending === d.id} onMark={() => mark(d.id)} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {left.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-[150px] flex-col items-center justify-center gap-3 text-on-ink"
              >
                <span className="grid size-14 place-items-center rounded-full bg-lime text-ink">
                  <Check size={26} weight="bold" />
                </span>
                <span className="text-[15px] font-semibold">All settled.</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {undo && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between rounded-2xl bg-on-ink px-4 py-3 text-[13.5px] font-medium shadow-xl"
              >
                Marked as received
                <button
                  type="button"
                  className="font-semibold text-income"
                  onClick={() => {
                    setDone((d) => d.filter((x) => x !== undo));
                    setUndo(null);
                  }}
                >
                  Undo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- Repeating */

function Repeating() {
  const orbits = [
    { r: 50, dur: 16, icon: "rent", label: "Rent", freq: "mo" },
    { r: 80, dur: 24, icon: "briefcase", label: "Salary", freq: "mo" },
    { r: 110, dur: 34, icon: "cpu", label: "Adobe", freq: "yr" },
  ];
  return (
    <Card
      className="lg:col-span-4"
      delay={0.08}
      title="Set it once"
      body="Salary, rent and subscriptions repeat weekly, monthly or yearly, either as paid entries or as dues to settle. Pause, edit or stop them any time."
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative size-[240px]">
          {orbits.map((o, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border border-dashed border-ink/15" style={{ width: o.r * 2, height: o.r * 2 }}>
              <div
                className="absolute inset-0"
                style={{ animation: `spin-slow ${o.dur}s linear infinite`, animationDelay: `${(-o.dur * i) / 3}s` }}
              >
                <div
                  className="absolute top-0 left-1/2 -translate-1/2"
                  style={{ animation: `spin-slow ${o.dur}s linear infinite reverse`, animationDelay: `${(-o.dur * i) / 3}s` }}
                >
                  <span className="flex items-center gap-1.5 rounded-full bg-surface py-1 pr-3 pl-1 text-[11.5px] font-semibold whitespace-nowrap shadow-[0_8px_20px_-8px_rgba(20,23,15,0.3)] ring-1 ring-line">
                    <span className="grid size-6 place-items-center rounded-full bg-lime">
                      <Glyph name={o.icon} size={13} />
                    </span>
                    {o.label}
                    <span className="font-medium text-muted">/{o.freq}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 grid size-[72px] -translate-1/2 place-items-center rounded-full bg-ink text-center text-on-ink">
            <div>
              <div className="text-[26px] leading-none font-bold">3</div>
              <div className="mt-1 text-[11px] text-on-ink-muted">active</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- App lock */

function AppLock() {
  const [state, setState] = useState<"locked" | "scanning" | "open">("locked");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scan = () => {
    if (state !== "locked") return;
    setState("scanning");
    timer.current = setTimeout(() => setState("open"), 1100);
  };
  const lock = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("locked"), 500);
  };
  return (
    <Card
      className="lg:col-span-3"
      tone="alt"
      delay={0.12}
      title="Locked when you step away"
      body="Face ID, fingerprint or passcode when you open the app, and again after 30 seconds away."
      onPointerEnter={scan}
      onPointerLeave={lock}
    >
      <button type="button" onClick={() => (state === "open" ? setState("locked") : scan())} className="absolute inset-0 flex flex-col items-center justify-center gap-5" aria-label="Unlock demo">
        <motion.div
          animate={{ filter: state === "open" ? "blur(0px)" : "blur(9px)", opacity: state === "open" ? 1 : 0.55 }}
          transition={{ duration: 0.6 }}
          className="tabular text-[28px] font-normal tracking-[-0.03em]"
        >
          ৳17,26,939
        </motion.div>
        <div className="relative grid size-[92px] place-items-center rounded-[30px] bg-surface shadow-[0_20px_40px_-20px_rgba(20,23,15,0.35)]">
          <AnimatePresence mode="popLayout" initial={false}>
            {state === "open" ? (
              <motion.span
                key="open"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="grid size-14 place-items-center rounded-full bg-lime"
              >
                <LockOpen size={28} weight="bold" />
              </motion.span>
            ) : (
              <motion.span key="fp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
                <Fingerprint size={50} weight="light" className="text-ink/25" />
                <motion.span
                  className="absolute inset-0 text-ink"
                  initial={false}
                  animate={{ clipPath: state === "scanning" ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
                  transition={{ duration: state === "scanning" ? 1 : 0.3, ease: "easeInOut" }}
                >
                  <Fingerprint size={50} weight="light" />
                </motion.span>
                {state === "scanning" && (
                  <motion.span
                    className="absolute inset-x-[-6px] h-[2px] rounded-full bg-lime-press shadow-[0_0_12px_#c3e443]"
                    initial={{ top: "100%" }}
                    animate={{ top: "0%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                )}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-ink text-on-ink">
            {state === "open" ? <Check size={13} weight="bold" /> : <LockSimple size={13} weight="bold" />}
          </span>
        </div>
      </button>
    </Card>
  );
}

/* ---------------------------------------------------------------- Reminders */

const NOTES = [
  { title: "Bluepeak Realty pays tomorrow", body: "৳2,19,600 · Monthly retainer", when: "1 day before · 9:00" },
  { title: "Office rent is due today", body: "৳45,000 · City Bank", when: "On the day · 9:00" },
  { title: "Adobe renews in 3 days", body: "$140.00 · Business card", when: "3 days before · 20:00" },
  { title: "Lumen Studio is overdue", body: "৳92,700 · Consulting", when: "On the day · 9:00" },
];

function Reminders() {
  const [head, setHead] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setHead((h) => h + 1), 2400);
    return () => clearInterval(t);
  }, [paused]);
  const stack = [0, 1, 2].map((k) => ({ key: head - k, n: NOTES[(((head - k) % NOTES.length) + NOTES.length) % NOTES.length] }));
  return (
    <Card
      className="lg:col-span-5"
      delay={0.04}
      title="Reminders before money is due"
      body="Get a notification on the day, a day before or three days before, at the time you choose. Tap it to open the entry."
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="absolute inset-x-0 top-2 mx-auto max-w-[400px]">
        <AnimatePresence initial={false}>
          {stack.map(({ key, n }, i) => (
            <motion.div
              key={key}
              initial={{ y: -60, opacity: 0, scale: 0.9 }}
              animate={{ y: i * 64, opacity: 1 - i * 0.28, scale: 1 - i * 0.05 }}
              exit={{ y: 3 * 64, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="absolute inset-x-0 flex items-center gap-3 rounded-[20px] bg-surface-alt p-3"
              style={{ zIndex: 10 - i }}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-lime">
                <Bell size={19} weight="fill" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-semibold">{n.title}</span>
                  <span className="shrink-0 text-[11px] text-muted">now</span>
                </div>
                <div className="tabular truncate text-[12.5px] text-text-2">{n.body}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-2">
        {["On the day", "1 day before", "3 days before"].map((w, i) => (
          <span key={w} className={cn("rounded-full px-3 py-1.5 text-[12px] font-semibold", i === head % 3 ? "bg-ink text-on-ink" : "bg-surface-alt text-text-2")}>
            {w}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- Customise */

const SWATCHES: AccountColor[] = ["lime", "ink", "sage", "sky", "lilac", "sand", "coral"];
const PATTERNS: Pattern[] = ["arc", "waves", "orbs", "stripes", "dots", "rings"];
const ICONS = ["savings", "wallet", "bank", "cash", "card", "briefcase", "design"];

function Picker({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[13px] text-text-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Customize() {
  const [name, setName] = useState("Travel fund");
  const [color, setColor] = useState<AccountColor>("sky");
  const [pattern, setPattern] = useState<Pattern>("waves");
  const [icon, setIcon] = useState("savings");
  const [scope, animate] = useAnimate();
  const bump = () => animate(scope.current, { rotate: [0, -3, 2, 0], scale: [1, 1.04, 1] }, { duration: 0.55, ease: "easeOut" });
  const c = ACCOUNT_COLORS[color];

  return (
    <Card
      className="lg:col-span-7"
      delay={0.08}
      title="Make it yours"
      body="Name accounts and categories the way you talk about them. Give each one a colour, pattern and icon from a library of about 190, or upload your own logo. You also decide what Home shows."
    >
      <div className="grid h-full items-center gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid place-items-center py-4">
          <div ref={scope}>
            <AccountCard
              account={{ id: "custom", name: name.trim() || "Untitled", kind: "savings", icon, currency: "BDT", color, pattern, balance: 64500 }}
              width={236}
              className="shadow-[0_30px_50px_-24px_rgba(20,23,15,0.5)] ring-1 ring-black/5"
            />
          </div>
        </div>
        <div className="space-y-5">
          <label className="block">
            <span className="text-[13px] text-text-2">Name</span>
            <input
              value={name}
              maxLength={18}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl bg-surface-alt px-3.5 text-[15px] ring-lime-press outline-none focus:ring-2"
            />
          </label>
          <Picker label="Colour">
            {SWATCHES.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={s}
                onClick={() => {
                  setColor(s);
                  bump();
                }}
                className="relative size-8 rounded-full ring-1 ring-black/10 transition-transform hover:scale-110"
                style={{ background: ACCOUNT_COLORS[s].bg }}
              >
                {color === s && (
                  <motion.span
                    layoutId="cz-colour"
                    className="absolute -inset-[5px] rounded-full ring-2 ring-ink"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </Picker>
          <Picker label="Pattern">
            {PATTERNS.map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`${p} pattern`}
                onClick={() => {
                  setPattern(p);
                  bump();
                }}
                className="relative h-8 w-11 rounded-[10px] transition-transform hover:scale-105"
              >
                <span className="absolute inset-0 overflow-hidden rounded-[10px]" style={{ background: c.bg, transition: "background-color .5s" }}>
                  <Artwork pattern={p} ink={c.fg} />
                </span>
                {pattern === p && (
                  <motion.span
                    layoutId="cz-pattern"
                    className="absolute -inset-[4px] rounded-[13px] ring-2 ring-ink"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </Picker>
          <Picker label="Icon">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i} icon`}
                onClick={() => {
                  setIcon(i);
                  bump();
                }}
                className={cn(
                  "relative grid size-9 place-items-center rounded-[11px] transition-colors duration-300",
                  icon === i ? "text-ink" : "bg-surface-alt text-text-2 hover:text-ink",
                )}
              >
                {icon === i && (
                  <motion.span
                    layoutId="cz-icon"
                    className="absolute inset-0 rounded-[11px] bg-lime"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
                <span className="relative">
                  <Glyph name={i} size={17} />
                </span>
              </button>
            ))}
          </Picker>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- Section */

export function Bento() {
  return (
    <section className="relative px-5 pb-24 md:px-8 md:pb-36">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SplitWords text={"Built for the way\nmoney really moves."} className="text-[clamp(2.6rem,5.6vw,4.6rem)]" />
          </div>
          <Reveal delay={0.15} className="text-[17px] leading-relaxed text-text-2 lg:col-span-4 lg:col-start-9">
            Cash in a drawer, salary in the bank, client payments in dollars, a bKash balance for everything else.
            Money Manager keeps all of it in one place, without turning bookkeeping into a chore.
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(440px,auto)]">
          <AccountsFan />
          <Currencies />
          <Dues />
          <Repeating />
          <AppLock />
          <Reminders />
          <Customize />
        </div>
      </div>
    </section>
  );
}

"use client";

import {
  ArrowDownLeft,
  CaretLeft,
  CaretRight,
  Check,
  Export,
  Eye,
  EyeSlash,
  MagnifyingGlass,
  Plus,
  SlidersHorizontal,
  Warning,
  CellSignalFull,
  WifiHigh,
  BatteryHigh,
  CalendarBlank,
} from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useId, type CSSProperties, type ReactNode } from "react";

import { Glyph } from "./icons";
import { ACCOUNT_COLORS, ACCOUNTS, cn, money, RECENT, type Currency, type DemoAccount, type DemoTx, type Pattern } from "./lib";
import { Odometer } from "./ui";

/* ---------------------------------------------------------------- Frame */

/**
 * A 360 × 760 phone drawn at native size and scaled with --s,
 * so every screen inside is laid out once in real app pixels.
 */
export function Phone({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  return (
    <div
      className={cn("relative", className)}
      style={{ width: "calc(384px * var(--s, 1))", height: "calc(784px * var(--s, 1))", ...style }}
    >
      <div
        className="absolute top-0 left-0 h-[784px] w-[384px] origin-top-left rounded-[58px] bg-[#0d0f0a] p-3 shadow-[0_50px_100px_-30px_rgba(20,23,15,0.55),0_30px_60px_-30px_rgba(20,23,15,0.4),inset_0_0_0_1.5px_#2e3326,inset_0_0_0_5px_#0d0f0a,inset_0_0_0_6px_#3a4030]"
        style={{ transform: "scale(var(--s, 1))" }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[47px] bg-canvas">
          <LayoutGroup id={id}>{children}</LayoutGroup>
          <div className="pointer-events-none absolute top-2.5 left-1/2 z-30 h-[30px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-[#7d8474]/70" />
        </div>
        <span className="absolute top-[150px] -left-[3px] h-14 w-[3px] rounded-l bg-[#2a2f22]" />
        <span className="absolute top-[220px] -left-[3px] h-14 w-[3px] rounded-l bg-[#2a2f22]" />
        <span className="absolute top-[180px] -right-[3px] h-20 w-[3px] rounded-r bg-[#2a2f22]" />
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-[50px] items-center justify-between px-8 pt-1 text-[14px] font-semibold text-text">
      <span className="tabular">9:41</span>
      <span className="flex items-center gap-1.5">
        <CellSignalFull size={15} weight="fill" />
        <WifiHigh size={15} weight="bold" />
        <BatteryHigh size={22} weight="fill" />
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- Shared bits */

export function Artwork({ pattern, ink }: { pattern: Pattern; ink: string }) {
  let body: ReactNode;
  switch (pattern) {
    case "waves":
      body = (
        <>
          <path d="M0 66 Q 20 54 40 66 T 80 66 T 120 66 T 160 66 V 101 H 0 Z" fill={ink} fillOpacity={0.06} />
          {[74, 84, 94].map((y, i) => (
            <path
              key={y}
              d={`M0 ${y} Q 20 ${y - 12} 40 ${y} T 80 ${y} T 120 ${y} T 160 ${y}`}
              stroke={ink}
              strokeOpacity={0.12 - i * 0.03}
              strokeWidth={1.4}
              fill="none"
            />
          ))}
        </>
      );
      break;
    case "orbs":
      body = (
        <>
          <circle cx={142} cy={8} r={48} fill={ink} fillOpacity={0.07} />
          <circle cx={112} cy={92} r={26} fill={ink} fillOpacity={0.06} />
          <circle cx={150} cy={70} r={10} fill={ink} fillOpacity={0.08} />
        </>
      );
      break;
    case "stripes":
      body = (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={92 + i * 14} y1={-4} x2={164 + i * 14} y2={68} stroke={ink} strokeOpacity={0.07} strokeWidth={6} />
          ))}
        </>
      );
      break;
    case "dots":
      body = (
        <>
          {[0, 1, 2, 3, 4].flatMap((r) =>
            [0, 1, 2, 3, 4, 5].map((c) => (
              <circle key={`${r}-${c}`} cx={98 + c * 11} cy={12 + r * 11} r={1.6} fill={ink} fillOpacity={0.08 + (c / 6) * 0.14} />
            )),
          )}
        </>
      );
      break;
    case "rings":
      body = (
        <>
          {[14, 26, 38, 50].map((r) => (
            <circle key={r} cx={140} cy={80} r={r} stroke={ink} strokeOpacity={0.1} strokeWidth={1.2} fill="none" />
          ))}
        </>
      );
      break;
    default:
      body = <path d="M70 -10 C 110 30, 120 60, 170 70 L 170 -10 Z" fill={ink} fillOpacity={0.07} />;
  }
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 160 101" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {body}
    </svg>
  );
}

/** Account card at the app's ID-1 bank-card ratio. */
export function AccountCard({
  account,
  width = 176,
  currency,
  lift,
  className,
  style,
}: {
  account: DemoAccount;
  width?: number;
  currency?: Currency;
  /** On dark screens the ink card is lifted a little so it stays visible, as in the app. */
  lift?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const base = ACCOUNT_COLORS[account.color];
  const c = lift && account.color === "ink" ? { ...base, bg: "#2A3021", chip: "rgba(255,255,255,0.12)" } : base;
  const scale = width / 176;
  return (
    <div
      className={cn("relative flex shrink-0 flex-col justify-between overflow-hidden", className)}
      style={{
        width,
        aspectRatio: 85.6 / 53.98,
        backgroundColor: c.bg,
        color: c.fg,
        borderRadius: 20 * scale,
        padding: 14 * scale,
        transition: "background-color 0.5s ease, color 0.5s ease",
        ...style,
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={account.pattern}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Artwork pattern={account.pattern} ink={c.fg} />
        </motion.div>
      </AnimatePresence>
      <div className="relative flex items-center justify-between">
        <span className="grid place-items-center" style={{ width: 30 * scale, height: 30 * scale, borderRadius: 10 * scale, background: c.chip }}>
          <Glyph name={account.icon ?? account.kind} size={15 * scale} />
        </span>
        <span className="font-bold tracking-wider" style={{ color: c.muted, fontSize: 10 * scale }}>
          {account.currency}
        </span>
      </div>
      <div className="relative">
        <div style={{ color: c.muted, fontSize: 12 * scale }}>{account.name}</div>
        <div className="tabular font-bold tracking-tight" style={{ fontSize: 19 * scale, lineHeight: 1.2 }}>
          {money(account.balance, currency ?? account.currency)}
        </div>
      </div>
    </div>
  );
}

export function TxAvatar({ icon, type, size = 40 }: { icon: string; type: DemoTx["type"]; size?: number }) {
  const dot = Math.round(size * 0.4);
  return (
    <span className="relative shrink-0">
      <span className="grid place-items-center bg-surface-alt text-text" style={{ width: size, height: size, borderRadius: size * 0.32 }}>
        <Glyph name={type === "transfer" ? "swap" : icon} size={size * 0.47} />
      </span>
      <span
        className={cn(
          "absolute -right-1 -bottom-1 grid place-items-center rounded-full border-2 border-surface text-white",
          type === "income" ? "bg-income" : type === "expense" ? "bg-expense" : "bg-text-2",
        )}
        style={{ width: dot, height: dot }}
      >
        <Glyph name={type === "income" ? "in" : type === "expense" ? "out" : "swap"} size={dot * 0.55} weight="bold" />
      </span>
    </span>
  );
}

export function TxRow({ tx, currency = "BDT" }: { tx: DemoTx; currency?: Currency }) {
  const sign = tx.type === "income" ? "+" : tx.type === "expense" ? "-" : undefined;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <TxAvatar icon={tx.icon} type={tx.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14.5px] font-semibold">{tx.title}</span>
          {tx.repeat && <Glyph name="repeat" size={12} className="shrink-0 text-muted" />}
        </div>
        <div className="truncate text-[12px] text-muted">{tx.sub}</div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className={cn("tabular text-[14.5px] font-semibold", tx.type === "income" && "text-income")}>
          {money(tx.amount, currency, sign)}
        </span>
        {tx.due ? (
          <span className="mt-0.5 rounded-full bg-due-soft px-2 py-px text-[10.5px] font-semibold text-due">{tx.due}</span>
        ) : tx.usd && currency === "BDT" ? (
          <span className="tabular text-[11.5px] text-muted">{money(tx.amount, "USD")}</span>
        ) : null}
      </div>
    </div>
  );
}

const TABS = [
  { key: "home", label: "Home" },
  { key: "activity", label: "Activity" },
  { key: "dues", label: "Dues" },
  { key: "reports", label: "Reports" },
] as const;
export type TabKey = (typeof TABS)[number]["key"];

/** Floating dark tab bar; the active tab opens into a lime pill that slides between tabs. */
export function TabBar({ active, id, onSelect }: { active: TabKey; id: string; onSelect?: (k: TabKey) => void }) {
  return (
    <div aria-hidden={!onSelect} className="absolute inset-x-4 bottom-6 z-10 flex items-center gap-3">
      <div className="flex h-[60px] flex-1 items-center gap-1 rounded-full bg-ink p-2 shadow-[0_10px_28px_rgba(10,14,4,0.25)]">
        {TABS.map((t) => {
          const on = t.key === active;
          return (
            <motion.button
              key={t.key}
              layout
              type="button"
              tabIndex={onSelect ? 0 : -1}
              onClick={() => onSelect?.(t.key)}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className={cn("relative flex h-11 items-center justify-center gap-1.5 rounded-full", on ? "flex-[2.4]" : "flex-1")}
            >
              {on && (
                <motion.span
                  layoutId={`tab-pill-${id}`}
                  className="absolute inset-0 rounded-full bg-lime"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className={cn("relative", on ? "text-ink" : "text-on-ink-muted")}>
                <Glyph name={t.key} size={21} weight={on ? "fill" : "regular"} />
                {t.key === "dues" && !on && (
                  <span className="absolute -top-0.5 -right-1 size-2.5 rounded-full border-2 border-ink bg-expense" />
                )}
              </span>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                    className="relative text-[13px] font-semibold text-ink"
                  >
                    {t.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <span className="grid size-[60px] shrink-0 place-items-center rounded-full bg-lime text-ink shadow-[0_10px_24px_rgba(120,150,20,0.35)]">
        <Plus size={26} weight="bold" />
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- Screens */

export type Theme = "light" | "dark";

function Screen({ children, theme = "light" }: { children: ReactNode; theme?: Theme }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-canvas", theme === "dark" ? "theme-dark" : "theme-light")}>
      <StatusBar />
      <div className="px-[18px] pt-[62px]">{children}</div>
    </div>
  );
}

const TOTAL = 1726939;
const INCOME = 152200;
const SPENT = 401064;

export function BalanceCard({
  currency,
  hidden,
  active = true,
  onCurrency,
  onHidden,
}: {
  currency: Currency;
  hidden: boolean;
  active?: boolean;
  onCurrency?: (c: Currency) => void;
  onHidden?: () => void;
}) {
  const mask = "••••••";
  return (
    <div className="rounded-[20px] border border-(--ink-border,#14170F) bg-ink p-5 text-on-ink">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onHidden}
          tabIndex={onHidden ? 0 : -1}
          aria-hidden={!onHidden}
          className="flex items-center gap-2 text-[12.5px] text-on-ink/60"
          aria-label={hidden ? "Show balance" : "Hide balance"}
        >
          Total balance
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={hidden ? "off" : "on"}
              initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              {hidden ? <EyeSlash size={15} /> : <Eye size={15} />}
            </motion.span>
          </AnimatePresence>
        </button>
        <div className="relative flex rounded-full border border-on-ink/15 p-0.5">
          {(["BDT", "USD"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCurrency?.(c)}
              tabIndex={onCurrency ? 0 : -1}
              aria-hidden={!onCurrency}
              className={cn("relative h-[26px] min-w-[42px] rounded-full px-2 text-[12px] font-semibold transition-colors", currency === c ? "text-on-ink" : "text-on-ink/55")}
            >
              {currency === c && (
                <motion.span layoutId="ccy-pill" className="absolute inset-0 rounded-full bg-on-ink/15" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-2 h-[42px] text-[34px] leading-[42px] font-bold tracking-tight">
        <motion.div animate={{ filter: hidden ? "blur(10px)" : "blur(0px)", opacity: hidden ? 0 : 1 }} transition={{ duration: 0.45 }}>
          <Odometer value={money(TOTAL, currency)} active={active} />
        </motion.div>
        <motion.div
          className="absolute inset-0 tracking-[0.15em]"
          initial={false}
          animate={{ opacity: hidden ? 1 : 0, y: hidden ? 0 : 8 }}
          transition={{ duration: 0.35 }}
        >
          {mask}
        </motion.div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-on-ink/14 pt-4">
        {[
          { label: "Income · Nov", v: INCOME, dot: "bg-gain" },
          { label: "Spent · Nov", v: SPENT, dot: "bg-spend" },
        ].map((f) => (
          <div key={f.label}>
            <div className="flex items-center gap-1.5 text-[12px] text-on-ink/60">
              <span className={cn("size-[7px] rounded-full", f.dot)} />
              {f.label}
            </div>
            <div className="mt-0.5 text-[17px] font-semibold">
              {hidden ? mask : <Odometer value={money(f.v, currency)} active={active} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeScreen({
  currency = "BDT",
  hidden = false,
  active = true,
  theme = "light",
  onCurrency,
  onHidden,
}: {
  currency?: Currency;
  hidden?: boolean;
  active?: boolean;
  theme?: Theme;
  onCurrency?: (c: Currency) => void;
  onHidden?: () => void;
}) {
  return (
    <Screen theme={theme}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] text-text-2">Good evening</div>
          <div className="text-[26px] leading-tight font-bold tracking-tight">Welcome back</div>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-surface">
          <SlidersHorizontal size={18} />
        </span>
      </div>
      <div className="mt-4">
        <BalanceCard currency={currency} hidden={hidden} active={active} onCurrency={onCurrency} onHidden={onHidden} />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-[18px] font-bold tracking-tight">Accounts</span>
        <span className="text-[13px] text-text-2">Manage</span>
      </div>
      <div className="-mx-[18px] mt-3 flex gap-3 overflow-hidden px-[18px]">
        {ACCOUNTS.slice(0, 3).map((a) => (
          <AccountCard key={a.id} account={a} width={168} lift={theme === "dark"} />
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-[18px] font-bold tracking-tight">Recent</span>
        <span className="text-[13px] text-text-2">See all</span>
      </div>
      <div className="mt-3 overflow-hidden rounded-[20px] bg-surface py-1">
        {RECENT.slice(0, 3).map((t) => (
          <TxRow key={t.id} tx={t} currency={currency} />
        ))}
      </div>
    </Screen>
  );
}

export function ActivityScreen() {
  return (
    <Screen>
      <div className="flex items-center justify-between">
        <span className="text-[28px] font-bold tracking-tight">Activity</span>
        <span className="grid size-11 place-items-center rounded-full bg-surface">
          <SlidersHorizontal size={18} />
        </span>
      </div>
      <div className="mt-3 flex h-12 items-center gap-2.5 rounded-2xl bg-surface px-4 text-[14px] text-muted">
        <MagnifyingGlass size={17} />
        Search client, vendor, note or amount
      </div>
      <div className="mt-3 flex gap-2 overflow-hidden">
        {["All", "Income", "Expenses", "Transfers", "Unpaid"].map((c, i) => (
          <span key={c} className={cn("shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold", i === 0 ? "bg-ink text-on-ink" : "bg-surface")}>
            {c}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 rounded-[20px] bg-surface p-4">
        {[
          { l: "Money in", v: money(4719653), c: "text-income" },
          { l: "Money out", v: money(3462475), c: "" },
          { l: "Net", v: money(1257179, "BDT", "+"), c: "" },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-[12px] text-text-2">{s.l}</div>
            <div className={cn("tabular text-[14.5px] font-semibold", s.c)}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 mb-2 text-[13px] font-semibold text-text-2">Today</div>
      <div className="overflow-hidden rounded-[20px] bg-surface py-1">
        <TxRow tx={{ id: "a1", title: "City Bank → Bank account", sub: "Transfer", type: "transfer", amount: 255808, icon: "swap" }} />
        <TxRow tx={{ id: "a2", title: "City Bank → Cash", sub: "Transfer", type: "transfer", amount: 115896, icon: "swap" }} />
      </div>
      <div className="mt-5 mb-2 flex justify-between text-[13px] font-semibold text-text-2">
        <span>Yesterday</span>
        <span className="tabular">−৳22,764</span>
      </div>
      <div className="overflow-hidden rounded-[20px] bg-surface py-1">
        <TxRow tx={RECENT[1]} />
        <TxRow tx={{ id: "a3", title: "Google Workspace", sub: "Software · Business card", type: "expense", amount: 5684, icon: "cpu", usd: true }} />
      </div>
    </Screen>
  );
}

export function DueCard({
  title,
  sub,
  amount,
  chip,
  overdue,
  done,
  onMark,
}: {
  title: string;
  sub: string;
  amount: number;
  chip: string;
  overdue?: boolean;
  done?: boolean;
  onMark?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-surface">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <TxAvatar icon={overdue ? "briefcase" : "repeat"} type="income" size={44} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold">{title}</div>
          <div className="truncate text-[12px] text-muted">{sub}</div>
        </div>
        <div className="text-right">
          <div className="tabular text-[15px] font-semibold">{money(amount)}</div>
          <div className="tabular text-[11.5px] text-muted">{money(amount, "USD")}</div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
            overdue ? "bg-expense-soft text-expense" : "bg-due-soft text-due",
          )}
        >
          {overdue ? <Warning size={12} weight="bold" /> : <CalendarBlank size={12} weight="bold" />}
          {chip}
        </span>
        <button
          type="button"
          onClick={onMark}
          tabIndex={onMark ? 0 : -1}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300",
            done ? "bg-income text-white" : "bg-ink text-on-ink",
          )}
        >
          <Check size={14} weight="bold" />
          {done ? "Received" : "Mark received"}
        </button>
      </div>
    </div>
  );
}

export function DuesScreen() {
  return (
    <Screen>
      <span className="text-[28px] font-bold tracking-tight">Dues</span>
      <div className="mt-3 grid grid-cols-2 rounded-full bg-surface-alt p-1 text-[13.5px] font-semibold">
        <span className="rounded-full bg-surface py-2.5 text-center shadow-sm">To receive · 3</span>
        <span className="py-2.5 text-center text-text-2">To pay · 2</span>
      </div>
      <div className="mt-4 rounded-[20px] bg-ink p-5 text-on-ink">
        <div className="flex items-center justify-between text-[13px] text-on-ink/60">
          Clients owe you
          <span className="grid size-8 place-items-center rounded-full bg-lime/15 text-lime">
            <ArrowDownLeft size={15} weight="bold" />
          </span>
        </div>
        <div className="tabular mt-1 text-[32px] font-bold tracking-tight">{money(568500)}</div>
        <div className="mt-3 grid grid-cols-2 text-[12px] text-on-ink/60">
          <div>
            <span className="mr-1.5 inline-block size-[7px] rounded-full bg-spend" />
            Overdue · 1<div className="tabular mt-0.5 text-[15px] font-semibold text-on-ink">{money(256200)}</div>
          </div>
          <div>
            Upcoming · 2<div className="tabular mt-0.5 text-[15px] font-semibold text-on-ink">{money(312300)}</div>
          </div>
        </div>
      </div>
      <div className="mt-5 mb-2 text-[13px] font-semibold text-text-2">Overdue</div>
      <DueCard title="Northwind Labs" sub="Client Project · Due 7 Nov" amount={256200} chip="2 days overdue" overdue />
      <div className="mt-5 mb-2 text-[13px] font-semibold text-text-2">Upcoming</div>
      <DueCard title="Bluepeak Realty" sub="Monthly Retainer · Due 10 Nov" amount={219600} chip="Due tomorrow" />
    </Screen>
  );
}

/** Cumulative income/expense paths on a 300 × 150 canvas. */
const INC_PATH = "M0 150 L40 150 L52 70 L70 66 L300 66";
const EXP_PATH = "M0 34 L40 34 L80 34 L96 30 L120 30 L140 16 L300 16";

export function ReportsScreen({ active = true }: { active?: boolean }) {
  return (
    <Screen>
      <div className="flex items-center justify-between">
        <span className="text-[28px] font-bold tracking-tight">Reports</span>
        <span className="grid size-11 place-items-center rounded-full bg-surface">
          <Export size={18} />
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <div className="grid flex-1 grid-cols-2 rounded-full bg-surface-alt p-1 text-[13px] font-semibold">
          <span className="rounded-full bg-surface py-2 text-center shadow-sm">Month</span>
          <span className="py-2 text-center text-text-2">Year</span>
        </div>
        <div className="flex flex-1 items-center justify-between rounded-full bg-surface px-3 text-[13px] font-semibold">
          <CaretLeft size={13} />
          Nov 2026
          <CaretRight size={13} className="text-muted" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-[18px] bg-surface p-3.5">
          <div className="text-[12.5px] text-text-2">Income</div>
          <div className="tabular text-[18px] font-bold">{money(INCOME)}</div>
          <div className="text-[11px] font-semibold text-expense">▼ 86% vs Oct</div>
        </div>
        <div className="rounded-[18px] bg-surface p-3.5">
          <div className="text-[12.5px] text-text-2">Expenses</div>
          <div className="tabular text-[18px] font-bold">{money(SPENT)}</div>
          <div className="text-[11px] font-semibold text-income">▼ 36% vs Oct</div>
        </div>
        <div className="rounded-[18px] bg-lime p-3.5">
          <div className="text-[12.5px] font-semibold">Net profit</div>
          <div className="tabular text-[18px] font-bold">−৳2,48,864</div>
          <div className="text-[11px] text-ink/60">−164% margin</div>
        </div>
        <div className="rounded-[18px] bg-surface p-3.5">
          <div className="text-[12.5px] text-text-2">Entries</div>
          <div className="tabular text-[18px] font-bold">11</div>
          <div className="text-[11px] text-text-2">4 still due</div>
        </div>
      </div>
      <div className="mt-3 rounded-[20px] bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold">Running total</span>
          <span className="text-[12px] text-text-2">Tap to inspect</span>
        </div>
        <svg viewBox="-4 0 308 160" className="mt-3 h-[150px] w-full overflow-visible">
          {[16, 66, 116].map((y) => (
            <line key={y} x1={0} x2={300} y1={y} y2={y} stroke="#E9EBE3" />
          ))}
          <motion.path
            d={`${EXP_PATH} L300 150 L0 150 Z`}
            fill="#EB6834"
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 0.1 : 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          />
          <motion.path
            d={EXP_PATH}
            fill="none"
            stroke="#EB6834"
            strokeWidth={2.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.path
            d={INC_PATH}
            fill="none"
            stroke="#1BAF7A"
            strokeWidth={2.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
          />
        </svg>
      </div>
    </Screen>
  );
}

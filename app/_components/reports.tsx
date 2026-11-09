"use client";

import { Check, FileCsv, FilePdf } from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn, EASE, money } from "./lib";
import { Odometer, Reveal, SplitWords } from "./ui";

type View = "month" | "year";
type Point = { label: string; income: number; expense: number };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Running totals for a 30-day month and a 12-month year, deterministic so SSR matches. */
function build(view: View): Point[] {
  const r = rng(view === "month" ? 7 : 11);
  const n = view === "month" ? 30 : 12;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let inc = 0;
  let exp = 0;
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    if (view === "month") {
      if (i === 0) exp += 45000;
      if ([2, 9, 16, 24].includes(i)) inc += Math.round((60000 + r() * 90000) / 100) * 100;
      exp += r() < 0.55 ? Math.round((800 + r() * 9000) / 10) * 10 : 0;
      if (i === 14) exp += 38000;
    } else {
      inc += Math.round((300000 + r() * 260000) / 100) * 100;
      exp += Math.round((220000 + r() * 160000) / 100) * 100;
    }
    out.push({ label: view === "month" ? `${i + 1} Nov` : months[i], income: inc, expense: exp });
  }
  return out;
}

/** Monotone cubic through the points (no overshoot, so running totals never dip). */
function monotonePath(pts: [number, number][]) {
  const n = pts.length;
  if (n < 2) return "";
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    m.push((pts[i + 1][1] - pts[i][1]) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += ` C${x0 + h},${y0 + t[i] * h} ${x1 - h},${y1 - t[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

/** Round axis step (1, 2, 2.5 or 5 × 10ⁿ) so four steps cover `top`. */
function niceStep(top: number) {
  const raw = top / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function compact(n: number) {
  if (n >= 1e7) return `৳${+(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `৳${+(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `৳${Math.round(n / 1e3)}k`;
  return `৳${n}`;
}

const PAD = { l: 52, r: 14, t: 20, b: 32 };

function ExportButton({ kind }: { kind: "pdf" | "csv" }) {
  const [busy, setBusy] = useState(0);
  const Icon = kind === "pdf" ? FilePdf : FileCsv;
  return (
    <button
      type="button"
      onClick={() => {
        if (busy) return;
        const id = Date.now();
        setBusy(id);
        setTimeout(() => setBusy(0), 1800);
      }}
      className="relative flex h-10 items-center gap-2 rounded-full bg-surface-alt px-4 text-[13px] font-semibold transition-colors hover:bg-sunken"
    >
      <AnimatePresence>
        {busy !== 0 && (
          <motion.span
            key={busy}
            initial={{ y: 0, opacity: 0, scale: 0.6, rotate: 0 }}
            animate={{ y: -70, opacity: [0, 1, 1, 0], scale: 1, rotate: kind === "pdf" ? -10 : 10 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="pointer-events-none absolute left-1/2 -ml-5 grid h-12 w-10 place-items-center rounded-lg bg-surface text-ink shadow-[0_12px_30px_-10px_rgba(20,23,15,0.4)] ring-1 ring-line"
          >
            <Icon size={20} weight="duotone" />
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={busy ? "y" : "n"}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          className="flex items-center gap-2"
        >
          {busy ? <Check size={15} weight="bold" className="text-income" /> : <Icon size={16} />}
          {busy ? "Exported" : kind === "pdf" ? "PDF report" : "CSV"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Reports() {
  const [view, setView] = useState<View>("month");
  const [show, setShow] = useState({ income: true, expense: true });
  const [hover, setHover] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, margin: "0px 0px -20% 0px" });
  /* Drawn in real pixels so labels stay readable at any width. */
  const [W, setW] = useState(1000);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = Math.round(Math.min(400, Math.max(280, W * 0.42)));
  const narrow = W < 560;
  const data = useMemo(() => build(view), [view]);
  const last = data[data.length - 1];
  const step = niceStep(Math.max(last.income, last.expense));
  const max = step * 4 * 1.04;
  const n = data.length;
  const xAt = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const yAt = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
  const incPts = data.map((p, i) => [xAt(i), yAt(p.income)] as [number, number]);
  const expPts = data.map((p, i) => [xAt(i), yAt(p.expense)] as [number, number]);
  const incPath = monotonePath(incPts);
  const expPath = monotonePath(expPts);
  const base = `L${xAt(n - 1)},${H - PAD.b} L${xAt(0)},${H - PAD.b} Z`;
  const ticks = [0, 1, 2, 3, 4].map((k) => step * k);

  const idx = hover ?? n - 1;
  const cur = data[idx];
  const net = cur.income - cur.expense;
  /* Crosshair position as a 0–1 fraction of the plot width, so it survives resizes. */
  const tipF = useMotionValue(1);
  const tipFs = useSpring(tipF, { stiffness: 500, damping: 40 });
  const tipLeft = useTransform(tipFs, (f) => `calc(${PAD.l}px + (100% - ${PAD.l + PAD.r}px) * ${f})`);

  const onMove = (clientX: number) => {
    const el = chartRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - PAD.l) / (r.width - PAD.l - PAD.r)) * (n - 1));
    const c = Math.max(0, Math.min(n - 1, i));
    setHover(c);
    tipF.set(c / (n - 1));
  };

  const kpis = [
    { label: "Income", v: money(last.income), sub: view === "month" ? "▲ 12% vs Oct" : "▲ 18% vs 2025", tone: "text-income" },
    { label: "Expenses", v: money(last.expense), sub: view === "month" ? "▼ 8% vs Oct" : "▲ 4% vs 2025", tone: "text-income" },
    { label: "Net profit", v: money(last.income - last.expense), sub: `${Math.round(((last.income - last.expense) / last.income) * 100)}% margin`, tone: "text-ink/60", lime: true },
    { label: "Entries", v: view === "month" ? "48" : "571", sub: view === "month" ? "4 still due" : "9 still due", tone: "text-text-2" },
  ];

  return (
    <section id="reports" className="relative px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SplitWords text={"Reports that answer\nreal questions."} className="text-[clamp(2.6rem,5.6vw,4.6rem)]" />
          </div>
          <Reveal delay={0.15} className="text-[17px] leading-relaxed text-text-2 lg:col-span-4 lg:col-start-9">
            How much came in this month? Where did it go? Are you ahead of last month? Drag across the chart to check
            any day, then export a PDF or CSV for your accountant.
          </Reveal>
        </div>

        <Reveal y={70}>
          <div className="rounded-[40px] bg-surface p-4 shadow-[0_50px_100px_-50px_rgba(20,23,15,0.35)] ring-1 ring-line md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 px-2 pt-1 pb-5">
              <div className="flex items-center gap-3">
                <LayoutGroup id="rep-view">
                  <div className="grid grid-cols-2 rounded-full bg-surface-alt p-1">
                    {(["month", "year"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setView(v);
                          setHover(null);
                          tipF.set(1);
                        }}
                        className={cn("relative h-9 rounded-full px-5 text-[13.5px] font-semibold capitalize", view === v ? "text-ink" : "text-text-2")}
                      >
                        {view === v && (
                          <motion.span layoutId="rep-pill" className="absolute inset-0 rounded-full bg-surface shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                        )}
                        <span className="relative">{v}</span>
                      </button>
                    ))}
                  </div>
                </LayoutGroup>
                <span className="text-[15px] font-semibold">{view === "month" ? "Nov 2026" : "2026"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["income", "expense"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
                    className={cn("flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold ring-1 ring-line transition-opacity", !show[k] && "opacity-40")}
                  >
                    <span className={cn("size-2.5 rounded-full", k === "income" ? "bg-chart-income" : "bg-chart-expense")} />
                    <span className={cn(!show[k] && "line-through")}>{k === "income" ? "Income" : "Expenses"}</span>
                  </button>
                ))}
                <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
                <ExportButton kind="pdf" />
                <ExportButton kind="csv" />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {kpis.map((k) => (
                  <div key={k.label} className={cn("rounded-[24px] p-5", k.lime ? "bg-lime" : "bg-surface-alt")}>
                    <div className={cn("text-[13px]", k.lime ? "font-semibold" : "text-text-2")}>{k.label}</div>
                    <div className="mt-1 text-[24px] font-normal tracking-[-0.03em] md:text-[28px]">
                      <Odometer value={k.v} active={inView} />
                    </div>
                    <div className={cn("mt-0.5 text-[12px] font-semibold", k.tone)}>{k.sub}</div>
                  </div>
                ))}
              </div>

              <div className="relative rounded-[28px] bg-surface-alt/50 p-3 md:p-5">
                <div
                  ref={chartRef}
                  className="relative cursor-crosshair touch-pan-y select-none"
                  onPointerMove={(e) => onMove(e.clientX)}
                  onPointerDown={(e) => onMove(e.clientX)}
                  onPointerLeave={() => {
                    setHover(null);
                    tipF.set(1);
                  }}
                >
                  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block w-full overflow-visible">
                    <defs>
                      <linearGradient id="g-inc" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="#1BAF7A" stopOpacity="0.22" />
                        <stop offset="1" stopColor="#1BAF7A" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="g-exp" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="#EB6834" stopOpacity="0.2" />
                        <stop offset="1" stopColor="#EB6834" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {ticks.map((t) => (
                      <g key={t}>
                        <line x1={PAD.l} x2={W - PAD.r} y1={yAt(t)} y2={yAt(t)} stroke="#E4E7DC" strokeDasharray={t === 0 ? undefined : "4 6"} />
                        <text x={PAD.l - 12} y={yAt(t) + 4} textAnchor="end" className="fill-muted text-[12px]">
                          {compact(t)}
                        </text>
                      </g>
                    ))}
                    {data.map((p, i) =>
                      i % (view === "month" ? (narrow ? 10 : 5) : narrow ? 3 : 1) === 0 || i === n - 1 ? (
                        <text key={p.label} x={xAt(i)} y={H - 8} textAnchor="middle" className="fill-muted text-[12px]">
                          {view === "month" ? p.label.split(" ")[0] : p.label}
                        </text>
                      ) : null,
                    )}

                    <AnimatePresence mode="wait">
                      <motion.g key={view} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                        {show.expense && (
                          <>
                            <motion.path
                              d={`${expPath} ${base}`}
                              fill="url(#g-exp)"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: inView ? 1 : 0 }}
                              transition={{ duration: 1, delay: 0.6 }}
                            />
                            <motion.path
                              d={expPath}
                              fill="none"
                              stroke="#EB6834"
                              strokeWidth={3}
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: inView ? 1 : 0 }}
                              transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
                            />
                          </>
                        )}
                        {show.income && (
                          <>
                            <motion.path
                              d={`${incPath} ${base}`}
                              fill="url(#g-inc)"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: inView ? 1 : 0 }}
                              transition={{ duration: 1, delay: 0.7 }}
                            />
                            <motion.path
                              d={incPath}
                              fill="none"
                              stroke="#1BAF7A"
                              strokeWidth={3}
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: inView ? 1 : 0 }}
                              transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.12 }}
                            />
                          </>
                        )}
                      </motion.g>
                    </AnimatePresence>

                    {inView && show.income && (
                      <motion.circle r={7} fill="#fff" stroke="#1BAF7A" strokeWidth={3} animate={{ cx: incPts[idx][0], cy: incPts[idx][1] }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                    )}
                    {inView && show.expense && (
                      <motion.circle r={7} fill="#fff" stroke="#EB6834" strokeWidth={3} animate={{ cx: expPts[idx][0], cy: expPts[idx][1] }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                    )}
                  </svg>

                  <motion.div
                    aria-hidden
                    style={{ left: tipLeft, top: PAD.t, bottom: PAD.b }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: inView ? 1 : 0 }}
                    transition={{ delay: 1.4 }}
                    className="pointer-events-none absolute w-0 border-l border-dashed border-ink/25"
                  />
                  <motion.div
                    style={{ left: tipLeft }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: inView ? 1 : 0 }}
                    transition={{ delay: 1.5 }}
                    className={cn(
                      "pointer-events-none absolute top-0 w-[190px] rounded-2xl bg-ink p-3.5 text-on-ink shadow-xl",
                      idx > n * 0.6 ? "-translate-x-[calc(100%+14px)]" : "translate-x-[14px]",
                    )}
                  >
                    <div className="text-[12px] text-on-ink/55">By {cur.label}</div>
                    <div className="mt-2 space-y-1 text-[13px]">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-chart-income" />
                          In
                        </span>
                        <span className="tabular font-semibold">{money(cur.income)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-chart-expense" />
                          Out
                        </span>
                        <span className="tabular font-semibold">{money(cur.expense)}</span>
                      </div>
                      <div className="flex justify-between border-t border-on-ink/15 pt-1.5">
                        <span className="text-on-ink/60">Net</span>
                        <span className={cn("tabular font-semibold", net >= 0 ? "text-gain" : "text-spend")}>
                          {money(net, "BDT", net >= 0 ? "+" : "-")}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import {
  ArrowsClockwise,
  CheckCircle,
  Clock,
  DeviceMobile,
  FileArchive,
  FileText,
  Fingerprint,
  GoogleDriveLogo,
  LockSimple,
  Table,
  WifiSlash,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";

import { scrollToY } from "./chrome";
import { cn, EASE, money } from "./lib";
import { Reveal, SplitWords } from "./ui";

/* ---------------------------------------------------------------- Steps */

const STEPS = [
  {
    title: "Saved on your phone",
    body: "Every entry is written to a database on the device first. No connection needed, nothing sent anywhere.",
    status: "Saved on this phone",
  },
  {
    title: "Packed into one small file",
    body: "A few minutes after your last change, the app bundles your books into a single compressed file, usually 5–10× smaller.",
    status: "Compressing",
  },
  {
    title: "Uploaded to a hidden folder",
    body: "The file goes to Google Drive’s private app folder in your own account, marked as pending. Only Money Manager can open that folder.",
    status: "Uploading",
  },
  {
    title: "Checked before it counts",
    body: "The app compares the file’s size and MD5 checksum with what Drive actually stored. Only an exact match is marked verified.",
    status: "Verifying",
  },
  {
    title: "Then the old copy steps aside",
    body: "Yesterday’s backup becomes your safety copy and the oldest one is removed. You always keep two, and a failed upload never touches either.",
    status: "Backed up",
  },
];

const N = STEPS.length;
/** Progress at which step i starts / ends. */
const at = (i: number, f = 0) => (i + f) / N;

const ROWS: { t: string; v: number; in?: boolean }[] = [
  { t: "Northwind Labs", v: 256200, in: true },
  { t: "Adobe CC", v: 17080 },
  { t: "Office rent", v: 45000 },
  { t: "Lumen Studio", v: 92700, in: true },
  { t: "Team lunch", v: 3250 },
];

const MD5 = "9f2c41abe07da71e";

/* ---------------------------------------------------------------- Stage */

/** 640 × 460 scene, scaled with --k so every coordinate below is fixed. */
function Stage({ p, step }: { p: MotionValue<number>; step: number }) {
  // Step 1: a new row lands at the top of the phone's list.
  const newRowY = useTransform(p, [0.02, 0.12], [-24, 0]);
  const newRowO = useTransform(p, [0.02, 0.1], [0, 1]);
  const newRowGlow = useTransform(p, [0.1, 0.22], ["rgba(212,242,92,0.9)", "rgba(212,242,92,0.12)"]);
  const newRowInk = useTransform(p, [0.1, 0.22], ["#11140D", "#F4F7EC"]);

  // Step 2: the books are copied (they stay on the phone) into one file; its size counts down.
  const listScale = useTransform(p, [at(1, 0.05), at(1, 0.35), at(1, 0.7)], [1, 0.96, 1]);
  const listO = useTransform(p, [at(1, 0.05), at(1, 0.35), at(1, 0.7)], [1, 0.45, 1]);
  const fileScale = useTransform(p, [at(1, 0.3), at(1, 0.8)], [0, 1]);
  const fileLift = useTransform(p, [at(1, 0.3), at(1, 0.8)], [-60, 0]);
  const sizeKB = useTransform(p, [at(1, 0.3), at(1, 0.95)], [1420, 184]);
  const sizeText = useTransform(sizeKB, (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} MB` : `${Math.round(v)} KB`));

  // Step 3: the file travels phone → Drive along the wire; older files make room.
  const fileX = useTransform(p, [at(2, 0.05), at(2, 0.5), at(2, 0.95)], [6, 220, 416]);
  const travelY = useTransform(p, [at(2, 0.05), at(2, 0.5), at(2, 0.95)], [336, 214, 112]);
  const fileY = useTransform([travelY, fileLift], ([a, b]: number[]) => a + b);
  const wireGlow = useTransform(p, [at(2, 0.15), at(2, 0.5), at(2, 0.85)], [0.2, 1, 0.2]);
  const oldY = useTransform(p, [at(2, 0.5), at(2, 0.95)], [112, 176]);
  const safeY = useTransform(p, [at(2, 0.5), at(2, 0.95)], [176, 240]);

  // Step 4: checksum check panel.
  const checkO = useTransform(p, [at(3, 0), at(3, 0.15), at(4, 0.6), at(4, 0.9)], [0, 1, 1, 0.35]);
  const checkY = useTransform(p, [at(3, 0), at(3, 0.15)], [20, 0]);
  const [typed, setTyped] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const k = Math.round(Math.min(1, Math.max(0, (v - at(3, 0.1)) / (at(3, 0.75) - at(3, 0.1)))) * MD5.length);
    setTyped((t) => (t === k ? t : k));
  });

  // Step 5: the oldest copy leaves.
  const safeO = useTransform(p, [at(4, 0.2), at(4, 0.6)], [1, 0]);
  const safeX = useTransform(p, [at(4, 0.2), at(4, 0.6)], [0, 46]);

  const verified = typed === MD5.length && step >= 3;
  const rotated = step >= 4;

  return (
    <div className="relative h-[460px] w-[640px]">
      {/* Phone */}
      <div className="absolute top-10 left-0 h-[420px] w-[220px] rounded-[30px] bg-ink-2 p-3 ring-1 ring-on-ink/10">
        <div className="flex items-center justify-between px-1 pt-1 text-[11.5px] text-on-ink-muted">
          <span className="flex items-center gap-1.5 text-on-ink">
            <DeviceMobile size={14} /> This phone
          </span>
          <WifiSlash size={14} />
        </div>
        <motion.div style={{ scale: listScale, opacity: listO }} className="mt-3 space-y-1.5">
          <motion.div
            style={{ y: newRowY, opacity: newRowO, backgroundColor: newRowGlow, color: newRowInk }}
            className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[11.5px]"
          >
            <span>Coffee</span>
            <span className="tabular">−৳450</span>
          </motion.div>
          {ROWS.map((r) => (
            <div key={r.t} className="flex items-center justify-between rounded-lg bg-on-ink/[0.05] px-2.5 py-2 text-[11.5px]">
              <span className="truncate text-on-ink/80">{r.t}</span>
              <span className={cn("tabular", r.in ? "text-gain" : "text-on-ink/60")}>
                {r.in ? "+" : "−"}
                {money(r.v).replace("−", "")}
              </span>
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-x-3 bottom-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center gap-1.5 rounded-full bg-on-ink/[0.07] py-1.5 text-[11px] font-medium text-on-ink"
            >
              {step === N - 1 ? <CheckCircle size={13} weight="fill" className="text-gain" /> : step === 0 ? <CheckCircle size={13} weight="fill" className="text-lime" /> : <ArrowsClockwise size={12} className="animate-spin" />}
              {STEPS[step].status}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Wire */}
      <svg className="absolute top-0 left-0 h-full w-full overflow-visible" aria-hidden>
        <path d="M220 236 C 290 236, 330 140, 400 140" stroke="rgba(244,247,236,0.18)" strokeDasharray="4 6" fill="none" />
        <motion.path d="M220 236 C 290 236, 330 140, 400 140" stroke="#D4F25C" strokeWidth={1.5} fill="none" style={{ opacity: wireGlow }} />
      </svg>

      {/* Drive */}
      <div className="absolute top-10 right-0 h-[280px] w-[240px] rounded-[24px] bg-ink-2 ring-1 ring-on-ink/10">
        <div className="flex items-center gap-2 px-4 pt-4 text-[12.5px] font-medium text-on-ink">
          <GoogleDriveLogo size={16} weight="fill" className="text-lime" /> App folder
          <span className="ml-auto flex items-center gap-1 text-[11px] text-on-ink-muted">
            <LockSimple size={11} /> hidden
          </span>
        </div>
      </div>

      {/* Files inside Drive (stage coordinates) */}
      <motion.div style={{ y: oldY }} className="absolute top-0 left-[416px] w-[208px]">
        <FileSlot title={rotated ? "Safety copy" : "Latest backup"} sub="yesterday" state="verified" />
      </motion.div>
      <motion.div style={{ y: safeY, x: safeX, opacity: safeO }} className="absolute top-0 left-[416px] w-[208px]">
        <FileSlot title="Safety copy" sub="Monday" state="old" />
      </motion.div>

      {/* The new backup file */}
      <motion.div style={{ x: fileX, y: fileY, scale: fileScale }} className="absolute top-0 left-0 z-10 w-[208px] origin-left">
        <FileSlot
          title={rotated ? "Latest backup" : "New backup"}
          sub={<motion.span>{sizeText}</motion.span>}
          state={verified ? "verified" : step >= 2 ? "pending" : "local"}
          highlight
        />
      </motion.div>

      {/* Checksum */}
      <motion.div
        style={{ opacity: checkO, y: checkY }}
        className="absolute top-[340px] left-[236px] w-[388px] rounded-[20px] bg-ink-2 p-4 ring-1 ring-on-ink/10"
      >
        {[
          { label: "On phone", value: MD5, n: MD5.length },
          { label: "In Drive", value: MD5, n: typed },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between py-1 text-[12px]">
            <span className="w-20 text-on-ink-muted">{r.label}</span>
            <span className="tabular flex-1 tracking-[0.08em]">
              {r.value.split("").map((ch, i) => (
                <span
                  key={i}
                  className={cn(
                    "transition-colors duration-200",
                    i < r.n ? (r.label === "In Drive" ? "text-gain" : "text-on-ink") : "text-on-ink/15",
                    i % 4 === 3 && "mr-1.5",
                  )}
                >
                  {i < r.n ? ch : "•"}
                </span>
              ))}
            </span>
            <span className="w-5">
              {r.n === MD5.length && <CheckCircle size={15} weight="fill" className="text-gain" />}
            </span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t border-on-ink/10 pt-2 text-[11.5px] text-on-ink-muted">
          <span>MD5 checksum</span>
          <span>{verified ? "Match, marked verified" : "Comparing…"}</span>
        </div>
      </motion.div>
    </div>
  );
}

function FileSlot({
  title,
  sub,
  state,
  highlight,
}: {
  title: string;
  sub: React.ReactNode;
  state: "local" | "pending" | "verified" | "old";
  highlight?: boolean;
}) {
  const badge = {
    local: { t: "On phone", c: "bg-on-ink/10 text-on-ink-muted" },
    pending: { t: "Pending", c: "bg-due/20 text-[#F2B544]" },
    verified: { t: "Verified", c: "bg-gain/15 text-gain" },
    old: { t: "Oldest", c: "bg-on-ink/10 text-on-ink-muted" },
  }[state];
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-2xl p-2.5 ring-1",
        highlight ? "bg-[#2a3021] ring-lime/30 shadow-[0_16px_30px_-12px_rgba(0,0,0,0.6)]" : "bg-on-ink/[0.05] ring-on-ink/5",
      )}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", highlight ? "bg-lime text-ink" : "bg-on-ink/10 text-on-ink")}>
        <FileArchive size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-medium text-on-ink">{title}</div>
        <div className="tabular text-[11px] text-on-ink-muted">{sub}</div>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={badge.t}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-medium", badge.c)}
        >
          {badge.t}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- Sequence */

function StepItem({ i, p, active, onClick }: { i: number; p: MotionValue<number>; active: boolean; onClick: () => void }) {
  const fill = useTransform(p, [at(i), at(i + 1)], [0, 1]);
  const s = STEPS[i];
  return (
    <li className="relative pl-6">
      <span className="absolute top-0 bottom-0 left-0 w-[2px] overflow-hidden rounded-full bg-on-ink/10">
        <motion.span className="block h-full w-full origin-top bg-lime" style={{ scaleY: fill }} />
      </span>
      <button type="button" onClick={onClick} className="block w-full py-3 text-left">
        <span className={cn("block text-[19px] tracking-[-0.01em] transition-colors duration-300", active ? "text-on-ink" : "text-on-ink/40 hover:text-on-ink/70")}>
          {s.title}
        </span>
        <AnimatePresence initial={false}>
          {active && (
            <motion.span
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="block overflow-hidden"
            >
              <span className="block max-w-[400px] pt-2 text-[15px] leading-relaxed text-on-ink-muted">{s.body}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </li>
  );
}

function BackupSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const s = Math.min(N - 1, Math.max(0, Math.floor(v * N * 0.9999)));
    setStep((cur) => (cur === s ? cur : s));
  });

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (el.offsetHeight - window.innerHeight) * ((i + 0.55) / N));
  };

  return (
    <div ref={ref} className="relative" style={{ height: `${N * 70 + 30}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="grid w-full items-center gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="mb-4 text-[14px] text-on-ink-muted">What happens when backup is on</p>
            <ol className="hidden lg:block">
              {STEPS.map((_, i) => (
                <StepItem key={i} i={i} p={p} active={i === step} onClick={() => go(i)} />
              ))}
            </ol>
            {/* Compact: just the active step on small screens */}
            <div className="min-h-[120px] lg:hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                  <div className="text-[22px] tracking-[-0.02em] text-on-ink">{STEPS[step].title}</div>
                  <p className="mt-2 text-[15px] leading-relaxed text-on-ink-muted">{STEPS[step].body}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-300", i <= step ? "bg-lime" : "bg-on-ink/15")} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-7">
            <div className="[--k:0.52] sm:[--k:0.75] lg:[--k:0.9] xl:[--k:1.08]" style={{ width: "calc(640px * var(--k))", height: "calc(460px * var(--k))" }}>
              <div className="origin-top-left" style={{ transform: "scale(var(--k))" }}>
                <Stage p={p} step={step} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Cards */

function LockCard() {
  const [run, setRun] = useState(0);
  return (
    <div
      onPointerEnter={() => setRun((r) => r + 1)}
      className="group flex h-full flex-col rounded-[28px] bg-ink-2 p-6 ring-1 ring-on-ink/[0.07]"
    >
      <div className="relative grid h-40 place-items-center">
        <svg viewBox="0 0 120 120" className="absolute size-32 -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r="52" stroke="rgba(244,247,236,0.1)" strokeWidth="4" fill="none" />
          <motion.circle
            key={run}
            cx="60"
            cy="60"
            r="52"
            stroke="#D4F25C"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: run ? 0 : 1 }}
            transition={{ duration: 1.6, ease: "linear" }}
          />
        </svg>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={run}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1, 1], opacity: 1 }}
            transition={{ duration: 1.8, times: [0, 0.1, 1] }}
            className="grid size-14 place-items-center rounded-2xl bg-on-ink/10 text-on-ink"
          >
            <motion.span initial={{ rotate: 0 }} animate={{ rotate: run ? [0, 0, -12, 0] : 0 }} transition={{ duration: 1.9, times: [0, 0.85, 0.92, 1] }}>
              {run ? <LockSimple size={24} weight="fill" /> : <Fingerprint size={26} />}
            </motion.span>
          </motion.span>
        </AnimatePresence>
        <span className="absolute bottom-0 flex items-center gap-1 text-[12px] text-on-ink-muted">
          <Clock size={12} /> 30 seconds away, then locked
        </span>
      </div>
      <h3 className="mt-6 text-[20px] tracking-[-0.02em]">Locks on its own</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-on-ink-muted">
        Face ID, fingerprint or passcode when you open the app, and again after 30 seconds in the background. The app
        switcher shows a blank screen, not your balance.
      </p>
    </div>
  );
}

function ScopeCard() {
  return (
    <div className="group flex h-full flex-col rounded-[28px] bg-ink-2 p-6 ring-1 ring-on-ink/[0.07]">
      <div className="relative grid h-40 grid-cols-4 content-center gap-2 px-2">
        {Array.from({ length: 12 }, (_, i) => {
          const ours = i === 6;
          return (
            <span
              key={i}
              className={cn(
                "relative grid h-10 place-items-center rounded-xl transition-all duration-500",
                ours
                  ? "bg-lime text-ink group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(212,242,92,0.45)]"
                  : "bg-on-ink/[0.06] text-on-ink/25 group-hover:opacity-40",
              )}
              style={{ transitionDelay: ours ? "0ms" : `${(i % 4) * 40}ms` }}
            >
              {ours ? <Table size={18} weight="bold" /> : <FileText size={16} />}
              {!ours && <LockSimple size={10} className="absolute right-1.5 bottom-1.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
            </span>
          );
        })}
      </div>
      <h3 className="mt-6 text-[20px] tracking-[-0.02em]">Sees only its own files</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-on-ink-muted">
        Sheets sync uses Google’s narrow drive.file permission, and backups sit in the hidden app folder. The app can’t
        browse or read anything else in your Drive.
      </p>
    </div>
  );
}

const SHEET = [
  ["9 Nov", "Northwind Labs", "+৳2,56,200"],
  ["9 Nov", "Adobe CC", "−৳17,080"],
  ["8 Nov", "Office rent", "−৳45,000"],
];

function SheetCard() {
  const [n, setN] = useState(0);
  return (
    <div onPointerEnter={() => setN((x) => x + 1)} className="group flex h-full flex-col rounded-[28px] bg-ink-2 p-6 ring-1 ring-on-ink/[0.07]">
      <div className="flex h-40 flex-col justify-center">
        <div className="overflow-hidden rounded-xl bg-surface text-ink">
          <div className="flex items-center justify-between border-b border-line px-3 py-2 text-[11.5px] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="grid size-5 place-items-center rounded bg-[#1E8E3E] text-white">
                <Table size={11} weight="bold" />
              </span>
              Money Manager
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10.5px] text-text-2">
                {n ? "Synced just now" : "Synced"}
              </motion.span>
            </AnimatePresence>
          </div>
          {SHEET.map((r, i) => (
            <motion.div
              key={`${n}-${i}`}
              initial={i === 0 && n ? { backgroundColor: "rgba(212,242,92,1)" } : false}
              animate={{ backgroundColor: "rgba(212,242,92,0)" }}
              transition={{ duration: 1.4, delay: 0.1 }}
              className="grid grid-cols-[44px_1fr_auto] gap-2 border-b border-line/70 px-3 py-1.5 text-[11px] last:border-0"
            >
              <span className="text-text-2">{r[0]}</span>
              <span className="truncate">{r[1]}</span>
              <span className={cn("tabular", r[2].startsWith("+") ? "text-income" : "")}>{r[2]}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <h3 className="mt-6 text-[20px] tracking-[-0.02em]">A spreadsheet you own</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-on-ink-muted">
        Turn on Sheets sync and new entries reach a Google Sheet in your Drive about 4 seconds after you save. Edit it
        there and the changes merge back.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Section */

export function Security() {
  return (
    <section id="security" className="px-3 md:px-5">
      <div className="relative overflow-clip rounded-[32px] bg-ink px-5 pt-24 pb-20 text-on-ink md:rounded-[44px] md:px-10 md:pt-32 md:pb-28">
        <div className="relative mx-auto max-w-[1240px]">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SplitWords text={"Your books stay\non your phone."} className="text-[clamp(2.6rem,5.6vw,4.6rem)]" />
            </div>
            <Reveal delay={0.15} className="text-[17px] leading-relaxed text-on-ink-muted lg:col-span-4 lg:col-start-9">
              There are no Money Manager servers holding your data. Backup is optional and goes to your own Google
              Drive. Scroll to see exactly what happens when it runs.
            </Reveal>
          </div>

          <BackupSequence />

          <p className="mx-auto mt-4 max-w-[640px] text-center text-[14px] leading-relaxed text-on-ink-muted">
            Restoring works the same way in reverse: the app checks the file’s format, version and SHA-256 checksum
            before replacing anything, and keeps an undo copy of what was on the phone.
          </p>

          <div className="mt-20 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Reveal y={40}>
              <LockCard />
            </Reveal>
            <Reveal y={40} delay={0.08}>
              <ScopeCard />
            </Reveal>
            <Reveal y={40} delay={0.16}>
              <SheetCard />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

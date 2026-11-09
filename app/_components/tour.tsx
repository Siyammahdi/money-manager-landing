"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";

import { scrollToY } from "./chrome";
import { cn, EASE } from "./lib";
import { ActivityScreen, DuesScreen, HomeScreen, Phone, ReportsScreen, TabBar, type TabKey } from "./phone";
const STEPS: { key: TabKey; tab: string; title: string; body: string; tint: string; points: string[] }[] = [
  {
    key: "home",
    tab: "Home",
    title: "Your whole balance at a glance.",
    body: "Open the app and see what you have across every account, what came in and went out this month, and your latest entries.",
    tint: "#D4F25C",
    points: ["Switch BDT / USD", "Hide the balance", "Monthly budget"],
  },
  {
    key: "activity",
    tab: "Activity",
    title: "Every entry, easy to find.",
    body: "Search by client, vendor, note, amount or account. Narrow it down by type, status, month or category.",
    tint: "#D2E3F7",
    points: ["Search everything", "Filter by month", "Grouped by day"],
  },
  {
    key: "dues",
    tab: "Dues",
    title: "Money coming in, and going out.",
    body: "What clients owe you and what you still have to pay, with overdue items first. Mark one settled the moment the money moves.",
    tint: "#F8D5C8",
    points: ["Overdue first", "To receive and to pay", "One-tap settle"],
  },
  {
    key: "reports",
    tab: "Reports",
    title: "Your month, in clear numbers.",
    body: "Income, expenses and profit compared with last month, a running total, and where the money went by category.",
    tint: "#E3DAF7",
    points: ["Compared with last month", "PDF and CSV export", "By category"],
  },
];

function StepTab({
  i,
  progress,
  active,
  label,
  onClick,
}: {
  i: number;
  progress: MotionValue<number>;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const fill = useTransform(progress, [i / STEPS.length, (i + 1) / STEPS.length], [0, 1]);
  return (
    <button type="button" onClick={onClick} className="group flex-1 text-left">
      <div className="h-[3px] overflow-hidden rounded-full bg-ink/10">
        <motion.div className="h-full origin-left rounded-full bg-ink" style={{ scaleX: fill }} />
      </div>
      <div className={cn("mt-3 text-[13.5px] font-medium transition-colors duration-300", active ? "text-ink" : "text-muted group-hover:text-text-2")}>
        {label}
      </div>
    </button>
  );
}

export function Tour() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);
  const panelScale = useTransform(scrollYProgress, [0, 0.12], [0.86, 1]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const s = Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length * 0.999)));
    if (s !== step) {
      setDir(s > step ? 1 : -1);
      setStep(s);
    }
  });

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    scrollToY(top + span * ((i + 0.5) / STEPS.length));
  };

  const s = STEPS[step];

  return (
    <section id="tour" ref={ref} className="relative" style={{ height: `${STEPS.length * 100 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-5 md:px-8">
        <div className="mx-auto grid w-full max-w-[1240px] items-center gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="relative min-h-[150px] md:min-h-[250px]">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={s.key}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ y: d * 50, opacity: 0, filter: "blur(10px)" }),
                    center: { y: 0, opacity: 1, filter: "blur(0px)" },
                    exit: (d: number) => ({ y: d * -50, opacity: 0, filter: "blur(10px)" }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <h2 className="display text-[clamp(2.1rem,4.6vw,3.8rem)]">{s.title}</h2>
                  <p className="mt-4 hidden max-w-[440px] text-[17px] leading-relaxed text-text-2 md:block">{s.body}</p>
                  <div className="mt-6 hidden flex-wrap gap-2 md:flex">
                    {s.points.map((p, i) => (
                      <motion.span
                        key={p}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: EASE }}
                        className="rounded-full bg-surface px-3.5 py-1.5 text-[13px] font-semibold ring-1 ring-line"
                      >
                        {p}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex gap-4 md:mt-10">
              {STEPS.map((st, i) => (
                <StepTab key={st.key} i={i} progress={scrollYProgress} active={i === step} label={st.tab} onClick={() => go(i)} />
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:col-span-7">
            <motion.div
              aria-hidden
              style={{ scale: panelScale }}
              animate={{ backgroundColor: s.tint }}
              transition={{ duration: 0.8, ease: EASE }}
              className="absolute top-1/2 left-1/2 aspect-square w-[min(92vw,620px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[64px]"
            />
            <motion.div style={{ rotate: phoneRotate }} className="relative">
              <Phone className="[--s:0.56] sm:[--s:0.66] lg:[--s:0.8]">
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <motion.div
                    key={s.key}
                    custom={dir}
                    variants={{
                      enter: (d: number) => ({ x: d * 60, opacity: 0, scale: 0.97 }),
                      center: { x: 0, opacity: 1, scale: 1 },
                      exit: (d: number) => ({ x: d * -60, opacity: 0, scale: 0.97 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.55, ease: EASE }}
                    className="absolute inset-0"
                  >
                    {s.key === "home" && <HomeScreen />}
                    {s.key === "activity" && <ActivityScreen />}
                    {s.key === "dues" && <DuesScreen />}
                    {s.key === "reports" && <ReportsScreen />}
                  </motion.div>
                </AnimatePresence>
                <TabBar active={s.key} id="tour" onSelect={(k) => go(STEPS.findIndex((x) => x.key === k))} />
              </Phone>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

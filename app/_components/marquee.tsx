"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";

import { Glyph } from "./icons";
import { cn, money } from "./lib";

type Item = { icon: string; label: string; amount: number; type: "income" | "expense" | "transfer"; usd?: boolean };

const ROW_A: Item[] = [
  { icon: "briefcase", label: "Northwind Labs", amount: 256200, type: "income", usd: true },
  { icon: "cpu", label: "Adobe Creative Cloud", amount: 17080, type: "expense", usd: true },
  { icon: "rent", label: "Office rent", amount: 45000, type: "expense" },
  { icon: "chat", label: "Lumen Studio retainer", amount: 92700, type: "income" },
  { icon: "coffee", label: "Client coffee", amount: 640, type: "expense" },
  { icon: "swap", label: "City Bank → bKash", amount: 12000, type: "transfer" },
  { icon: "design", label: "Logo project", amount: 61000, type: "income", usd: true },
];

const ROW_B: Item[] = [
  { icon: "wifi", label: "Link3 Internet", amount: 1600, type: "expense" },
  { icon: "car", label: "Pathao ride", amount: 380, type: "expense" },
  { icon: "briefcase", label: "Bluepeak Realty", amount: 219600, type: "income" },
  { icon: "food", label: "Team lunch", amount: 3250, type: "expense" },
  { icon: "swap", label: "Payoneer → City Bank", amount: 122000, type: "transfer", usd: true },
  { icon: "shopping", label: "Studio supplies", amount: 8900, type: "expense" },
  { icon: "cpu", label: "Google Workspace", amount: 5684, type: "expense", usd: true },
];

function wrap(min: number, max: number, v: number) {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
}

/** Endless row that speeds up and flips direction with the page's scroll velocity. */
function Row({ items, base, dark }: { items: Item[]; base: number; dark?: boolean }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(velocity, [-2500, 0, 2500], [6, 0, -6]);
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);
  const slow = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move * slow.current);
  });

  return (
    <div
      className="-my-3 flex overflow-hidden py-3"
      onPointerEnter={() => (slow.current = 0.18)}
      onPointerLeave={() => (slow.current = 1)}
    >
      <motion.div className="flex shrink-0 gap-3 pr-3" style={{ x, skewX: skew }}>
        {[0, 1, 2, 3].flatMap((copy) =>
          items.map((it, i) => (
            <span
              key={`${copy}-${i}`}
              aria-hidden={copy > 0}
              className={cn(
                "group flex shrink-0 items-center gap-3 rounded-full py-2 pr-5 pl-2 transition-transform duration-500 ease-(--ease-spring) hover:-translate-y-1 hover:rotate-[-1.5deg]",
                dark ? "bg-ink text-on-ink" : "bg-surface text-ink ring-1 ring-line",
              )}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full transition-colors duration-300",
                  dark ? "bg-on-ink/10 group-hover:bg-lime group-hover:text-ink" : "bg-surface-alt group-hover:bg-lime",
                )}
              >
                <Glyph name={it.icon} size={18} />
              </span>
              <span className="text-[15px] font-medium whitespace-nowrap">{it.label}</span>
              <span
                className={cn(
                  "tabular text-[15px] font-semibold whitespace-nowrap",
                  it.type === "income" ? (dark ? "text-gain" : "text-income") : it.type === "expense" ? (dark ? "text-spend" : "text-expense") : "opacity-60",
                )}
              >
                {it.type === "income" ? "+" : it.type === "expense" ? "−" : ""}
                {money(it.amount, it.usd ? "USD" : "BDT").replace("−", "")}
              </span>
            </span>
          )),
        )}
      </motion.div>
    </div>
  );
}

export function LedgerMarquee() {
  return (
    <section aria-label="Example entries" className="relative py-14 md:py-20">
      <div className="mask-fade-x flex -rotate-[1.5deg] flex-col gap-3">
        <Row items={ROW_A} base={-1.6} />
        <Row items={ROW_B} base={1.6} dark />
      </div>
    </section>
  );
}

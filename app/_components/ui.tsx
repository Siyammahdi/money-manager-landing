"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import { cn, EASE } from "./lib";

/* ---------------------------------------------------------------- Logo */

/** Three rising bars on a lime tile, same mark as the app icon. Bars bounce on hover. */
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("group/logo relative inline-grid shrink-0 place-items-center bg-lime", className)}
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" aria-hidden>
        {[
          { x: 2, y: 13, h: 9 },
          { x: 9.4, y: 7.5, h: 14.5 },
          { x: 16.8, y: 2, h: 20 },
        ].map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={5.2}
            height={b.h}
            rx={2.2}
            fill="#11140D"
            className="origin-bottom transition-transform duration-500 ease-(--ease-spring) [transform-box:fill-box] group-hover/logo:[transform:scaleY(var(--s))]"
            style={{ "--s": [1.5, 0.6, 1.1][i], transitionDelay: `${i * 50}ms` } as React.CSSProperties}
          />
        ))}
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------- Text */

/** Words per line; "\n" forces a line break. */
function parse(text: string): string[][] {
  return text.split("\n").map((line) => line.split(/\s+/).filter(Boolean));
}

/**
 * Headline whose words rise out of a mask one after another.
 * `play` lets the hero hold the animation until the preloader is gone.
 */
export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  play,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  play?: boolean;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = play ?? inView;
  const lines = parse(text);
  let i = 0;
  return (
    <Tag ref={ref} className={cn("display", className)} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((words, li) => (
        <Fragment key={li}>
          {words.map((w, wi) => {
            const idx = i++;
            return (
              <Fragment key={wi}>
                <span aria-hidden className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
                  <motion.span
                    className="inline-block will-change-transform"
                    initial={{ y: "115%", rotate: 6 }}
                    animate={show ? { y: "0%", rotate: 0 } : undefined}
                    transition={{ duration: 1.1, ease: EASE, delay: delay + idx * stagger }}
                    style={{ transformOrigin: "0% 100%" }}
                  >
                    {w}
                  </motion.span>
                </span>
                {wi < words.length - 1 && " "}
              </Fragment>
            );
          })}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Fade, rise and de-blur once in view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  play,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  play?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const show = play ?? inView;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Odometer */

function Digit({ d, delay }: { d: number; delay: number }) {
  return (
    <span aria-hidden className="relative inline-block overflow-hidden align-top">
      <span className="invisible">0</span>
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[1100ms] ease-(--ease-out-expo)"
        style={{ transform: `translateY(${-d * 10}%)`, transitionDelay: `${delay}ms` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

/**
 * Digits roll like a mechanical counter whenever `value` changes.
 * Until `active`, every digit sits at 0, so the first appearance rolls up too.
 */
export function Odometer({
  value,
  className,
  active = true,
  stagger = 28,
}: {
  value: string;
  className?: string;
  active?: boolean;
  stagger?: number;
}) {
  const chars = value.split("");
  return (
    <span className={cn("tabular relative inline-flex whitespace-pre leading-[1.1]", className)}>
      <span className="sr-only">{value}</span>
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (/\d/.test(ch)) return <Digit key={`d${key}`} d={active ? +ch : 0} delay={i * stagger} />;
        return (
          <span key={`c${key}${ch}`} aria-hidden>
            {ch}
          </span>
        );
      })}
    </span>
  );
}

/** Odometer that rolls in the first time it scrolls into view. */
export function CountIn({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <span ref={ref}>
      <Odometer value={value} active={inView} className={className} />
    </span>
  );
}

/* ---------------------------------------------------------------- Pointer effects */

/** Child drifts toward the cursor while hovered and springs back on leave. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 16, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 16, mass: 0.5 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Tracks the pointer inside an element as CSS vars --mx/--my, for spotlight borders. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);
  return ref;
}

/* ---------------------------------------------------------------- Buttons */

const PILL = {
  lime: { base: "bg-lime text-ink", fill: "bg-ink", hoverText: "group-hover:text-lime", dot: "text-lime" },
  ink: { base: "bg-ink text-on-ink", fill: "bg-lime", hoverText: "group-hover:text-ink", dot: "text-ink" },
  light: { base: "bg-surface text-ink ring-1 ring-line", fill: "bg-ink", hoverText: "group-hover:text-on-ink", dot: "text-on-ink" },
} as const;

/**
 * Pill with a dark circle on the right. On hover the circle floods the whole button,
 * the label rolls up to a fresh copy and the arrow exits right as a new one enters.
 */
export function PillButton({
  href,
  children,
  tone = "lime",
  size = "md",
  className,
  onClick,
}: {
  href?: string;
  children: ReactNode;
  tone?: keyof typeof PILL;
  size?: "md" | "sm";
  className?: string;
  onClick?: () => void;
}) {
  const t = PILL[tone];
  const sm = size === "sm";
  const Comp = href ? "a" : "button";
  return (
    <Magnetic strength={0.22}>
      <Comp
        href={href}
        onClick={onClick}
        className={cn(
          "group relative isolate inline-flex items-center overflow-hidden rounded-full pr-1.5 font-semibold transition-transform duration-300 active:scale-[0.97]",
          sm ? "h-11 gap-3 pl-5 text-[14px]" : "h-14 gap-4 pl-6 text-[15px]",
          t.base,
          className,
        )}
      >
        <span
          className={cn(
            "absolute top-1.5 right-1.5 bottom-1.5 -z-10 rounded-full transition-[width] duration-[650ms] ease-(--ease-out-expo) group-hover:w-[calc(100%-12px)]",
            sm ? "w-8" : "w-11",
            t.fill,
          )}
        />
        <span className={cn("relative block h-[1.3em] overflow-hidden leading-[1.3em] transition-colors duration-300", t.hoverText)}>
          <span className="flex flex-col transition-transform duration-[600ms] ease-(--ease-out-expo) group-hover:-translate-y-1/2">
            <span>{children}</span>
            <span aria-hidden>{children}</span>
          </span>
        </span>
        <span className={cn("relative grid place-items-center overflow-hidden", sm ? "size-8" : "size-11", t.dot)}>
          <ArrowRight
            size={18}
            weight="bold"
            className="transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-8"
          />
          <ArrowRight
            size={18}
            weight="bold"
            className="absolute -translate-x-8 transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-0"
          />
        </span>
      </Comp>
    </Magnetic>
  );
}

/** Official marks (Simple Icons), drawn in the current text colour. */
const APPLE_PATH =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";
const PLAY_PATH =
  "M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z";

export function StoreButtons({ dark, className }: { dark?: boolean; className?: string }) {
  const base = dark ? "bg-on-ink text-ink hover:bg-lime" : "bg-ink text-on-ink hover:bg-ink-3";
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {[
        { path: PLAY_PATH, top: "Get it on", label: "Google Play", size: 22 },
        { path: APPLE_PATH, top: "Download on the", label: "App Store", size: 24 },
      ].map(({ path, top, label, size }) => (
        <Magnetic key={label} strength={0.18}>
          <a
            href="#download"
            aria-label={`${top} ${label}`}
            className={cn(
              "group flex h-14 items-center gap-3 rounded-2xl pr-5 pl-4 transition-[background-color,transform] duration-300 active:scale-[0.97]",
              base,
            )}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              fill="currentColor"
              aria-hidden
              className="transition-transform duration-500 ease-(--ease-spring) group-hover:scale-110"
            >
              <path d={path} />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="text-[10px] font-medium opacity-60">{top}</span>
              <span className="mt-1 text-[16px] font-semibold tracking-tight">{label}</span>
            </span>
          </a>
        </Magnetic>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Misc */

/** False during SSR and hydration, true from the first frame after. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setM(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

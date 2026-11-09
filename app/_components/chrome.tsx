"use client";

import { List, X } from "@phosphor-icons/react";
import Lenis from "lenis";
import { AnimatePresence, motion, MotionConfig, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn, EASE, INTRO_DELAY } from "./lib";
import { Logo, Odometer, PillButton, useMounted } from "./ui";

export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

let lenis: Lenis | null = null;

/** Smooth-scroll to a page offset, through Lenis when it's running. */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ autoRaf: true, lerp: 0.085, anchors: { offset: -20 } });
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}

/** Ink curtain: the logo bars rise, a balance rolls up, then it all lifts away (timing lives in globals.css). */
export function Intro() {
  const mounted = useMounted();
  return (
    <div aria-hidden className="intro fixed inset-0 z-[70] grid place-items-center bg-ink">
      <div className="flex flex-col items-center gap-7">
        <div className="flex h-16 items-end gap-2">
          {[0.45, 0.72, 1].map((h, i) => (
            <span
              key={i}
              className="intro-bar w-[18px] rounded-[7px] bg-lime"
              style={{ height: `${h * 64}px`, animationDelay: `${0.1 + i * 0.12}s` }}
            />
          ))}
        </div>
        <Odometer value="৳17,26,939" active={mounted} stagger={45} className="text-[22px] font-medium tracking-tight text-on-ink/80" />
      </div>
    </div>
  );
}

const LINKS = [
  { id: "features", label: "Features" },
  { id: "tour", label: "How it works" },
  { id: "reports", label: "Reports" },
  { id: "security", label: "Security" },
  { id: "faq", label: "FAQ" },
];

/** Which section is under the middle of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return active;
}

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  /** Where the current scroll direction started; hide/show only after real travel, not per-frame jitter. */
  const anchor = useRef(0);
  const dir = useRef(0);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? y;
    setScrolled(y > 40);
    if (open || y < 160) {
      setHidden(false);
      anchor.current = y;
      return;
    }
    const d = Math.sign(y - prev);
    if (d === 0) return;
    if (d !== dir.current) {
      dir.current = d;
      anchor.current = prev;
    }
    const travelled = Math.abs(y - anchor.current);
    if (d > 0 && travelled > 60) setHidden(true);
    else if (d < 0 && travelled > 20) setHidden(false);
  });

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: INTRO_DELAY + 0.2 }}
        >
          <motion.div
            onFocusCapture={() => setHidden(false)}
            animate={{
              y: hidden ? -92 : 0,
              scale: hidden ? 0.92 : 1,
              opacity: hidden ? 0 : 1,
              maxWidth: scrolled && !open ? 860 : 1240,
            }}
            transition={
              hidden
                ? { duration: 0.42, ease: [0.4, 0, 1, 1] }
                : { type: "spring", stiffness: 340, damping: 26, mass: 0.9, opacity: { duration: 0.25 } }
            }
            className={cn(
              "pointer-events-auto mx-auto flex h-16 items-center justify-between rounded-full pr-2.5 pl-3 transition-[background-color,box-shadow,color] duration-500",
              open
                ? "bg-transparent text-on-ink"
                : scrolled
                  ? "bg-surface/80 shadow-[0_1px_0_rgba(20,23,15,0.05),0_18px_40px_-18px_rgba(20,23,15,0.28)] ring-1 ring-ink/5 backdrop-blur-xl backdrop-saturate-150"
                  : "bg-transparent",
            )}
          >
            <a href="#top" onClick={() => setOpen(false)} className="flex items-center gap-2.5" aria-label="Money Manager home">
              <Logo size={38} />
              <span className="text-[16px] font-semibold tracking-tight">Money Manager</span>
            </a>

            <nav className="hidden items-center md:flex" onPointerLeave={() => setHover(null)}>
              {LINKS.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onPointerEnter={() => setHover(l.id)}
                  className={cn(
                    "relative px-3.5 py-2 text-[14px] font-medium transition-colors lg:px-4",
                    active === l.id ? "text-ink" : "text-text-2 hover:text-ink",
                  )}
                >
                  {hover === l.id && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 -z-10 rounded-full bg-ink/[0.06]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {l.label}
                  {active === l.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <PillButton href="#download" size="sm" tone="ink">
                  Download
                </PillButton>
              </div>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn("grid size-11 place-items-center rounded-full md:hidden", open ? "bg-lime text-ink" : "bg-ink text-on-ink")}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={open ? "x" : "m"}
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  >
                    {open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0 round 0 0 40px 40px)" }}
            animate={{ clipPath: "inset(0 0 0% 0 round 0 0 0px 0px)" }}
            exit={{ clipPath: "inset(0 0 100% 0 round 0 0 40px 40px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-6 pb-10 text-on-ink md:hidden"
            data-lenis-prevent
          >
            <ul className="space-y-1">
              {LINKS.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <motion.a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.05 }}
                    className="block py-1 text-[42px] leading-tight font-normal tracking-[-0.03em]"
                  >
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} exit={{ opacity: 0 }} className="mt-10">
              <PillButton href="#download" onClick={() => setOpen(false)}>
                Download the app
              </PillButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn, EASE, EASE_IN_OUT, INTRO_DELAY, type Currency } from "./lib";
import { HomeScreen, Phone, TabBar, type Theme } from "./phone";
import { Reveal, SplitWords, StoreButtons, useMounted } from "./ui";

function Toggle<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="text-center md:text-left">
      <div className="mb-2 text-[12px] text-on-ink-muted md:text-[13px]">{label}</div>
      <div role="radiogroup" aria-label={label} className="inline-grid grid-cols-2 rounded-full bg-on-ink/[0.06] p-1 ring-1 ring-on-ink/10">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className="relative h-8 min-w-[48px] rounded-full px-2.5 text-[12.5px] font-medium md:h-9 md:min-w-[76px] md:px-4 md:text-[13.5px]"
            >
              {on && (
                <motion.span
                  layoutId={`hero-${id}`}
                  className="absolute inset-0 rounded-full bg-lime"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span className={cn("relative transition-colors duration-300", on ? "text-ink" : "text-on-ink/70 hover:text-on-ink")}>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A label on the right with a hairline that runs into the part of the screen it describes. */
function Note({ top, title, body, delay, show }: { top: number; title: string; body: string; delay: number; show: boolean }) {
  return (
    <div className="absolute inset-x-0 flex items-start" style={{ top }}>
      <motion.span
        className="mt-[7px] size-2 shrink-0 rounded-full bg-lime"
        initial={{ scale: 0 }}
        animate={show ? { scale: 1 } : undefined}
        transition={{ type: "spring", stiffness: 500, damping: 20, delay }}
      />
      <motion.span
        className="mt-[10px] h-px w-10 shrink-0 origin-left bg-on-ink/25 xl:w-16"
        initial={{ scaleX: 0 }}
        animate={show ? { scaleX: 1 } : undefined}
        transition={{ duration: 0.8, ease: EASE, delay: delay + 0.1 }}
      />
      <motion.div
        className="ml-4 max-w-[230px]"
        initial={{ opacity: 0, x: -8 }}
        animate={show ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.8, ease: EASE, delay: delay + 0.3 }}
      >
        <div className="text-[15px] font-medium text-on-ink">{title}</div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={body}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-1 text-[13.5px] leading-relaxed text-on-ink-muted"
          >
            {body}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Where each Home block sits, measured from the phone's top edge at the md+ scale of 0.9. */
const AT = { balance: 190, accounts: 372, recent: 520 };

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const mounted = useMounted();
  const [ready, setReady] = useState(false);
  const [currency, setCurrency] = useState<Currency>("BDT");
  const [hidden, setHidden] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  /** Theme currently painted underneath; the new one wipes in over it, then becomes the base. */
  const [base, setBase] = useState<Theme>("light");

  useEffect(() => {
    const t = setTimeout(() => setReady(true), INTRO_DELAY * 1000 + 500);
    return () => clearTimeout(t);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const stageScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.97]);

  const screenProps = {
    currency,
    hidden,
    active: ready,
    onCurrency: setCurrency,
    onHidden: () => setHidden((h) => !h),
  };

  const balanceNote = hidden
    ? "Hidden with one tap, for when someone is looking over your shoulder."
    : currency === "USD"
      ? "Shown in dollars at the rate you set, here ৳122 to $1."
      : "Every account added up, in your main currency.";

  return (
    <section id="top" ref={ref} className="relative pt-32 md:pt-40">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SplitWords
          as="h1"
          play={mounted}
          delay={INTRO_DELAY}
          stagger={0.07}
          text={"Know where every\ntaka goes."}
          className="text-[clamp(3.1rem,8.6vw,8.4rem)]"
        />
        <Reveal play={mounted} delay={INTRO_DELAY + 0.35} className="mt-10 grid items-end gap-8 border-t border-ink/10 pt-8 md:grid-cols-12">
          <p className="max-w-[520px] text-[18px] leading-relaxed text-text-2 md:col-span-6">
            Money Manager is a simple ledger for income, expenses, accounts and client dues. It lives on your phone,
            works without internet, and backs up to your own Google Drive.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 md:col-span-6 md:justify-end">
            <a href="#tour" className="group relative py-2 text-[15px] font-medium">
              See how it works
              <span className="absolute inset-x-0 bottom-1 h-px origin-right bg-ink transition-transform duration-500 ease-(--ease-out-expo) group-hover:scale-x-0" />
            </a>
            <StoreButtons />
          </div>
        </Reveal>
      </div>

      {/* Stage */}
      <div className="mt-14 px-3 md:mt-20 md:px-5">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={mounted ? { y: 0, opacity: 1 } : undefined}
          transition={{ duration: 1.3, ease: EASE, delay: INTRO_DELAY + 0.25 }}
          style={{ scale: stageScale }}
          className="relative mx-auto flex h-[720px] max-w-[1400px] flex-col overflow-hidden rounded-[32px] bg-ink bg-[radial-gradient(55%_70%_at_50%_100%,#2a3021,transparent)] md:block md:rounded-[44px]"
        >
          <LayoutGroup id="hero-controls">
            {/* Controls: a row on small screens, a column on the left from md up. */}
            <Reveal
              play={ready}
              className="relative z-10 grid grid-cols-3 gap-1 px-3 pt-6 md:absolute md:top-[150px] md:left-10 md:block md:space-y-6 md:p-0 xl:left-16"
            >
              <div className="hidden text-[15px] font-medium text-on-ink md:block">Try the Home screen</div>
              <Toggle id="ccy" label="Currency" value={currency} onChange={setCurrency} options={[{ value: "BDT", label: "BDT" }, { value: "USD", label: "USD" }]} />
              <Toggle
                id="bal"
                label="Balance"
                value={hidden ? "hide" : "show"}
                onChange={(v) => setHidden(v === "hide")}
                options={[{ value: "show", label: "Show" }, { value: "hide", label: "Hide" }]}
              />
              <Toggle
                id="theme"
                label="Appearance"
                value={theme}
                onChange={setTheme}
                options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
              />
            </Reveal>
          </LayoutGroup>

          <div className="relative mt-12 flex flex-1 justify-center md:absolute md:inset-x-0 md:top-16 md:mt-0">
            <motion.div
              initial={{ y: 220 }}
              animate={mounted ? { y: 0 } : undefined}
              transition={{ duration: 1.5, ease: EASE, delay: INTRO_DELAY + 0.45 }}
              className="relative"
            >
              <motion.div style={{ y: phoneY }} className="relative">
                <Phone className="[--s:0.76] md:[--s:0.9]">
                  <div className="absolute inset-0">
                    <HomeScreen {...screenProps} theme={base} />
                    <div className={base === "dark" ? "theme-dark" : undefined}>
                      <TabBar active="home" id="hero-base" />
                    </div>
                  </div>
                  <AnimatePresence>
                    {theme !== base && (
                      <motion.div
                        key={theme}
                        className="absolute inset-0 z-[1]"
                        initial={{ clipPath: "circle(0% at 86% 7%)" }}
                        animate={{ clipPath: "circle(150% at 86% 7%)" }}
                        transition={{ duration: 0.95, ease: EASE_IN_OUT }}
                        onAnimationComplete={() => setBase(theme)}
                      >
                        <HomeScreen {...screenProps} theme={theme} />
                        <div className={theme === "dark" ? "theme-dark" : undefined}>
                          <TabBar active="home" id="hero-top" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Phone>

                {/* Notes hang off the phone's right edge */}
                <div className="absolute top-0 left-full hidden h-full w-[270px] lg:block xl:w-[330px]">
                  <Note top={AT.balance} title="Total balance" body={balanceNote} delay={0} show={ready} />
                  <Note top={AT.accounts} title="Accounts" body="Cash, bank and bKash as cards. Each keeps its own balance and currency." delay={0.15} show={ready} />
                  <Note top={AT.recent} title="Recent" body="The latest entries, with dollar amounts kept beside the taka value." delay={0.3} show={ready} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

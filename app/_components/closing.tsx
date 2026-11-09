"use client";

import { ArrowUp } from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

import { scrollToY } from "./chrome";
import { cn, EASE } from "./lib";
import { Phone, ReportsScreen, TabBar } from "./phone";
import { Logo, Magnetic, Reveal, SplitWords, StoreButtons } from "./ui";

/* ---------------------------------------------------------------- FAQ */

const FAQ = [
  {
    q: "Do I need to create an account?",
    a: "No. Enter your name and main currency and start adding entries. A Google account is only needed if you turn on Sheets sync or Drive backup.",
  },
  {
    q: "Where is my data stored?",
    a: "On your phone. Entries, accounts and settings are saved on the device, and everything works without internet. Sync and backup are optional, and both go to your own Google account, never to a Money Manager server.",
  },
  {
    q: "What can the app see in my Google Drive?",
    a: "Only what it created. Sheets sync uses Google’s drive.file permission, so the app can open the one spreadsheet it made and nothing else. Backups go to Drive’s hidden app folder, which other apps, and you browsing Drive, can’t see into.",
  },
  {
    q: "Can I edit my books in the Google Sheet?",
    a: "Yes. Change any cell, or delete a row to delete that entry. To add an entry, fill in a new row and leave the ID empty; the app gives it one on the next sync. If the same entry changed in both places, the newer edit wins.",
  },
  {
    q: "How do two currencies work?",
    a: "You choose a main currency and a second one, for example BDT and USD. Each entry keeps the exchange rate from the day you saved it, so old totals don’t change when the rate does. You can view any amount in either currency, and move money between accounts in different currencies.",
  },
  {
    q: "What happens if I lose or change my phone?",
    a: "If Drive backup is on, install the app on the new phone and choose “Restore from Google Drive” on the welcome screen. The app checks the backup before replacing anything, so a damaged file can’t wipe your books.",
  },
  {
    q: "Can I use it on more than one phone?",
    a: "Yes, through Sheets sync. Connect each phone to the same Google account and they share one spreadsheet. Default accounts and repeating entries aren’t duplicated.",
  },
  {
    q: "Can I export my data?",
    a: "Any time. Reports export as a PDF or CSV for a month or a year. With Sheets sync on, your full ledger is also a spreadsheet you can open, share or print.",
  },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={cn("border-b border-ink/10 transition-colors", open && "border-ink/25")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="group flex w-full items-center gap-5 py-6 text-left md:py-7">
        <span className="flex-1 text-[19px] font-normal tracking-[-0.015em] transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1.5 md:text-[22px]">
          {q}
        </span>
        <span
          className={cn(
            "relative grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-500",
            open ? "bg-lime" : "bg-surface ring-1 ring-line group-hover:bg-ink group-hover:text-on-ink",
          )}
        >
          <span className="absolute h-[2px] w-3.5 rounded-full bg-current" />
          <motion.span
            className="absolute h-3.5 w-[2px] rounded-full bg-current"
            animate={{ rotate: open ? 90 : 0, scaleY: open ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: -10, filter: "blur(4px)" }}
              animate={{ y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="max-w-[640px] pr-14 pb-7 text-[16px] leading-relaxed text-text-2"
            >
              {a}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SplitWords text={"Questions\nand answers."} className="text-[clamp(2.6rem,5vw,4.2rem)]" />
            <Reveal delay={0.2} className="mt-10">
              <div className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-on-ink">
                <div className="relative text-[19px] tracking-[-0.015em]">Want to look around first?</div>
                <p className="relative mt-2 text-[14.5px] leading-relaxed text-on-ink-muted">
                  Choose <span className="text-on-ink">Explore with sample data</span> on the welcome screen to try the app with
                  six months of example books. Clear it with one tap when you’re ready to start your own.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
        <Reveal className="lg:col-span-8" y={40}>
          <div className="border-t border-ink/10">
            {FAQ.map((f, i) => (
              <FaqItem key={f.q} {...f} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Download CTA */

export function Download() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const bars = [
    useTransform(scrollYProgress, [0.1, 0.8], [0.15, 0.45]),
    useTransform(scrollYProgress, [0.15, 0.85], [0.15, 0.72]),
    useTransform(scrollYProgress, [0.2, 0.9], [0.15, 1]),
  ];
  const phoneY = useTransform(scrollYProgress, [0.2, 1], [260, 40]);
  const phoneRot = useTransform(scrollYProgress, [0.2, 1], [14, -4]);

  return (
    <section id="download" ref={ref} className="px-3 md:px-4">
      <div className="relative overflow-hidden rounded-[40px] bg-lime px-6 pt-20 md:rounded-[56px] md:px-14 md:pt-28">
        <div aria-hidden className="pointer-events-none absolute right-[-4%] bottom-0 flex h-[88%] items-end gap-[2.2vw] opacity-[0.09]">
          {bars.map((s, i) => (
            <motion.span key={i} className="block h-full w-[9vw] max-w-[150px] origin-bottom rounded-t-[3vw] bg-ink" style={{ scaleY: s }} />
          ))}
        </div>

        <div className="relative mx-auto grid max-w-[1240px] items-end gap-10 lg:grid-cols-12">
          <div className="pb-16 lg:col-span-7 lg:pb-28">
            <SplitWords text={"Start with\ntoday’s entries."} className="text-[clamp(3rem,7.4vw,6.4rem)]" />
            <Reveal delay={0.25} className="mt-8 max-w-[460px] text-[18px] leading-relaxed text-ink/70">
              No sign-up and nothing to configure. Choose your name and currency, and add your first entry in under a
              minute.
            </Reveal>
            <Reveal delay={0.35} className="mt-10">
              <StoreButtons />
            </Reveal>
          </div>
          <div className="relative flex h-[440px] justify-center overflow-visible md:h-[560px] lg:col-span-5">
            <motion.div style={{ y: phoneY, rotate: phoneRot }} className="absolute top-0">
              <Phone className="[--s:0.66] md:[--s:0.78]">
                <ReportsScreen />
                <TabBar active="reports" id="cta" />
              </Phone>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Footer */

function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const text = "Money Manager";
  return (
    <div ref={ref} aria-label={text} className="flex justify-between text-[clamp(3.4rem,13.8vw,14rem)] leading-[0.9] font-normal tracking-[-0.06em] select-none">
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.2em]">
          <motion.span
            className="inline-block cursor-default transition-colors duration-300 hover:text-lime-press"
            initial={{ y: "105%" }}
            animate={inView ? { y: "0%" } : undefined}
            whileHover={{ y: "-14%", transition: { type: "spring", stiffness: 500, damping: 12 } }}
            transition={{ duration: 1, ease: EASE, delay: i * 0.035 }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

export function Footer() {
  const cols = [
    { title: "Product", links: [["Features", "#features"], ["How it works", "#tour"], ["Reports", "#reports"], ["Security", "#security"]] },
    { title: "Get the app", links: [["Google Play", "#download"], ["App Store", "#download"], ["FAQ", "#faq"]] },
    { title: "Legal", links: [["Privacy policy", "#"], ["Terms of use", "#"]] },
  ];
  return (
    <footer className="px-5 pt-28 pb-8 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Logo size={44} />
              <span className="text-[18px] font-semibold tracking-tight">Money Manager</span>
            </div>
            <p className="mt-5 max-w-[340px] text-[15px] leading-relaxed text-text-2">
              A private ledger for income, expenses, accounts and dues. Built by TechWitPro for people who get paid in
              more than one way.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <div className="text-[13px] text-muted">{c.title}</div>
              <ul className="mt-5 space-y-3">
                {c.links.map(([l, h]) => (
                  <li key={l}>
                    <a href={h} className="group relative inline-flex overflow-hidden text-[15px] font-medium">
                      <span className="transition-transform duration-500 ease-(--ease-out-expo) group-hover:-translate-y-full">{l}</span>
                      <span aria-hidden className="absolute top-full left-0 text-income transition-transform duration-500 ease-(--ease-out-expo) group-hover:-translate-y-full">
                        {l}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex md:col-span-1 md:justify-end">
            <Magnetic strength={0.35}>
              <button
                type="button"
                onClick={() => scrollToY(0)}
                className="group grid size-14 place-items-center overflow-hidden rounded-full bg-ink text-on-ink transition-colors hover:bg-lime hover:text-ink"
                aria-label="Back to top"
              >
                <ArrowUp size={20} weight="bold" className="transition-transform duration-500 ease-(--ease-out-expo) group-hover:-translate-y-10" />
                <ArrowUp size={20} weight="bold" className="absolute translate-y-10 transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-y-0" />
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="mt-24">
          <Wordmark />
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-ink/10 pt-6 text-[13px] text-muted sm:flex-row">
          <span>© 2026 TechWitPro. All rights reserved.</span>
          <span>Your books stay on your phone.</span>
        </div>
      </div>
    </footer>
  );
}

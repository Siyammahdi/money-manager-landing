import { Bento } from "./_components/bento";
import { Intro, MotionRoot, Nav, SmoothScroll } from "./_components/chrome";
import { Download, Faq, Footer } from "./_components/closing";
import { Hero } from "./_components/hero";
import { LedgerMarquee } from "./_components/marquee";
import { Security } from "./_components/privacy";
import { QuickAdd } from "./_components/quick-add";
import { Reports } from "./_components/reports";
import { Tour } from "./_components/tour";

export default function Home() {
  return (
    <MotionRoot>
      <SmoothScroll />
      <Intro />
      <Nav />
      <main>
        <Hero />
        <LedgerMarquee />
        <QuickAdd />
        <Bento />
        <Tour />
        <Reports />
        <Security />
        <Faq />
        <Download />
      </main>
      <Footer />
    </MotionRoot>
  );
}
